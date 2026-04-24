<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require_once '../db/database.php';

$db = Database::getInstance();

try {
    $stmt = $db->query("
        SELECT p.*, c.name as customer_name, i.invoice_number 
        FROM payments p 
        JOIN customers c ON p.customer_id = c.id 
        LEFT JOIN invoices i ON p.invoice_id = i.id 
        ORDER BY p.payment_date DESC
        LIMIT 5
    ");
    $payments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($payments);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>