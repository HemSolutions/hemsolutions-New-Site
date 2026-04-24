import { useState, useEffect } from 'react';
import { BarChart3, Loader2, Download, Calendar, TrendingUp, Users, FileText, DollarSign } from 'lucide-react';

interface ReportStats {
  total_invoices: number;
  total_revenue: number;
  total_customers: number;
  total_bookings: number;
  paid_invoices: number;
  pending_invoices: number;
  overdue_invoices: number;
  monthly_revenue: { month: string; amount: number }[];
}

interface ReportsManagementProps {
  apiBaseUrl: string;
}

export default function ReportsManagement({ apiBaseUrl }: ReportsManagementProps) {
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('this_month');

  useEffect(() => {
    fetchReports();
  }, [apiBaseUrl, dateRange]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiBaseUrl}/api/reports?range=${dateRange}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Kunde inte hämta rapporter');
      }
      
      const data = await response.json();
      setStats(data.stats || data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ett fel uppstod');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format: 'pdf' | 'csv') => {
    window.open(`${apiBaseUrl}/api/reports/export?format=${format}&range=${dateRange}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Laddar rapporter...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">Fel: {error}</p>
        <button 
          onClick={fetchReports}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Försök igen
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          Rapporter
        </h2>
        <div className="flex items-center gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="this_month">Denna månad</option>
            <option value="last_month">Förra månaden</option>
            <option value="this_quarter">Detta kvartal</option>
            <option value="this_year">Detta år</option>
            <option value="all_time">All tid</option>
          </select>
          <button 
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <Download className="w-4 h-4" />
            PDF
          </button>
          <button 
            onClick={() => handleExport('csv')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
        </div>
      </div>

      {/* Statistik-kort */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Omsättning</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.total_revenue?.toLocaleString('sv-SE')} kr
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Antal Fakturor</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.total_invoices || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Kunder</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.total_customers || 0}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Bokningar</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.total_bookings || 0}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Fakturastatus */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-green-700">Betalda Fakturor</p>
              <p className="text-2xl font-bold text-green-900">{stats?.paid_invoices || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-sm text-yellow-700">Väntande Fakturor</p>
              <p className="text-2xl font-bold text-yellow-900">{stats?.pending_invoices || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-sm text-red-700">Försenade Fakturor</p>
              <p className="text-2xl font-bold text-red-900">{stats?.overdue_invoices || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Månadsvis omsättning */}
      {stats?.monthly_revenue && stats.monthly_revenue.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Månadsvis Omsättning</h3>
          <div className="space-y-3">
            {stats.monthly_revenue.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-700">{item.month}</span>
                <div className="flex items-center gap-4">
                  <div className="w-48 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ 
                        width: `${Math.min((item.amount / (stats.total_revenue || 1)) * 100, 100)}%` 
                      }}
                    />
                  </div>
                  <span className="text-gray-900 font-medium w-24 text-right">
                    {item.amount.toLocaleString('sv-SE')} kr
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
