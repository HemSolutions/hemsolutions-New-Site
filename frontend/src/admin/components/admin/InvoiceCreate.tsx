import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, FileText, QrCode, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LineItem {
  id: number;
  description: string;
  quantity: number;
  unit: string;
  price: number;
  discount: number;
  vat: number;
}

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  postcode: string;
  city: string;
  org_number?: string;
  rut_eligible?: boolean;
}

interface CompanySettings {
  name: string;
  address: string;
  postcode: string;
  city: string;
  phone: string;
  email: string;
  org_number: string;
  vat_number: string;
  bankgiro: string;
  bank_account: string;
  logo?: string;
  next_invoice_number: number;
  default_payment_terms: number;
  default_vat: number;
}

export default function InvoiceCreate({ apiBaseUrl, rutMode = false }: { apiBaseUrl: string; rutMode?: boolean }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<number | ''>('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('14');
  const [ourContact, setOurContact] = useState('');
  const [customerContact, setCustomerContact] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: 1, description: '', quantity: 1, unit: 'tim', price: 0, discount: 0, vat: 25 }
  ]);
  const [notes, setNotes] = useState('');
  const [isRUT, setIsRUT] = useState(rutMode);
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchCustomers();
    fetchSettings();
    calculateDueDate();
  }, []);

  useEffect(() => {
    calculateDueDate();
  }, [invoiceDate, paymentTerms]);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${apiBaseUrl}/customers?limit=100`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers || []);
      }
    } catch (e) { console.error(e); }
  };

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${apiBaseUrl}/settings`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setCompanySettings({
            name: data.settings.company_name || 'HemSolutions Sverige AB',
            address: data.settings.company_address || '',
            postcode: data.settings.company_postcode || '',
            city: data.settings.company_city || '',
            phone: data.settings.company_phone || '',
            email: data.settings.company_email || '',
            org_number: data.settings.company_org_number || '',
            vat_number: data.settings.company_vat_number || '',
            bankgiro: data.settings.company_bankgiro || '',
            bank_account: data.settings.company_bank_account || '',
            logo: data.settings.company_logo || '',
            next_invoice_number: parseInt(data.settings.next_invoice_number) || 1000,
            default_payment_terms: parseInt(data.settings.default_payment_terms) || 14,
            default_vat: parseInt(data.settings.default_vat) || 25,
          });
          setPaymentTerms(data.settings.default_payment_terms || '14');
        }
      }
    } catch (e) { console.error(e); }
  };

  const calculateDueDate = () => {
    const date = new Date(invoiceDate);
    date.setDate(date.getDate() + parseInt(paymentTerms || '14'));
    setDueDate(date.toISOString().split('T')[0]);
  };

  const addLineItem = () => {
    const newId = Math.max(...lineItems.map(i => i.id), 0) + 1;
    setLineItems([...lineItems, { 
      id: newId, description: '', quantity: 1, unit: 'tim', 
      price: 0, discount: 0, vat: companySettings?.default_vat || 25 
    }]);
  };

  const removeLineItem = (id: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(i => i.id !== id));
    }
  };

  const updateLineItem = (id: number, field: keyof LineItem, value: any) => {
    setLineItems(lineItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const calculateItemTotal = (item: LineItem) => {
    const base = item.quantity * item.price;
    const afterDiscount = base * (1 - item.discount / 100);
    const withVat = afterDiscount * (1 + item.vat / 100);
    return Math.round(withVat);
  };

  const calculateTotals = () => {
    let netTotal = 0;
    let vatTotal = 0;
    lineItems.forEach(item => {
      const base = item.quantity * item.price;
      const afterDiscount = base * (1 - item.discount / 100);
      netTotal += afterDiscount;
      vatTotal += afterDiscount * (item.vat / 100);
    });
    return {
      netTotal: Math.round(netTotal),
      vatTotal: Math.round(vatTotal),
      total: Math.round(netTotal + vatTotal)
    };
  };

  const handleSubmit = async () => {
    if (!selectedCustomer) {
      setMessage('Välj en kund först.');
      return;
    }
    if (lineItems.some(i => !i.description || i.price <= 0)) {
      setMessage('Fyll i alla raders beskrivning och pris.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const token = localStorage.getItem('auth_token');
      const customer = customers.find(c => c.id === Number(selectedCustomer));
      
      const invoiceData = {
        customer_id: Number(selectedCustomer),
        invoice_date: invoiceDate,
        due_date: dueDate,
        payment_terms: parseInt(paymentTerms),
        our_contact: ourContact,
        customer_contact: customerContact,
        is_rut: isRUT,
        notes: notes,
        line_items: lineItems.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          price: item.price,
          discount: item.discount,
          vat: item.vat,
          total: calculateItemTotal(item)
        })),
        totals: calculateTotals()
      };

      const res = await fetch(`${apiBaseUrl}/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(invoiceData)
      });

      if (res.ok) {
        const result = await res.json();
        setMessage(`Faktura ${result.invoice_number || 'skapad'} sparad!`);
        // Reset form
        setSelectedCustomer('');
        setLineItems([{ id: 1, description: '', quantity: 1, unit: 'tim', price: 0, discount: 0, vat: 25 }]);
        setNotes('');
        setIsRUT(rutMode);
      } else {
        const err = await res.json();
        setMessage(err.error || 'Kunde inte spara faktura.');
      }
    } catch (e) {
      setMessage('Nätverksfel. Försök igen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generatePDF = async () => {
    // Dynamically import jsPDF
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    
    const customer = customers.find(c => c.id === Number(selectedCustomer));
    const totals = calculateTotals();
    const invNum = companySettings?.next_invoice_number || 1000;

    // Header
    doc.setFontSize(10);
    if (companySettings?.logo) {
      try {
        doc.addImage(companySettings.logo, 'PNG', 10, 10, 40, 20);
      } catch (e) {}
    }
    
    doc.setFontSize(18);
    doc.setTextColor(37, 99, 235);
    doc.text('FAKTURA', 150, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`${companySettings?.name || 'HemSolutions Sverige AB'}`, 10, 40);
    doc.text(`${companySettings?.address || ''}`, 10, 45);
    doc.text(`${companySettings?.postcode || ''} ${companySettings?.city || ''}`, 10, 50);
    doc.text(`Tel: ${companySettings?.phone || ''}`, 10, 55);
    doc.text(`E-post: ${companySettings?.email || ''}`, 10, 60);
    doc.text(`Org.nr: ${companySettings?.org_number || ''}`, 10, 65);

    // Invoice details
    doc.text(`Fakturanummer: ${invNum}`, 150, 40);
    doc.text(`Fakturadatum: ${invoiceDate}`, 150, 45);
    doc.text(`Förfallodatum: ${dueDate}`, 150, 50);
    doc.text(`Betalningsvillkor: ${paymentTerms} dagar`, 150, 55);
    if (isRUT) doc.text('RUT-avdrag: Ja', 150, 60);

    // Customer
    doc.text('Kund:', 10, 80);
    doc.text(`${customer?.name || ''}`, 10, 85);
    doc.text(`${customer?.address || ''}`, 10, 90);
    doc.text(`${customer?.postcode || ''} ${customer?.city || ''}`, 10, 95);
    doc.text(`Tel: ${customer?.phone || ''}`, 10, 100);
    doc.text(`E-post: ${customer?.email || ''}`, 10, 105);
    if (customer?.org_number) doc.text(`Org.nr: ${customer.org_number}`, 10, 110);

    // Line items table
    let y = 130;
    doc.setFillColor(37, 99, 235);
    doc.rect(10, y - 5, 190, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text('Beskrivning', 12, y);
    doc.text('Antal', 90, y);
    doc.text('À-pris', 110, y);
    doc.text('Moms', 135, y);
    doc.text('Summa', 170, y);
    
    doc.setTextColor(0, 0, 0);
    y += 10;
    lineItems.forEach(item => {
      doc.text(item.description.substring(0, 40), 12, y);
      doc.text(`${item.quantity} ${item.unit}`, 90, y);
      doc.text(`${item.price} kr`, 110, y);
      doc.text(`${item.vat}%`, 135, y);
      doc.text(`${calculateItemTotal(item)} kr`, 170, y);
      y += 8;
    });

    // Totals
    y += 5;
    doc.line(10, y, 200, y);
    y += 8;
    doc.text('Nettobelopp:', 140, y);
    doc.text(`${totals.netTotal} kr`, 180, y);
    y += 6;
    doc.text(`Moms:`, 140, y);
    doc.text(`${totals.vatTotal} kr`, 180, y);
    y += 6;
    doc.setFontSize(12);
    doc.setTextColor(37, 99, 235);
    doc.text('ATT BETALA:', 140, y);
    doc.text(`${totals.total} kr`, 180, y);

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Bankgiro: ${companySettings?.bankgiro || ''}`, 10, 270);
    doc.text(`Bankkonto: ${companySettings?.bank_account || ''}`, 10, 275);
    
    if (companySettings?.bankgiro) {
      doc.text('Swish: 123 011 77 76', 10, 280);
      // QR code placeholder
      doc.rect(160, 250, 30, 30);
      doc.text('Swish QR', 168, 268);
    }

    doc.save(`Faktura_${invNum}_${customer?.name?.replace(/\s+/g, '_') || 'kund'}_${invoiceDate}.pdf`);
    setMessage('PDF genererad och nedladdad!');
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          {rutMode ? 'Skapa ny RUT-faktura' : 'Skapa ny faktura'}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={generatePDF} disabled={!selectedCustomer}>
            <FileText className="h-4 w-4 mr-2" />
            Förhandsgranska PDF
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Sparar...' : 'Spara faktura'}
          </Button>
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded-lg ${message.includes('!') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message}
        </div>
      )}

      {/* Invoice Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Fakturainformation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label>Kund *</Label>
              <Select value={selectedCustomer.toString()} onValueChange={(v) => setSelectedCustomer(Number(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="Välj kund..." />
                </SelectTrigger>
                <SelectContent>
                  {customers.map(c => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.name} {c.org_number ? `(Org.nr: ${c.org_number})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Fakturadatum</Label>
              <Input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} />
            </div>
            <div>
              <Label>Förfallodatum</Label>
              <Input type="date" value={dueDate} readOnly className="bg-gray-50" />
            </div>
            <div>
              <Label>Betalningsvillkor (dagar)</Label>
              <Input type="number" value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} />
            </div>
            <div>
              <Label>Vår kontakt</Label>
              <Input value={ourContact} onChange={e => setOurContact(e.target.value)} placeholder="t.ex. Per Persson" />
            </div>
            <div>
              <Label>Kundens kontakt</Label>
              <Input value={customerContact} onChange={e => setCustomerContact(e.target.value)} placeholder="t.ex. Anna Andersson" />
            </div>
          </div>
          
          {rutMode && (
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <Checkbox checked={isRUT} onCheckedChange={() => setIsRUT(!isRUT)} />
              <Label className="font-medium text-green-800">RUT-avdrag tillämpas (50% avdrag på arbetskostnad)</Label>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Artikelrader</CardTitle>
          <Button variant="outline" size="sm" onClick={addLineItem}>
            <Plus className="h-4 w-4 mr-1" /> Lägg till rad
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-2 font-medium">Beskrivning</th>
                  <th className="text-left p-2 font-medium w-20">Antal</th>
                  <th className="text-left p-2 font-medium w-24">Enhet</th>
                  <th className="text-left p-2 font-medium w-28">À-pris (kr)</th>
                  <th className="text-left p-2 font-medium w-20">Rabatt %</th>
                  <th className="text-left p-2 font-medium w-20">Moms %</th>
                  <th className="text-right p-2 font-medium w-28">Summa (kr)</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map(item => (
                  <tr key={item.id} className="border-b">
                    <td className="p-2">
                      <Input 
                        value={item.description} 
                        onChange={e => updateLineItem(item.id, 'description', e.target.value)}
                        placeholder="Beskrivning av tjänst..."
                      />
                    </td>
                    <td className="p-2">
                      <Input type="number" min="0" step="0.5"
                        value={item.quantity} 
                        onChange={e => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      />
                    </td>
                    <td className="p-2">
                      <Select value={item.unit} onValueChange={(v) => updateLineItem(item.id, 'unit', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tim">tim</SelectItem>
                          <SelectItem value="st">st</SelectItem>
                          <SelectItem value="m²">m²</SelectItem>
                          <SelectItem value="km">km</SelectItem>
                          <SelectItem value="dag">dag</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-2">
                      <Input type="number" min="0"
                        value={item.price} 
                        onChange={e => updateLineItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                      />
                    </td>
                    <td className="p-2">
                      <Input type="number" min="0" max="100"
                        value={item.discount} 
                        onChange={e => updateLineItem(item.id, 'discount', parseFloat(e.target.value) || 0)}
                      />
                    </td>
                    <td className="p-2">
                      <Input type="number" min="0" max="100"
                        value={item.vat} 
                        onChange={e => updateLineItem(item.id, 'vat', parseFloat(e.target.value) || 0)}
                      />
                    </td>
                    <td className="p-2 text-right font-medium">
                      {calculateItemTotal(item).toLocaleString()}
                    </td>
                    <td className="p-2">
                      <Button variant="ghost" size="sm" onClick={() => removeLineItem(item.id)} 
                        disabled={lineItems.length <= 1} className="text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="mt-4 flex justify-end">
            <div className="w-72 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Nettobelopp:</span>
                <span className="font-medium">{totals.netTotal.toLocaleString()} kr</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Moms:</span>
                <span className="font-medium">{totals.vatTotal.toLocaleString()} kr</span>
              </div>
              {isRUT && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>RUT-avdrag (50%):</span>
                  <span>-{Math.round(totals.netTotal * 0.5).toLocaleString()} kr</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between text-lg font-bold">
                <span>Att betala:</span>
                <span className="text-blue-600">
                  {isRUT 
                    ? Math.round(totals.total - totals.netTotal * 0.5).toLocaleString() 
                    : totals.total.toLocaleString()} kr
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Anteckningar</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea 
            value={notes} 
            onChange={e => setNotes(e.target.value)}
            className="w-full p-3 border rounded-lg min-h-[80px] text-sm"
            placeholder="Anteckningar som visas på fakturan..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
