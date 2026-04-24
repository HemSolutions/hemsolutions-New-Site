import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, FileText, Users, Package, CreditCard, 
  Bell, BarChart3, Settings, ChevronDown,
  TrendingUp, AlertCircle, CheckCircle,
  Calendar, MoreVertical, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Import management components - using default imports
import CustomersManagement from './CustomersManagement';
import InvoicesManagement from './InvoicesManagement';
import SettingsManagement from './SettingsManagement';
import ReportsManagement from './ReportsManagement';
import WorkersManagement from './WorkersManagement';
import BookingsManagement from './BookingsManagement';
import ReceiptsManagement from './ReceiptsManagement';
import RemindersManagement from './RemindersManagement';

interface DashboardStats {
  totalSalesYear: number;
  totalSalesMonth: number;
  salesChangeYear: number;
  salesChangeMonth: number;
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

interface ReminderCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  lastInvoiceDate: string;
  amountDue: number;
  daysOverdue: number;
}

export default function AdminDashboard({ apiBaseUrl }: { apiBaseUrl: string }) {
  const [activeView, setActiveView] = useState('overview');
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['faktura', 'kund']);
  const [stats, setStats] = useState<DashboardStats>({
    totalSalesYear: 0,
    totalSalesMonth: 0,
    salesChangeYear: 0,
    salesChangeMonth: 0,
    pendingReminders: 0,
    incomingPayments: 0,
    totalCustomers: 0,
    totalInvoices: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    overdueInvoices: 0
  });
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [reminderCustomers, setReminderCustomers] = useState<ReminderCustomer[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const statsRes = await fetch(`${apiBaseUrl}/admin/dashboard-stats`, {
        credentials: 'include'
      });
      if (statsRes.ok) {
        const data = await statsRes.json();
        if (data.stats) setStats(data.stats);
      }

      const topRes = await fetch(`${apiBaseUrl}/admin/top-customers`, {
        credentials: 'include'
      });
      if (topRes.ok) {
        const data = await topRes.json();
        if (data.customers) setTopCustomers(data.customers);
      }

      const remindersRes = await fetch(`${apiBaseUrl}/admin/reminders`, {
        credentials: 'include'
      });
      if (remindersRes.ok) {
        const data = await remindersRes.json();
        if (data.customers) setReminderCustomers(data.customers);
      }

      const invoicesRes = await fetch(`${apiBaseUrl}/invoices?limit=5`, {
        credentials: 'include'
      });
      if (invoicesRes.ok) {
        const data = await invoicesRes.json();
        if (data.invoices) setRecentInvoices(data.invoices.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMenu = (menu: string) => {
    setExpandedMenus(prev => 
      prev.includes(menu) 
        ? prev.filter(m => m !== menu)
        : [...prev, menu]
    );
  };

  const menuItems = [
    { id: 'overview', label: 'Översikt', icon: LayoutDashboard },
    { id: 'invoices', label: 'Fakturor', icon: FileText },
    { id: 'receipts', label: 'Kvitton', icon: CreditCard },
    { id: 'customers', label: 'Kunder', icon: Users },
    { id: 'workers', label: 'Arbetare', icon: Package },
    { id: 'bookings', label: 'Bokningar', icon: Calendar },
    { id: 'reminders', label: 'Påminnelser', icon: Bell },
    { id: 'reports', label: 'Rapporter', icon: BarChart3 },
    { id: 'settings', label: 'Inställningar', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'overview':
        return (
          <div className="space-y-6">
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
                    <TrendingUp className="h-8 w-8 text-blue-500" />
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

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Customers */}
              <Card>
                <CardHeader>
                  <CardTitle>Årets bästa kunder</CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>

              {/* Reminders */}
              <Card>
                <CardHeader>
                  <CardTitle>Att påminna</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reminderCustomers.map((customer) => (
                      <div key={customer.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-sm text-gray-500">{customer.daysOverdue} dagar försenad</p>
                        </div>
                        <span className="font-bold text-red-600">{customer.amountDue.toLocaleString()} kr</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'invoices':
        return <InvoicesManagement apiBaseUrl={apiBaseUrl} />;
      case 'receipts':
        return <ReceiptsManagement apiBaseUrl={apiBaseUrl} />;
      case 'customers':
        return <CustomersManagement apiBaseUrl={apiBaseUrl} />;
      case 'workers':
        return <WorkersManagement apiBaseUrl={apiBaseUrl} />;
      case 'bookings':
        return <BookingsManagement apiBaseUrl={apiBaseUrl} />;
      case 'reminders':
        return <RemindersManagement apiBaseUrl={apiBaseUrl} />;
      case 'reports':
        return <ReportsManagement apiBaseUrl={apiBaseUrl} />;
      case 'settings':
        return <SettingsManagement apiBaseUrl={apiBaseUrl} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-blue-600">HemSolutions</h1>
          <p className="text-sm text-gray-500">Billing Dashboard</p>
        </div>
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeView === item.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
