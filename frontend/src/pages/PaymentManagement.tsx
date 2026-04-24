import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Trash2, CreditCard, Banknote, ArrowLeftRight, Wallet, RotateCcw, Download, FileText } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog'
import { Label } from '../components/ui/label'
import { formatCurrency, formatDate } from '../lib/utils'
import { getPayments, getCustomers, getInvoices, createPayment, deletePayment } from '../api'
import type { Customer, Invoice, Payment } from '../types'

const paymentMethodIcons: Record<string, React.ReactNode> = {
  swish: <ArrowLeftRight className="h-4 w-4" />,
  card: <CreditCard className="h-4 w-4" />,
  bank_transfer: <Banknote className="h-4 w-4" />,
  cash: <Wallet className="h-4 w-4" />,
}

const paymentMethodLabels: Record<string, string> = {
  swish: 'Swish',
  card: 'Kort',
  bank_transfer: 'Banköverföring',
  cash: 'Kontant',
}

export default function PaymentManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isReverseOpen, setIsReverseOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)

  const queryClient = useQueryClient()

  const { data: payments, isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: getPayments,
  })

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers,
  })

  const { data: invoices } = useQuery({
    queryKey: ['invoices'],
    queryFn: getInvoices,
  })

  const createMutation = useMutation({
    mutationFn: createPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      setIsCreateOpen(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deletePayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      setIsReverseOpen(false)
      setSelectedPayment(null)
    },
  })

  const filteredPayments = payments?.filter(
    (payment) =>
      payment.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment.invoice_number?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      payment.reference.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calculate totals
  const totalPayments = payments?.reduce((sum, p) => sum + p.amount, 0) || 0
  const todayPayments = payments?.filter(p => p.payment_date === new Date().toISOString().split('T')[0]).reduce((sum, p) => sum + p.amount, 0) || 0
  const monthPayments = payments?.filter(p => {
    const payDate = new Date(p.payment_date)
    const now = new Date()
    return payDate.getMonth() === now.getMonth() && payDate.getFullYear() === now.getFullYear()
  }).reduce((sum, p) => sum + p.amount, 0) || 0

  const handleReversePayment = (payment: Payment) => {
    setSelectedPayment(payment)
    setIsReverseOpen(true)
  }

  const confirmReversePayment = () => {
    if (selectedPayment) {
      deleteMutation.mutate(selectedPayment.id)
    }
  }

  const exportPayments = () => {
    const data = filteredPayments?.map(p => ({
      Datum: p.payment_date,
      Kund: p.customer_name,
      Faktura: p.invoice_number || 'Direktbetalning',
      Belopp: p.amount,
      Metod: paymentMethodLabels[p.payment_method],
      Referens: p.reference,
    })) || []
    
    const csv = [
      Object.keys(data[0] || {}).join(';'),
      ...data.map(row => Object.values(row).join(';'))
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `betalningar_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Laddar betalningar...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Betalningshantering</h1>
          <p className="text-muted-foreground">Registrera och hantera inbetalningar</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Registrera Betalning
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Registrera ny betalning</DialogTitle>
              <DialogDescription>
                Fyll i uppgifterna nedan för att registrera en ny betalning.
              </DialogDescription>
            </DialogHeader>
            <PaymentForm
              customers={customers || []}
              invoices={invoices || []}
              onSubmit={(data) => createMutation.mutate(data)}
              onCancel={() => setIsCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totala inbetalningar</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPayments)}</div>
            <p className="text-xs text-muted-foreground">{payments?.length || 0} registrerade</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dagens inbetalningar</CardTitle>
            <Wallet className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(todayPayments)}</div>
            <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString('sv-SE')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Månadens inbetalningar</CardTitle>
            <ArrowLeftRight className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(monthPayments)}</div>
            <p className="text-xs text-muted-foreground">Denna månad</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Antal betalningar</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payments?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Totalt registrerade</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Sök betalning, kund eller faktura..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportPayments}>
                <Download className="mr-2 h-4 w-4" />
                Exportera
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Betalningshistorik</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Datum</TableHead>
                  <TableHead>Kund</TableHead>
                  <TableHead>Faktura</TableHead>
                  <TableHead>Betalningsmetod</TableHead>
                  <TableHead>Referens</TableHead>
                  <TableHead className="text-right">Belopp</TableHead>
                  <TableHead className="text-right">Åtgärder</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments?.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{formatDate(payment.payment_date)}</TableCell>
                    <TableCell className="font-medium">{payment.customer_name}</TableCell>
                    <TableCell>{payment.invoice_number || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {paymentMethodIcons[payment.payment_method]}
                        <Badge variant="outline">
                          {paymentMethodLabels[payment.payment_method] || payment.payment_method}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{payment.reference || '-'}</TableCell>
                    <TableCell className="font-medium text-green-600 text-right">
                      +{formatCurrency(payment.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReversePayment(payment)}
                        className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Ångra
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredPayments?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Inga betalningar hittades
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Reverse Payment Dialog */}
      <Dialog open={isReverseOpen} onOpenChange={setIsReverseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ångra betalning</DialogTitle>
            <DialogDescription>
              Är du säker på att du vill ångra denna betalning? Detta kommer att ta bort betalningen och återställa fakturans status.
            </DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-2 py-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kund:</span>
                <span className="font-medium">{selectedPayment.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Belopp:</span>
                <span className="font-medium text-green-600">+{formatCurrency(selectedPayment.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Datum:</span>
                <span className="font-medium">{formatDate(selectedPayment.payment_date)}</span>
              </div>
              {selectedPayment.invoice_number && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Faktura:</span>
                  <span className="font-medium">{selectedPayment.invoice_number}</span>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsReverseOpen(false)}>
              Avbryt
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmReversePayment}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Ångrar...' : 'Bekräfta ångring'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface PaymentFormProps {
  customers: Customer[]
  invoices: Invoice[]
  onSubmit: (data: {
    invoice_id?: number
    customer_id: number
    amount: number
    payment_date: string
    payment_method: 'bank_transfer' | 'card' | 'swish' | 'cash'
    reference: string
  }) => void
  onCancel: () => void
}

function PaymentForm({ customers, invoices, onSubmit, onCancel }: PaymentFormProps) {
  const [formData, setFormData] = useState({
    invoice_id: '',
    customer_id: '',
    amount: 0,
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'swish' as 'bank_transfer' | 'card' | 'swish' | 'cash',
    reference: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      invoice_id: formData.invoice_id ? Number(formData.invoice_id) : undefined,
      customer_id: Number(formData.customer_id),
      amount: formData.amount,
      payment_date: formData.payment_date,
      payment_method: formData.payment_method,
      reference: formData.reference,
    })
  }

  const handleChange = (field: string, value: string | number) => {
    setFormData({ ...formData, [field]: value })
  }

  // When invoice is selected, auto-fill customer and amount
  const handleInvoiceChange = (invoiceId: string) => {
    const invoice = invoices.find((i) => i.id === Number(invoiceId))
    if (invoice) {
      setFormData({
        ...formData,
        invoice_id: invoiceId,
        customer_id: String(invoice.customer_id),
        amount: invoice.total_amount,
      })
    } else {
      setFormData({ ...formData, invoice_id: invoiceId })
    }
  }

  const paymentMethods = [
    { value: 'swish' as const, label: 'Swish' },
    { value: 'card' as const, label: 'Kort' },
    { value: 'bank_transfer' as const, label: 'Banköverföring' },
    { value: 'cash' as const, label: 'Kontant' },
  ]

  // Get unpaid invoices for the selected customer
  const unpaidInvoices = invoices.filter(i => 
    (i.status === 'sent' || i.status === 'overdue') &&
    (!formData.customer_id || i.customer_id === Number(formData.customer_id))
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="customer">Kund *</Label>
        <select
          id="customer"
          value={formData.customer_id}
          onChange={(e) => handleChange('customer_id', e.target.value)}
          className="w-full h-10 rounded-md border border-input bg-background px-3"
          required
        >
          <option value="">Välj kund...</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="invoice">Faktura (valfritt)</Label>
        <select
          id="invoice"
          value={formData.invoice_id}
          onChange={(e) => handleInvoiceChange(e.target.value)}
          className="w-full h-10 rounded-md border border-input bg-background px-3"
        >
          <option value="">Direktbetalning (ingen faktura)</option>
          {unpaidInvoices.map((invoice) => (
            <option key={invoice.id} value={invoice.id}>
              {invoice.invoice_number} - {formatCurrency(invoice.total_amount)} - Förfaller: {invoice.due_date}
            </option>
          ))}
        </select>
        {unpaidInvoices.length === 0 && formData.customer_id && (
          <p className="text-xs text-muted-foreground">Inga obetalda fakturor för denna kund</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Belopp *</Label>
          <Input
            id="amount"
            type="number"
            min="0.01"
            step="0.01"
            value={formData.amount}
            onChange={(e) => handleChange('amount', Number(e.target.value))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="payment_date">Betalningsdatum *</Label>
          <Input
            id="payment_date"
            type="date"
            value={formData.payment_date}
            onChange={(e) => handleChange('payment_date', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="payment_method">Betalningsmetod *</Label>
          <select
            id="payment_method"
            value={formData.payment_method}
            onChange={(e) => handleChange('payment_method', e.target.value)}
            className="w-full h-10 rounded-md border border-input bg-background px-3"
            required
          >
            {paymentMethods.map((method) => (
              <option key={method.value} value={method.value}>
                {method.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="reference">Referens/OCR</Label>
          <Input
            id="reference"
            value={formData.reference}
            onChange={(e) => handleChange('reference', e.target.value)}
            placeholder="T.ex. OCR-nummer"
          />
        </div>
      </div>

      <DialogFooter className="pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Avbryt
        </Button>
        <Button type="submit" disabled={!formData.customer_id || formData.amount <= 0}>
          Registrera betalning
        </Button>
      </DialogFooter>
    </form>
  )
}
