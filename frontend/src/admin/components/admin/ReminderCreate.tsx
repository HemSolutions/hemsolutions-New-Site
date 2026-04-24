import { useState } from 'react';
import { Send, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export default function ReminderCreate({ apiBaseUrl }: { apiBaseUrl: string }) {
  const [invoiceId, setInvoiceId] = useState('');
  const [reminderType, setReminderType] = useState('email');
  const [daysAfterDue, setDaysAfterDue] = useState('7');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState('');

  const handleSubmit = async () => {
    if (!invoiceId) {
      setResult('Välj en faktura.');
      return;
    }
    setIsSubmitting(true);
    setResult('');
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${apiBaseUrl}/invoices/${invoiceId}/reminder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ reminder_type: reminderType, days_after_due: parseInt(daysAfterDue), message })
      });
      if (res.ok) {
        setResult('Påminnelse skickad!');
        setInvoiceId('');
        setMessage('');
      } else {
        const err = await res.json();
        setResult(err.error || 'Kunde inte skicka påminnelse.');
      }
    } catch (e) {
      setResult('Nätverksfel.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800">Skapa påminnelse</h1>
      {result && (
        <div className={`p-3 rounded-lg ${result.includes('!') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {result}
        </div>
      )}
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div>
            <Label>Faktura ID</Label>
            <Input value={invoiceId} onChange={e => setInvoiceId(e.target.value)} placeholder="t.ex. 123" />
          </div>
          <div>
            <Label>Påminnelse typ</Label>
            <Select value={reminderType} onValueChange={setReminderType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="email">E-post</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="both">E-post + SMS</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Dagar efter förfallodatum</Label>
            <Input type="number" value={daysAfterDue} onChange={e => setDaysAfterDue(e.target.value)} />
          </div>
          <div>
            <Label>Meddelande (valfritt)</Label>
            <Textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Anpassat påminnelsemeddelande..." />
          </div>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full bg-amber-600 hover:bg-amber-700">
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Skickar...' : 'Skicka påminnelse'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
