<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require_once '../db/database.php';

$db = Database::getInstance();

try {
    $stmt = $db->query("
        SELECT r.*, c.name as customer_name, i.invoice_number 
        FROM reminders r 
        JOIN customers c ON r.customer_id = c.id 
        JOIN invoices i ON r.invoice_id = i.id 
        WHERE r.status = 'pending'
        ORDER BY r.reminder_date ASC
        LIMIT 10
    ");
    $reminders = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($reminders);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>