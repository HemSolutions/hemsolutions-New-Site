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
                $stmt = $db->prepare("SELECT * FROM workers WHERE id = ?");
                $stmt->execute([$_GET['id']]);
                $worker = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($worker) {
                    echo json_encode($worker);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Arbetare hittades inte']);
                }
            } else {
                $stmt = $db->query("SELECT * FROM workers WHERE is_active = 1 ORDER BY name");
                $workers = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($workers);
            }
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            $stmt = $db->prepare("INSERT INTO workers (name, email, phone, color, role, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))");
            $stmt->execute([
                $data['name'],
                $data['email'] ?? null,
                $data['phone'] ?? null,
                $data['color'] ?? '#3B82F6',
                $data['role'] ?? 'employee',
                $data['is_active'] ?? 1
            ]);
            $id = $db->lastInsertId();
            echo json_encode(['id' => $id, 'message' => 'Arbetare skapad']);
            break;

        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);
            $id = $_GET['id'] ?? null;
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'ID krävs']);
                break;
            }
            $stmt = $db->prepare("UPDATE workers SET name = ?, email = ?, phone = ?, color = ?, role = ?, is_active = ?, updated_at = datetime('now') WHERE id = ?");
            $stmt->execute([
                $data['name'],
                $data['email'] ?? null,
                $data['phone'] ?? null,
                $data['color'] ?? '#3B82F6',
                $data['role'] ?? 'employee',
                $data['is_active'] ?? 1,
                $id
            ]);
            echo json_encode(['message' => 'Arbetare uppdaterad']);
            break;

        case 'DELETE':
            $id = $_GET['id'] ?? null;
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'ID krävs']);
                break;
            }
            // Soft delete - just deactivate
            $stmt = $db->prepare("UPDATE workers SET is_active = 0, updated_at = datetime('now') WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['message' => 'Arbetare inaktiverad']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>