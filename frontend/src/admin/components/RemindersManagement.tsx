import { useState, useEffect } from 'react';
import { Bell, Loader2, Search, Plus, Send, Mail, MessageSquare, Calendar, Clock, User, AlertCircle, CheckCircle, Phone } from 'lucide-react';

interface Reminder {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  invoice_number: string;
  amount: number;
  due_date: string;
  days_overdue: number;
  reminder_type: 'email' | 'sms' | 'phone';
  status: 'pending' | 'sent' | 'completed';
  message: string;
  sent_at: string;
  created_at: string;
}

interface RemindersManagementProps {
  apiBaseUrl: string;
}

export default function RemindersManagement({ apiBaseUrl }: RemindersManagementProps) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchReminders();
  }, [apiBaseUrl]);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiBaseUrl}/api/reminders`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Kunde inte hämta påminnelser');
      }
      
      const data = await response.json();
      setReminders(data.reminders || data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ett fel uppstod');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminder = async (reminderId: string) => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/reminders/${reminderId}/send`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Kunde inte skicka påminnelse');
      }
      
      fetchReminders();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ett fel uppstod');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'sms':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <Phone className="w-4 h-4" />;
    }
  };

  const getTypeText = (type: string) => {
    const typeMap: Record<string, string> = {
      email: 'E-post',
      sms: 'SMS',
      phone: 'Telefon'
    };
    return typeMap[type] || type;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'sent':
        return <Send className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-orange-600" />;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: 'Väntar',
      sent: 'Skickad',
      completed: 'Avslutad'
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status: string) => {
    const classMap: Record<string, string> = {
      pending: 'bg-orange-100 text-orange-700',
      sent: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700'
    };
    return classMap[status] || 'bg-gray-100 text-gray-700';
  };

  const getOverdueClass = (days: number) => {
    if (days >= 30) return 'text-red-600 font-bold';
    if (days >= 14) return 'text-orange-600';
    return 'text-yellow-600';
  };

  const filteredReminders = reminders.filter(reminder => {
    const matchesSearch = 
      reminder.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reminder.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reminder.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || reminder.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Laddar påminnelser...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">Fel: {error}</p>
        <button 
          onClick={fetchReminders}
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
          <Bell className="w-6 h-6" />
          Påminnelser
        </h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          Ny Påminnelse
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Sök påminnelser..."
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
          <option value="sent">Skickad</option>
          <option value="completed">Avslutad</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Kund</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Faktura</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Belopp</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Försenad</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Typ</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Åtgärder</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredReminders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  Inga påminnelser hittades
                </td>
              </tr>
            ) : (
              filteredReminders.map((reminder) => (
                <tr key={reminder.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">{reminder.customer_name}</div>
                        <div className="text-sm text-gray-500">{reminder.customer_email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{reminder.invoice_number}</div>
                    <div className="text-sm text-gray-500">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      Förfaller: {new Date(reminder.due_date).toLocaleDateString('sv-SE')}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {reminder.amount?.toLocaleString('sv-SE')} kr
                  </td>
                  <td className="px-4 py-3">
                    <span className={`flex items-center gap-1 ${getOverdueClass(reminder.days_overdue)}`}>
                      <AlertCircle className="w-4 h-4" />
                      {reminder.days_overdue} dagar
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs">
                      {getTypeIcon(reminder.reminder_type)}
                      {getTypeText(reminder.reminder_type)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(reminder.status)}`}>
                      {getStatusIcon(reminder.status)}
                      {getStatusText(reminder.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {reminder.status === 'pending' && (
                      <button 
                        onClick={() => handleSendReminder(reminder.id)}
                        className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        <Send className="w-3 h-3" />
                        Skicka
                      </button>
                    )}
                    {reminder.status === 'sent' && reminder.sent_at && (
                      <span className="text-sm text-gray-500">
                        Skickad: {new Date(reminder.sent_at).toLocaleDateString('sv-SE')}
                      </span>
                    )}
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
