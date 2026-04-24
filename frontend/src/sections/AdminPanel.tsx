import { useState } from 'react';
import { 
  Users, Calendar, Star, 
  LogOut, Home, Search, Plus, Edit3, Trash2, CheckCircle,
  XCircle, Send, Eye, Download, DollarSign,
  Briefcase, Bell, User, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';

interface AdminPanelProps {
  onBack: () => void;
}

// Generate calendar days
const generateCalendarDays = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDay = firstDay.getDay() || 7;
  
  const days = [];
  for (let i = 1; i < startingDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);
  return days;
};

export function AdminPanel({ onBack }: AdminPanelProps) {
  const { user, logout, notifications, markNotificationRead, unreadCount } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [messageText, setMessageText] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState('all');
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const calendarDays = generateCalendarDays(currentDate.getFullYear(), currentDate.getMonth());
  const monthNames = ['Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni', 'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'];
  const dayNames = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'];
  
  // Modals state
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [, setSelectedCustomer] = useState<any>(null);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  
  // Edit states
  const [, setIsEditingCustomer] = useState(false);
  const [editingCustomerData, setEditingCustomerData] = useState<any>({});
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState({ name: '', email: '', phone: '', address: '', postcode: '' });
  
  // Data states
  const [customers, setCustomers] = useState([
    { id: 'C-001', name: 'Anna Andersson', email: 'anna@example.com', phone: '070-123 45 67', address: 'Storgatan 1', postcode: '12345', bookings: 5, totalSpent: 4500, status: 'active', notes: '' },
    { id: 'C-002', name: 'Erik Svensson', email: 'erik@example.com', phone: '070-234 56 78', address: 'Kungsgatan 10', postcode: '11122', bookings: 3, totalSpent: 2800, status: 'active', notes: 'Allergisk mot parfym' },
    { id: 'C-003', name: 'Lisa Karlsson', email: 'lisa@example.com', phone: '070-345 67 89', address: 'Drottninggatan 5', postcode: '11122', bookings: 1, totalSpent: 1200, status: 'inactive', notes: '' },
    { id: 'C-004', name: 'Maria Nilsson', email: 'maria@example.com', phone: '070-456 78 90', address: 'Sveavägen 25', postcode: '11134', bookings: 8, totalSpent: 7200, status: 'active', notes: 'Husdjur' },
    { id: 'C-005', name: 'Johan Eriksson', email: 'johan@example.com', phone: '070-567 89 01', address: 'Hornsgatan 45', postcode: '11821', bookings: 2, totalSpent: 1800, status: 'active', notes: '' },
  ]);
  
  const workers = [
    { id: 'W-001', name: 'Maria Persson', email: 'maria@hemsolutions.se', phone: '070-456 78 90', role: 'Städare', rating: 4.8, jobs: 45, status: 'active' },
    { id: 'W-002', name: 'Erik Svensson', email: 'erik.s@hemsolutions.se', phone: '070-567 89 01', role: 'Städare', rating: 4.9, jobs: 38, status: 'active' },
    { id: 'W-003', name: 'Lisa Karlsson', email: 'lisa.k@hemsolutions.se', phone: '070-678 90 12', role: 'Fönsterputsare', rating: 4.7, jobs: 32, status: 'on-leave' },
    { id: 'W-004', name: 'Anders Johansson', email: 'anders@hemsolutions.se', phone: '070-789 01 23', role: 'Städare', rating: 4.6, jobs: 28, status: 'active' },
  ];
  
  const [bookings, setBookings] = useState([
    { id: 'B-001', customerId: 'C-001', customer: 'Anna Andersson', workerId: 'W-001', worker: 'Maria Persson', service: 'Hemstädning', date: '2025-01-20', time: '08:00-12:00', status: 'confirmed', price: 796, notes: '' },
    { id: 'B-002', customerId: 'C-002', customer: 'Erik Svensson', workerId: 'W-002', worker: 'Erik Svensson', service: 'Fönsterputs', date: '2025-01-20', time: '13:00-17:00', status: 'completed', price: 356, notes: '' },
    { id: 'B-003', customerId: 'C-003', customer: 'Lisa Karlsson', workerId: '', worker: 'Ej tilldelad', service: 'Storstädning', date: '2025-02-05', time: '08:00-12:00', status: 'pending', price: 1145, notes: 'Flyttstädning' },
    { id: 'B-004', customerId: 'C-001', customer: 'Anna Andersson', workerId: 'W-001', worker: 'Maria Persson', service: 'Hemstädning', date: '2025-01-27', time: '08:00-12:00', status: 'confirmed', price: 796, notes: '' },
    { id: 'B-005', customerId: 'C-004', customer: 'Maria Nilsson', workerId: '', worker: 'Ej tilldelad', service: 'Hemstädning', date: '2025-01-22', time: '09:00-13:00', status: 'pending', price: 796, notes: 'Husdjur i hemmet' },
  ]);
  
  const invoices = [
    { id: 'F-001', customerId: 'C-002', customer: 'Erik Svensson', date: '2025-01-15', amount: 356, status: 'paid', dueDate: '2025-01-29', items: [{ desc: 'Fönsterputs 4 fönster', qty: 1, price: 356 }] },
    { id: 'F-002', customerId: 'C-001', customer: 'Anna Andersson', date: '2025-01-20', amount: 796, status: 'pending', dueDate: '2025-02-03', items: [{ desc: 'Hemstädning 4 timmar', qty: 4, price: 199 }] },
    { id: 'F-003', customerId: 'C-003', customer: 'Lisa Karlsson', date: '2025-01-10', amount: 1200, status: 'overdue', dueDate: '2025-01-24', items: [{ desc: 'Storstädning', qty: 1, price: 1200 }] },
  ];
  
  const [messages, setMessages] = useState([
    { id: 'M-001', sender: 'Anna Andersson', senderRole: 'customer', content: 'Kan jag ändra tid för min bokning?', timestamp: new Date(Date.now() - 3600000), read: false },
    { id: 'M-002', sender: 'Maria Persson', senderRole: 'worker', content: 'Jag är sjuk idag och kan inte arbeta.', timestamp: new Date(Date.now() - 7200000), read: false },
    { id: 'M-003', sender: 'Erik Svensson', senderRole: 'customer', content: 'Tack för fantastisk service!', timestamp: new Date(Date.now() - 86400000), read: true },
  ]);
  
  const [ratings] = useState([
    { id: 'R-001', customer: 'Erik Svensson', worker: 'Erik Svensson', service: 'Fönsterputs', rating: 5, comment: 'Perfekt jobb!', date: '2025-01-15' },
    { id: 'R-002', customer: 'Anna Andersson', worker: 'Maria Persson', service: 'Hemstädning', rating: 4, comment: 'Bra städning men glömde damma hyllorna.', date: '2025-01-10' },
  ]);
  
  const [complaints, setComplaints] = useState([
    { id: 'CMP-001', customer: 'Lisa Karlsson', issue: 'Missat område', status: 'open', date: '2025-01-18', priority: 'medium' },
    { id: 'CMP-002', customer: 'Erik Svensson', issue: 'Försenad ankomst', status: 'resolved', date: '2025-01-10', priority: 'low' },
  ]);

  // New booking form state
  const [newBookingData, setNewBookingData] = useState({
    customerId: '',
    service: 'Hemstädning',
    date: '',
    time: '08:00-12:00',
    notes: ''
  });

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    
    const newMessage = {
      id: `M-${Date.now()}`,
      sender: 'Admin',
      senderRole: 'admin',
      content: messageText,
      timestamp: new Date(),
      read: true,
    };
    
    setMessages(prev => [...prev, newMessage]);
    setMessageText('');
    
    // Send notification to recipient
    if (selectedRecipient !== 'all') {
      // In real app, this would send to specific user
    }
  };

  const handleDeleteCustomer = (customerId: string) => {
    if (confirm('Är du säker på att du vill ta bort denna kund?')) {
      setCustomers(prev => prev.filter(c => c.id !== customerId));
    }
  };

  const handleSaveCustomer = () => {
    if (isAddingCustomer) {
      const newCustomer = {
        id: `C-${String(customers.length + 1).padStart(3, '0')}`,
        ...newCustomerData,
        bookings: 0,
        totalSpent: 0,
        status: 'active',
        notes: ''
      };
      setCustomers(prev => [...prev, newCustomer]);
      setIsAddingCustomer(false);
      setNewCustomerData({ name: '', email: '', phone: '', address: '', postcode: '' });
    } else {
      setCustomers(prev => prev.map(c => c.id === editingCustomerData.id ? editingCustomerData : c));
      setIsEditingCustomer(false);
    }
    setShowCustomerModal(false);
  };

  const handleAddBooking = () => {
    const customer = customers.find(c => c.id === newBookingData.customerId);
    if (!customer) return;
    
    const newBooking = {
      id: `B-${String(bookings.length + 1).padStart(3, '0')}`,
      customerId: customer.id,
      customer: customer.name,
      workerId: '',
      worker: 'Ej tilldelad',
      service: newBookingData.service,
      date: newBookingData.date,
      time: newBookingData.time,
      status: 'pending',
      price: newBookingData.service === 'Hemstädning' ? 796 : newBookingData.service === 'Fönsterputs' ? 356 : 1145,
      notes: newBookingData.notes
    };
    
    setBookings(prev => [...prev, newBooking]);
    setCustomers(prev => prev.map(c => c.id === customer.id ? { ...c, bookings: c.bookings + 1 } : c));
    
    // Add notification
    // addNotification(customer.id, 'Ny bokning', `Din bokning för ${newBookingData.service} den ${newBookingData.date} har skapats.`, 'success');
    
    setShowBookingModal(false);
    setNewBookingData({ customerId: '', service: 'Hemstädning', date: '', time: '08:00-12:00', notes: '' });
  };

  const handleAssignWorker = (bookingId: string, workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    if (!worker) return;
    
    setBookings(prev => prev.map(b => 
      b.id === bookingId ? { ...b, workerId, worker: worker.name, status: 'confirmed' } : b
    ));
    
    // Add notification for worker
    // addNotification(workerId, 'Ny bokning', `Du har fått en ny bokning.`, 'info');
    
    setShowAssignModal(false);
  };

  const handleCancelBooking = (bookingId: string) => {
    if (confirm('Är du säker på att du vill avboka?')) {
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
    }
  };

  const handleViewInvoice = (invoice: any) => {
    setSelectedInvoice(invoice);
    setShowInvoiceModal(true);
  };

  const handleDownloadInvoice = (invoice: any) => {
    const content = `
FAKTURA ${invoice.id}
================
Datum: ${invoice.date}
Förfaller: ${invoice.dueDate}
Status: ${invoice.status === 'paid' ? 'Betald' : invoice.status === 'overdue' ? 'Försenad' : 'Obetald'}

KUND: ${invoice.customer}

ARTIKLAR:
${invoice.items.map((item: any) => `${item.desc} - ${item.qty} st × ${item.price} kr = ${item.qty * item.price} kr`).join('\n')}

TOTALT: ${invoice.amount} kr
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Faktura-${invoice.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleResolveComplaint = (complaintId: string) => {
    setComplaints(prev => prev.map(c => c.id === complaintId ? { ...c, status: 'resolved' } : c));
  };

  const getBookingsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return bookings.filter(b => b.date === dateStr);
  };

  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
  const pendingRevenue = invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0);
  const overdueRevenue = invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'paid':
      case 'active':
      case 'resolved':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">{status === 'confirmed' ? 'Bekräftad' : status === 'paid' ? 'Betald' : status === 'active' ? 'Aktiv' : 'Löst'}</span>;
      case 'pending':
      case 'open':
        return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">{status === 'pending' ? 'Väntar' : 'Öppen'}</span>;
      case 'completed':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Genomförd</span>;
      case 'overdue':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Försenad</span>;
      case 'on-leave':
        return <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">Sjukledig</span>;
      case 'inactive':
        return <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">Inaktiv</span>;
      case 'cancelled':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Avbokad</span>;
      default:
        return null;
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Du måste vara inloggad för att se denna sida.</p>
          <Button onClick={onBack}>Gå till startsidan</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-lg">
                <Home className="w-5 h-5" />
              </button>
              <img src="/hemsolutions-logo.png" alt="HemSolutions" className="w-10 h-10" />
              <span className="font-semibold">Admin Panel</span>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="hidden md:flex items-center bg-slate-800 rounded-lg px-3 py-1.5">
                <Search className="w-4 h-4 text-slate-400 mr-2" />
                <Input 
                  placeholder="Sök..." 
                  className="bg-transparent border-none text-white placeholder:text-slate-400 w-48"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 hover:bg-slate-800 rounded-lg relative"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                
                {showNotifications && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border z-50 text-slate-800">
                    <div className="p-3 border-b">
                      <h4 className="font-semibold">Notifikationer</h4>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map(notif => (
                        <div 
                          key={notif.id} 
                          className={`p-3 border-b hover:bg-slate-50 cursor-pointer ${!notif.read ? 'bg-blue-50' : ''}`}
                          onClick={() => markNotificationRead(notif.id)}
                        >
                          <p className="font-medium text-sm">{notif.title}</p>
                          <p className="text-xs text-slate-600">{notif.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <img src={user.avatar} alt={user.firstName} className="w-8 h-8 rounded-full" />
                <span className="hidden sm:block text-sm">{user.firstName}</span>
              </div>
              
              <button onClick={logout} className="p-2 hover:bg-slate-800 rounded-lg">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-9 mb-8">
            <TabsTrigger value="overview">Översikt</TabsTrigger>
            <TabsTrigger value="calendar">Kalender</TabsTrigger>
            <TabsTrigger value="customers">Kunder</TabsTrigger>
            <TabsTrigger value="workers">Personal</TabsTrigger>
            <TabsTrigger value="bookings">Bokningar</TabsTrigger>
            <TabsTrigger value="invoices">Fakturor</TabsTrigger>
            <TabsTrigger value="messages">Meddelanden</TabsTrigger>
            <TabsTrigger value="ratings">Omdömen</TabsTrigger>
            <TabsTrigger value="complaints">Reklamationer</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  <span className="text-sm text-slate-500">Totalt kunder</span>
                </div>
                <p className="text-2xl font-bold">{customers.length}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Briefcase className="w-5 h-5 text-teal-500" />
                  <span className="text-sm text-slate-500">Personal</span>
                </div>
                <p className="text-2xl font-bold">{workers.length}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-5 h-5 text-purple-500" />
                  <span className="text-sm text-slate-500">Bokningar idag</span>
                </div>
                <p className="text-2xl font-bold">{bookings.filter(b => b.date === '2025-01-20').length}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-slate-500">Intäkt denna månad</span>
                </div>
                <p className="text-2xl font-bold">{totalRevenue.toLocaleString()} kr</p>
              </div>
            </div>

            {/* Revenue Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-6 rounded-xl">
                <p className="text-sm text-green-700 mb-1">Betalt</p>
                <p className="text-xl font-bold text-green-800">{totalRevenue.toLocaleString()} kr</p>
              </div>
              <div className="bg-amber-50 p-6 rounded-xl">
                <p className="text-sm text-amber-700 mb-1">Väntar på betalning</p>
                <p className="text-xl font-bold text-amber-800">{pendingRevenue.toLocaleString()} kr</p>
              </div>
              <div className="bg-red-50 p-6 rounded-xl">
                <p className="text-sm text-red-700 mb-1">Försenat</p>
                <p className="text-xl font-bold text-red-800">{overdueRevenue.toLocaleString()} kr</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-lg mb-4">Senaste aktivitet</h3>
              <div className="space-y-3">
                {bookings.slice(0, 5).map(booking => (
                  <div key={booking.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium">{booking.service} - {booking.customer}</p>
                      <p className="text-sm text-slate-500">{booking.date} • {booking.time}</p>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                    className="p-2 hover:bg-slate-100 rounded-lg"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setCurrentDate(new Date())}
                    className="px-4 py-2 bg-teal-100 text-teal-700 rounded-lg font-medium"
                  >
                    Idag
                  </button>
                  <button 
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                    className="p-2 hover:bg-slate-100 rounded-lg"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1">
                {dayNames.map(day => (
                  <div key={day} className="text-center text-sm font-medium text-slate-500 py-2">
                    {day}
                  </div>
                ))}
                {calendarDays.map((day, idx) => {
                  const dayBookings = day ? getBookingsForDate(day) : [];
                  const hasBookings = dayBookings.length > 0;
                  const isToday = day === new Date().getDate() && 
                    currentDate.getMonth() === new Date().getMonth() &&
                    currentDate.getFullYear() === new Date().getFullYear();
                  
                  return (
                    <div 
                      key={idx} 
                      className={`
                        min-h-[100px] p-2 border rounded-lg
                        ${day ? 'bg-white' : 'bg-slate-50'}
                        ${isToday ? 'border-teal-500 border-2' : 'border-slate-200'}
                        ${hasBookings ? 'cursor-pointer hover:bg-teal-50' : ''}
                      `}
                    >
                      {day && (
                        <>
                          <span className={`text-sm font-medium ${isToday ? 'text-teal-600' : ''}`}>{day}</span>
                          {hasBookings && (
                            <div className="mt-1 space-y-1">
                              {dayBookings.map((booking, bidx) => (
                                <div 
                                  key={bidx} 
                                  className="text-xs bg-teal-100 text-teal-700 px-1 py-0.5 rounded truncate cursor-pointer hover:bg-teal-200"
                                  onClick={() => setSelectedBooking(booking)}
                                >
                                  {booking.time.split('-')[0]} {booking.customer.split(' ')[0]}
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-semibold text-lg">Kunddatabas</h3>
                <Button 
                  size="sm" 
                  className="bg-teal-500 hover:bg-teal-600"
                  onClick={() => {setIsAddingCustomer(true); setShowCustomerModal(true);}}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ny kund
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Namn</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Kontakt</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Adress</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Bokningar</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Åtgärder</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredCustomers.map(customer => (
                      <tr key={customer.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-sm text-slate-500">{customer.id}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm">{customer.email}</p>
                          <p className="text-sm text-slate-500">{customer.phone}</p>
                        </td>
                        <td className="px-4 py-3 text-sm">{customer.address}, {customer.postcode}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium">{customer.bookings}</p>
                          <p className="text-sm text-slate-500">{customer.totalSpent.toLocaleString()} kr</p>
                        </td>
                        <td className="px-4 py-3">{getStatusBadge(customer.status)}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button 
                              className="p-1 hover:bg-blue-100 rounded text-blue-600"
                              onClick={() => {setSelectedCustomer(customer); setEditingCustomerData(customer); setIsEditingCustomer(true); setShowCustomerModal(true);}}
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button 
                              className="p-1 hover:bg-red-100 rounded text-red-600"
                              onClick={() => handleDeleteCustomer(customer.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button 
                              className="p-1 hover:bg-green-100 rounded text-green-600"
                              onClick={() => {setNewBookingData({...newBookingData, customerId: customer.id}); setShowBookingModal(true);}}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Workers Tab */}
          <TabsContent value="workers">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-semibold text-lg">Personal</h3>
                <Button size="sm" className="bg-teal-500 hover:bg-teal-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Ny anställd
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Namn</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Roll</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Betyg</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Jobb</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Åtgärder</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {workers.map(worker => (
                      <tr key={worker.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <p className="font-medium">{worker.name}</p>
                          <p className="text-sm text-slate-500">{worker.email}</p>
                        </td>
                        <td className="px-4 py-3 text-sm">{worker.role}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span className="font-medium">{worker.rating}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">{worker.jobs}</td>
                        <td className="px-4 py-3">{getStatusBadge(worker.status)}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button className="p-1 hover:bg-blue-100 rounded text-blue-600">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button className="p-1 hover:bg-red-100 rounded text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-semibold text-lg">Bokningar</h3>
                <Button 
                  size="sm" 
                  className="bg-teal-500 hover:bg-teal-600"
                  onClick={() => setShowBookingModal(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ny bokning
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">ID</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Kund</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Personal</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Tjänst</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Datum/Tid</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Pris</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Åtgärder</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {bookings.map(booking => (
                      <tr key={booking.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm">{booking.id}</td>
                        <td className="px-4 py-3 text-sm">{booking.customer}</td>
                        <td className="px-4 py-3 text-sm">
                          {booking.workerId ? booking.worker : (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {setSelectedBooking(booking); setShowAssignModal(true);}}
                            >
                              Tilldela
                            </Button>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">{booking.service}</td>
                        <td className="px-4 py-3 text-sm">{booking.date}<br/>{booking.time}</td>
                        <td className="px-4 py-3 text-sm font-medium">{booking.price} kr</td>
                        <td className="px-4 py-3">{getStatusBadge(booking.status)}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button className="p-1 hover:bg-blue-100 rounded text-blue-600">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button 
                              className="p-1 hover:bg-red-100 rounded text-red-600"
                              onClick={() => handleCancelBooking(booking.id)}
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-lg">Fakturor</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">ID</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Kund</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Datum</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Belopp</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Förfaller</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Åtgärder</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {invoices.map(invoice => (
                      <tr key={invoice.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm">{invoice.id}</td>
                        <td className="px-4 py-3 text-sm">{invoice.customer}</td>
                        <td className="px-4 py-3 text-sm">{invoice.date}</td>
                        <td className="px-4 py-3 text-sm font-medium">{invoice.amount} kr</td>
                        <td className="px-4 py-3 text-sm">{invoice.dueDate}</td>
                        <td className="px-4 py-3">{getStatusBadge(invoice.status)}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button 
                              className="p-1 hover:bg-blue-100 rounded text-blue-600"
                              onClick={() => handleViewInvoice(invoice)}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              className="p-1 hover:bg-green-100 rounded text-green-600"
                              onClick={() => handleDownloadInvoice(invoice)}
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-4">
                <h3 className="font-semibold text-lg mb-4">Skicka meddelande</h3>
                <div className="space-y-4">
                  <div>
                    <Label>Mottagare</Label>
                    <select 
                      className="w-full p-2 border rounded-lg mt-1"
                      value={selectedRecipient}
                      onChange={(e) => setSelectedRecipient(e.target.value)}
                    >
                      <option value="all">Alla</option>
                      <option value="customers">Alla kunder</option>
                      <option value="workers">Alla anställda</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name} (Kund)</option>
                      ))}
                      {workers.map(w => (
                        <option key={w.id} value={w.id}>{w.name} (Personal)</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Meddelande</Label>
                    <textarea 
                      className="w-full p-2 border rounded-lg mt-1 h-32 resize-none"
                      placeholder="Skriv ditt meddelande..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleSendMessage} className="w-full bg-teal-500 hover:bg-teal-600">
                    <Send className="w-4 h-4 mr-2" />
                    Skicka
                  </Button>
                </div>
              </div>

              <div className="md:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b">
                  <h3 className="font-semibold text-lg">Meddelandehistorik</h3>
                </div>
                <div className="divide-y max-h-96 overflow-y-auto">
                  {messages.map(msg => (
                    <div key={msg.id} className="p-4 hover:bg-slate-50">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-teal-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{msg.sender}</p>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              msg.senderRole === 'customer' ? 'bg-blue-100 text-blue-700' : 
                              msg.senderRole === 'worker' ? 'bg-purple-100 text-purple-700' : 
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {msg.senderRole === 'customer' ? 'Kund' : msg.senderRole === 'worker' ? 'Personal' : 'Admin'}
                            </span>
                            {!msg.read && <span className="w-2 h-2 bg-red-500 rounded-full" />}
                          </div>
                          <p className="text-sm text-slate-600 mt-1">{msg.content}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {msg.timestamp.toLocaleString('sv-SE')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Ratings Tab */}
          <TabsContent value="ratings">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-lg">Kundomdömen</h3>
              </div>
              <div className="divide-y">
                {ratings.map(rating => (
                  <div key={rating.id} className="p-4 hover:bg-slate-50">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{rating.customer}</p>
                          <span className="text-sm text-slate-500">→</span>
                          <p className="font-medium">{rating.worker}</p>
                        </div>
                        <p className="text-sm text-slate-500">{rating.service} • {rating.date}</p>
                        <div className="flex gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star 
                              key={star} 
                              className={`w-5 h-5 ${star <= rating.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`}
                            />
                          ))}
                        </div>
                        <p className="mt-2 text-slate-700">{rating.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Complaints Tab */}
          <TabsContent value="complaints">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-semibold text-lg">Reklamationer</h3>
                <Button size="sm" className="bg-teal-500 hover:bg-teal-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Ny reklamation
                </Button>
              </div>
              <div className="divide-y">
                {complaints.map(complaint => (
                  <div key={complaint.id} className="p-4 hover:bg-slate-50">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{complaint.issue}</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            complaint.priority === 'high' ? 'bg-red-100 text-red-700' : 
                            complaint.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 
                            'bg-green-100 text-green-700'
                          }`}>
                            {complaint.priority === 'high' ? 'Hög' : complaint.priority === 'medium' ? 'Medel' : 'Låg'}
                          </span>
                          {getStatusBadge(complaint.status)}
                        </div>
                        <p className="text-sm text-slate-500">Kund: {complaint.customer}</p>
                        <p className="text-sm text-slate-500">{complaint.date}</p>
                      </div>
                      <div className="flex gap-2">
                        {complaint.status === 'open' && (
                          <Button 
                            size="sm" 
                            className="bg-green-500 hover:bg-green-600"
                            onClick={() => handleResolveComplaint(complaint.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Markera löst
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Customer Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">
              {isAddingCustomer ? 'Lägg till kund' : 'Redigera kund'}
            </h3>
            <div className="space-y-4">
              <div>
                <Label>Namn</Label>
                <Input 
                  value={isAddingCustomer ? newCustomerData.name : editingCustomerData.name} 
                  onChange={(e) => isAddingCustomer 
                    ? setNewCustomerData({...newCustomerData, name: e.target.value})
                    : setEditingCustomerData({...editingCustomerData, name: e.target.value})
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label>E-post</Label>
                <Input 
                  value={isAddingCustomer ? newCustomerData.email : editingCustomerData.email} 
                  onChange={(e) => isAddingCustomer 
                    ? setNewCustomerData({...newCustomerData, email: e.target.value})
                    : setEditingCustomerData({...editingCustomerData, email: e.target.value})
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Telefon</Label>
                <Input 
                  value={isAddingCustomer ? newCustomerData.phone : editingCustomerData.phone} 
                  onChange={(e) => isAddingCustomer 
                    ? setNewCustomerData({...newCustomerData, phone: e.target.value})
                    : setEditingCustomerData({...editingCustomerData, phone: e.target.value})
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Adress</Label>
                <Input 
                  value={isAddingCustomer ? newCustomerData.address : editingCustomerData.address} 
                  onChange={(e) => isAddingCustomer 
                    ? setNewCustomerData({...newCustomerData, address: e.target.value})
                    : setEditingCustomerData({...editingCustomerData, address: e.target.value})
                  }
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button 
                variant="outline" 
                onClick={() => {setShowCustomerModal(false); setIsAddingCustomer(false); setIsEditingCustomer(false);}} 
                className="flex-1"
              >
                Avbryt
              </Button>
              <Button onClick={handleSaveCustomer} className="flex-1 bg-teal-500 hover:bg-teal-600">
                <CheckCircle className="w-4 h-4 mr-2" />
                Spara
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Ny bokning</h3>
            <div className="space-y-4">
              <div>
                <Label>Kund</Label>
                <select 
                  className="w-full p-2 border rounded-lg mt-1"
                  value={newBookingData.customerId}
                  onChange={(e) => setNewBookingData({...newBookingData, customerId: e.target.value})}
                >
                  <option value="">Välj kund</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Tjänst</Label>
                <select 
                  className="w-full p-2 border rounded-lg mt-1"
                  value={newBookingData.service}
                  onChange={(e) => setNewBookingData({...newBookingData, service: e.target.value})}
                >
                  <option value="Hemstädning">Hemstädning</option>
                  <option value="Fönsterputs">Fönsterputs</option>
                  <option value="Storstädning">Storstädning</option>
                  <option value="Flyttstädning">Flyttstädning</option>
                  <option value="Kontorsstädning">Kontorsstädning</option>
                </select>
              </div>
              <div>
                <Label>Datum</Label>
                <Input 
                  type="date"
                  value={newBookingData.date}
                  onChange={(e) => setNewBookingData({...newBookingData, date: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Tid</Label>
                <select 
                  className="w-full p-2 border rounded-lg mt-1"
                  value={newBookingData.time}
                  onChange={(e) => setNewBookingData({...newBookingData, time: e.target.value})}
                >
                  <option value="08:00-12:00">08:00 - 12:00</option>
                  <option value="09:00-13:00">09:00 - 13:00</option>
                  <option value="10:00-14:00">10:00 - 14:00</option>
                  <option value="13:00-17:00">13:00 - 17:00</option>
                </select>
              </div>
              <div>
                <Label>Anteckningar</Label>
                <textarea 
                  className="w-full p-2 border rounded-lg mt-1 h-20 resize-none"
                  placeholder="Eventuella anteckningar..."
                  value={newBookingData.notes}
                  onChange={(e) => setNewBookingData({...newBookingData, notes: e.target.value})}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowBookingModal(false)} className="flex-1">
                Avbryt
              </Button>
              <Button onClick={handleAddBooking} className="flex-1 bg-teal-500 hover:bg-teal-600">
                <Plus className="w-4 h-4 mr-2" />
                Skapa bokning
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Worker Modal */}
      {showAssignModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Tilldela personal</h3>
            <p className="text-slate-600 mb-4">
              Bokning: {selectedBooking.service} för {selectedBooking.customer} den {selectedBooking.date}
            </p>
            <div className="space-y-2">
              {workers.filter(w => w.status === 'active').map(worker => (
                <button
                  key={worker.id}
                  className="w-full p-3 border rounded-lg hover:bg-teal-50 flex items-center justify-between"
                  onClick={() => handleAssignWorker(selectedBooking.id, worker.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-teal-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">{worker.name}</p>
                      <p className="text-sm text-slate-500">{worker.role} • {worker.jobs} jobb</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm">{worker.rating}</span>
                  </div>
                </button>
              ))}
            </div>
            <Button variant="outline" onClick={() => setShowAssignModal(false)} className="w-full mt-4">
              Avbryt
            </Button>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Faktura {selectedInvoice.id}</h3>
              <button onClick={() => setShowInvoiceModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="border-b pb-4 mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-slate-500">Fakturanummer:</span>
                <span className="font-medium">{selectedInvoice.id}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-500">Datum:</span>
                <span>{selectedInvoice.date}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-500">Förfallodatum:</span>
                <span>{selectedInvoice.dueDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  selectedInvoice.status === 'paid' ? 'bg-green-100 text-green-700' : 
                  selectedInvoice.status === 'overdue' ? 'bg-red-100 text-red-700' : 
                  'bg-amber-100 text-amber-700'
                }`}>
                  {selectedInvoice.status === 'paid' ? 'Betald' : selectedInvoice.status === 'overdue' ? 'Försenad' : 'Obetald'}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-medium mb-2">Artiklar</h4>
              <div className="space-y-2">
                {selectedInvoice.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between p-2 bg-slate-50 rounded">
                    <span>{item.desc}</span>
                    <span className="font-medium">{item.qty * item.price} kr</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-xl font-bold">
                <span>Totalt:</span>
                <span className="text-teal-600">{selectedInvoice.amount} kr</span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => handleDownloadInvoice(selectedInvoice)} className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Ladda ner
              </Button>
              <Button onClick={() => setShowInvoiceModal(false)} className="flex-1 bg-teal-500 hover:bg-teal-600">
                Stäng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
