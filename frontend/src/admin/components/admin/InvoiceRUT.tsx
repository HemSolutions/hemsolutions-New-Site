import { useState, useEffect } from 'react';
import { Download, FileCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Invoice {
  id: number;
  invoice_number: string;
  customer_name: string;
  total_amount: number;
  rut_amount: number;
  status: string;
  invoice_date: string;
}

export default function InvoiceRUT({ apiBaseUrl, mode }: { apiBaseUrl: string; mode: 'apply' | 'close' }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRUTInvoices();
  }, []);

  const fetchRUTInvoices = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${apiBaseUrl}/invoices?is_rut=true&limit=100`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setInvoices(data.invoices || []);
      }
    } catch (e) { console.error(e); }
    setIsLoading(false);
  };

  const handleAction = async (invoiceId: number) => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${apiBaseUrl}/invoices/${invoiceId}/rut`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ action: mode })
      });
      if (res.ok) {
        fetchRUTInvoices();
      }
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">
        {mode === 'apply' ? 'Ansök om RUT-utbetalning' : 'Avslut RUT'}
      </h1>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-3 font-medium">Faktura</th>
                  <th className="text-left p-3 font-medium">Kund</th>
                  <th className="text-right p-3 font-medium">Totalt</th>
                  <th className="text-right p-3 font-medium">RUT-belopp</th>
                  <th className="text-center p-3 font-medium">Status</th>
                  <th className="text-center p-3 font-medium">Åtgärd</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-gray-500">
                    {isLoading ? 'Laddar...' : 'Inga RUT-fakturor.'}
                  </td></tr>
                ) : (
                  invoices.map(inv => (
                    <tr key={inv.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{inv.invoice_number || `#${inv.id}`}</td>
                      <td className="p-3">{inv.customer_name || 'Kund'}</td>
                      <td className="p-3 text-right">{inv.total_amount?.toLocaleString()} kr</td>
                      <td className="p-3 text-right text-green-600">{inv.rut_amount?.toLocaleString()} kr</td>
                      <td className="p-3 text-center"><Badge variant="outline">{inv.status}</Badge></td>
                      <td className="p-3 text-center">
                        <Button size="sm" variant="outline" onClick={() => handleAction(inv.id)}>
                          <FileCheck className="h-4 w-4 mr-1" />
                          {mode === 'apply' ? 'Ansök' : 'Avslut'}
                        </Button>
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
