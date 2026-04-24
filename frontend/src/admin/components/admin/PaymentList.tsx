import { useState, useEffect } from 'react';
import { Download, Eye, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Payment {
  id: number;
  invoice_id: number;
  invoice_number: string;
  customer_name: string;
  amount: number;
  payment_date: string;
  payment_method: string;
}

export default function PaymentList({ apiBaseUrl }: { apiBaseUrl: string }) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${apiBaseUrl}/payments?limit=100`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setPayments(data.payments || []);
      }
    } catch (e) { console.error(e); }
    setIsLoading(false);
  };

  const getMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      bank: 'Bankkonto', cash: 'Kontant', swish: 'Swish',
      card: 'Kort', autogiro: 'Autogiro', stripe: 'Stripe'
    };
    return labels[method] || method;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Betalningar</h1>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-3 font-medium">Datum</th>
                  <th className="text-left p-3 font-medium">Faktura</th>
                  <th className="text-left p-3 font-medium">Kund</th>
                  <th className="text-left p-3 font-medium">Sätt</th>
                  <th className="text-right p-3 font-medium">Belopp</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-500">
                    {isLoading ? 'Laddar...' : 'Inga betalningar ännu.'}
                  </td></tr>
                ) : (
                  payments.map(p => (
                    <tr key={p.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 text-gray-500">{p.payment_date}</td>
                      <td className="p-3 font-medium">{p.invoice_number || `#${p.invoice_id}`}</td>
                      <td className="p-3">{p.customer_name || 'Kund'}</td>
                      <td className="p-3"><Badge variant="outline">{getMethodLabel(p.payment_method)}</Badge></td>
                      <td className="p-3 text-right font-medium text-green-600">+{p.amount?.toLocaleString()} kr</td>
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
