import { useState, useEffect } from 'react';
import { Calendar, Loader2, Search, Plus, Clock, MapPin, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Booking {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  service_name: string;
  worker_name: string;
  booking_date: string;
  booking_time: string;
  duration: number;
  address: string;
  city: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  price: number;
  notes: string;
  created_at: string;
}

interface BookingsManagementProps {
  apiBaseUrl: string;
}

export default function BookingsManagement({ apiBaseUrl }: BookingsManagementProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchBookings();
  }, [apiBaseUrl]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiBaseUrl}/api/bookings`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Kunde inte hämta bokningar');
      }
      
      const data = await response.json();
      setBookings(data.bookings || data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ett fel uppstod');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: 'Väntar',
      confirmed: 'Bekräftad',
      in_progress: 'Pågår',
      completed: 'Avslutad',
      cancelled: 'Avbruten'
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status: string) => {
    const classMap: Record<string, string> = {
      pending: 'bg-orange-100 text-orange-700',
      confirmed: 'bg-blue-100 text-blue-700',
      in_progress: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return classMap[status] || 'bg-gray-100 text-gray-700';
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer_phone?.includes(searchTerm) ||
      booking.service_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.worker_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Laddar bokningar...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">Fel: {error}</p>
        <button 
          onClick={fetchBookings}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Försök igen
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="w-6 h-6" />
          Bokningar
        </h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          Ny Bokning
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Sök bokningar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Alla statusar</option>
          <option value="pending">Väntar</option>
          <option value="confirmed">Bekräftad</option>
          <option value="in_progress">Pågår</option>
          <option value="completed">Avslutad</option>
          <option value="cancelled">Avbruten</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Kund</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tjänst</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Datum & Tid</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Anställd</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Pris</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  Inga bokningar hittades
                </td>
              </tr>
            ) : (
              filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{booking.customer_name}</div>
                        <div className="text-sm text-gray-500">{booking.customer_phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{booking.service_name}</div>
                    {booking.notes && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">{booking.notes}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-gray-900">
                          {new Date(booking.booking_date).toLocaleDateString('sv-SE')}
                        </div>
                        <div className="text-gray-500">
                          {booking.booking_time} ({booking.duration} min)
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {booking.worker_name || 'Ej tilldelad'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      {getStatusText(booking.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {booking.price?.toLocaleString('sv-SE')} kr
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
