<?php
// Main API router
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);
$path = str_replace('/api/', '', $path);
$path = str_replace('/api', '', $path);

// Route to appropriate file
$api_files = [
    'customers.php',
    'articles.php', 
    'invoices.php',
    'receipts.php',
    'payments.php',
    'reminders.php',
    'settings.php',
    'customer-prices.php',
];

// Check if request is for admin subfolder
if (strpos($path, 'admin/') === 0) {
    $admin_file = str_replace('admin/', '', $path);
    $admin_path = __DIR__ . '/admin/' . $admin_file;
    if (file_exists($admin_path)) {
        require_once $admin_path;
        exit;
    }
}

// Check if request is for PDF subfolder
if (strpos($path, 'pdf/') === 0) {
    $pdf_file = str_replace('pdf/', '', $path);
    $pdf_path = __DIR__ . '/pdf/' . $pdf_file;
    if (file_exists($pdf_path)) {
        require_once $pdf_path;
        exit;
    }
}

// Check main API files
foreach ($api_files as $file) {
    if (strpos($path, $file) !== false || $path === $file || strpos($path, str_replace('.php', '', $file)) !== false) {
        $file_path = __DIR__ . '/' . $file;
        if (file_exists($file_path)) {
            require_once $file_path;
            exit;
        }
    }
}

// If no match, return 404
header('HTTP/1.0 404 Not Found');
echo json_encode(['error' => 'API endpoint not found', 'path' => $path]);
?>