<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, PUT, OPTIONS');
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
            $stmt = $db->query("SELECT * FROM company_settings LIMIT 1");
            $settings = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($settings) {
                echo json_encode($settings);
            } else {
                // Return default settings
                echo json_encode([
                    'id' => 1,
                    'company_name' => 'Demo AB',
                    'org_number' => '556677-8899',
                    'address' => 'Storgatan 1',
                    'city' => 'Stockholm',
                    'postal_code' => '111 22',
                    'phone' => '08-123 45 67',
                    'email' => 'info@demoab.se',
                    'website' => 'www.demoab.se',
                    'bankgiro' => '123-4567',
                    'plusgiro' => '12 34 56-7',
                    'bank_account' => 'SE12 3456 7890 1234 5678 9012',
                    'vat_number' => 'SE556677889901'
                ]);
            }
            break;

        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);
            
            $stmt = $db->query("SELECT id FROM company_settings LIMIT 1");
            $exists = $stmt->fetchColumn();
            
            if ($exists) {
                $stmt = $db->prepare("
                    UPDATE company_settings 
                    SET company_name = ?, org_number = ?, address = ?, city = ?, postal_code = ?,
                        phone = ?, email = ?, website = ?, bankgiro = ?, plusgiro = ?,
                        bank_account = ?, vat_number = ?, updated_at = datetime('now')
                    WHERE id = ?
                ");
                $stmt->execute([
                    $data['company_name'],
                    $data['org_number'],
                    $data['address'],
                    $data['city'],
                    $data['postal_code'],
                    $data['phone'],
                    $data['email'],
                    $data['website'],
                    $data['bankgiro'],
                    $data['plusgiro'],
                    $data['bank_account'],
                    $data['vat_number'],
                    $exists
                ]);
            } else {
                $stmt = $db->prepare("
                    INSERT INTO company_settings 
                    (company_name, org_number, address, city, postal_code, phone, email, website,
                     bankgiro, plusgiro, bank_account, vat_number, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
                ");
                $stmt->execute([
                    $data['company_name'],
                    $data['org_number'],
                    $data['address'],
                    $data['city'],
                    $data['postal_code'],
                    $data['phone'],
                    $data['email'],
                    $data['website'],
                    $data['bankgiro'],
                    $data['plusgiro'],
                    $data['bank_account'],
                    $data['vat_number']
                ]);
            }
            
            echo json_encode(['message' => 'Inställningar sparade']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>