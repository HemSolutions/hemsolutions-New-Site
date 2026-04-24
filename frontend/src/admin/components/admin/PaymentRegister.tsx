import { useState, useEffect } from 'react';
import { Wallet, Save, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface Invoice {
  id: number;
  invoice_number: string;
  customer_name: string;
  total_amount: number;
  status: string;
  due_date: string;
  remaining_amount: number;
}

export default function PaymentRegister({ apiBaseUrl }: { apiBaseUrl: string }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<number | ''>('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('bank');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUnpaidInvoices();
  }, []);

  const fetchUnpaidInvoices = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${apiBaseUrl}/invoices?status=unpaid,overdue,sent&limit=100`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setInvoices(data.invoices?.filter((inv: Invoice) => inv.status !== 'paid') || []);
      }
    } catch (e) { console.error(e); }
  };

  const handleSubmit = async () => {
    if (!selectedInvoice || !amount) {
      setMessage('Välj faktura och ange belopp.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${apiBaseUrl}/invoices/${selectedInvoice}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          payment_date: paymentDate,
          payment_method: paymentMethod,
          reference
        })
      });

      if (res.ok) {
        setMessage('Betalning registrerad!');
        setSelectedInvoice('');
        setAmount('');
        setReference('');
        fetchUnpaidInvoices();
      } else {
        const err = await res.json();
        setMessage(err.error || 'Kunde inte registrera betalning.');
      }
    } catch (e) {
      setMessage('Nätverksfel. Försök igen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedInv = invoices.find(i => i.id === Number(selectedInvoice));

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Registrera inbetalning</h1>
      </div>

      {message && (
        <div className={`p-3 rounded-lg ${message.includes('!') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message}
        </div>
      )}

      {/* Unpaid Invoices List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Obetalda fakturor</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p className="text-gray-500 text-sm">Inga obetalda fakturor.</p>
          ) : (
            <div className="space-y-2">
              {invoices.map(inv => (
                <button
                  key={inv.id}
                  onClick={() => {
                    setSelectedInvoice(inv.id);
                    setAmount(inv.remaining_amount?.toString() || inv.total_amount?.toString() || '');
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors text-left ${
                    selectedInvoice === inv.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div>
                    <p className="font-medium">{inv.invoice_number || `Faktura #${inv.id}`}</p>
                    <p className="text-sm text-gray-500">{inv.customer_name || 'Kund'} • Förfaller {inv.due_date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{inv.total_amount?.toLocaleString()} kr</p>
                    <Badge variant="secondary">{inv.status === 'overdue' ? 'Försenad' : 'Obetald'}</Badge>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Form */}
      {selectedInvoice && selectedInv && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Registrera betalning för {selectedInv.invoice_number || `#${selectedInv.id}`}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Betalningsdatum</Label>
                <Input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} />
              </div>
              <div>
                <Label>Betalningssätt</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank">Bankkonto</SelectItem>
                    <SelectItem value="cash">Kontant</SelectItem>
                    <SelectItem value="swish">Swish</SelectItem>
                    <SelectItem value="card">Kort</SelectItem>
                    <SelectItem value="autogiro">Autogiro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Belopp (kr) *</Label>
                <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="t.ex. 1490" />
              </div>
              <div>
                <Label>Referens / OCR</Label>
                <Input value={reference} onChange={e => setReference(e.target.value)} placeholder="t.ex. OCR-nummer" />
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm">
                <strong>Fakturabelopp:</strong> {selectedInv.total_amount?.toLocaleString()} kr
              </p>
            </div>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Registrerar...' : 'Registrera betalning'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
