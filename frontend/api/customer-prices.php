<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require_once '../db/database.php';

$db = Database::getInstance();

try {
    $customerId = $_GET['customer_id'] ?? null;
    if (!$customerId) {
        echo json_encode([]);
        exit;
    }
    
    $stmt = $db->prepare("
        SELECT cp.*, a.name as article_name 
        FROM customer_prices cp
        JOIN articles a ON cp.article_id = a.id
        WHERE cp.customer_id = ?
    ");
    $stmt->execute([$customerId]);
    $prices = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($prices);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>