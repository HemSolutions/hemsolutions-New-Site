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
            $stmt = $db->query("
                SELECT r.*, c.name as customer_name, i.invoice_number 
                FROM reminders r 
                JOIN customers c ON r.customer_id = c.id 
                JOIN invoices i ON r.invoice_id = i.id 
                ORDER BY r.reminder_date DESC
            ");
            $reminders = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($reminders);
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Get invoice info
            $stmt = $db->prepare("
                SELECT i.*, c.name as customer_name 
                FROM invoices i 
                JOIN customers c ON i.customer_id = c.id 
                WHERE i.id = ?
            ");
            $stmt->execute([$data['invoice_id']]);
            $invoice = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$invoice) {
                http_response_code(404);
                echo json_encode(['error' => 'Faktura hittades inte']);
                break;
            }
            
            // Determine reminder level and fee
            $stmt = $db->prepare("
                SELECT COUNT(*) FROM reminders WHERE invoice_id = ? AND status = 'sent'
            ");
            $stmt->execute([$data['invoice_id']]);
            $reminderCount = $stmt->fetchColumn();
            $reminderLevel = $reminderCount + 1;
            
            $feeAmount = 0;
            if ($reminderLevel === 1) $feeAmount = 60;
            elseif ($reminderLevel === 2) $feeAmount = 180;
            else $feeAmount = 300;
            
            $stmt = $db->prepare("
                INSERT INTO reminders (invoice_id, invoice_number, customer_id, customer_name, 
                    reminder_level, reminder_date, fee_amount, status, created_at) 
                VALUES (?, ?, ?, ?, ?, date('now', '+7 days'), ?, 'pending', datetime('now'))
            ");
            $stmt->execute([
                $data['invoice_id'],
                $invoice['invoice_number'],
                $invoice['customer_id'],
                $invoice['customer_name'],
                $reminderLevel,
                $feeAmount
            ]);
            
            $id = $db->lastInsertId();
            echo json_encode(['id' => $id, 'message' => 'Påminnelse skapad']);
            break;

        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);
            $id = $_GET['id'] ?? null;
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'ID krävs']);
                break;
            }
            $stmt = $db->prepare("UPDATE reminders SET status = ? WHERE id = ?");
            $stmt->execute([$data['status'], $id]);
            echo json_encode(['message' => 'Påminnelse uppdaterad']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>