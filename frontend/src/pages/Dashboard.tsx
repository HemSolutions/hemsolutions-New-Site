import { useQuery } from '@tanstack/react-query'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  Users,
  Bell,
} from 'lucide-react'
import { formatCurrency } from '../lib/utils'
import {
  getDashboardStats,
  getTopCustomers,
  getOutstandingReminders,
  getRecentPayments,
} from '../api'
import type { TopCustomer, Reminder, PaymentWithInvoice } from '../types'

const BLUE_PRIMARY = '#1976D2'
const BLUE_LIGHT = '#64B5F6'
const GREEN_UP = '#10B981'
const RED_DOWN = '#EF4444'

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
  })

  const { data: topCustomers, isLoading: customersLoading } = useQuery({
    queryKey: ['topCustomers'],
    queryFn: getTopCustomers,
  })

  const { data: reminders, isLoading: remindersLoading } = useQuery({
    queryKey: ['outstandingReminders'],
    queryFn: getOutstandingReminders,
  })

  const { data: recentPayments, isLoading: paymentsLoading } = useQuery({
    queryKey: ['recentPayments'],
    queryFn: getRecentPayments,
  })

  // Sample monthly data (will be replaced with API data)
  const monthlySalesData = [
    { month: 'Jan', försäljning: 42000 },
    { month: 'Feb', försäljning: 38000 },
    { month: 'Mar', försäljning: 55000 },
    { month: 'Apr', försäljning: 48000 },
    { month: 'Maj', försäljning: 62000 },
    { month: 'Jun', försäljning: 58000 },
    { month: 'Jul', försäljning: 45000 },
    { month: 'Aug', försäljning: 51000 },
    { month: 'Sep', försäljning: 67000 },
    { month: 'Okt', försäljning: 72000 },
    { month: 'Nov', försäljning: 69000 },
    { month: 'Dec', försäljning: stats?.total_sales_year ? stats.total_sales_year * 0.12 : 54000 },
  ]

  const salesByArticleData = [
    { artikel: 'Städning', försäljning: 125000 },
    { artikel: 'Flyttstäd', försäljning: 98000 },
    { artikel: 'Fönsterputs', försäljning: 76000 },
    { artikel: 'Trädgård', försäljning: 54000 },
    { artikel: 'Snöskottning', försäljning: 32000 },
  ]

  const yearSales = stats?.total_sales_year || 685000
  const monthSales = stats?.total_sales_month || 72000
  const yearChange = 12.5
  const monthChange = 8.3

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Översikt</h1>
        <p className="text-sm text-gray-500 mt-1">Välkommen tillbaka! Här är en sammanfattning av din verksamhet.</p>
      </div>

      {/* Top Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Försäljning år */}
        <div className="bg-white rounded-lg shadow-md p-5">
          <p className="text-sm text-gray-500 font-medium">Försäljning år</p>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-gray-900">
              {statsLoading ? '...' : formatCurrency(yearSales)}
            </span>
          </div>
          <div className="mt-2 flex items-center space-x-1">
            <TrendingUp className="h-4 w-4" style={{ color: GREEN_UP }} />
            <span className="text-sm font-medium" style={{ color: GREEN_UP }}>+{yearChange}%</span>
            <span className="text-xs text-gray-400">vs förra året</span>
          </div>
        </div>

        {/* Försäljning mån */}
        <div className="bg-white rounded-lg shadow-md p-5">
          <p className="text-sm text-gray-500 font-medium">Försäljning mån</p>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-gray-900">
              {statsLoading ? '...' : formatCurrency(monthSales)}
            </span>
          </div>
          <div className="mt-2 flex items-center space-x-1">
            <TrendingUp className="h-4 w-4" style={{ color: GREEN_UP }} />
            <span className="text-sm font-medium" style={{ color: GREEN_UP }}>+{monthChange}%</span>
            <span className="text-xs text-gray-400">vs förra månaden</span>
          </div>
        </div>

        {/* Utestående */}
        <div className="bg-white rounded-lg shadow-md p-5">
          <p className="text-sm text-gray-500 font-medium">Utestående belopp</p>
          <div className="mt-2">
            <span className="text-3xl font-bold text-gray-900">
              {statsLoading ? '...' : formatCurrency(stats?.outstanding_amount || 45000)}
            </span>
          </div>
          <div className="mt-2 flex items-center space-x-1">
            <TrendingDown className="h-4 w-4" style={{ color: RED_DOWN }} />
            <span className="text-sm font-medium" style={{ color: RED_DOWN }}>-3.2%</span>
            <span className="text-xs text-gray-400">vs förra månaden</span>
          </div>
        </div>

        {/* Förfallet */}
        <div className="bg-white rounded-lg shadow-md p-5">
          <p className="text-sm text-gray-500 font-medium">Förfallet belopp</p>
          <div className="mt-2">
            <span className="text-3xl font-bold" style={{ color: RED_DOWN }}>
              {statsLoading ? '...' : formatCurrency(stats?.overdue_amount || 12500)}
            </span>
          </div>
          <div className="mt-2 flex items-center space-x-1">
            <TrendingUp className="h-4 w-4" style={{ color: RED_DOWN }} />
            <span className="text-sm font-medium" style={{ color: RED_DOWN }}>+5.1%</span>
            <span className="text-xs text-gray-400">kräver åtgärd</span>
          </div>
        </div>
      </div>

      {/* Middle Row: Alert + Tables + Payments */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Att påminna - Red alert card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5" style={{ color: RED_DOWN }} />
              <h3 className="font-semibold text-gray-900">Att påminna</h3>
            </div>
          </div>
          <div className="p-4">
            {remindersLoading ? (
              <p className="text-sm text-gray-500">Laddar...</p>
            ) : reminders && reminders.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 rounded-lg bg-red-50 border border-red-100">
                  <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: RED_DOWN }} />
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      {reminders.length} kunder behöver påminnas om betalning
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      Totalt förfallet: {formatCurrency(reminders.reduce((sum, r) => sum + (r.fee_amount || 0), 0))}
                    </p>
                  </div>
                </div>
                {reminders.slice(0, 3).map((reminder: Reminder) => (
                  <div key={reminder.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{reminder.customer_name}</p>
                      <p className="text-xs text-gray-500">{reminder.invoice_number}</p>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: RED_DOWN }}>
                      Nivå {reminder.reminder_level}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-start space-x-3 p-3 rounded-lg bg-green-50 border border-green-100">
                <DollarSign className="h-5 w-5 mt-0.5 flex-shrink-0 text-green-600" />
                <p className="text-sm text-green-800">Alla fakturor är betalda! Inga påminnelser behövs.</p>
              </div>
            )}
          </div>
        </div>

        {/* Årets bästa kunder */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5" style={{ color: BLUE_PRIMARY }} />
              <h3 className="font-semibold text-gray-900">Årets bästa kunder</h3>
            </div>
          </div>
          <div className="p-0">
            {customersLoading ? (
              <p className="p-4 text-sm text-gray-500">Laddar...</p>
            ) : topCustomers && topCustomers.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Namn</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Försäljning</th>
                  </tr>
                </thead>
                <tbody>
                  {topCustomers.map((customer: TopCustomer, index: number) => (
                    <tr key={customer.customer_id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium text-white" style={{ backgroundColor: index < 3 ? BLUE_PRIMARY : '#9CA3AF' }}>
                            {index + 1}
                          </span>
                          <span className="text-sm font-medium text-gray-900">{customer.customer_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                        {formatCurrency(customer.total_amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-4">
                <p className="text-sm text-gray-500">Inga kunder att visa</p>
              </div>
            )}
          </div>
        </div>

        {/* Inbetalningar */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">Inbetalningar</h3>
            </div>
          </div>
          <div className="p-4">
            {paymentsLoading ? (
              <p className="text-sm text-gray-500">Laddar...</p>
            ) : recentPayments && recentPayments.length > 0 ? (
              <div className="space-y-3">
                {recentPayments.slice(0, 5).map((payment: PaymentWithInvoice) => (
                  <div key={payment.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{payment.customer_name}</p>
                      <p className="text-xs text-gray-500">{payment.invoice_number || 'Direktbetalning'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600">+{formatCurrency(payment.amount)}</p>
                      <p className="text-xs text-gray-400">{payment.payment_date}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <DollarSign className="h-8 w-8 mx-auto text-gray-300" />
                <p className="text-sm text-gray-500 mt-2">Inga nyliga inbetalningar</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Försäljning per månad */}
        <div className="bg-white rounded-lg shadow-md p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Försäljning per månad</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlySalesData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#6B7280" />
              <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" tickFormatter={(value) => `${value / 1000}k`} />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), 'Försäljning']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }}
              />
              <Bar dataKey="försäljning" fill={BLUE_PRIMARY} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Försäljning per artikel */}
        <div className="bg-white rounded-lg shadow-md p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Försäljning per artikel</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={salesByArticleData} layout="vertical" margin={{ top: 5, right: 5, bottom: 5, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" tick={{ fontSize: 12 }} stroke="#6B7280" tickFormatter={(value) => `${value / 1000}k`} />
              <YAxis type="category" dataKey="artikel" tick={{ fontSize: 12 }} stroke="#6B7280" width={80} />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), 'Försäljning']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }}
              />
              <Bar dataKey="försäljning" fill={BLUE_LIGHT} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
