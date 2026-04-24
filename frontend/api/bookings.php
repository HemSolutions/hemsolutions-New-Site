<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

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
                // Get single booking with joins
                $stmt = $db->prepare("
                    SELECT 
                        b.*,
                        c.name as customer_name,
                        c.email as customer_email,
                        c.phone as customer_phone,
                        w.name as worker_name,
                        w.color as worker_color,
                        a.name as service_name
                    FROM bookings b
                    LEFT JOIN customers c ON b.customer_id = c.id
                    LEFT JOIN workers w ON b.worker_id = w.id
                    LEFT JOIN articles a ON b.service_id = a.id
                    WHERE b.id = ?
                ");
                $stmt->execute([$_GET['id']]);
                $booking = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($booking) {
                    echo json_encode($booking);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Bokning hittades inte']);
                }
            } elseif (isset($_GET['worker_id'])) {
                // Get bookings for a specific worker
                $start = $_GET['start'] ?? date('Y-m-d', strtotime('-1 month'));
                $end = $_GET['end'] ?? date('Y-m-d', strtotime('+3 months'));
                $stmt = $db->prepare("
                    SELECT 
                        b.*,
                        c.name as customer_name,
                        w.name as worker_name,
                        w.color as worker_color,
                        a.name as service_name
                    FROM bookings b
                    LEFT JOIN customers c ON b.customer_id = c.id
                    LEFT JOIN workers w ON b.worker_id = w.id
                    LEFT JOIN articles a ON b.service_id = a.id
                    WHERE b.worker_id = ? AND date(b.start_time) BETWEEN ? AND ?
                    ORDER BY b.start_time
                ");
                $stmt->execute([$_GET['worker_id'], $start, $end]);
                $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($bookings);
            } elseif (isset($_GET['start']) && isset($_GET['end'])) {
                // Get bookings in date range
                $stmt = $db->prepare("
                    SELECT 
                        b.*,
                        c.name as customer_name,
                        w.name as worker_name,
                        w.color as worker_color,
                        a.name as service_name
                    FROM bookings b
                    LEFT JOIN customers c ON b.customer_id = c.id
                    LEFT JOIN workers w ON b.worker_id = w.id
                    LEFT JOIN articles a ON b.service_id = a.id
                    WHERE date(b.start_time) BETWEEN ? AND ?
                    ORDER BY b.start_time
                ");
                $stmt->execute([$_GET['start'], $_GET['end']]);
                $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($bookings);
            } else {
                // Get all bookings (default to current month view)
                $start = date('Y-m-01');
                $end = date('Y-m-t', strtotime('+2 months'));
                $stmt = $db->prepare("
                    SELECT 
                        b.*,
                        c.name as customer_name,
                        w.name as worker_name,
                        w.color as worker_color,
                        a.name as service_name
                    FROM bookings b
                    LEFT JOIN customers c ON b.customer_id = c.id
                    LEFT JOIN workers w ON b.worker_id = w.id
                    LEFT JOIN articles a ON b.service_id = a.id
                    WHERE date(b.start_time) BETWEEN ? AND ?
                    ORDER BY b.start_time
                ");
                $stmt->execute([$start, $end]);
                $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($bookings);
            }
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Calculate end_time if not provided
            $start_time = $data['start_time'];
            $duration_hours = floatval($data['duration_hours'] ?? 1);
            $duration_minutes = intval($data['duration_minutes'] ?? 0);
            $total_minutes = ($duration_hours * 60) + $duration_minutes;
            
            if (empty($data['end_time'])) {
                $end_time = date('Y-m-d H:i:s', strtotime($start_time) + ($total_minutes * 60));
            } else {
                $end_time = $data['end_time'];
            }
            
            $stmt = $db->prepare("
                INSERT INTO bookings 
                (customer_id, worker_id, service_id, start_time, end_time, duration_hours, status, notes, is_recurring, recurrence_rule, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
            ");
            $stmt->execute([
                $data['customer_id'] ?? null,
                $data['worker_id'],
                $data['service_id'] ?? null,
                $start_time,
                $end_time,
                $duration_hours + ($duration_minutes / 60),
                $data['status'] ?? 'pending',
                $data['notes'] ?? '',
                $data['is_recurring'] ?? 0,
                $data['recurrence_rule'] ?? null
            ]);
            $id = $db->lastInsertId();
            
            // Return the created booking
            $stmt = $db->prepare("
                SELECT b.*, c.name as customer_name, w.name as worker_name, w.color as worker_color, a.name as service_name
                FROM bookings b
                LEFT JOIN customers c ON b.customer_id = c.id
                LEFT JOIN workers w ON b.worker_id = w.id
                LEFT JOIN articles a ON b.service_id = a.id
                WHERE b.id = ?
            ");
            $stmt->execute([$id]);
            $booking = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode($booking);
            break;

        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);
            $id = $_GET['id'] ?? null;
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'ID krävs']);
                break;
            }
            
            // Build update query dynamically
            $fields = [];
            $values = [];
            
            if (isset($data['customer_id'])) {
                $fields[] = 'customer_id = ?';
                $values[] = $data['customer_id'];
            }
            if (isset($data['worker_id'])) {
                $fields[] = 'worker_id = ?';
                $values[] = $data['worker_id'];
            }
            if (isset($data['service_id'])) {
                $fields[] = 'service_id = ?';
                $values[] = $data['service_id'];
            }
            if (isset($data['start_time'])) {
                $fields[] = 'start_time = ?';
                $values[] = $data['start_time'];
            }
            if (isset($data['end_time'])) {
                $fields[] = 'end_time = ?';
                $values[] = $data['end_time'];
            }
            if (isset($data['duration_hours'])) {
                $fields[] = 'duration_hours = ?';
                $values[] = $data['duration_hours'];
            }
            if (isset($data['status'])) {
                $fields[] = 'status = ?';
                $values[] = $data['status'];
            }
            if (isset($data['notes'])) {
                $fields[] = 'notes = ?';
                $values[] = $data['notes'];
            }
            if (isset($data['is_recurring'])) {
                $fields[] = 'is_recurring = ?';
                $values[] = $data['is_recurring'];
            }
            if (isset($data['recurrence_rule'])) {
                $fields[] = 'recurrence_rule = ?';
                $values[] = $data['recurrence_rule'];
            }
            
            if (empty($fields)) {
                http_response_code(400);
                echo json_encode(['error' => 'Inga fält att uppdatera']);
                break;
            }
            
            $fields[] = 'updated_at = datetime(\'now\')';
            $values[] = $id;
            
            $sql = "UPDATE bookings SET " . implode(', ', $fields) . " WHERE id = ?";
            $stmt = $db->prepare($sql);
            $stmt->execute($values);
            
            // Return updated booking
            $stmt = $db->prepare("
                SELECT b.*, c.name as customer_name, w.name as worker_name, w.color as worker_color, a.name as service_name
                FROM bookings b
                LEFT JOIN customers c ON b.customer_id = c.id
                LEFT JOIN workers w ON b.worker_id = w.id
                LEFT JOIN articles a ON b.service_id = a.id
                WHERE b.id = ?
            ");
            $stmt->execute([$id]);
            $booking = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode($booking);
            break;

        case 'DELETE':
            $id = $_GET['id'] ?? null;
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'ID krävs']);
                break;
            }
            $stmt = $db->prepare("DELETE FROM bookings WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['message' => 'Bokning borttagen']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>