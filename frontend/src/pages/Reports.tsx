import { useState } from 'react'
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
  LineChart,
  Line,
  Legend,
} from 'recharts'
import { Download, FileText, Printer, Calendar, Filter } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Badge } from '../components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'
import { formatCurrency, formatDate } from '../lib/utils'
import { getInvoices, getCustomers, getPayments, getReceipts } from '../api'
import type { Invoice, Receipt } from '../types'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function Reports() {
  const [activeTab, setActiveTab] = useState<'month' | 'customer' | 'article' | 'invoices' | 'receipts' | 'accounting'>('month')
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date()
    d.setMonth(d.getMonth() - 6)
    return d.toISOString().split('T')[0]
  })
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0])

  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: getInvoices,
  })

  const { data: customers, isLoading: customersLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers,
  })

  const { data: payments } = useQuery({
    queryKey: ['payments'],
    queryFn: getPayments,
  })

  const { data: receipts, isLoading: receiptsLoading } = useQuery({
    queryKey: ['receipts'],
    queryFn: getReceipts,
  })

  // Filter data by date range
  const filterByDate = (items: any[], dateField: string) => {
    return items?.filter(item => {
      const itemDate = new Date(item[dateField])
      return itemDate >= new Date(dateFrom) && itemDate <= new Date(dateTo + 'T23:59:59')
    }) || []
  }

  const filteredInvoices = filterByDate(invoices || [], 'issue_date')
  const filteredReceipts = filterByDate(receipts || [], 'issue_date')
  const filteredPayments = filterByDate(payments || [], 'payment_date')

  // Calculate statistics
  const totalSales = filteredInvoices.reduce((sum, inv) => sum + inv.total_amount, 0)
  const totalPaid = filteredInvoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + inv.total_amount, 0)
  const totalOutstanding = filteredInvoices.filter(i => i.status === 'sent').reduce((sum, inv) => sum + inv.total_amount, 0)
  const totalOverdue = filteredInvoices.filter(i => i.status === 'overdue').reduce((sum, inv) => sum + inv.total_amount, 0)

  // Monthly sales data
  const getMonthlySalesData = () => {
    const months: Record<string, { month: string; sales: number; payments: number; invoices: number }> = {}
    
    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const key = d.toISOString().slice(0, 7) // YYYY-MM
      months[key] = { month: key, sales: 0, payments: 0, invoices: 0 }
    }
    
    // Add invoice data
    filteredInvoices.forEach(inv => {
      const key = inv.issue_date.slice(0, 7)
      if (months[key]) {
        months[key].sales += inv.total_amount
        months[key].invoices += 1
      }
    })
    
    // Add payment data
    filteredPayments.forEach(pay => {
      const key = pay.payment_date.slice(0, 7)
      if (months[key]) {
        months[key].payments += pay.amount
      }
    })
    
    return Object.values(months).map(m => ({
      ...m,
      month: new Date(m.month + '-01').toLocaleDateString('sv-SE', { month: 'short', year: '2-digit' })
    }))
  }

  const monthlyData = getMonthlySalesData()

  // Customer sales data
  const customerSalesData = customers?.map(customer => {
    const customerInvoices = filteredInvoices.filter(i => i.customer_id === customer.id)
    return {
      name: customer.name,
      sales: customerInvoices.reduce((sum, inv) => sum + inv.total_amount, 0),
      invoices: customerInvoices.length,
      paid: customerInvoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + inv.total_amount, 0),
      unpaid: customerInvoices.filter(i => i.status !== 'paid').reduce((sum, inv) => sum + inv.total_amount, 0),
    }
  }).sort((a, b) => b.sales - a.sales).slice(0, 15)

  // Sales by article data
  const getArticleSalesData = () => {
    const articleSales: Record<string, { name: string; sales: number; quantity: number }> = {}
    
    filteredInvoices.forEach(inv => {
      const invWithItems = inv as Invoice & { items?: Array<{ article_name?: string; total_price?: number; quantity: number; unit_price: number }> }
      if (invWithItems.items) {
        invWithItems.items.forEach((item: { article_name?: string; total_price?: number; quantity: number; unit_price: number }) => {
          const name = item.article_name || 'Okänd'
          if (!articleSales[name]) {
            articleSales[name] = { name, sales: 0, quantity: 0 }
          }
          articleSales[name].sales += item.total_price || item.quantity * item.unit_price
          articleSales[name].quantity += item.quantity
        })
      }
    })
    
    return Object.values(articleSales).sort((a, b) => b.sales - a.sales).slice(0, 10)
  }

  const articleSalesData = getArticleSalesData()

  // Invoice status distribution
  const statusData = [
    { name: 'Betald', value: filteredInvoices.filter(i => i.status === 'paid').length, color: '#10b981' },
    { name: 'Skickad', value: filteredInvoices.filter(i => i.status === 'sent').length, color: '#3b82f6' },
    { name: 'Utkast', value: filteredInvoices.filter(i => i.status === 'draft').length, color: '#6b7280' },
    { name: 'Förfallen', value: filteredInvoices.filter(i => i.status === 'overdue').length, color: '#ef4444' },
    { name: 'Avbruten', value: filteredInvoices.filter(i => i.status === 'cancelled').length, color: '#9ca3af' },
  ].filter(d => d.value > 0)

  // Payment methods distribution
  const paymentMethodData = [
    { name: 'Swish', value: filteredPayments.filter(p => p.payment_method === 'swish').length },
    { name: 'Kort', value: filteredPayments.filter(p => p.payment_method === 'card').length },
    { name: 'Banköverföring', value: filteredPayments.filter(p => p.payment_method === 'bank_transfer').length },
    { name: 'Kontant', value: filteredPayments.filter(p => p.payment_method === 'cash').length },
  ].filter(d => d.value > 0)

  // Export functions
  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return
    
    const headers = Object.keys(data[0]).join(';')
    const rows = data.map(row => Object.values(row).join(';')).join('\n')
    const csv = headers + '\n' + rows
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()
  }

  const exportToPDF = (title: string, data: any[]) => {
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text(title, 14, 20)
    doc.setFontSize(10)
    doc.text(`Period: ${dateFrom} - ${dateTo}`, 14, 30)
    
    // @ts-ignore
    doc.autoTable({
      startY: 40,
      head: [Object.keys(data[0] || {}).map(h => h.toUpperCase())],
      body: data.map(row => Object.values(row)),
    })
    
    doc.save(`${title.toLowerCase().replace(/\s+/g, '_')}_${dateFrom}.pdf`)
  }

  const printReport = () => {
    window.print()
  }

  const generateSIE4Export = () => {
    // SIE4 format export for accounting
    const year = new Date().getFullYear()
    let sie4 = `#FLAGGA\t0\n`
    sie4 += `#FORMAT\tPC8\n`
    sie4 += `#GEN\tHemSolutions\t${new Date().toISOString().split('T')[0]}\n`
    sie4 += `#SIETYP\t4\n`
    sie4 += `#ORGNR\t5566778899\n`
    sie4 += `#FNAMN\tHemSolutions Sverige AB\n`
    sie4 += `#RAR\t0\t${year - 1}-01-01\t${year}-12-31\n`
    sie4 += `#KPTYP\tEUE\n`
    
    // Add voucher series
    const series = 'F' // Faktura series
    
    filteredInvoices.forEach((inv, idx) => {
      const date = inv.issue_date.replace(/-/g, '')
      sie4 += `#VER\t${series}\t${inv.invoice_number}\t${date}\t"Faktura ${inv.invoice_number}"\n`
      
      // Debit entry (customer account)
      sie4 += `\t#TRANS\t1510\t{}\t${inv.total_amount.toFixed(2)}\t${date}\t"${inv.customer_name}"\n`
      // Credit entry (sales account)
      sie4 += `\t#TRANS\t3010\t{}\t-${inv.total_amount.toFixed(2)}\t${date}\t"Försäljning"\n`
      // VAT entry
      sie4 += `\t#TRANS\t2610\t{}\t-${inv.vat_amount.toFixed(2)}\t${date}\t"Utgående moms"\n`
    })
    
    const blob = new Blob([sie4], { type: 'text/plain' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `sie4_export_${dateFrom}_${dateTo}.si`
    link.click()
  }

  const tabs = [
    { id: 'month', label: 'Försäljning månad', icon: Calendar },
    { id: 'customer', label: 'Försäljning kund', icon: FileText },
    { id: 'article', label: 'Försäljning artikel', icon: FileText },
    { id: 'invoices', label: 'Fakturalista', icon: FileText },
    { id: 'receipts', label: 'Kvittolista', icon: FileText },
    { id: 'accounting', label: 'Bokföring', icon: FileText },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Rapporter</h1>
          <p className="text-muted-foreground">Detaljerade rapporter och analyser</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={printReport}>
            <Printer className="mr-2 h-4 w-4" />
            Skriv ut
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex gap-4 flex-1">
              <div className="space-y-2">
                <Label htmlFor="dateFrom">Från datum</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateTo">Till datum</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => exportToCSV(filteredInvoices, `fakturor_${dateFrom}_${dateTo}.csv`)}>
                <Download className="mr-2 h-4 w-4" />
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportToPDF('Fakturor', filteredInvoices)}>
                <Download className="mr-2 h-4 w-4" />
                PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Försäljning</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSales)}</div>
            <p className="text-xs text-muted-foreground">{filteredInvoices.length} fakturor</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inbetalningar</CardTitle>
            <div className="h-4 w-4 text-green-500">+</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</div>
            <p className="text-xs text-muted-foreground">{filteredPayments.length} betalningar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utestående</CardTitle>
            <div className="h-4 w-4 text-amber-500">!</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{formatCurrency(totalOutstanding)}</div>
            <p className="text-xs text-muted-foreground">Ej förfallet</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Förfallet</CardTitle>
            <div className="h-4 w-4 text-red-500">×</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalOverdue)}</div>
            <p className="text-xs text-muted-foreground">Kräver åtgärd</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex flex-wrap gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="mr-2 h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Försäljning månad */}
        {activeTab === 'month' && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Månadsförsäljning</CardTitle>
                <CardDescription>Försäljning och inbetalningar per månad</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `kr ${value / 1000}k`} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="sales" fill="#3b82f6" name="Försäljning" />
                    <Bar dataKey="payments" fill="#10b981" name="Inbetalningar" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Monthly breakdown table */}
            <Card>
              <CardHeader>
                <CardTitle>Månadsfördelning</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Månad</TableHead>
                      <TableHead>Antal fakturor</TableHead>
                      <TableHead>Försäljning</TableHead>
                      <TableHead>Inbetalningar</TableHead>
                      <TableHead>Balans</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthlyData.map((month) => (
                      <TableRow key={month.month}>
                        <TableCell className="font-medium">{month.month}</TableCell>
                        <TableCell>{month.invoices}</TableCell>
                        <TableCell>{formatCurrency(month.sales)}</TableCell>
                        <TableCell>{formatCurrency(month.payments)}</TableCell>
                        <TableCell className={month.sales - month.payments > 0 ? 'text-amber-600' : 'text-green-600'}>
                          {formatCurrency(month.sales - month.payments)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}

        {/* Försäljning kund */}
        {activeTab === 'customer' && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Försäljning per kund</CardTitle>
                <CardDescription>Toppkunder efter fakturerad summa</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={customerSalesData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(value) => `kr ${value / 1000}k`} />
                    <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="sales" fill="#3b82f6" name="Total försäljning" />
                    <Bar dataKey="paid" fill="#10b981" name="Betalt" />
                    <Bar dataKey="unpaid" fill="#f59e0b" name="Ej betalt" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Kundlista</CardTitle>
                <Button variant="outline" size="sm" onClick={() => exportToCSV(customerSalesData || [], 'kundrapport.csv')}>
                  <Download className="mr-2 h-4 w-4" />
                  Exportera
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kund</TableHead>
                      <TableHead>Antal fakturor</TableHead>
                      <TableHead>Total försäljning</TableHead>
                      <TableHead>Betalt</TableHead>
                      <TableHead>Ej betalt</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerSalesData?.map((customer) => (
                      <TableRow key={customer.name}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.invoices}</TableCell>
                        <TableCell>{formatCurrency(customer.sales)}</TableCell>
                        <TableCell className="text-green-600">{formatCurrency(customer.paid)}</TableCell>
                        <TableCell className="text-amber-600">{formatCurrency(customer.unpaid)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}

        {/* Försäljning artikel */}
        {activeTab === 'article' && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Försäljning per artikel/tjänst</CardTitle>
                <CardDescription>Topp artiklar efter försäljningsvärde</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={articleSalesData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(value) => `kr ${value / 1000}k`} />
                    <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value: number, name: string) => 
                      name === 'sales' ? formatCurrency(value) : value
                    } />
                    <Legend />
                    <Bar dataKey="sales" fill="#3b82f6" name="Försäljning" />
                    <Bar dataKey="quantity" fill="#8b5cf6" name="Antal sålda" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Artikellista</CardTitle>
                <Button variant="outline" size="sm" onClick={() => exportToCSV(articleSalesData || [], 'artikelrapport.csv')}>
                  <Download className="mr-2 h-4 w-4" />
                  Exportera
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Artikel/Tjänst</TableHead>
                      <TableHead>Antal sålda</TableHead>
                      <TableHead>Total försäljning</TableHead>
                      <TableHead>Genomsnittligt pris</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {articleSalesData?.map((article) => (
                      <TableRow key={article.name}>
                        <TableCell className="font-medium">{article.name}</TableCell>
                        <TableCell>{article.quantity}</TableCell>
                        <TableCell>{formatCurrency(article.sales)}</TableCell>
                        <TableCell>{formatCurrency(article.sales / article.quantity)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}

        {/* Fakturalista */}
        {activeTab === 'invoices' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Komplett fakturalista</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => exportToCSV(filteredInvoices, `fakturor_${dateFrom}_${dateTo}.csv`)}>
                  <Download className="mr-2 h-4 w-4" />
                  CSV
                </Button>
                <Button variant="outline" size="sm" onClick={() => exportToPDF('Fakturor', filteredInvoices)}>
                  PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-auto max-h-[600px]">
                <Table>
                  <TableHeader className="sticky top-0 bg-white">
                    <TableRow>
                      <TableHead>Fakturanr</TableHead>
                      <TableHead>Kund</TableHead>
                      <TableHead>Utställningsdatum</TableHead>
                      <TableHead>Förfallodatum</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Belopp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices?.map((invoice: Invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                        <TableCell>{invoice.customer_name}</TableCell>
                        <TableCell>{formatDate(invoice.issue_date)}</TableCell>
                        <TableCell>{formatDate(invoice.due_date)}</TableCell>
                        <TableCell>
                          <Badge className={
                            invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                            invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                            invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                            invoice.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                            'bg-amber-100 text-amber-800'
                          }>
                            {invoice.status === 'paid' ? 'Betald' :
                             invoice.status === 'sent' ? 'Skickad' :
                             invoice.status === 'overdue' ? 'Förfallen' :
                             invoice.status === 'cancelled' ? 'Avbruten' : 'Utkast'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(invoice.total_amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Kvittolista */}
        {activeTab === 'receipts' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Komplett kvittolista</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => exportToCSV(filteredReceipts, `kvitton_${dateFrom}_${dateTo}.csv`)}>
                  <Download className="mr-2 h-4 w-4" />
                  CSV
                </Button>
                <Button variant="outline" size="sm" onClick={() => exportToPDF('Kvitton', filteredReceipts)}>
                  PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-auto max-h-[600px]">
                <Table>
                  <TableHeader className="sticky top-0 bg-white">
                    <TableRow>
                      <TableHead>Kvittonr</TableHead>
                      <TableHead>Kund</TableHead>
                      <TableHead>Datum</TableHead>
                      <TableHead>Betalningsmetod</TableHead>
                      <TableHead className="text-right">Belopp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReceipts?.map((receipt: Receipt) => (
                      <TableRow key={receipt.id}>
                        <TableCell className="font-medium">{receipt.receipt_number}</TableCell>
                        <TableCell>{receipt.customer_name}</TableCell>
                        <TableCell>{formatDate(receipt.issue_date)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {receipt.payment_method === 'swish' ? 'Swish' :
                             receipt.payment_method === 'card' ? 'Kort' :
                             receipt.payment_method === 'bank_transfer' ? 'Banköverföring' : 'Kontant'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(receipt.total_amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bokföring - SIE4 Export */}
        {activeTab === 'accounting' && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Bokföring - SIE4 Export</CardTitle>
                <CardDescription>Exportera bokföringsdata i SIE4-format för import till bokföringsprogram</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-600">Totalt antal verifikationer</p>
                    <p className="text-2xl font-bold">{filteredInvoices.length}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-600">Total omsättning</p>
                    <p className="text-2xl font-bold">{formatCurrency(totalSales)}</p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <p className="text-sm text-amber-600">Total moms</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(filteredInvoices.reduce((sum, inv) => sum + (inv.vat_amount || 0), 0))}
                    </p>
                  </div>
                </div>

                <div className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="font-medium mb-2">SIE4 Format Information</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• SIE4 är standardformat för överföring av bokföringsdata</li>
                    <li>• Kan importeras till de flesta bokföringsprogram (Fortnox, Visma, etc.)</li>
                    <li>• Inkluderar alla verifikationer (fakturor) med transaktioner</li>
                    <li>• Konteras enligt BAS-kontoplan (1510 Kundfordringar, 3010 Försäljning, 2610 Utgående moms)</li>
                  </ul>
                </div>

                <div className="flex gap-2">
                  <Button onClick={generateSIE4Export}>
                    <Download className="mr-2 h-4 w-4" />
                    Ladda ner SIE4-fil
                  </Button>
                  <Button variant="outline" onClick={() => exportToCSV(
                    filteredInvoices.map(inv => ({
                      verifikationsnummer: inv.invoice_number,
                      datum: inv.issue_date,
                      kund: inv.customer_name,
                      belopp: inv.total_amount,
                      moms: inv.vat_amount || 0,
                      status: inv.status
                    })),
                    'bokforing_export.csv'
                  )}>
                    Exportera CSV
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bokföringsunderlag</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Verifikationsnr</TableHead>
                      <TableHead>Datum</TableHead>
                      <TableHead>Kund</TableHead>
                      <TableHead>Konto</TableHead>
                      <TableHead>Debet</TableHead>
                      <TableHead>Kredit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.slice(0, 20).map((invoice: Invoice) => (
                      <>
                        <TableRow key={`${invoice.id}-deb`}>
                          <TableCell>{invoice.invoice_number}</TableCell>
                          <TableCell>{invoice.issue_date}</TableCell>
                          <TableCell>{invoice.customer_name}</TableCell>
                          <TableCell>1510 - Kundfordringar</TableCell>
                          <TableCell>{formatCurrency(invoice.total_amount)}</TableCell>
                          <TableCell>-</TableCell>
                        </TableRow>
                        <TableRow key={`${invoice.id}-cred`} className="bg-gray-50/50">
                          <TableCell></TableCell>
                          <TableCell></TableCell>
                          <TableCell></TableCell>
                          <TableCell>3010 - Försäljning</TableCell>
                          <TableCell>-</TableCell>
                          <TableCell className="text-red-600">-{formatCurrency(invoice.total_amount - (invoice.vat_amount || 0))}</TableCell>
                        </TableRow>
                        <TableRow key={`${invoice.id}-vat`} className="bg-gray-50/50">
                          <TableCell></TableCell>
                          <TableCell></TableCell>
                          <TableCell></TableCell>
                          <TableCell>2610 - Utgående moms</TableCell>
                          <TableCell>-</TableCell>
                          <TableCell className="text-red-600">-{formatCurrency(invoice.vat_amount || 0)}</TableCell>
                        </TableRow>
                      </>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
