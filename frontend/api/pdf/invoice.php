<?php
header('Content-Type: application/pdf');
header('Access-Control-Allow-Origin: *');

require_once '../db/database.php';

$id = $_GET['id'] ?? null;
if (!$id) {
    http_response_code(400);
    echo 'Invoice ID required';
    exit;
}

$db = Database::getInstance();

// Get invoice data
$stmt = $db->prepare("
    SELECT i.*, c.name as customer_name, c.email as customer_email, 
           c.phone as customer_phone, c.address as customer_address,
           c.city as customer_city, c.postal_code as customer_postal_code,
           c.org_number as customer_org_number,
           cs.company_name, cs.org_number as company_org_number,
           cs.address as company_address, cs.city as company_city,
           cs.postal_code as company_postal_code, cs.phone as company_phone,
           cs.email as company_email, cs.bankgiro, cs.plusgiro
    FROM invoices i 
    JOIN customers c ON i.customer_id = c.id 
    JOIN company_settings cs ON 1=1
    WHERE i.id = ?
");
$stmt->execute([$id]);
$invoice = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$invoice) {
    http_response_code(404);
    echo 'Invoice not found';
    exit;
}

// Get invoice items
$stmt = $db->prepare("SELECT * FROM invoice_items WHERE invoice_id = ?");
$stmt->execute([$id]);
$items = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Generate simple PDF content as HTML for now (can be enhanced with proper PDF library)
$pdf_content = "
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { margin-bottom: 30px; }
        .company-info { float: left; width: 50%; }
        .invoice-info { float: right; width: 50%; text-align: right; }
        .customer-info { clear: both; margin-top: 30px; margin-bottom: 30px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background-color: #f0f0f0; padding: 10px; text-align: left; border-bottom: 2px solid #333; }
        td { padding: 10px; border-bottom: 1px solid #ddd; }
        .totals { margin-top: 20px; text-align: right; }
        .total-row { font-weight: bold; font-size: 1.1em; }
        .footer { margin-top: 40px; font-size: 0.9em; color: #666; }
        .clear { clear: both; }
    </style>
</head>
<body>
    <div class='header'>
        <div class='company-info'>
            <h2>{$invoice['company_name']}</h2>
            <p>{$invoice['company_address']}<br>
            {$invoice['company_postal_code']} {$invoice['company_city']}<br>
            Org.nr: {$invoice['company_org_number']}<br>
            Telefon: {$invoice['company_phone']}<br>
            E-post: {$invoice['company_email']}</p>
        </div>
        <div class='invoice-info'>
            <h1>FAKTURA</h1>
            <p><strong>Fakturanr:</strong> {$invoice['invoice_number']}<br>
            <strong>Fakturadatum:</strong> {$invoice['issue_date']}<br>
            <strong>Förfallodatum:</strong> {$invoice['due_date']}<br>
            <strong>Betalningsvillkor:</strong> 30 dagar</p>
        </div>
        <div class='clear'></div>
    </div>
    
    <div class='customer-info'>
        <h3>Kund</h3>
        <p><strong>{$invoice['customer_name']}</strong><br>
        {$invoice['customer_address']}<br>
        {$invoice['customer_postal_code']} {$invoice['customer_city']}<br>
        " . ($invoice['customer_org_number'] ? "Org.nr: {$invoice['customer_org_number']}<br>" : "") . "
        " . ($invoice['customer_email'] ? "E-post: {$invoice['customer_email']}<br>" : "") . "
        " . ($invoice['customer_phone'] ? "Telefon: {$invoice['customer_phone']}" : "") . "</p>
    </div>
    
    <table>
        <thead>
            <tr>
                <th>Beskrivning</th>
                <th>Antal</th>
                <th>Á-pris</th>
                <th>Totalt</th>
            </tr>
        </thead>
        <tbody>
";

foreach ($items as $item) {
    $pdf_content .= "
            <tr>
                <td>{$item['article_name']}</td>
                <td>{$item['quantity']}</td>
                <td>" . number_format($item['unit_price'], 2, ',', ' ') . " kr</td>
                <td>" . number_format($item['total_price'], 2, ',', ' ') . " kr</td>
            </tr>
    ";
}

$subtotal = $invoice['total_amount'] - $invoice['vat_amount'];
$pdf_content .= "
        </tbody>
    </table>
    
    <div class='totals'>
        <p>Netto: " . number_format($subtotal, 2, ',', ' ') . " kr</p>
        <p>Moms (25%): " . number_format($invoice['vat_amount'], 2, ',', ' ') . " kr</p>
        " . ($invoice['is_rot_rut'] ? "<p>ROT/RUT-avdrag: -" . number_format($invoice['rot_rut_amount'], 2, ',', ' ') . " kr</p>" : "") . "
        <p class='total-row'>Att betala: " . number_format($invoice['total_amount'], 2, ',', ' ') . " kr</p>
    </div>
    
    <div class='footer'>
        <p><strong>Betalningsinformation:</strong><br>
        Bankgiro: {$invoice['bankgiro']}<br>
        Plusgiro: {$invoice['plusgiro']}</p>
        " . ($invoice['notes'] ? "<p><strong>Notering:</strong> {$invoice['notes']}</p>" : "") . "
    </div>
</body>
</html>
";

// Output as HTML for now (in production, use a PDF library like FPDF or mPDF)
echo $pdf_content;
?>