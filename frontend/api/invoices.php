<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../db/database.php';

$method = $_SERVER['REQUEST_METHOD'];
$db = Database::getInstance();

try {
    switch ($method) {
        case 'GET':
            if (isset($_GET['action']) && $_GET['action'] === 'stats') {
                // Get invoice statistics
                $stmt = $db->query("SELECT COUNT(*) as total_count, 
                    SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft_count,
                    SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent_count,
                    SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid_count,
                    SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) as overdue_count,
                    SUM(total_amount) as total_amount,
                    SUM(CASE WHEN status IN ('sent', 'overdue') THEN total_amount ELSE 0 END) as outstanding_amount
                    FROM invoices");
                $stats = $stmt->fetch(PDO::FETCH_ASSOC);
                echo json_encode($stats);
                break;
            }

            if (isset($_GET['id'])) {
                // Get single invoice with items and customer
                $stmt = $db->prepare("
                    SELECT i.*, c.name as customer_name, c.email as customer_email, 
                           c.phone as customer_phone, c.address as customer_address,
                           c.city as customer_city, c.postal_code as customer_postal_code,
                           c.org_number as customer_org_number
                    FROM invoices i 
                    JOIN customers c ON i.customer_id = c.id 
                    WHERE i.id = ?
                ");
                $stmt->execute([$_GET['id']]);
                $invoice = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($invoice) {
                    $stmt = $db->prepare("SELECT * FROM invoice_items WHERE invoice_id = ?");
                    $stmt->execute([$_GET['id']]);
                    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    $invoice['items'] = $items;
                    echo json_encode($invoice);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Faktura hittades inte']);
                }
            } else {
                // Build query with filters
                $sql = "
                    SELECT i.*, c.name as customer_name 
                    FROM invoices i 
                    JOIN customers c ON i.customer_id = c.id 
                    WHERE 1=1
                ";
                $params = [];
                
                if (isset($_GET['status']) && in_array($_GET['status'], ['draft', 'sent', 'paid', 'overdue', 'cancelled'])) {
                    $sql .= " AND i.status = ?";
                    $params[] = $_GET['status'];
                }
                
                if (isset($_GET['customer_id'])) {
                    $sql .= " AND i.customer_id = ?";
                    $params[] = $_GET['customer_id'];
                }
                
                if (isset($_GET['start_date'])) {
                    $sql .= " AND i.issue_date >= ?";
                    $params[] = $_GET['start_date'];
                }
                
                if (isset($_GET['end_date'])) {
                    $sql .= " AND i.issue_date <= ?";
                    $params[] = $_GET['end_date'];
                }
                
                if (isset($_GET['search'])) {
                    $sql .= " AND (i.invoice_number LIKE ? OR c.name LIKE ?)";
                    $search = '%' . $_GET['search'] . '%';
                    $params[] = $search;
                    $params[] = $search;
                }
                
                $sql .= " ORDER BY i.created_at DESC";
                
                $stmt = $db->prepare($sql);
                $stmt->execute($params);
                $invoices = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($invoices);
            }
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            $db->beginTransaction();
            
            // Generate invoice number if not provided
            $invoiceNumber = $data['invoice_number'] ?? '';
            if (empty($invoiceNumber)) {
                $year = date('Y');
                $stmt = $db->query("SELECT COUNT(*) FROM invoices WHERE strftime('%Y', created_at) = '$year'");
                $count = $stmt->fetchColumn() + 1;
                $invoiceNumber = "F-$year-" . str_pad($count, 4, '0', STR_PAD_LEFT);
            }
            
            // Calculate totals from line items
            $totalAmount = 0;
            $vatAmount = 0;
            $rotRutAmount = 0;
            
            if (isset($data['items']) && is_array($data['items'])) {
                foreach ($data['items'] as $item) {
                    $lineTotal = ($item['quantity'] ?? 0) * ($item['unit_price'] ?? 0);
                    $totalAmount += $lineTotal;
                    $vatRate = $item['vat_rate'] ?? 25;
                    $vatAmount += $lineTotal * ($vatRate / 100);
                }
            }
            
            // Calculate ROT/RUT deduction
            $isRotRut = isset($data['is_rot_rut']) && $data['is_rot_rut'] ? 1 : 0;
            if ($isRotRut && isset($data['rot_rut_amount'])) {
                $rotRutAmount = $data['rot_rut_amount'];
            }
            
            $finalTotal = $totalAmount + $vatAmount - $rotRutAmount;
            
            // Create invoice
            $stmt = $db->prepare("
                INSERT INTO invoices (invoice_number, customer_id, issue_date, due_date, 
                    total_amount, vat_amount, status, is_rot_rut, rot_rut_amount, notes, 
                    reference, our_reference, payment_terms, created_at, updated_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
            ");
            $stmt->execute([
                $invoiceNumber,
                $data['customer_id'] ?? 0,
                $data['issue_date'] ?? date('Y-m-d'),
                $data['due_date'] ?? date('Y-m-d', strtotime('+30 days')),
                $finalTotal,
                $vatAmount,
                $data['status'] ?? 'draft',
                $isRotRut,
                $rotRutAmount,
                $data['notes'] ?? '',
                $data['reference'] ?? null,
                $data['our_reference'] ?? null,
                $data['payment_terms'] ?? '30',
            ]);
            $invoiceId = $db->lastInsertId();
            
            // Add items
            if (isset($data['items']) && is_array($data['items'])) {
                $stmt = $db->prepare("
                    INSERT INTO invoice_items (invoice_id, article_id, article_name, quantity, unit_price, vat_rate, total_price) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ");
                foreach ($data['items'] as $item) {
                    $lineTotal = ($item['quantity'] ?? 0) * ($item['unit_price'] ?? 0);
                    $stmt->execute([
                        $invoiceId,
                        $item['article_id'] ?? null,
                        $item['article_name'] ?? '',
                        $item['quantity'] ?? 1,
                        $item['unit_price'] ?? 0,
                        $item['vat_rate'] ?? 25,
                        $lineTotal,
                    ]);
                }
            }
            
            $db->commit();
            echo json_encode([
                'id' => $invoiceId, 
                'invoice_number' => $invoiceNumber, 
                'message' => 'Faktura skapad',
                'total_amount' => $finalTotal,
                'vat_amount' => $vatAmount,
            ]);
            break;

        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);
            $id = $_GET['id'] ?? null;
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'ID krävs']);
                break;
            }
            
            $updates = [];
            $params = [];
            
            if (isset($data['status'])) {
                $updates[] = "status = ?";
                $params[] = $data['status'];
            }
            if (isset($data['notes'])) {
                $updates[] = "notes = ?";
                $params[] = $data['notes'];
            }
            if (isset($data['due_date'])) {
                $updates[] = "due_date = ?";
                $params[] = $data['due_date'];
            }
            if (isset($data['issue_date'])) {
                $updates[] = "issue_date = ?";
                $params[] = $data['issue_date'];
            }
            if (isset($data['reference'])) {
                $updates[] = "reference = ?";
                $params[] = $data['reference'];
            }
            if (isset($data['our_reference'])) {
                $updates[] = "our_reference = ?";
                $params[] = $data['our_reference'];
            }
            if (isset($data['payment_terms'])) {
                $updates[] = "payment_terms = ?";
                $params[] = $data['payment_terms'];
            }
            if (isset($data['vat_amount'])) {
                $updates[] = "vat_amount = ?";
                $params[] = $data['vat_amount'];
            }
            if (isset($data['is_rot_rut'])) {
                $updates[] = "is_rot_rut = ?";
                $params[] = $data['is_rot_rut'] ? 1 : 0;
            }
            if (isset($data['rot_rut_amount'])) {
                $updates[] = "rot_rut_amount = ?";
                $params[] = $data['rot_rut_amount'];
            }
            
            if (count($updates) === 0) {
                http_response_code(400);
                echo json_encode(['error' => 'Inga fält att uppdatera']);
                break;
            }
            
            $updates[] = "updated_at = datetime('now')";
            $params[] = $id;
            
            $db->beginTransaction();
            
            // Update invoice
            $stmt = $db->prepare("UPDATE invoices SET " . implode(', ', $updates) . " WHERE id = ?");
            $stmt->execute($params);
            
            // If items are provided, replace them
            if (isset($data['items']) && is_array($data['items'])) {
                $stmt = $db->prepare("DELETE FROM invoice_items WHERE invoice_id = ?");
                $stmt->execute([$id]);
                
                $stmt = $db->prepare("
                    INSERT INTO invoice_items (invoice_id, article_id, article_name, quantity, unit_price, vat_rate, total_price) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ");
                foreach ($data['items'] as $item) {
                    $lineTotal = ($item['quantity'] ?? 0) * ($item['unit_price'] ?? 0);
                    $stmt->execute([
                        $id,
                        $item['article_id'] ?? null,
                        $item['article_name'] ?? '',
                        $item['quantity'] ?? 1,
                        $item['unit_price'] ?? 0,
                        $item['vat_rate'] ?? 25,
                        $lineTotal,
                    ]);
                }
            }
            
            $db->commit();
            echo json_encode(['message' => 'Faktura uppdaterad']);
            break;

        case 'DELETE':
            $id = $_GET['id'] ?? null;
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'ID krävs']);
                break;
            }
            $db->beginTransaction();
            $stmt = $db->prepare("DELETE FROM invoice_items WHERE invoice_id = ?");
            $stmt->execute([$id]);
            $stmt = $db->prepare("DELETE FROM invoices WHERE id = ?");
            $stmt->execute([$id]);
            $db->commit();
            echo json_encode(['message' => 'Faktura borttagen']);
            break;
    }
} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
