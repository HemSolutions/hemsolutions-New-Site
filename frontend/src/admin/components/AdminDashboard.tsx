import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, FileText, Receipt, Users, Package, CreditCard, 
  Bell, BarChart3, Settings, ChevronDown, ChevronRight, LogOut,
  Plus, List, FileCheck, RotateCcw, Wallet, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import OverviewPanel from './admin/OverviewPanel';
import InvoiceCreate from './admin/InvoiceCreate';
import InvoiceList from './admin/InvoiceList';
import InvoiceRUT from './admin/InvoiceRUT';
import CustomerCreate from './admin/CustomerCreate';
import CustomerList from './admin/CustomerList';
import PaymentRegister from './admin/PaymentRegister';
import PaymentList from './admin/PaymentList';
import ReminderCreate from './admin/ReminderCreate';
import ReminderList from './admin/ReminderList';
import ReportsPanel from './admin/ReportsPanel';
import SettingsPanel from './admin/SettingsPanel';
import BookingsManagement from './BookingsManagement';
import WorkersManagement from './WorkersManagement';
import ReceiptsManagement from './ReceiptsManagement';

interface SubMenuItem {
  id: string;
  label: string;
  icon?: React.ElementType;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  subMenu?: SubMenuItem[];
}

const menuItems: MenuItem[] = [
  { id: 'overview', label: 'Översikt', icon: LayoutDashboard },
  { 
    id: 'faktura', 
    label: 'Faktura', 
    icon: FileText,
    subMenu: [
      { id: 'invoice-create', label: 'Skapa ny', icon: Plus },
      { id: 'invoice-rut', label: 'Skapa ny RUT', icon: FileCheck },
      { id: 'invoice-list', label: 'Lista', icon: List },
      { id: 'invoice-rut-apply', label: 'Ansök RUT', icon: RotateCcw },
      { id: 'invoice-rut-close', label: 'Avslut RUT', icon: FileCheck },
    ]
  },
  { 
    id: 'kvitto', 
    label: 'Kvitto', 
    icon: Receipt,
    subMenu: [
      { id: 'receipt-create', label: 'Skapa ny', icon: Plus },
      { id: 'receipt-list', label: 'Lista', icon: List },
    ]
  },
  { 
    id: 'kund', 
    label: 'Kund', 
    icon: Users,
    subMenu: [
      { id: 'customer-create', label: 'Skapa ny', icon: Plus },
      { id: 'customer-list', label: 'Lista', icon: List },
    ]
  },
  { 
    id: 'artikel', 
    label: 'Artikel', 
    icon: Package,
    subMenu: [
      { id: 'article-create', label: 'Skapa ny', icon: Plus },
      { id: 'article-list', label: 'Lista', icon: List },
    ]
  },
  { 
    id: 'betalning', 
    label: 'Betalning', 
    icon: CreditCard,
    subMenu: [
      { id: 'payment-register', label: 'Registrera', icon: Wallet },
      { id: 'payment-list', label: 'Lista', icon: List },
    ]
  },
  { 
    id: 'paminnelse', 
    label: 'Påminnelse', 
    icon: Bell,
    subMenu: [
      { id: 'reminder-create', label: 'Skapa ny', icon: Plus },
      { id: 'reminder-list', label: 'Lista', icon: List },
    ]
  },
  { 
    id: 'rapporter', 
    label: 'Rapporter', 
    icon: BarChart3,
    subMenu: [
      { id: 'reports-sales', label: 'Försäljning', icon: BarChart3 },
      { id: 'reports-customers', label: 'Kunder', icon: Users },
      { id: 'reports-services', label: 'Tjänster', icon: Package },
    ]
  },
  { 
    id: 'installningar', 
    label: 'Inställningar', 
    icon: Settings,
    subMenu: [
      { id: 'settings-company', label: 'Företag', icon: LayoutDashboard },
      { id: 'settings-invoice', label: 'Faktura', icon: FileText },
      { id: 'settings-email', label: 'Email/SMS', icon: Bell },
      { id: 'settings-users', label: 'Användare', icon: Users },
    ]
  },
];

