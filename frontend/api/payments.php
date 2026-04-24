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
                    SELECT p.*, c.name as customer_name, i.invoice_number 
                    FROM payments p 
                    JOIN customers c ON p.customer_id = c.id 
                    LEFT JOIN invoices i ON p.invoice_id = i.id 
                    WHERE p.id = ?
                ");
                $stmt->execute([$_GET['id']]);
                $payment = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($payment) {
                    echo json_encode($payment);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Betalning hittades inte']);
                }
            } else {
                $stmt = $db->query("
                    SELECT p.*, c.name as customer_name, i.invoice_number 
                    FROM payments p 
                    JOIN customers c ON p.customer_id = c.id 
                    LEFT JOIN invoices i ON p.invoice_id = i.id 
                    ORDER BY p.payment_date DESC
                ");
                $payments = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($payments);
            }
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            $stmt = $db->prepare("
                INSERT INTO payments (invoice_id, customer_id, amount, payment_date, payment_method, reference, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
            ");
            $stmt->execute([
                $data['invoice_id'] ?? null,
                $data['customer_id'],
                $data['amount'],
                $data['payment_date'],
                $data['payment_method'],
                $data['reference'] ?? ''
            ]);
            
            // Update invoice status if payment matches
            if ($data['invoice_id']) {
                $stmt = $db->prepare("
                    UPDATE invoices SET status = 'paid' 
                    WHERE id = ? AND total_amount <= (
                        SELECT SUM(amount) FROM payments WHERE invoice_id = ?
                    )
                ");
                $stmt->execute([$data['invoice_id'], $data['invoice_id']]);
            }
            
            $id = $db->lastInsertId();
            echo json_encode(['id' => $id, 'message' => 'Betalning registrerad']);
            break;

        case 'DELETE':
            $id = $_GET['id'] ?? null;
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'ID krävs']);
                break;
            }
            $stmt = $db->prepare("DELETE FROM payments WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['message' => 'Betalning borttagen']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>