import { useState, useEffect } from 'react';
import { 
  TrendingUp, AlertCircle, CheckCircle, Users, FileText, 
  CreditCard, Bell, ArrowRight, Euro
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DashboardStats {
  totalSalesYear: number;
  totalSalesMonth: number;
  pendingReminders: number;
  incomingPayments: number;
  totalCustomers: number;
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
}

interface TopCustomer {
  id: string;
  name: string;
  sales: number;
}

interface RecentInvoice {
  id: number;
  invoice_number: string;
  customer_name: string;
  total_amount: number;
  status: string;
  due_date: string;
}

export default function OverviewPanel({ apiBaseUrl }: { apiBaseUrl: string }) {
  const [stats, setStats] = useState<DashboardStats>({
    totalSalesYear: 0, totalSalesMonth: 0, pendingReminders: 0,
    incomingPayments: 0, totalCustomers: 0, totalInvoices: 0,
    paidInvoices: 0, pendingInvoices: 0, overdueInvoices: 0
  });
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<RecentInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const [statsRes, custRes, invRes] = await Promise.all([
        fetch(`${apiBaseUrl}/admin/stats`, { headers }).catch(() => null),
        fetch(`${apiBaseUrl}/customers?limit=5`, { headers }).catch(() => null),
        fetch(`${apiBaseUrl}/invoices?limit=5`, { headers }).catch(() => null),
      ]);

      if (statsRes?.ok) {
        const data = await statsRes.json();
        setStats(prev => ({ ...prev, ...data }));
      }
      if (custRes?.ok) {
        const data = await custRes.json();
        if (data.customers) {
          setTopCustomers(data.customers.map((c: any) => ({
            id: c.id?.toString() || '0',
            name: c.name || c.company_name || 'Kund',
            sales: c.total_sales || 0
          })));
        }
      }
      if (invRes?.ok) {
        const data = await invRes.json();
        if (data.invoices) setRecentInvoices(data.invoices.slice(0, 5));
      }
    } catch (error) {
      console.error('Dashboard error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Översikt</h1>
        <Button variant="outline" size="sm" onClick={fetchDashboardData} disabled={isLoading}>
          Uppdatera
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Försäljning (år)</p>
                <p className="text-2xl font-bold">{stats.totalSalesYear.toLocaleString()} kr</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Försäljning (mån)</p>
                <p className="text-2xl font-bold">{stats.totalSalesMonth.toLocaleString()} kr</p>
              </div>
              <Euro className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Obetalda fakturor</p>
                <p className="text-2xl font-bold text-red-500">{stats.pendingInvoices}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Kommande betalningar</p>
                <p className="text-2xl font-bold text-green-500">+{stats.incomingPayments.toLocaleString()} kr</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Totalt kunder</p>
                <p className="text-2xl font-bold">{stats.totalCustomers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Totalt fakturor</p>
                <p className="text-2xl font-bold">{stats.totalInvoices}</p>
              </div>
              <FileText className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Betalda fakturor</p>
                <p className="text-2xl font-bold text-green-600">{stats.paidInvoices}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Påminnelser</p>
                <p className="text-2xl font-bold text-amber-600">{stats.pendingReminders}</p>
              </div>
              <Bell className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Customers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Bästa kunder</CardTitle>
            <Users className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            {topCustomers.length === 0 ? (
              <p className="text-gray-500 text-sm">Inga kunder ännu.</p>
            ) : (
              <div className="space-y-3">
                {topCustomers.map((customer, index) => (
                  <div key={customer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                      <span className="font-medium">{customer.name}</span>
                    </div>
                    <span className="font-bold">{customer.sales.toLocaleString()} kr</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Senaste fakturor</CardTitle>
            <FileText className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            {recentInvoices.length === 0 ? (
              <p className="text-gray-500 text-sm">Inga fakturor ännu.</p>
            ) : (
              <div className="space-y-3">
                {recentInvoices.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{inv.invoice_number || `Faktura #${inv.id}`}</p>
                      <p className="text-sm text-gray-500">{inv.customer_name || 'Kund'}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold">{inv.total_amount?.toLocaleString()} kr</span>
                      <Badge variant={inv.status === 'paid' ? 'default' : 'secondary'} className="ml-2">
                        {inv.status === 'paid' ? 'Betald' : inv.status === 'overdue' ? 'Försenad' : 'Obetald'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
