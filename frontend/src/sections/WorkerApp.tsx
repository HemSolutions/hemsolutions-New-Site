import { useState } from 'react';
import { 
  MapPin, CheckCircle, MessageSquare, 
  User, LogOut, Home, Send,
  AlertCircle, Phone, Navigation,
  ChevronLeft, ChevronRight, XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';

interface WorkerAppProps {
  onBack: () => void;
}

// Generate calendar days for current month
const generateCalendarDays = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDay = firstDay.getDay() || 7; // 1 = Monday
  
  const days = [];
  // Previous month padding
  for (let i = 1; i < startingDay; i++) {
    days.push(null);
  }
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }
  return days;
};

export function WorkerApp({ onBack }: WorkerAppProps) {
  const { user, logout, sendMessage } = useAuth();
  const [activeTab, setActiveTab] = useState('calendar');
  const [messageText, setMessageText] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkInNotes, setCheckInNotes] = useState('');
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  
  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const calendarDays = generateCalendarDays(currentDate.getFullYear(), currentDate.getMonth());
  const monthNames = ['Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni', 'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'];
  const dayNames = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'];
  
  // Bookings state
  const [bookings, setBookings] = useState([
    { id: 'B-001', customer: 'Anna Andersson', service: 'Hemstädning', date: '2025-01-20', time: '08:00-12:00', address: 'Storgatan 1, 12345 Stockholm', status: 'confirmed', phone: '070-123 45 67', notes: 'Husdjur i hemmet', completed: false },
    { id: 'B-002', customer: 'Erik Svensson', service: 'Fönsterputs', date: '2025-01-20', time: '13:00-17:00', address: 'Kungsgatan 10, 11122 Stockholm', status: 'confirmed', phone: '070-234 56 78', notes: '', completed: false },
    { id: 'B-003', customer: 'Lisa Karlsson', service: 'Storstädning', date: '2025-01-21', time: '08:00-12:00', address: 'Drottninggatan 5, 11122 Stockholm', status: 'pending', phone: '070-345 67 89', notes: 'Flyttstädning', completed: false },
    { id: 'B-004', customer: 'Maria Nilsson', service: 'Hemstädning', date: '2025-01-22', time: '09:00-13:00', address: 'Sveavägen 25, 11134 Stockholm', status: 'confirmed', phone: '070-456 78 90', notes: 'Extra damning', completed: false },
    { id: 'B-005', customer: 'Johan Eriksson', service: 'Fönsterputs', date: '2025-01-23', time: '10:00-14:00', address: 'Hornsgatan 45, 11821 Stockholm', status: 'confirmed', phone: '070-567 89 01', notes: '', completed: false },
  ]);
  
  // Messages state
  const [messages, setMessages] = useState([
    { id: 'M-001', sender: 'Anna Andersson', senderRole: 'customer', content: 'Hej! Kan du ta med extra trasor?', timestamp: new Date(Date.now() - 3600000), read: false },
    { id: 'M-002', sender: 'Admin', senderRole: 'admin', content: 'Ny bokning tillagd i ditt schema för imorgon.', timestamp: new Date(Date.now() - 7200000), read: true },
    { id: 'M-003', sender: 'Lisa Karlsson', senderRole: 'customer', content: 'Tack för senast! Supernöjd.', timestamp: new Date(Date.now() - 86400000), read: true },
  ]);
  
  // Product requests state
  const [productRequests, setProductRequests] = useState([
    { id: 'PR-001', customer: 'Anna Andersson', product: 'Fönsterputsmedel', status: 'pending', date: '2025-01-18' },
    { id: 'PR-002', customer: 'Erik Svensson', product: 'Allrengöring', status: 'delivered', date: '2025-01-15' },
    { id: 'PR-003', customer: 'Lisa Karlsson', product: 'Städtrasor', status: 'pending', date: '2025-01-19' },
  ]);
  
  // New product request form
  const [newProductName, setNewProductName] = useState('');
  const [newProductCustomer, setNewProductCustomer] = useState('');
  
  // Earnings state
  const [earnings] = useState([
    { week: 'Vecka 3', hours: 35, amount: 7000 },
    { week: 'Vecka 2', hours: 32, amount: 6400 },
    { week: 'Vecka 1', hours: 28, amount: 5600 },
  ]);

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    
    const newMessage = {
      id: `M-${Date.now()}`,
      sender: `${user?.firstName} ${user?.lastName}`,
      senderRole: 'worker' as const,
      content: messageText,
      timestamp: new Date(),
      read: true,
    };
    
    setMessages(prev => [...prev, newMessage]);
    sendMessage({ userId: 'admin', message: messageText });
    setMessageText('');
  };

  const handleCheckIn = (booking: any) => {
    setSelectedBooking(booking);
    setShowCheckInModal(true);
  };

  const handleCompleteJob = () => {
    if (selectedBooking) {
      setBookings(prev => prev.map(b => 
        b.id === selectedBooking.id ? { ...b, completed: true, status: 'completed' } : b
      ));
    }
    setShowCheckInModal(false);
    setCheckInNotes('');
    setSelectedBooking(null);
  };

  const handleMarkDelivered = (requestId: string) => {
    setProductRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: 'delivered' } : req
    ));
  };

  const handleAddProductRequest = () => {
    if (newProductName.trim() && newProductCustomer.trim()) {
      const newRequest = {
        id: `PR-${Date.now()}`,
        customer: newProductCustomer,
        product: newProductName,
        status: 'pending',
        date: new Date().toISOString().split('T')[0],
      };
      setProductRequests(prev => [newRequest, ...prev]);
      setNewProductName('');
      setNewProductCustomer('');
    }
  };

  const getBookingsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return bookings.filter(b => b.date === dateStr);
  };

  const handleDateClick = (day: number) => {
    const dayBookings = getBookingsForDate(day);
    if (dayBookings.length > 0) {
      setSelectedBooking(dayBookings[0]);
      setShowBookingDetails(true);
    }
  };

  const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);
  const totalHours = earnings.reduce((sum, e) => sum + e.hours, 0);
  const todayBookings = bookings.filter(b => b.date === '2025-01-20');

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
              <span className="font-semibold text-slate-800">Medarbetarportal</span>
            </div>
            
            <div className="flex items-center gap-4">
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
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 mb-8">
            <TabsTrigger value="calendar">Kalender</TabsTrigger>
            <TabsTrigger value="schedule">Dagens schema</TabsTrigger>
            <TabsTrigger value="earnings">Lön</TabsTrigger>
            <TabsTrigger value="messages">Meddelanden</TabsTrigger>
            <TabsTrigger value="products">Produkter</TabsTrigger>
          </TabsList>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="space-y-6">
            {/* Calendar Header */}
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

              {/* Calendar Grid */}
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
                        min-h-[80px] p-2 border rounded-lg
                        ${day ? 'bg-white' : 'bg-slate-50'}
                        ${isToday ? 'border-teal-500 border-2' : 'border-slate-200'}
                        ${hasBookings ? 'cursor-pointer hover:bg-teal-50' : ''}
                      `}
                      onClick={() => day && hasBookings && handleDateClick(day)}
                    >
                      {day && (
                        <>
                          <span className={`text-sm font-medium ${isToday ? 'text-teal-600' : ''}`}>{day}</span>
                          {hasBookings && (
                            <div className="mt-1 space-y-1">
                              {dayBookings.slice(0, 2).map((booking, bidx) => (
                                <div key={bidx} className="text-xs bg-teal-100 text-teal-700 px-1 py-0.5 rounded truncate">
                                  {booking.time.split('-')[0]} {booking.customer.split(' ')[0]}
                                </div>
                              ))}
                              {dayBookings.length > 2 && (
                                <div className="text-xs text-slate-500">+{dayBookings.length - 2} till</div>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Upcoming Bookings Summary */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-semibold text-lg mb-4">Kommande bokningar</h3>
              <div className="space-y-3">
                {bookings.filter(b => !b.completed).slice(0, 5).map(booking => (
                  <div key={booking.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium">{booking.service}</p>
                      <p className="text-sm text-slate-500">{booking.date} • {booking.time}</p>
                      <p className="text-sm text-slate-500">{booking.customer}</p>
                    </div>
                    <Button size="sm" onClick={() => {setSelectedBooking(booking); setShowBookingDetails(true);}}>
                      Visa
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Schedule Tab - Today's Bookings */}
          <TabsContent value="schedule" className="space-y-6">
            {/* Today's Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <p className="text-sm text-slate-500 mb-1">Dagens bokningar</p>
                <p className="text-2xl font-bold">{todayBookings.length}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <p className="text-sm text-slate-500 mb-1">Timmar idag</p>
                <p className="text-2xl font-bold">8</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <p className="text-sm text-slate-500 mb-1">Nästa bokning</p>
                <p className="text-lg font-bold">{todayBookings[0]?.time.split('-')[0] || 'Ingen'}</p>
              </div>
            </div>

            {/* Schedule List */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-lg">Dagens schema</h3>
              </div>
              <div className="divide-y">
                {todayBookings.length === 0 ? (
                  <p className="p-8 text-center text-slate-500">Inga bokningar idag</p>
                ) : (
                  todayBookings.map(booking => (
                    <div key={booking.id} className="p-4 hover:bg-slate-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{booking.service}</p>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {booking.status === 'confirmed' ? 'Bekräftad' : 'Väntar'}
                            </span>
                            {booking.completed && (
                              <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">
                                Genomförd
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium text-slate-700">{booking.customer}</p>
                          <p className="text-sm text-slate-500">{booking.date} • {booking.time}</p>
                          <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                            <MapPin className="w-4 h-4" />
                            {booking.address}
                          </div>
                          {booking.notes && (
                            <p className="text-sm text-amber-600 mt-1">
                              <AlertCircle className="w-4 h-4 inline mr-1" />
                              {booking.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <a href={`tel:${booking.phone}`} className="p-2 bg-green-100 rounded-lg text-green-600 hover:bg-green-200">
                            <Phone className="w-4 h-4" />
                          </a>
                          <button className="p-2 bg-blue-100 rounded-lg text-blue-600 hover:bg-blue-200">
                            <Navigation className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {!booking.completed && (
                        <div className="flex gap-2 mt-3">
                          <Button 
                            size="sm" 
                            className="bg-teal-500 hover:bg-teal-600"
                            onClick={() => handleCheckIn(booking)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Checka in
                          </Button>
                          <Button size="sm" variant="outline">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Meddela kund
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          {/* Earnings Tab */}
          <TabsContent value="earnings">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <p className="text-sm text-slate-500 mb-1">Total lön (3 veckor)</p>
                <p className="text-2xl font-bold text-teal-600">{totalEarnings.toLocaleString()} kr</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <p className="text-sm text-slate-500 mb-1">Totala timmar</p>
                <p className="text-2xl font-bold">{totalHours} h</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <p className="text-sm text-slate-500 mb-1">Timlön</p>
                <p className="text-2xl font-bold">200 kr/h</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-lg">Löneöversikt</h3>
              </div>
              <div className="divide-y">
                {earnings.map((earning, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{earning.week}</p>
                      <p className="text-sm text-slate-500">{earning.hours} timmar</p>
                    </div>
                    <p className="font-bold text-lg">{earning.amount.toLocaleString()} kr</p>
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
                    <div key={msg.id} className={`flex gap-3 ${msg.senderRole === 'worker' ? 'flex-row-reverse' : ''}`}>
                      <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-teal-600" />
                      </div>
                      <div className={`max-w-[70%] p-3 rounded-xl ${
                        msg.senderRole === 'worker' 
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
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-lg">Produktförfrågningar</h3>
              </div>
              <div className="divide-y">
                {productRequests.map(request => (
                  <div key={request.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{request.product}</p>
                      <p className="text-sm text-slate-500">Kund: {request.customer}</p>
                      <p className="text-sm text-slate-500">{request.date}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        request.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {request.status === 'delivered' ? 'Levererad' : 'Väntar'}
                      </span>
                      {request.status === 'pending' && (
                        <Button size="sm" className="bg-teal-500 hover:bg-teal-600" onClick={() => handleMarkDelivered(request.id)}>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Markera levererad
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Product Request */}
            <div className="bg-white rounded-xl shadow-sm p-4 mt-6">
              <h3 className="font-semibold text-lg mb-4">Begär produkt till kund</h3>
              <div className="flex gap-2">
                <Input 
                  placeholder="Produktnamn" 
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                />
                <Input 
                  placeholder="Kundnamn" 
                  value={newProductCustomer}
                  onChange={(e) => setNewProductCustomer(e.target.value)}
                />
                <Button className="bg-teal-500 hover:bg-teal-600" onClick={handleAddProductRequest}>
                  Skicka
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Check-in Modal */}
      {showCheckInModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Checka in</h3>
            <div className="mb-4 p-3 bg-slate-50 rounded-lg">
              <p className="font-medium">{selectedBooking.service}</p>
              <p className="text-sm text-slate-500">{selectedBooking.customer}</p>
              <p className="text-sm text-slate-500">{selectedBooking.address}</p>
            </div>
            <textarea
              placeholder="Anteckningar från städningen..."
              value={checkInNotes}
              onChange={(e) => setCheckInNotes(e.target.value)}
              className="w-full p-3 border rounded-lg mb-4 h-32 resize-none"
            />
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowCheckInModal(false)} className="flex-1">
                Avbryt
              </Button>
              <Button onClick={handleCompleteJob} className="flex-1 bg-teal-500 hover:bg-teal-600">
                <CheckCircle className="w-4 h-4 mr-2" />
                Slutför jobb
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {showBookingDetails && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Bokningsdetaljer</h3>
              <button onClick={() => setShowBookingDetails(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-slate-500">Tjänst</Label>
                <p className="font-medium text-lg">{selectedBooking.service}</p>
              </div>
              <div>
                <Label className="text-slate-500">Kund</Label>
                <p className="font-medium">{selectedBooking.customer}</p>
              </div>
              <div>
                <Label className="text-slate-500">Datum & Tid</Label>
                <p className="font-medium">{selectedBooking.date} • {selectedBooking.time}</p>
              </div>
              <div>
                <Label className="text-slate-500">Adress</Label>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <p>{selectedBooking.address}</p>
                </div>
              </div>
              <div>
                <Label className="text-slate-500">Telefon</Label>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <a href={`tel:${selectedBooking.phone}`} className="text-teal-600 hover:underline">
                    {selectedBooking.phone}
                  </a>
                </div>
              </div>
              {selectedBooking.notes && (
                <div className="p-3 bg-amber-50 rounded-lg">
                  <Label className="text-amber-700">Anteckningar</Label>
                  <p className="text-amber-800">{selectedBooking.notes}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowBookingDetails(false)} className="flex-1">
                Stäng
              </Button>
              {!selectedBooking.completed && (
                <Button 
                  onClick={() => {setShowBookingDetails(false); handleCheckIn(selectedBooking);}} 
                  className="flex-1 bg-teal-500 hover:bg-teal-600"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Checka in
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
