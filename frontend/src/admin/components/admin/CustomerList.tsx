import { useState, useEffect } from 'react';
import { Users, FileText, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  postcode: string;
  city: string;
  customer_type: string;
  total_sales: number;
}

export default function CustomerList({ apiBaseUrl }: { apiBaseUrl: string }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setIsLoading(true);
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
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Kunder</h1>
        <Button variant="outline" size="sm" onClick={fetchCustomers} disabled={isLoading}>Uppdatera</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-3 font-medium">Namn</th>
                  <th className="text-left p-3 font-medium">E-post</th>
                  <th className="text-left p-3 font-medium">Telefon</th>
                  <th className="text-left p-3 font-medium">Ort</th>
                  <th className="text-center p-3 font-medium">Typ</th>
                  <th className="text-right p-3 font-medium">Försäljning</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-gray-500">
                    {isLoading ? 'Laddar...' : 'Inga kunder ännu.'}
                  </td></tr>
                ) : (
                  customers.map(c => (
                    <tr key={c.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{c.name}</td>
                      <td className="p-3 text-gray-500">{c.email}</td>
                      <td className="p-3 text-gray-500">{c.phone}</td>
                      <td className="p-3 text-gray-500">{c.city}</td>
                      <td className="p-3 text-center">
                        <Badge variant={c.customer_type === 'company' ? 'default' : 'secondary'}>
                          {c.customer_type === 'company' ? 'Företag' : 'Privat'}
                        </Badge>
                      </td>
                      <td className="p-3 text-right font-medium">{(c.total_sales || 0).toLocaleString()} kr</td>
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