export default function AdminDashboard({ apiBaseUrl }: { apiBaseUrl: string }) {
  const [activeView, setActiveView] = useState('overview');
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['faktura', 'kund']);
  const [adminName, setAdminName] = useState('Admin');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsed = JSON.parse(user);
        setAdminName(parsed.name || parsed.email || 'Admin');
      } catch (e) {}
    }
  }, []);

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(m => m !== menuId)
        : [...prev, menuId]
    );
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const renderContent = () => {
    switch (activeView) {
      case 'overview':
        return <OverviewPanel apiBaseUrl={apiBaseUrl} />;
      case 'invoice-create':
        return <InvoiceCreate apiBaseUrl={apiBaseUrl} />;
      case 'invoice-rut':
        return <InvoiceCreate apiBaseUrl={apiBaseUrl} rutMode />;
      case 'invoice-list':
        return <InvoiceList apiBaseUrl={apiBaseUrl} />;
      case 'invoice-rut-apply':
        return <InvoiceRUT apiBaseUrl={apiBaseUrl} mode="apply" />;
      case 'invoice-rut-close':
        return <InvoiceRUT apiBaseUrl={apiBaseUrl} mode="close" />;
      case 'receipt-create':
        return <ReceiptsManagement apiBaseUrl={apiBaseUrl} />;
      case 'receipt-list':
        return <ReceiptsManagement apiBaseUrl={apiBaseUrl} />;
      case 'customer-create':
        return <CustomerCreate apiBaseUrl={apiBaseUrl} />;
      case 'customer-list':
        return <CustomerList apiBaseUrl={apiBaseUrl} />;
      case 'article-create':
      case 'article-list':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Artiklar</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Artikelhantering kommer snart.</p>
            </CardContent>
          </Card>
        );
      case 'payment-register':
        return <PaymentRegister apiBaseUrl={apiBaseUrl} />;
      case 'payment-list':
        return <PaymentList apiBaseUrl={apiBaseUrl} />;
      case 'reminder-create':
        return <ReminderCreate apiBaseUrl={apiBaseUrl} />;
      case 'reminder-list':
        return <ReminderList apiBaseUrl={apiBaseUrl} />;
      case 'reports-sales':
      case 'reports-customers':
      case 'reports-services':
        return <ReportsPanel apiBaseUrl={apiBaseUrl} view={activeView} />;
      case 'settings-company':
      case 'settings-invoice':
      case 'settings-email':
      case 'settings-users':
        return <SettingsPanel apiBaseUrl={apiBaseUrl} view={activeView} />;
      default:
        return <OverviewPanel apiBaseUrl={apiBaseUrl} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-blue-600">
          <h1 className="text-xl font-bold text-white">HemSolutions</h1>
          <p className="text-sm text-blue-100">Admin Panel</p>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isExpanded = expandedMenus.includes(item.id);
            const hasSubMenu = item.subMenu && item.subMenu.length > 0;
            const isActive = activeView === item.id || item.subMenu?.some(s => s.id === activeView);
            
            return (
              <div key={item.id}>
                <button
                  onClick={() => {
                    if (hasSubMenu) {
                      toggleMenu(item.id);
                    } else {
                      setActiveView(item.id);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors text-sm ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                  {hasSubMenu && (
                    isExpanded ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                </button>
                
                {hasSubMenu && isExpanded && item.subMenu && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.subMenu.map((sub) => {
                      const SubIcon = sub.icon || List;
                      return (
                        <button
                          key={sub.id}
                          onClick={() => setActiveView(sub.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                            activeView === sub.id
                              ? 'bg-blue-100 text-blue-700 font-medium'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <SubIcon className="h-4 w-4" />
                          <span>{sub.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        
        {/* Footer */}
        <div className="p-3 border-t">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 truncate">
              {adminName}
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-500 hover:text-red-600">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
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
