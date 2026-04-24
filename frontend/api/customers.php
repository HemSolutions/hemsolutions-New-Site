<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
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
                // Get single customer
                $stmt = $db->prepare("SELECT * FROM customers WHERE id = ?");
                $stmt->execute([$_GET['id']]);
                $customer = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($customer) {
                    $customer['e_invoice'] = (bool)$customer['e_invoice'];
                    echo json_encode($customer);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Kund hittades inte']);
                }
            } else if (isset($_GET['page']) || isset($_GET['limit']) || isset($_GET['search']) || isset($_GET['sort'])) {
                // Paginated list with search/filters
                $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
                $limit = isset($_GET['limit']) ? max(1, min(100, intval($_GET['limit']))) : 20;
                $offset = ($page - 1) * $limit;
                
                $search = isset($_GET['search']) ? trim($_GET['search']) : '';
                $sortBy = isset($_GET['sort']) ? $_GET['sort'] : 'name';
                $sortOrder = isset($_GET['order']) && strtoupper($_GET['order']) === 'DESC' ? 'DESC' : 'ASC';
                
                $allowedSortColumns = ['name', 'customer_number', 'email', 'phone', 'city', 'created_at'];
                if (!in_array($sortBy, $allowedSortColumns)) {
                    $sortBy = 'name';
                }
                
                $whereConditions = [];
                $params = [];
                
                if ($search) {
                    $whereConditions[] = "(name LIKE ? OR customer_number LIKE ? OR email LIKE ? OR phone LIKE ? OR org_number LIKE ? OR city LIKE ?)";
                    $searchParam = "%$search%";
                    $params = array_fill(0, 6, $searchParam);
                }
                
                $whereClause = $whereConditions ? 'WHERE ' . implode(' AND ', $whereConditions) : '';
                
                $countStmt = $db->prepare("SELECT COUNT(*) FROM customers $whereClause");
                $countStmt->execute($params);
                $total = $countStmt->fetchColumn();
                
                $sql = "SELECT * FROM customers $whereClause ORDER BY $sortBy $sortOrder LIMIT ? OFFSET ?";
                $stmt = $db->prepare($sql);
                $stmt->execute(array_merge($params, [$limit, $offset]));
                $customers = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                foreach ($customers as &$customer) {
                    $customer['e_invoice'] = (bool)$customer['e_invoice'];
                }
                
                echo json_encode([
                    'customers' => $customers,
                    'pagination' => [
                        'page' => $page,
                        'limit' => $limit,
                        'total' => $total,
                        'total_pages' => ceil($total / $limit)
                    ]
                ]);
            } else {
                // Simple list - return array for backward compatibility
                $stmt = $db->query("SELECT * FROM customers ORDER BY name");
                $customers = $stmt->fetchAll(PDO::FETCH_ASSOC);
                foreach ($customers as &$customer) {
                    $customer['e_invoice'] = (bool)$customer['e_invoice'];
                }
                echo json_encode($customers);
            }
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Generate customer number if not provided
            $customerNumber = $data['customer_number'] ?? null;
            if (!$customerNumber) {
                $stmt = $db->query("SELECT MAX(CAST(SUBSTR(customer_number, 3) AS INTEGER)) as max_num FROM customers WHERE customer_number LIKE 'K-%'");
                $result = $stmt->fetch(PDO::FETCH_ASSOC);
                $nextNum = ($result['max_num'] ?? 1000) + 1;
                $customerNumber = 'K-' . $nextNum;
            }
            
            $stmt = $db->prepare("
                INSERT INTO customers (
                    customer_number, name, email, phone, mobile_phone,
                    address, city, postal_code,
                    invoice_address_line1, invoice_address_line2, invoice_address_line3,
                    invoice_postal_code, invoice_city,
                    org_number, person_number,
                    payment_terms_days, late_payment_interest, discount_percent,
                    e_invoice, gln_number, reference, invoice_info, notes,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
            ");
            
            $stmt->execute([
                $customerNumber,
                $data['name'] ?? '',
                $data['email'] ?? '',
                $data['phone'] ?? '',
                $data['mobile_phone'] ?? '',
                $data['address'] ?? '',
                $data['city'] ?? '',
                $data['postal_code'] ?? '',
                $data['invoice_address_line1'] ?? '',
                $data['invoice_address_line2'] ?? '',
                $data['invoice_address_line3'] ?? '',
                $data['invoice_postal_code'] ?? '',
                $data['invoice_city'] ?? '',
                $data['org_number'] ?? '',
                $data['person_number'] ?? '',
                $data['payment_terms_days'] ?? 30,
                $data['late_payment_interest'] ?? 8.0,
                $data['discount_percent'] ?? 0,
                ($data['e_invoice'] ?? false) ? 1 : 0,
                $data['gln_number'] ?? '',
                $data['reference'] ?? '',
                $data['invoice_info'] ?? '',
                $data['notes'] ?? ''
            ]);
            
            $id = $db->lastInsertId();
            echo json_encode(['id' => $id, 'customer_number' => $customerNumber, 'message' => 'Kund skapad']);
            break;

        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);
            $id = $_GET['id'] ?? null;
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'ID krävs']);
                break;
            }
            
            // Build dynamic update query
            $allowedFields = [
                'customer_number', 'name', 'email', 'phone', 'mobile_phone',
                'address', 'city', 'postal_code',
                'invoice_address_line1', 'invoice_address_line2', 'invoice_address_line3',
                'invoice_postal_code', 'invoice_city',
                'org_number', 'person_number',
                'payment_terms_days', 'late_payment_interest', 'discount_percent',
                'e_invoice', 'gln_number', 'reference', 'invoice_info', 'notes'
            ];
            
            $updates = [];
            $params = [];
            
            foreach ($allowedFields as $field) {
                if (isset($data[$field])) {
                    if ($field === 'e_invoice') {
                        $updates[] = "$field = ?";
                        $params[] = $data[$field] ? 1 : 0;
                    } else {
                        $updates[] = "$field = ?";
                        $params[] = $data[$field];
                    }
                }
            }
            
            if (empty($updates)) {
                http_response_code(400);
                echo json_encode(['error' => 'Inga fält att uppdatera']);
                break;
            }
            
            $updates[] = "updated_at = datetime('now')";
            $params[] = $id;
            
            $sql = "UPDATE customers SET " . implode(', ', $updates) . " WHERE id = ?";
            $stmt = $db->prepare($sql);
            $stmt->execute($params);
            
            echo json_encode(['message' => 'Kund uppdaterad']);
            break;

        case 'DELETE':
            $id = $_GET['id'] ?? null;
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'ID krävs']);
                break;
            }
            $stmt = $db->prepare("DELETE FROM customers WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['message' => 'Kund borttagen']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
