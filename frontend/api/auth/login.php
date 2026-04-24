<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../db/database.php';

$method = $_SERVER['REQUEST_METHOD'];
$db = Database::getInstance();

// Simple token generation
function generateToken($userId) {
    $payload = json_encode([
        'sub' => $userId,
        'iat' => time(),
        'exp' => time() + (24 * 60 * 60) // 24 hours
    ]);
    $base64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    $signature = hash_hmac('sha256', $base64Payload, 'hemsolutions-secret-key-2025');
    return $base64Payload . '.' . $signature;
}

function verifyToken($token) {
    $parts = explode('.', $token);
    if (count($parts) !== 2) return false;
    
    $expectedSig = hash_hmac('sha256', $parts[0], 'hemsolutions-secret-key-2025');
    return hash_equals($expectedSig, $parts[1]);
}

try {
    switch ($method) {
        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            $email = $data['email'] ?? '';
            $password = $data['password'] ?? '';
            
            if (empty($email) || empty($password)) {
                http_response_code(400);
                echo json_encode(['error' => 'E-post och lösenord krävs']);
                exit;
            }
            
            // Check admin credentials
            if ($email === 'info@hemsolutions.se' && $password === 'Mzeeshan786') {
                $token = generateToken(1);
                echo json_encode([
                    'success' => true,
                    'token' => $token,
                    'user' => [
                        'id' => 1,
                        'email' => 'info@hemsolutions.se',
                        'name' => 'Admin',
                        'role' => 'admin'
                    ]
                ]);
                exit;
            }
            
            // Check workers table
            $stmt = $db->prepare("SELECT * FROM workers WHERE email = ? AND password = ?");
            $stmt->execute([$email, $password]);
            $worker = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($worker) {
                $token = generateToken($worker['id']);
                echo json_encode([
                    'success' => true,
                    'token' => $token,
                    'user' => [
                        'id' => $worker['id'],
                        'email' => $worker['email'],
                        'name' => $worker['name'],
                        'role' => 'employee'
                    ]
                ]);
                exit;
            }
            
            // Check customers table
            $stmt = $db->prepare("SELECT * FROM customers WHERE email = ? AND person_number = ?");
            $stmt->execute([$email, $password]);
            $customer = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($customer) {
                $token = generateToken($customer['id']);
                echo json_encode([
                    'success' => true,
                    'token' => $token,
                    'user' => [
                        'id' => $customer['id'],
                        'email' => $customer['email'],
                        'name' => $customer['name'],
                        'role' => 'customer'
                    ]
                ]);
                exit;
            }
            
            http_response_code(401);
            echo json_encode(['error' => 'Felaktig e-post eller lösenord']);
            break;
            
        case 'GET':
            // Verify token
            $headers = getallheaders();
            $authHeader = $headers['Authorization'] ?? '';
            $token = str_replace('Bearer ', '', $authHeader);
            
            if ($token && verifyToken($token)) {
                echo json_encode(['valid' => true]);
            } else {
                http_response_code(401);
                echo json_encode(['valid' => false]);
            }
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>