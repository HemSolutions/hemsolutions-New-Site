import { useState, useEffect } from 'react';
import { 
  Calendar, CreditCard, Star, MessageSquare, 
  User, Bell, LogOut, 
  Home, XCircle, Send, Plus,
  ShoppingCart, Trash2, Edit3, Eye, Download, Lock,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';

interface CustomerDashboardProps {
  onBack: () => void;
}

// Mock products data
const mockProducts = [
  { id: 'P-001', name: 'Allrengöring', description: 'Miljövänlig allrengöring 1L', price: 89, image: '🧴' },
  { id: 'P-002', name: 'Fönsterputsmedel', description: 'Professionellt fönsterputs', price: 79, image: '🪟' },
  { id: 'P-003', name: 'Toalettborste', description: 'Högkvalitativ toalettborste', price: 129, image: '🚽' },
  { id: 'P-004', name: 'Städtrasor', description: 'Mikrofibertrasor 5-pack', price: 99, image: '🧽' },
  { id: 'P-005', name: 'Handskar', description: 'Skyddshandskar stl M', price: 49, image: '🧤' },
  { id: 'P-006', name: 'Sopsäckar', description: 'Återvinningsbara sopsäckar 20st', price: 59, image: '🗑️' },
];

export function CustomerDashboard({ onBack }: CustomerDashboardProps) {
  const { user, logout, sendMessage, notifications, markNotificationRead, unreadCount, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Bookings state
  const [bookings, setBookings] = useState([
    { id: 'B-001', service: 'Hemstädning', date: '2025-01-20', time: '08:00-12:00', status: 'confirmed', price: 796, hours: 4, worker: 'Maria Persson' },
    { id: 'B-002', service: 'Fönsterputs', date: '2025-01-15', time: '13:00-17:00', status: 'completed', price: 356, windows: 4, worker: 'Erik Svensson' },
    { id: 'B-003', service: 'Storstädning', date: '2025-02-05', time: '08:00-12:00', status: 'pending', price: 1145, hours: 5, worker: 'Ej tilldelad' },
  ]);
  
  // Invoices state
  const [invoices, setInvoices] = useState([
    { id: 'F-001', date: '2025-01-15', amount: 356, status: 'paid', dueDate: '2025-01-29', items: [{ desc: 'Fönsterputs 4 fönster', qty: 1, price: 356 }] },
    { id: 'F-002', date: '2025-01-20', amount: 796, status: 'pending', dueDate: '2025-02-03', items: [{ desc: 'Hemstädning 4 timmar', qty: 4, price: 199 }] },
  ]);
  
  // Messages state
  const [messages, setMessages] = useState([
    { id: 'M-001', sender: 'Maria Persson', role: 'worker', content: 'Hej! Jag kommer vid 08:00 imorgon. Ser fram emot att hjälpa dig!', timestamp: new Date(Date.now() - 86400000), read: true },
    { id: 'M-002', sender: 'HemSolutions Support', role: 'admin', content: 'Din bokning har bekräftats. Tack för att du väljer oss!', timestamp: new Date(Date.now() - 172800000), read: true },
  ]);
  
  // Ratings state
  const [ratings, setRatings] = useState([
    { id: 'R-001', bookingId: 'B-002', service: 'Fönsterputs', worker: 'Erik Svensson', date: '2025-01-15', rating: 5, comment: 'Perfekt jobb! Fönstren är skinande rena.' },
  ]);
  
  // Cart state
  const [cart, setCart] = useState<{product: typeof mockProducts[0], quantity: number}[]>([]);
  
  // UI states
  const [messageText, setMessageText] = useState('');
  const [selectedBookingForRating, setSelectedBookingForRating] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<typeof invoices[0] | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState<string | null>(null);
  
  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    address: user?.address || '',
    postcode: user?.postcode || '',
  });
  
  // Password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });

  // Load user data into profile form
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        address: user.address || '',
        postcode: user.postcode || '',
      });
    }
  }, [user]);

  const addToCart = (product: typeof mockProducts[0]) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    
    const newMessage = {
      id: `M-${Date.now()}`,
      sender: `${user?.firstName} ${user?.lastName}`,
      role: 'customer' as const,
      content: messageText,
      timestamp: new Date(),
      read: true,
    };
    
    setMessages(prev => [...prev, newMessage]);
    sendMessage({ userId: 'admin', message: messageText });
    setMessageText('');
  };

  const handleCancelBooking = (bookingId: string) => {
    setBookings(prev => prev.map(b => 
      b.id === bookingId ? { ...b, status: 'cancelled' } : b
    ));
    setSelectedBookingForCancel(null);
  };

  const handleSubmitRating = () => {
    if (selectedBookingForRating && rating > 0) {
      const booking = bookings.find(b => b.id === selectedBookingForRating);
      if (booking) {
        const newRating = {
          id: `R-${Date.now()}`,
          bookingId: selectedBookingForRating,
          service: booking.service,
          worker: booking.worker,
          date: new Date().toISOString().split('T')[0],
          rating,
          comment: ratingComment,
        };
        setRatings(prev => [newRating, ...prev]);
      }
      setSelectedBookingForRating(null);
      setRating(0);
      setRatingComment('');
    }
  };

  const handleViewInvoice = (invoice: typeof invoices[0]) => {
    setSelectedInvoice(invoice);
    setShowInvoiceModal(true);
  };

  const handleDownloadInvoice = (invoice: typeof invoices[0]) => {
    // Create invoice content
    const content = `
FAKTURA ${invoice.id}
================
Datum: ${invoice.date}
Förfaller: ${invoice.dueDate}
Status: ${invoice.status === 'paid' ? 'Betald' : 'Obetald'}

ARTIKLAR:
${invoice.items.map(item => `${item.desc} - ${item.qty} st × ${item.price} kr = ${item.qty * item.price} kr`).join('\n')}

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

  const handlePayInvoice = (invoiceId: string) => {
    setShowPaymentModal(true);
    // Simulate payment processing
    setTimeout(() => {
      setInvoices(prev => prev.map(inv => 
        inv.id === invoiceId ? { ...inv, status: 'paid' } : inv
      ));
      setShowPaymentModal(false);
    }, 2000);
  };

  const handleCheckout = () => {
    setShowCheckoutModal(false);
    // Process order
    alert('Tack för din beställning! Vi levererar produkterna vid nästa städning.');
    setCart([]);
  };

  const handleSaveProfile = async () => {
    const success = await updateProfile({
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      phone: profileData.phone,
      address: profileData.address,
      postcode: profileData.postcode,
    });
    if (success) {
      setIsEditingProfile(false);
    }
  };

  const handleChangePassword = () => {
    if (passwordData.new !== passwordData.confirm) {
      alert('Lösenorden matchar inte!');
      return;
    }
    if (passwordData.new.length < 6) {
      alert('Lösenordet måste vara minst 6 tecken!');
      return;
    }
    alert('Lösenordet har ändrats!');
    setShowPasswordModal(false);
    setPasswordData({ current: '', new: '', confirm: '' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Bekräftad</span>;
      case 'pending':
        return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">Väntar</span>;
      case 'completed':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Genomförd</span>;
      case 'cancelled':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Avbokad</span>;
      default:
        return null;
    }
  };

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
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg">
                <Home className="w-5 h-5" />
              </button>
              <img src="/hemsolutions-logo.png" alt="HemSolutions" className="w-10 h-10" />
              <span className="font-semibold text-slate-800">Kundportal</span>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 hover:bg-slate-100 rounded-lg relative"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                
                {showNotifications && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border z-50">
                    <div className="p-3 border-b">
                      <h4 className="font-semibold">Notifikationer</h4>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="p-4 text-center text-slate-500 text-sm">Inga notifikationer</p>
                      ) : (
                        notifications.map(notif => (
                          <div 
                            key={notif.id} 
                            className={`p-3 border-b hover:bg-slate-50 cursor-pointer ${!notif.read ? 'bg-blue-50' : ''}`}
                            onClick={() => markNotificationRead(notif.id)}
                          >
                            <p className="font-medium text-sm">{notif.title}</p>
                            <p className="text-xs text-slate-600">{notif.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="flex items-center gap-3">
                <img src={user.avatar} alt={user.firstName} className="w-8 h-8 rounded-full" />
                <span className="hidden sm:block text-sm font-medium">{user.firstName}</span>
              </div>
              
              <button onClick={logout} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 mb-8">
            <TabsTrigger value="overview">Översikt</TabsTrigger>
            <TabsTrigger value="bookings">Bokningar</TabsTrigger>
            <TabsTrigger value="invoices">Fakturor</TabsTrigger>
            <TabsTrigger value="messages">Meddelanden</TabsTrigger>
            <TabsTrigger value="products">Produkter</TabsTrigger>
            <TabsTrigger value="ratings">Omdömen</TabsTrigger>
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="settings">Inställningar</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-5 h-5 text-teal-500" />
                  <span className="text-sm text-slate-500">Kommande bokningar</span>
                </div>
                <p className="text-2xl font-bold">{bookings.filter(b => b.status !== 'completed' && b.status !== 'cancelled').length}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <CreditCard className="w-5 h-5 text-amber-500" />
                  <span className="text-sm text-slate-500">Obetalda fakturor</span>
                </div>
                <p className="text-2xl font-bold">{invoices.filter(i => i.status === 'pending').length}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm text-slate-500">Dina omdömen</span>
                </div>
                <p className="text-2xl font-bold">{ratings.length}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <MessageSquare className="w-5 h-5 text-blue-500" />
                  <span className="text-sm text-slate-500">Nya meddelanden</span>
                </div>
                <p className="text-2xl font-bold">{unreadCount}</p>
              </div>
            </div>

            {/* Next Booking */}
            {bookings.filter(b => b.status === 'confirmed' || b.status === 'pending')[0] && (
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="font-semibold text-lg mb-4">Nästa bokning</h3>
                {(() => {
                  const nextBooking = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending')[0];
                  return (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{nextBooking.service}</p>
                        <p className="text-sm text-slate-500">{nextBooking.date} • {nextBooking.time}</p>
                        <p className="text-sm text-slate-500">Städare: {nextBooking.worker}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-teal-600">{nextBooking.price} kr</p>
                        {getStatusBadge(nextBooking.status)}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-semibold text-lg mb-4">Snabbåtgärder</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <button 
                  onClick={() => setActiveTab('bookings')}
                  className="p-4 bg-teal-50 rounded-xl hover:bg-teal-100 transition-colors text-center"
                >
                  <Plus className="w-6 h-6 mx-auto mb-2 text-teal-600" />
                  <span className="text-sm font-medium">Ny bokning</span>
                </button>
                <button 
                  onClick={() => setActiveTab('messages')}
                  className="p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors text-center"
                >
                  <MessageSquare className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                  <span className="text-sm font-medium">Skicka meddelande</span>
                </button>
                <button 
                  onClick={() => setActiveTab('products')}
                  className="p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors text-center"
                >
                  <ShoppingCart className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                  <span className="text-sm font-medium">Beställ produkter</span>
                </button>
                <button 
                  onClick={() => setActiveTab('profile')}
                  className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors text-center"
                >
                  <User className="w-6 h-6 mx-auto mb-2 text-slate-600" />
                  <span className="text-sm font-medium">Uppdatera profil</span>
                </button>
              </div>
            </div>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-semibold text-lg">Dina bokningar</h3>
                <Button size="sm" className="bg-teal-500 hover:bg-teal-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Ny bokning
                </Button>
              </div>
              <div className="divide-y">
                {bookings.map(booking => (
                  <div key={booking.id} className="p-4 hover:bg-slate-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{booking.service}</p>
                          {getStatusBadge(booking.status)}
                        </div>
                        <p className="text-sm text-slate-500">{booking.date} • {booking.time}</p>
                        <p className="text-sm text-slate-500">Städare: {booking.worker}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{booking.price} kr</p>
                        <div className="flex gap-2 mt-2">
                          {booking.status === 'completed' && !ratings.find(r => r.bookingId === booking.id) && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setSelectedBookingForRating(booking.id)}
                            >
                              <Star className="w-4 h-4 mr-1" />
                              Betygsätt
                            </Button>
                          )}
                          {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-red-600"
                              onClick={() => setSelectedBookingForCancel(booking.id)}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Avboka
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-lg">Dina fakturor</h3>
              </div>
              <div className="divide-y">
                {invoices.map(invoice => (
                  <div key={invoice.id} className="p-4 hover:bg-slate-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Faktura {invoice.id}</p>
                        <p className="text-sm text-slate-500">Datum: {invoice.date}</p>
                        <p className="text-sm text-slate-500">Förfaller: {invoice.dueDate}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{invoice.amount} kr</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          invoice.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {invoice.status === 'paid' ? 'Betald' : 'Obetald'}
                        </span>
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" variant="outline" onClick={() => handleViewInvoice(invoice)}>
                            <Eye className="w-4 h-4 mr-1" />
                            Visa
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDownloadInvoice(invoice)}>
                            <Download className="w-4 h-4 mr-1" />
                            Ladda ner
                          </Button>
                          {invoice.status === 'pending' && (
                            <Button size="sm" className="bg-teal-500 hover:bg-teal-600" onClick={() => handlePayInvoice(invoice.id)}>
                              <CreditCard className="w-4 h-4 mr-1" />
                              Betala
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-lg">Meddelanden</h3>
              </div>
              <div className="h-96 flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex gap-3 ${msg.role === 'customer' ? 'flex-row-reverse' : ''}`}>
                      <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-teal-600" />
                      </div>
                      <div className={`max-w-[70%] p-3 rounded-xl ${
                        msg.role === 'customer' 
                          ? 'bg-teal-500 text-white rounded-tr-none' 
                          : 'bg-slate-100 rounded-tl-none'
                      }`}>
                        <p className="text-xs font-medium mb-1">{msg.sender}</p>
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {msg.timestamp.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t flex gap-2">
                  <Input
                    placeholder="Skriv ett meddelande..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button onClick={handleSendMessage} className="bg-teal-500 hover:bg-teal-600">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Products List */}
              <div className="bg-white rounded-xl shadow-sm p-4">
                <h3 className="font-semibold text-lg mb-4">Städprodukter</h3>
                <div className="grid grid-cols-2 gap-4">
                  {mockProducts.map(product => (
                    <div key={product.id} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                      <div className="text-3xl mb-2">{product.image}</div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-slate-500">{product.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-semibold text-teal-600">{product.price} kr</span>
                        <Button size="sm" onClick={() => addToCart(product)}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shopping Cart */}
              <div className="bg-white rounded-xl shadow-sm p-4">
                <h3 className="font-semibold text-lg mb-4">Din varukorg</h3>
                {cart.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">Varukorgen är tom</p>
                ) : (
                  <>
                    <div className="space-y-3 mb-4">
                      {cart.map(item => (
                        <div key={item.product.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{item.product.image}</span>
                            <div>
                              <p className="font-medium text-sm">{item.product.name}</p>
                              <p className="text-xs text-slate-500">{item.product.price} kr/st</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => updateQuantity(item.product.id, -1)}
                              className="w-6 h-6 bg-slate-200 rounded flex items-center justify-center"
                            >-</button>
                            <span className="w-6 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.product.id, 1)}
                              className="w-6 h-6 bg-slate-200 rounded flex items-center justify-center"
                            >+</button>
                            <span className="font-semibold w-16 text-right">{item.product.price * item.quantity} kr</span>
                            <button 
                              onClick={() => removeFromCart(item.product.id)}
                              className="p-1 hover:bg-red-100 rounded text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between mb-4">
                        <span className="font-semibold">Totalt:</span>
                        <span className="font-bold text-xl text-teal-600">{cartTotal} kr</span>
                      </div>
                      <Button 
                        className="w-full bg-teal-500 hover:bg-teal-600"
                        onClick={() => setShowCheckoutModal(true)}
                      >
                        Gå till kassan
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Ratings Tab */}
          <TabsContent value="ratings">
            <div className="space-y-6">
              {/* Completed bookings without ratings */}
              {bookings.filter(b => b.status === 'completed' && !ratings.find(r => r.bookingId === b.id)).length > 0 && (
                <div className="bg-amber-50 rounded-xl p-4">
                  <h3 className="font-semibold text-lg mb-2">Väntar på ditt omdöme</h3>
                  <p className="text-sm text-slate-600 mb-4">Hjälp oss bli bättre genom att betygsätta dina städningar</p>
                  <div className="space-y-2">
                    {bookings.filter(b => b.status === 'completed' && !ratings.find(r => r.bookingId === b.id)).map(booking => (
                      <div key={booking.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div>
                          <p className="font-medium">{booking.service}</p>
                          <p className="text-sm text-slate-500">{booking.date} • {booking.worker}</p>
                        </div>
                        <Button size="sm" onClick={() => setSelectedBookingForRating(booking.id)}>
                          <Star className="w-4 h-4 mr-1" />
                          Betygsätt
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Existing ratings */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b">
                  <h3 className="font-semibold text-lg">Dina omdömen</h3>
                </div>
                <div className="divide-y">
                  {ratings.length === 0 ? (
                    <p className="p-8 text-center text-slate-500">Du har inte lämnat några omdömen än</p>
                  ) : (
                    ratings.map(rating => (
                      <div key={rating.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{rating.service}</p>
                            <p className="text-sm text-slate-500">Städare: {rating.worker}</p>
                            <p className="text-sm text-slate-500">{rating.date}</p>
                            <div className="flex gap-1 mt-2">
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
                    ))
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-lg mb-6">Din profil</h3>
              <div className="flex items-center gap-6 mb-6">
                <img src={user.avatar} alt={user.firstName} className="w-24 h-24 rounded-full" />
                <div>
                  <p className="text-xl font-semibold">{user.firstName} {user.lastName}</p>
                  <p className="text-slate-500">{user.email}</p>
                  <p className="text-slate-500">Medlem sedan {user.createdAt ? new Date(user.createdAt).toLocaleDateString('sv-SE') : ''}</p>
                </div>
              </div>
              
              {isEditingProfile ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Förnamn</Label>
                      <Input 
                        value={profileData.firstName} 
                        onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                        className="mt-1" 
                      />
                    </div>
                    <div>
                      <Label>Efternamn</Label>
                      <Input 
                        value={profileData.lastName} 
                        onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                        className="mt-1" 
                      />
                    </div>
                    <div>
                      <Label>Telefon</Label>
                      <Input 
                        value={profileData.phone} 
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        className="mt-1" 
                      />
                    </div>
                    <div>
                      <Label>Personnummer</Label>
                      <Input value={user.personnummer} readOnly className="mt-1 bg-slate-100" />
                    </div>
                    <div>
                      <Label>Adress</Label>
                      <Input 
                        value={profileData.address} 
                        onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                        className="mt-1" 
                      />
                    </div>
                    <div>
                      <Label>Postnummer</Label>
                      <Input 
                        value={profileData.postcode} 
                        onChange={(e) => setProfileData({...profileData, postcode: e.target.value})}
                        className="mt-1" 
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setIsEditingProfile(false)}>
                      Avbryt
                    </Button>
                    <Button className="bg-teal-500 hover:bg-teal-600" onClick={handleSaveProfile}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Spara ändringar
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Telefon</Label>
                      <Input value={user.phone} readOnly className="mt-1 bg-slate-50" />
                    </div>
                    <div>
                      <Label>Personnummer</Label>
                      <Input value={user.personnummer} readOnly className="mt-1 bg-slate-50" />
                    </div>
                    <div>
                      <Label>Adress</Label>
                      <Input value={user.address || ''} readOnly className="mt-1 bg-slate-50" />
                    </div>
                    <div>
                      <Label>Postnummer</Label>
                      <Input value={user.postcode || ''} readOnly className="mt-1 bg-slate-50" />
                    </div>
                  </div>
                  <div className="mt-6 flex gap-3">
                    <Button variant="outline" onClick={() => setIsEditingProfile(true)}>
                      <Edit3 className="w-4 h-4 mr-2" />
                      Redigera profil
                    </Button>
                    <Button variant="outline" onClick={() => setShowPasswordModal(true)}>
                      <Lock className="w-4 h-4 mr-2" />
                      Ändra lösenord
                    </Button>
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-lg mb-6">Inställningar</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium">E-postnotifikationer</p>
                    <p className="text-sm text-slate-500">Få e-post vid nya bokningar och påminnelser</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium">SMS-notifikationer</p>
                    <p className="text-sm text-slate-500">Få SMS påminnelser före städning</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium">Nyhetsbrev</p>
                    <p className="text-sm text-slate-500">Få erbjudanden och nyheter</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium">RUT-avdrag automatiskt</p>
                    <p className="text-sm text-slate-500">Ansök om RUT-avdrag automatiskt</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Rating Modal */}
      {selectedBookingForRating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Betygsätt städning</h3>
            <p className="text-slate-600 mb-4">
              {bookings.find(b => b.id === selectedBookingForRating)?.service} - {bookings.find(b => b.id === selectedBookingForRating)?.worker}
            </p>
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1"
                >
                  <Star 
                    className={`w-8 h-8 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`}
                  />
                </button>
              ))}
            </div>
            <textarea
              placeholder="Din kommentar (valfritt)"
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              className="w-full p-3 border rounded-lg mb-4 h-24 resize-none"
            />
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => {setSelectedBookingForRating(null); setRating(0); setRatingComment('');}} className="flex-1">
                Avbryt
              </Button>
              <Button onClick={handleSubmitRating} className="flex-1 bg-teal-500 hover:bg-teal-600" disabled={rating === 0}>
                Skicka omdöme
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Booking Modal */}
      {selectedBookingForCancel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Bekräfta avbokning</h3>
            <p className="text-slate-600 mb-4">
              Är du säker på att du vill avboka {bookings.find(b => b.id === selectedBookingForCancel)?.service} den {bookings.find(b => b.id === selectedBookingForCancel)?.date}?
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setSelectedBookingForCancel(null)} className="flex-1">
                Avbryt
              </Button>
              <Button onClick={() => handleCancelBooking(selectedBookingForCancel)} className="flex-1 bg-red-500 hover:bg-red-600">
                <XCircle className="w-4 h-4 mr-2" />
                Ja, avboka
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice View Modal */}
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
                  selectedInvoice.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {selectedInvoice.status === 'paid' ? 'Betald' : 'Obetald'}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-medium mb-2">Artiklar</h4>
              <div className="space-y-2">
                {selectedInvoice.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between p-2 bg-slate-50 rounded">
                    <span>{item.desc}</span>
                    <span className="font-medium">{item.qty * item.price} kr</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-xl font-bold">
                <span>Totalt att betala:</span>
                <span className="text-teal-600">{selectedInvoice.amount} kr</span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => handleDownloadInvoice(selectedInvoice)} className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Ladda ner
              </Button>
              {selectedInvoice.status === 'pending' && (
                <Button onClick={() => {setShowInvoiceModal(false); handlePayInvoice(selectedInvoice.id);}} className="flex-1 bg-teal-500 hover:bg-teal-600">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Betala nu
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Bekräfta beställning</h3>
            <div className="space-y-2 mb-4">
              {cart.map(item => (
                <div key={item.product.id} className="flex justify-between">
                  <span>{item.product.name} × {item.quantity}</span>
                  <span>{item.product.price * item.quantity} kr</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 mb-4">
              <div className="flex justify-between text-xl font-bold">
                <span>Totalt:</span>
                <span className="text-teal-600">{cartTotal} kr</span>
              </div>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Produkterna levereras vid din nästa städning.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowCheckoutModal(false)} className="flex-1">
                Avbryt
              </Button>
              <Button onClick={handleCheckout} className="flex-1 bg-teal-500 hover:bg-teal-600">
                <CheckCircle className="w-4 h-4 mr-2" />
                Bekräfta beställning
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full text-center">
            <div className="animate-spin w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold mb-2">Bearbetar betalning...</h3>
            <p className="text-slate-500">Vänligen vänta medan vi behandlar din betalning.</p>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Ändra lösenord</h3>
            <div className="space-y-4">
              <div>
                <Label>Nuvarande lösenord</Label>
                <Input 
                  type="password" 
                  value={passwordData.current}
                  onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Nytt lösenord</Label>
                <Input 
                  type="password" 
                  value={passwordData.new}
                  onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Bekräfta nytt lösenord</Label>
                <Input 
                  type="password" 
                  value={passwordData.confirm}
                  onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowPasswordModal(false)} className="flex-1">
                Avbryt
              </Button>
              <Button onClick={handleChangePassword} className="flex-1 bg-teal-500 hover:bg-teal-600">
                <CheckCircle className="w-4 h-4 mr-2" />
                Ändra lösenord
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
