<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require_once '../db/database.php';

$db = Database::getInstance();

try {
    $stmt = $db->query("
        SELECT 
            i.customer_id,
            c.name as customer_name,
            COALESCE(SUM(i.total_amount), 0) as total_amount,
            COUNT(i.id) as invoice_count
        FROM invoices i
        JOIN customers c ON i.customer_id = c.id
        WHERE i.status = 'paid' AND strftime('%Y', i.created_at) = strftime('%Y', 'now')
        GROUP BY i.customer_id, c.name
        ORDER BY total_amount DESC
        LIMIT 5
    ");
    $customers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($customers);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>