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
                // Get single reklamation with comments
                $stmt = $db->prepare("
                    SELECT r.*, c.name as customer_name 
                    FROM reklamationer r 
                    LEFT JOIN customers c ON r.customer_id = c.id 
                    WHERE r.id = ?
                ");
                $stmt->execute([$_GET['id']]);
                $reklamation = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($reklamation) {
                    $reklamation['images'] = json_decode($reklamation['images'] ?? '[]', true) ?: [];
                    $stmt2 = $db->prepare("
                        SELECT rc.* FROM reklamation_comments rc 
                        WHERE rc.reklamation_id = ? 
                        ORDER BY rc.created_at ASC
                    ");
                    $stmt2->execute([$_GET['id']]);
                    $reklamation['comments'] = $stmt2->fetchAll(PDO::FETCH_ASSOC);
                    echo json_encode($reklamation);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Reklamation hittades inte']);
                }
            } else {
                $status = $_GET['status'] ?? null;
                if ($status && $status !== 'all') {
                    $stmt = $db->prepare("
                        SELECT r.*, c.name as customer_name 
                        FROM reklamationer r 
                        LEFT JOIN customers c ON r.customer_id = c.id 
                        WHERE r.status = ? 
                        ORDER BY r.created_at DESC
                    ");
                    $stmt->execute([$status]);
                } else {
                    $stmt = $db->query("
                        SELECT r.*, c.name as customer_name 
                        FROM reklamationer r 
                        LEFT JOIN customers c ON r.customer_id = c.id 
                        ORDER BY r.created_at DESC
                    ");
                }
                $reklamationer = $stmt->fetchAll(PDO::FETCH_ASSOC);
                foreach ($reklamationer as &$r) {
                    $r['images'] = json_decode($r['images'] ?? '[]', true) ?: [];
                }
                echo json_encode($reklamationer);
            }
            break;

        case 'POST':
            $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
            
            if (strpos($contentType, 'multipart/form-data') !== false) {
                // Form data with file upload
                $customerId = $_POST['customer_id'] ?? null;
                $title = $_POST['title'] ?? '';
                $description = $_POST['description'] ?? '';
                $status = $_POST['status'] ?? 'new';
                $shareCustomer = isset($_POST['share_with_customer']) ? 1 : 0;
                $shareWorker = isset($_POST['share_with_worker']) ? 1 : 0;
                
                // Handle image uploads
                $images = [];
                if (!empty($_FILES['images'])) {
                    $uploadDir = __DIR__ . '/../uploads/reklamationer/';
                    if (!is_dir($uploadDir)) {
                        mkdir($uploadDir, 0755, true);
                    }
                    
                    $fileCount = count($_FILES['images']['name']);
                    for ($i = 0; $i < $fileCount; $i++) {
                        if ($_FILES['images']['error'][$i] === UPLOAD_ERR_OK) {
                            $tmpName = $_FILES['images']['tmp_name'][$i];
                            $originalName = basename($_FILES['images']['name'][$i]);
                            $ext = pathinfo($originalName, PATHINFO_EXTENSION);
                            $newName = uniqid() . '.' . $ext;
                            $destination = $uploadDir . $newName;
                            
                            if (move_uploaded_file($tmpName, $destination)) {
                                $images[] = '/uploads/reklamationer/' . $newName;
                            }
                        }
                    }
                }
                
                $stmt = $db->prepare("
                    INSERT INTO reklamationer (customer_id, title, description, status, images, share_with_customer, share_with_worker, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
                ");
                $stmt->execute([
                    $customerId,
                    $title,
                    $description,
                    $status,
                    json_encode($images),
                    $shareCustomer,
                    $shareWorker
                ]);
                $id = $db->lastInsertId();
                echo json_encode(['id' => $id, 'message' => 'Reklamation skapad']);
                
            } else {
                // JSON data (for comments)
                $data = json_decode(file_get_contents('php://input'), true);
                
                if (isset($data['comment']) && isset($data['reklamation_id'])) {
                    // Add comment
                    $stmt = $db->prepare("
                        INSERT INTO reklamation_comments (reklamation_id, author_type, author_name, content, created_at)
                        VALUES (?, ?, ?, ?, datetime('now'))
                    ");
                    $stmt->execute([
                        $data['reklamation_id'],
                        $data['author_type'] ?? 'admin',
                        $data['author_name'] ?? 'Admin',
                        $data['content']
                    ]);
                    $id = $db->lastInsertId();
                    echo json_encode(['id' => $id, 'message' => 'Kommentar tillagd']);
                } else {
                    // Create reklamation without files
                    $stmt = $db->prepare("
                        INSERT INTO reklamationer (customer_id, title, description, status, images, share_with_customer, share_with_worker, created_at, updated_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
                    ");
                    $stmt->execute([
                        $data['customer_id'],
                        $data['title'],
                        $data['description'],
                        $data['status'] ?? 'new',
                        json_encode($data['images'] ?? []),
                        $data['share_with_customer'] ? 1 : 0,
                        $data['share_with_worker'] ? 1 : 0
                    ]);
                    $id = $db->lastInsertId();
                    echo json_encode(['id' => $id, 'message' => 'Reklamation skapad']);
                }
            }
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
            
            if (isset($data['title'])) { $updates[] = "title = ?"; $params[] = $data['title']; }
            if (isset($data['description'])) { $updates[] = "description = ?"; $params[] = $data['description']; }
            if (isset($data['status'])) { $updates[] = "status = ?"; $params[] = $data['status']; }
            if (isset($data['images'])) { $updates[] = "images = ?"; $params[] = json_encode($data['images']); }
            if (isset($data['share_with_customer'])) { $updates[] = "share_with_customer = ?"; $params[] = $data['share_with_customer'] ? 1 : 0; }
            if (isset($data['share_with_worker'])) { $updates[] = "share_with_worker = ?"; $params[] = $data['share_with_worker'] ? 1 : 0; }
            
            if (empty($updates)) {
                echo json_encode(['message' => 'Inga ändringar']);
                break;
            }
            
            $updates[] = "updated_at = datetime('now')";
            $sql = "UPDATE reklamationer SET " . implode(', ', $updates) . " WHERE id = ?";
            $params[] = $id;
            $stmt = $db->prepare($sql);
            $stmt->execute($params);
            echo json_encode(['message' => 'Reklamation uppdaterad']);
            break;

        case 'DELETE':
            $id = $_GET['id'] ?? null;
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'ID krävs']);
                break;
            }
            // Delete comments first
            $stmt = $db->prepare("DELETE FROM reklamation_comments WHERE reklamation_id = ?");
            $stmt->execute([$id]);
            // Delete reklamation
            $stmt = $db->prepare("DELETE FROM reklamationer WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['message' => 'Reklamation borttagen']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
