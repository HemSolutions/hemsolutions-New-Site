<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

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
            if (isset($_GET['id'])) {
                $stmt = $db->prepare("
                    SELECT r.*, c.name as customer_name 
                    FROM receipts r 
                    JOIN customers c ON r.customer_id = c.id 
                    WHERE r.id = ?
                ");
                $stmt->execute([$_GET['id']]);
                $receipt = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($receipt) {
                    $stmt = $db->prepare("SELECT * FROM receipt_items WHERE receipt_id = ?");
                    $stmt->execute([$_GET['id']]);
                    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    $receipt['items'] = $items;
                    echo json_encode($receipt);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Kvitto hittades inte']);
                }
            } else {
                $stmt = $db->query("
                    SELECT r.*, c.name as customer_name 
                    FROM receipts r 
                    JOIN customers c ON r.customer_id = c.id 
                    ORDER BY r.created_at DESC
                ");
                $receipts = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($receipts);
            }
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            $db->beginTransaction();
            
            // Generate receipt number
            $year = date('Y');
            $stmt = $db->query("SELECT COUNT(*) FROM receipts WHERE strftime('%Y', created_at) = '$year'");
            $count = $stmt->fetchColumn() + 1;
            $receiptNumber = "K-$year-" . str_pad($count, 4, '0', STR_PAD_LEFT);
            
            // Calculate totals
            $totalAmount = 0;
            $vatAmount = 0;
            
            foreach ($data['items'] as $item) {
                $lineTotal = $item['quantity'] * $item['unit_price'];
                $totalAmount += $lineTotal;
                $vatAmount += $lineTotal * 0.25;
            }
            
            // Create receipt
            $stmt = $db->prepare("
                INSERT INTO receipts (receipt_number, customer_id, issue_date, total_amount, vat_amount, payment_method, created_at) 
                VALUES (?, ?, date('now'), ?, ?, ?, datetime('now'))
            ");
            $stmt->execute([
                $receiptNumber,
                $data['customer_id'],
                $totalAmount,
                $vatAmount,
                $data['payment_method']
            ]);
            $receiptId = $db->lastInsertId();
            
            // Add items
            $stmt = $db->prepare("
                INSERT INTO receipt_items (receipt_id, article_id, article_name, quantity, unit_price, total_price) 
                SELECT ?, a.id, a.name, ?, ?, ? 
                FROM articles a WHERE a.id = ?
            ");
            foreach ($data['items'] as $item) {
                $lineTotal = $item['quantity'] * $item['unit_price'];
                $stmt->execute([$receiptId, $item['quantity'], $item['unit_price'], $lineTotal, $item['article_id']]);
            }
            
            $db->commit();
            echo json_encode(['id' => $receiptId, 'receipt_number' => $receiptNumber, 'message' => 'Kvitto skapad']);
            break;

        case 'DELETE':
            $id = $_GET['id'] ?? null;
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'ID krävs']);
                break;
            }
            $db->beginTransaction();
            $stmt = $db->prepare("DELETE FROM receipt_items WHERE receipt_id = ?");
            $stmt->execute([$id]);
            $stmt = $db->prepare("DELETE FROM receipts WHERE id = ?");
            $stmt->execute([$id]);
            $db->commit();
            echo json_encode(['message' => 'Kvitto borttagen']);
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