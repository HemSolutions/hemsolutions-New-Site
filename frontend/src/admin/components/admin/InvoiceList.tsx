import { useState, useEffect } from 'react';
import { Download, Eye, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Invoice {
  id: number;
  invoice_number: string;
  customer_name: string;
  total_amount: number;
  status: string;
  due_date: string;
  invoice_date: string;
  is_rut: boolean;
}

export default function InvoiceList({ apiBaseUrl }: { apiBaseUrl: string }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${apiBaseUrl}/invoices?limit=100`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setInvoices(data.invoices || []);
      }
    } catch (e) { console.error(e); }
    setIsLoading(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <Badge className="bg-green-100 text-green-800">Betald</Badge>;
      case 'sent': return <Badge className="bg-blue-100 text-blue-800">Skickad</Badge>;
      case 'overdue': return <Badge className="bg-red-100 text-red-800">Försenad</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-800">Obetald</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'overdue': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Fakturor</h1>
        <Button variant="outline" size="sm" onClick={fetchInvoices} disabled={isLoading}>
          Uppdatera
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-3 font-medium">Fakturanr</th>
                  <th className="text-left p-3 font-medium">Kund</th>
                  <th className="text-left p-3 font-medium">Datum</th>
                  <th className="text-left p-3 font-medium">Förfallodatum</th>
                  <th className="text-right p-3 font-medium">Belopp</th>
                  <th className="text-center p-3 font-medium">Status</th>
                  <th className="text-center p-3 font-medium">Åtgärder</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">
                      {isLoading ? 'Laddar...' : 'Inga fakturor ännu.'}
                    </td>
                  </tr>
                ) : (
                  invoices.map(inv => (
                    <tr key={inv.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{inv.invoice_number || `#${inv.id}`}</td>
                      <td className="p-3">{inv.customer_name || 'Kund'}</td>
                      <td className="p-3 text-gray-500">{inv.invoice_date}</td>
                      <td className="p-3 text-gray-500">{inv.due_date}</td>
                      <td className="p-3 text-right font-medium">{inv.total_amount?.toLocaleString()} kr</td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {getStatusIcon(inv.status)}
                          {getStatusBadge(inv.status)}
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
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
