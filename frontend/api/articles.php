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
                $stmt = $db->prepare("SELECT * FROM articles WHERE id = ?");
                $stmt->execute([$_GET['id']]);
                $article = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($article) {
                    echo json_encode($article);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Artikel hittades inte']);
                }
            } else {
                $stmt = $db->query("SELECT * FROM articles ORDER BY name");
                $articles = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($articles);
            }
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            $stmt = $db->prepare("INSERT INTO articles (name, description, price, type, vat_rate, is_rot_rut, unit, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))");
            $stmt->execute([
                $data['name'],
                $data['description'] ?? '',
                $data['price'],
                $data['type'],
                $data['vat_rate'] ?? 25,
                $data['is_rot_rut'] ? 1 : 0,
                $data['unit'] ?? 'st'
            ]);
            $id = $db->lastInsertId();
            echo json_encode(['id' => $id, 'message' => 'Artikel skapad']);
            break;

        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);
            $id = $_GET['id'] ?? null;
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'ID krävs']);
                break;
            }
            $stmt = $db->prepare("UPDATE articles SET name = ?, description = ?, price = ?, type = ?, vat_rate = ?, is_rot_rut = ?, unit = ?, updated_at = datetime('now') WHERE id = ?");
            $stmt->execute([
                $data['name'],
                $data['description'] ?? '',
                $data['price'],
                $data['type'],
                $data['vat_rate'] ?? 25,
                $data['is_rot_rut'] ? 1 : 0,
                $data['unit'] ?? 'st',
                $id
            ]);
            echo json_encode(['message' => 'Artikel uppdaterad']);
            break;

        case 'DELETE':
            $id = $_GET['id'] ?? null;
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'ID krävs']);
                break;
            }
            $stmt = $db->prepare("DELETE FROM articles WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['message' => 'Artikel borttagen']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>