<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require_once '../db/database.php';

$db = Database::getInstance();

try {
    // Total sales this year
    $stmt = $db->query("
        SELECT COALESCE(SUM(total_amount), 0) as total 
        FROM invoices 
        WHERE status = 'paid' AND strftime('%Y', created_at) = strftime('%Y', 'now')
    ");
    $totalSalesYear = $stmt->fetchColumn();
    
    // Total sales this month
    $stmt = $db->query("
        SELECT COALESCE(SUM(total_amount), 0) as total 
        FROM invoices 
        WHERE status = 'paid' 
        AND strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
    ");
    $totalSalesMonth = $stmt->fetchColumn();
    
    // Outstanding amount (unpaid invoices)
    $stmt = $db->query("
        SELECT COALESCE(SUM(total_amount), 0) as total 
        FROM invoices 
        WHERE status IN ('sent', 'draft')
    ");
    $outstandingAmount = $stmt->fetchColumn();
    
    // Overdue amount
    $stmt = $db->query("
        SELECT COALESCE(SUM(total_amount), 0) as total 
        FROM invoices 
        WHERE status = 'overdue'
    ");
    $overdueAmount = $stmt->fetchColumn();
    
    // Invoice counts
    $stmt = $db->query("SELECT COUNT(*) FROM invoices WHERE strftime('%Y', created_at) = strftime('%Y', 'now')");
    $invoiceCount = $stmt->fetchColumn();
    
    $stmt = $db->query("SELECT COUNT(*) FROM invoices WHERE status = 'paid' AND strftime('%Y', created_at) = strftime('%Y', 'now')");
    $paidInvoiceCount = $stmt->fetchColumn();
    
    echo json_encode([
        'total_sales_year' => (float) $totalSalesYear,
        'total_sales_month' => (float) $totalSalesMonth,
        'outstanding_amount' => (float) $outstandingAmount,
        'overdue_amount' => (float) $overdueAmount,
        'invoice_count' => (int) $invoiceCount,
        'paid_invoice_count' => (int) $paidInvoiceCount
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>