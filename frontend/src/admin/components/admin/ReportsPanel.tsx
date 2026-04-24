import { useState, useEffect } from 'react';
import { Users, FileText, Euro, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ReportsPanel({ apiBaseUrl, view }: { apiBaseUrl: string; view: string }) {
  const [salesData, setSalesData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [view]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${apiBaseUrl}/admin/stats`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setSalesData(data.sales_by_month || []);
      }
    } catch (e) { console.error(e); }
    setIsLoading(false);
  };

  const getTitle = () => {
    switch (view) {
      case 'reports-sales': return 'Försäljningsrapport';
      case 'reports-customers': return 'Kundrapport';
      case 'reports-services': return 'Tjänsterapport';
      default: return 'Rapporter';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">{getTitle()}</h1>
        <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading}>Uppdatera</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Totalt försäljning</p>
                <p className="text-2xl font-bold">0 kr</p>
              </div>
              <Euro className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Antal fakturor</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <FileText className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Aktiva kunder</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Månadsförsäljning</CardTitle>
        </CardHeader>
        <CardContent>
          {salesData.length === 0 ? (
            <p className="text-gray-500 text-sm">Ingen data tillgänglig ännu.</p>
          ) : (
            <div className="space-y-2">
              {salesData.map((row: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{row.month}</span>
                  <span className="font-bold">{row.amount?.toLocaleString()} kr</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
