import { useState, useEffect } from 'react';
import { Bell, Send, Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Reminder {
  id: number;
  invoice_id: number;
  invoice_number: string;
  customer_name: string;
  reminder_type: string;
  sent_date: string;
  status: string;
}

export default function ReminderList({ apiBaseUrl }: { apiBaseUrl: string }) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${apiBaseUrl}/admin/reminders?limit=100`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setReminders(data.reminders || []);
      }
    } catch (e) { console.error(e); }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Påminnelser</h1>
        <Button variant="outline" size="sm" onClick={fetchReminders} disabled={isLoading}>Uppdatera</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-3 font-medium">Datum</th>
                  <th className="text-left p-3 font-medium">Faktura</th>
                  <th className="text-left p-3 font-medium">Kund</th>
                  <th className="text-left p-3 font-medium">Typ</th>
                  <th className="text-center p-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {reminders.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-500">
                    {isLoading ? 'Laddar...' : 'Inga påminnelser ännu.'}
                  </td></tr>
                ) : (
                  reminders.map(r => (
                    <tr key={r.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 text-gray-500">{r.sent_date}</td>
                      <td className="p-3 font-medium">{r.invoice_number || `#${r.invoice_id}`}</td>
                      <td className="p-3">{r.customer_name || 'Kund'}</td>
                      <td className="p-3">
                        <Badge variant="outline" className="gap-1">
                          {r.reminder_type === 'sms' ? <Bell className="h-3 w-3" /> : <Mail className="h-3 w-3" />}
                          {r.reminder_type === 'sms' ? 'SMS' : r.reminder_type === 'both' ? 'E-post+SMS' : 'E-post'}
                        </Badge>
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant={r.status === 'sent' ? 'default' : 'secondary'}>
                          {r.status === 'sent' ? 'Skickad' : 'Väntar'}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
