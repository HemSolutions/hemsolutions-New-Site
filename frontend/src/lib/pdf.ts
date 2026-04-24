import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { InvoiceWithCustomer, InvoiceItem, Receipt, CompanySettings } from '../types';

// Swedish currency formatter
export function formatSEK(amount: number): string {
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: 'SEK',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount).replace('kr', '').trim() + ' kr';
}

// Format number with Swedish style (space as thousand separator)
export function formatNumberSwedish(num: number): string {
  return new Intl.NumberFormat('sv-SE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

// Format date in Swedish style
export function formatDateSwedish(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('sv-SE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Format short date (YYYY-MM-DD)
export function formatDateShortSwedish(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('sv-SE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

// Default company settings (fallback)
const defaultCompanySettings: Partial<CompanySettings> = {
  company_name: 'HemSolutions Sverige AB',
  org_number: '559123-4567',
  address: 'Företagsvägen 12',
  postal_code: '211 55',
  city: 'Malmö',
  phone: '070-123 45 67',
  email: 'info@hemsolutions.se',
  website: 'www.hemsolutions.se',
  bankgiro: '123-4567',
  plusgiro: '12 34 56-7',
  bank_account: 'SE45 5000 0000 0580 1234 5678',
  vat_number: 'SE559123456701',
};

export interface InvoicePDFData extends InvoiceWithCustomer {
  items?: InvoiceItem[];
  companySettings?: CompanySettings;
  reference?: string;
  our_reference?: string;
  payment_terms?: string;
  person_number?: string;
}

export interface ReceiptPDFData extends Receipt {
  items?: Array<{
    id: number;
    receipt_id: number;
    article_id: number;
    article_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  companySettings?: CompanySettings;
}

/**
 * Generate professional Swedish invoice PDF (BillingPoint style)
 */
export function generateInvoicePDF(invoice: InvoicePDFData): jsPDF {
  const doc = new jsPDF();
  const settings = invoice.companySettings || defaultCompanySettings;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const rightCol = pageWidth - margin;
  let currentY = margin;

  // --- Header Area ---
  // Company info on the right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(33, 37, 41);
  doc.text(settings.company_name || 'Företagsnamn', rightCol, currentY, { align: 'right' });
  
  currentY += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(73, 80, 87);
  doc.text(`${settings.address || ''}`, rightCol, currentY, { align: 'right' });
  currentY += 4;
  doc.text(`${settings.postal_code || ''} ${settings.city || ''}`, rightCol, currentY, { align: 'right' });
  currentY += 4;
  doc.text(`Tel: ${settings.phone || ''}`, rightCol, currentY, { align: 'right' });
  currentY += 4;
  doc.text(`${settings.email || ''}`, rightCol, currentY, { align: 'right' });
  
  // Reset Y for invoice title on the left
  currentY = margin + 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(33, 37, 41);
  doc.text('FAKTURA', margin, currentY);
  
  currentY += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(108, 117, 125);
  doc.text(`${settings.vat_number || ''}`, margin, currentY);

  // --- Invoice & Customer Details Box ---
  currentY += 20;
  const boxHeight = 55;
  
  // Invoice details box (left)
  doc.setFillColor(248, 249, 250);
  doc.rect(margin, currentY - 3, 80, boxHeight, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(33, 37, 41);
  doc.text('Fakturadetaljer', margin + 5, currentY + 6);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(73, 80, 87);
  
  const detailRows = [
    ['Fakturanummer:', invoice.invoice_number || ''],
    ['Fakturadatum:', formatDateShortSwedish(invoice.issue_date)],
    ['Förfallodatum:', formatDateShortSwedish(invoice.due_date)],
    ['Betalningsvillkor:', invoice.payment_terms || '30 dagar'],
  ];
  if (invoice.reference) {
    detailRows.push(['Er referens:', invoice.reference]);
  }
  if (invoice.our_reference) {
    detailRows.push(['Vår referens:', invoice.our_reference]);
  }
  
  let detailY = currentY + 14;
  detailRows.forEach(([label, value]) => {
    doc.text(label, margin + 5, detailY);
    doc.text(value, margin + 40, detailY);
    detailY += 5;
  });

  // Customer box (right)
  doc.setDrawColor(222, 226, 230);
  doc.rect(margin + 85, currentY - 3, pageWidth - margin - 85 - margin, boxHeight, 'D');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(33, 37, 41);
  doc.text('Kund', margin + 90, currentY + 6);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(73, 80, 87);
  
  let custY = currentY + 14;
  doc.text(invoice.customer_name || '', margin + 90, custY);
  custY += 5;
  if (invoice.customer_address) {
    doc.text(invoice.customer_address, margin + 90, custY);
    custY += 5;
  }
  if (invoice.customer_email) {
    doc.text(invoice.customer_email, margin + 90, custY);
    custY += 5;
  }
  if (invoice.customer_phone) {
    doc.text(invoice.customer_phone, margin + 90, custY);
    custY += 5;
  }
  if (invoice.person_number) {
    doc.text(`Personnr: ${invoice.person_number}`, margin + 90, custY);
  }

  currentY += boxHeight + 10;

  // --- Line Items Table ---
  const items = invoice.items || [];
  const tableData = items.map((item) => [
    item.article_name,
    item.quantity.toString(),
    'st',
    formatSEK(item.unit_price),
    `${item.vat_rate}%`,
    formatSEK(item.total_price),
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Beskrivning', 'Antal', 'Enhet', 'À-pris', 'Moms %', 'Belopp']],
    body: tableData,
    theme: 'plain',
    headStyles: {
      fillColor: [33, 37, 41],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      cellPadding: { top: 4, bottom: 4, left: 3, right: 3 },
    },
    styles: {
      fontSize: 9,
      cellPadding: { top: 4, bottom: 4, left: 3, right: 3 },
      lineColor: [222, 226, 230],
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 25, halign: 'center' },
      3: { cellWidth: 35, halign: 'right' },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 35, halign: 'right' },
    },
    margin: { left: margin, right: margin },
    alternateRowStyles: {
      fillColor: [248, 249, 250],
    },
  });

  let finalY = (doc as any).lastAutoTable?.finalY || currentY;
  currentY = finalY + 12;

  // --- Totals Section ---
  const summaryX = pageWidth - margin - 100;
  const subtotal = invoice.total_amount - invoice.vat_amount;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(73, 80, 87);
  
  // Horizontal line above totals
  doc.setDrawColor(222, 226, 230);
  doc.line(summaryX - 5, currentY - 5, rightCol, currentY - 5);
  
  doc.text('Nettosumma:', summaryX, currentY);
  doc.text(formatSEK(subtotal), rightCol, currentY, { align: 'right' });
  
  currentY += 7;
  doc.text(`Moms:`, summaryX, currentY);
  doc.text(formatSEK(invoice.vat_amount), rightCol, currentY, { align: 'right' });
  
  currentY += 7;
  doc.text('Brutto:', summaryX, currentY);
  doc.text(formatSEK(invoice.total_amount), rightCol, currentY, { align: 'right' });
  
  // ROT/RUT deduction
  if (invoice.is_rot_rut && invoice.rot_rut_amount > 0) {
    currentY += 7;
    doc.setTextColor(13, 110, 253);
    doc.text(`${invoice.rot_rut_amount > 0 ? (invoice.rot_rut_amount > invoice.total_amount * 0.3 ? 'RUT' : 'ROT') : 'ROT/RUT'}-avdrag:`, summaryX, currentY);
    doc.text(`-${formatSEK(invoice.rot_rut_amount)}`, rightCol, currentY, { align: 'right' });
    doc.setTextColor(73, 80, 87);
  }
  
  currentY += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(33, 37, 41);
  doc.text('Att betala:', summaryX, currentY);
  doc.text(formatSEK(invoice.total_amount), rightCol, currentY, { align: 'right' });

  // --- Notes Section ---
  if (invoice.notes) {
    currentY += 18;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(33, 37, 41);
    doc.text('Anteckningar:', margin, currentY);
    
    currentY += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(73, 80, 87);
    const splitNotes = doc.splitTextToSize(invoice.notes, pageWidth - margin * 2);
    doc.text(splitNotes, margin, currentY);
    currentY += splitNotes.length * 3.5;
  }

  // --- Footer - Payment info ---
  const footerY = doc.internal.pageSize.getHeight() - 35;
  doc.setDrawColor(222, 226, 230);
  doc.line(margin, footerY - 3, rightCol, footerY - 3);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(33, 37, 41);
  doc.text('Betalningsinformation', margin, footerY + 3);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(108, 117, 125);
  
  const paymentInfo = [
    `Bankgiro: ${settings.bankgiro || 'N/A'}`,
    `Plusgiro: ${settings.plusgiro || 'N/A'}`,
    `Bankkonto: ${settings.bank_account || 'N/A'}`,
    `IBAN: ${settings.iban || 'N/A'}`,
    `BIC/SWIFT: ${settings.swift || 'N/A'}`,
    `Swish: ${settings.phone || 'N/A'}`,
  ];
  
  let payY = footerY + 9;
  const colWidth = (pageWidth - margin * 2) / 2;
  paymentInfo.forEach((info, i) => {
    const x = i < 3 ? margin : margin + colWidth;
    const y = payY + (i % 3) * 4.5;
    doc.text(info, x, y);
  });
  
  // Contact info
  payY = footerY + 26;
  doc.text(`Vid frågor, kontakta oss på ${settings.email || ''} eller ${settings.phone || ''}`, margin, payY);

  return doc;
}

/**
 * Generate simplified receipt PDF
 */
export function generateReceiptPDF(receipt: ReceiptPDFData): jsPDF {
  const doc = new jsPDF();
  const settings = receipt.companySettings || defaultCompanySettings;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const centerX = pageWidth / 2;
  let currentY = 20;

  // Header - Receipt title centered
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(33, 37, 41);
  doc.text('KVITTO', centerX, currentY, { align: 'center' });

  // Company info centered below title
  currentY += 15;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(settings.company_name || 'Företagsnamn', centerX, currentY, { align: 'center' });
  
  currentY += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(108, 117, 125);
  doc.text(`${settings.address || ''}, ${settings.postal_code || ''} ${settings.city || ''}`, centerX, currentY, { align: 'center' });
  
  currentY += 5;
  doc.text(`Org.nr: ${settings.org_number || ''} | Tel: ${settings.phone || ''}`, centerX, currentY, { align: 'center' });

  // Receipt details
  currentY += 20;
  doc.setDrawColor(222, 226, 230);
  doc.line(margin, currentY - 5, pageWidth - margin, currentY - 5);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(33, 37, 41);
  doc.text(`Kvittonummer: ${receipt.receipt_number}`, margin, currentY);
  doc.text(formatDateSwedish(receipt.issue_date), pageWidth - margin, currentY, { align: 'right' });

  // Customer info
  currentY += 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Kund:', margin, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(receipt.customer_name || '', margin + 20, currentY);

  // Line items table
  currentY += 15;
  const items = receipt.items || [];
  const tableData = items.map((item) => [
    item.article_name,
    formatNumberSwedish(item.quantity),
    `${formatSEK(item.unit_price)}`,
    `${formatSEK(item.total_price)}`,
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Artikel', 'Antal', 'À-pris', 'Totalt']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [33, 37, 41],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
    },
    columnStyles: {
      0: { cellWidth: 'auto', halign: 'left' },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' },
    },
    margin: { left: margin, right: margin },
    alternateRowStyles: {
      fillColor: [248, 249, 250],
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 15;
  currentY = finalY;

  // Summary section
  const summaryX = pageWidth - margin - 70;
  const subtotal = receipt.total_amount - receipt.vat_amount;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(73, 80, 87);
  
  doc.text('Nettosumma:', summaryX, currentY);
  doc.text(formatSEK(subtotal), pageWidth - margin, currentY, { align: 'right' });
  
  currentY += 7;
  doc.text('Moms (25%):', summaryX, currentY);
  doc.text(formatSEK(receipt.vat_amount), pageWidth - margin, currentY, { align: 'right' });

  // Payment method
  currentY += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  const paymentMethodLabels: Record<string, string> = {
    swish: 'Swish',
    card: 'Kort',
    bank_transfer: 'Banköverföring',
    cash: 'Kontant',
  };
  doc.text(`Betalningsmetod: ${paymentMethodLabels[receipt.payment_method] || receipt.payment_method}`, margin, currentY);

  currentY += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(33, 37, 41);
  doc.text('TOTALT', summaryX, currentY);
  doc.text(formatSEK(receipt.total_amount), pageWidth - margin, currentY, { align: 'right' });

  // Thank you message
  currentY += 25;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(108, 117, 125);
  doc.text('Tack för ditt köp!', centerX, currentY, { align: 'center' });

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setFontSize(8);
  doc.text(`Vid frågor: ${settings.email || ''} | ${settings.website || ''}`, centerX, footerY, { align: 'center' });

  return doc;
}

/**
 * Open PDF in new tab
 */
export function openPDFInNewTab(doc: jsPDF, filename: string): void {
  const pdfOutput = doc.output('blob');
  const url = URL.createObjectURL(pdfOutput);
  const newWindow = window.open(url, '_blank');
  if (newWindow) {
    newWindow.document.title = filename;
  }
}

/**
 * Download PDF file
 */
export function downloadPDF(doc: jsPDF, filename: string): void {
  doc.save(filename);
}

/**
 * Get PDF as blob for upload/email
 */
export function getPDFBlob(doc: jsPDF): Blob {
  return doc.output('blob');
}
