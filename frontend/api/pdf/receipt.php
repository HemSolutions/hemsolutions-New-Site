<?php
header('Content-Type: application/pdf');
header('Access-Control-Allow-Origin: *');

require_once '../db/database.php';

$id = $_GET['id'] ?? null;
if (!$id) {
    http_response_code(400);
    echo 'Receipt ID required';
    exit;
}

$db = Database::getInstance();

// Get receipt data
$stmt = $db->prepare("
    SELECT r.*, c.name as customer_name, c.email as customer_email, 
           c.phone as customer_phone,
           cs.company_name, cs.org_number as company_org_number,
           cs.address as company_address, cs.city as company_city,
           cs.postal_code as company_postal_code, cs.phone as company_phone,
           cs.email as company_email, cs.org_number, cs.vat_number
    FROM receipts r 
    JOIN customers c ON r.customer_id = c.id 
    JOIN company_settings cs ON 1=1
    WHERE r.id = ?
");
$stmt->execute([$id]);
$receipt = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$receipt) {
    http_response_code(404);
    echo 'Receipt not found';
    exit;
}

// Get receipt items
$stmt = $db->prepare("SELECT * FROM receipt_items WHERE receipt_id = ?");
$stmt->execute([$id]);
$items = $stmt->fetchAll(PDO::FETCH_ASSOC);

$payment_methods = [
    'swish' => 'Swish',
    'card' => 'Kort',
    'bank_transfer' => 'Banköverföring',
    'cash' => 'Kontant',
];

// Generate simple PDF content as HTML
$pdf_content = "
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; margin-bottom: 30px; }
        .company-info { margin-bottom: 20px; }
        .receipt-title { font-size: 24px; font-weight: bold; margin: 20px 0; }
        .receipt-number { font-size: 18px; color: #666; }
        .customer-info { margin: 30px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background-color: #f0f0f0; padding: 10px; text-align: left; border-bottom: 2px solid #333; }
        td { padding: 10px; border-bottom: 1px solid #ddd; }
        .totals { margin-top: 20px; text-align: right; }
        .total-row { font-weight: bold; font-size: 1.2em; border-top: 2px solid #333; padding-top: 10px; }
        .footer { margin-top: 40px; text-align: center; font-size: 0.9em; color: #666; }
        .payment-method { background: #f0f0f0; padding: 10px; margin: 20px 0; text-align: center; }
    </style>
</head>
<body>
    <div class='header'>
        <div class='company-info'>
            <h2>{$receipt['company_name']}</h2>
            <p>{$receipt['company_address']}, {$receipt['company_postal_code']} {$receipt['company_city']}<br>
            Org.nr: {$receipt['org_number']} | Momsnr: {$receipt['vat_number']}</p>
        </div>
        <div class='receipt-title'>KVITTO</div>
        <div class='receipt-number'>{$receipt['receipt_number']}</div>
        <p>Datum: {$receipt['issue_date']}</p>
    </div>
    
    <div class='customer-info'>
        <p><strong>Kund:</strong> {$receipt['customer_name']}<br>
        " . ($receipt['customer_email'] ? "E-post: {$receipt['customer_email']}<br>" : "") . "
        " . ($receipt['customer_phone'] ? "Telefon: {$receipt['customer_phone']}" : "") . "</p>
    </div>
    
    <table>
        <thead>
            <tr>
                <th>Artikel</th>
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

$subtotal = $receipt['total_amount'] - $receipt['vat_amount'];
$pdf_content .= "
        </tbody>
    </table>
    
    <div class='totals'>
        <p>Netto: " . number_format($subtotal, 2, ',', ' ') . " kr</p>
        <p>Moms (25%): " . number_format($receipt['vat_amount'], 2, ',', ' ') . " kr</p>
        <p class='total-row'>TOTALT: " . number_format($receipt['total_amount'], 2, ',', ' ') . " kr</p>
    </div>
    
    <div class='payment-method'>
        <strong>Betalningsmetod:</strong> " . ($payment_methods[$receipt['payment_method']] ?? $receipt['payment_method']) . "
    </div>
    
    <div class='footer'>
        <p>Tack för ditt köp!</p>
        <p>{$receipt['company_name']} | {$receipt['company_email']}</p>
    </div>
</body>
</html>
";

echo $pdf_content;
?>