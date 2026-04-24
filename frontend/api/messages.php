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
require_once 'sms-service.php';

$method = $_SERVER['REQUEST_METHOD'];
$db = Database::getInstance();

try {
    switch ($method) {
        case 'GET':
            $conversation = $_GET['conversation'] ?? null;
            if ($conversation) {
                // Get messages for a specific conversation (between two parties)
                $parts = explode(':', $conversation);
                if (count($parts) === 4) {
                    [$type1, $id1, $type2, $id2] = $parts;
                    $stmt = $db->prepare("
                        SELECT * FROM messages 
                        WHERE (sender_type = ? AND sender_id = ? AND recipient_type = ? AND recipient_id = ?)
                           OR (sender_type = ? AND sender_id = ? AND recipient_type = ? AND recipient_id = ?)
                        ORDER BY created_at ASC
                    ");
                    $stmt->execute([$type1, $id1, $type2, $id2, $type2, $id2, $type1, $id1]);
                    $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    foreach ($messages as &$msg) {
                        $msg['attachments'] = json_decode($msg['attachments'] ?? '[]', true) ?: [];
                    }
                    echo json_encode($messages);
                } else {
                    http_response_code(400);
                    echo json_encode(['error' => 'Invalid conversation format']);
                }
            } else {
                $stmt = $db->query("SELECT * FROM messages ORDER BY created_at DESC LIMIT 200");
                $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
                foreach ($messages as &$msg) {
                    $msg['attachments'] = json_decode($msg['attachments'] ?? '[]', true) ?: [];
                }
                echo json_encode($messages);
            }
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            
            $channels = [];
            if (isset($data['channels'])) {
                $channels = is_array($data['channels']) ? $data['channels'] : explode(',', $data['channels']);
            } else if (isset($data['channel'])) {
                $channels = $data['channel'] === 'all' ? ['app', 'sms', 'email'] : [$data['channel']];
            } else {
                $channels = ['app'];
            }
            
            $attachments = json_encode($data['attachments'] ?? []);
            $senderType = $data['sender_type'] ?? 'admin';
            $senderId = $data['sender_id'] ?? 1;
            $senderName = $data['sender_name'] ?? 'Admin';
            
            $stmt = $db->prepare("
                INSERT INTO messages (sender_type, sender_id, sender_name, recipient_type, recipient_id, recipient_name, content, channel, status, attachments, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
            ");
            
            $results = [];
            foreach ($channels as $channel) {
                $channel = trim($channel);
                $status = $channel === 'app' ? 'sent' : 'pending';
                
                $stmt->execute([
                    $senderType,
                    $senderId,
                    $senderName,
                    $data['recipient_type'],
                    $data['recipient_id'],
                    $data['recipient_name'] ?? '',
                    $data['content'],
                    $channel,
                    $status,
                    $attachments
                ]);
                $id = $db->lastInsertId();
                $results[] = ['id' => $id, 'channel' => $channel, 'status' => $status];
                
                // SMS integration via 46elks
                if ($channel === 'sms') {
                    $smsService = createSMSService();
                    if ($smsService) {
                        // Get recipient phone number
                        $recipientPhone = '';
                        if ($data['recipient_type'] === 'customer') {
                            $phoneStmt = $db->prepare("SELECT phone FROM customers WHERE id = ?");
                            $phoneStmt->execute([$data['recipient_id']]);
                            $recipientPhone = $phoneStmt->fetchColumn() ?: '';
                        } else if ($data['recipient_type'] === 'worker') {
                            $phoneStmt = $db->prepare("SELECT phone FROM workers WHERE id = ?");
                            $phoneStmt->execute([$data['recipient_id']]);
                            $recipientPhone = $phoneStmt->fetchColumn() ?: '';
                        }
                        
                        if ($recipientPhone) {
                            $smsResult = $smsService->sendSMS($recipientPhone, $data['content']);
                            if ($smsResult['success']) {
                                $status = 'sent';
                            } else {
                                error_log('SMS failed: ' . ($smsResult['error'] ?? 'Unknown error'));
                            }
                        }
                    }
                }
                
                // Email integration placeholder
                if ($channel === 'email') {
                    // TODO: Integrate with email service
                    // $emailResult = sendEmail($recipientEmail, $subject, $content);
                }
            }
            
            echo json_encode(['results' => $results, 'message' => 'Meddelande skickat']);
            break;

        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);
            $id = $_GET['id'] ?? null;
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'ID krävs']);
                break;
            }
            $stmt = $db->prepare("UPDATE messages SET status = ? WHERE id = ?");
            $stmt->execute([$data['status'] ?? 'read', $id]);
            echo json_encode(['message' => 'Meddelande uppdaterat']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
