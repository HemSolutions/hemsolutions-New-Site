import { useQuery } from '@tanstack/react-query'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  TrendingUp,
  Users,
  AlertCircle,
  DollarSign,
  FileText,
  Clock,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { formatCurrency, formatDate } from '../lib/utils'
import {
  getDashboardStats,
  getTopCustomers,
  getOutstandingReminders,
  getRecentPayments,
} from '../api'
import type { TopCustomer, Reminder, PaymentWithInvoice } from '../types'

const chartColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function Overview() {
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

  const monthlyData = [
    { name: 'Jan', försäljning: 45000, betalningar: 38000 },
    { name: 'Feb', försäljning: 52000, betalningar: 45000 },
    { name: 'Mar', försäljning: 48000, betalningar: 42000 },
    { name: 'Apr', försäljning: stats?.total_sales_month ? stats.total_sales_month * 0.8 : 35000, betalningar: stats?.total_sales_month || 30000 },
  ]

  const invoiceStatusData = [
    { name: 'Betald', value: stats?.paid_invoice_count || 0, color: '#10b981' },
    { name: 'Ej betald', value: (stats?.invoice_count || 0) - (stats?.paid_invoice_count || 0), color: '#f59e0b' },
    { name: 'Förfallen', value: Math.floor(((stats?.overdue_amount || 0) / 5000)), color: '#ef4444' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Översikt</h1>
        <p className="text-muted-foreground">Välkommen tillbaka! Här är en sammanfattning av din verksamhet.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Försäljning (År)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : formatCurrency(stats?.total_sales_year || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Totalt inbetalt i år</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Försäljning (Mån)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : formatCurrency(stats?.total_sales_month || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Totalt inbetalt denna månad</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utestående</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : formatCurrency(stats?.outstanding_amount || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Ej förfallet</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Förfallet</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {statsLoading ? '...' : formatCurrency(stats?.overdue_amount || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Kräver omedelbar uppmärksamhet</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Försäljning & Inbetalningar</CardTitle>
            <CardDescription>Över tid</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `kr ${value / 1000}k`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="försäljning" fill="#3b82f6" name="Försäljning" />
                <Bar dataKey="betalningar" fill="#10b981" name="Inbetalningar" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fakturastatus</CardTitle>
            <CardDescription>Fördelning av fakturor</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={invoiceStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {invoiceStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-4 mt-4">
              {invoiceStatusData.map((item) => (
                <div key={item.name} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lists Row */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Top Customers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Årets Bästa Kunder</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {customersLoading ? (
              <p>Laddar...</p>
            ) : topCustomers && topCustomers.length > 0 ? (
              <div className="space-y-3">
                {topCustomers.map((customer: TopCustomer, index: number) => (
                  <div key={customer.customer_id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600">
                        {index + 1}
                      </span>
                      <span className="font-medium">{customer.customer_name}</span>
                    </div>
                    <span className="text-sm font-semibold">{formatCurrency(customer.total_amount)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Inga kunder att visa</p>
            )}
          </CardContent>
        </Card>

        {/* Reminders Needed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <span>Att Påminna</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {remindersLoading ? (
              <p>Laddar...</p>
            ) : reminders && reminders.length > 0 ? (
              <div className="space-y-3">
                {reminders.slice(0, 5).map((reminder: Reminder) => (
                  <div key={reminder.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{reminder.customer_name}</p>
                      <p className="text-sm text-muted-foreground">{reminder.invoice_number}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">Nivå {reminder.reminder_level}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(reminder.reminder_date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Inga påminnelser väntande</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <span>Senaste Inbetalningar</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {paymentsLoading ? (
              <p>Laddar...</p>
            ) : recentPayments && recentPayments.length > 0 ? (
              <div className="space-y-3">
                {recentPayments.map((payment: PaymentWithInvoice) => (
                  <div key={payment.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{payment.customer_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {payment.invoice_number || 'Direktbetalning'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600">+{formatCurrency(payment.amount)}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(payment.payment_date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Inga nyliga betalningar</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Invoice Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Fakturasammanfattning</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600">Totalt antal fakturor</p>
              <p className="text-2xl font-bold">{stats?.invoice_count || 0}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600">Betald</p>
              <p className="text-2xl font-bold">{stats?.paid_invoice_count || 0}</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg">
              <p className="text-sm text-amber-600">Ej betald</p>
              <p className="text-2xl font-bold">
                {(stats?.invoice_count || 0) - (stats?.paid_invoice_count || 0)}
              </p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-600">Förfallen</p>
              <p className="text-2xl font-bold">{reminders?.length || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
