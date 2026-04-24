import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, Send, CheckCircle, AlertTriangle, Search, Plus, Download, Mail, MessageSquare, Calculator } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
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
} from '../components/ui/dialog'
import { Label } from '../components/ui/label'
import { formatCurrency, formatDate } from '../lib/utils'
import { getReminders, getInvoices, createReminder, updateReminder } from '../api'
import type { Reminder, Invoice } from '../types'

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  sent: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
}

const statusLabels: Record<string, string> = {
  pending: 'Väntande',
  sent: 'Skickad',
  resolved: 'Åtgärdad',
}

// Late fee structure (Swedish standard)
const LATE_FEES = {
  1: { fee: 60, interest: 0 },      // First reminder
  2: { fee: 180, interest: 0.16 },     // Second reminder (16% annual interest)
  3: { fee: 180, interest: 0.16, inkasso: true }, // Collection notice
}

export default function ReminderManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [reminderType, setReminderType] = useState<1 | 2 | 3>(1)
  const [reminderMethod, setReminderMethod] = useState<'email' | 'sms' | 'both'>('email')
  const [customMessage, setCustomMessage] = useState('')

  const queryClient = useQueryClient()

  const { data: reminders, isLoading } = useQuery({
    queryKey: ['reminders'],
    queryFn: getReminders,
  })

  const { data: invoices } = useQuery({
    queryKey: ['invoices'],
    queryFn: getInvoices,
  })

  const createMutation = useMutation({
    mutationFn: createReminder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] })
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      setIsCreateOpen(false)
      resetForm()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => updateReminder(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] })
    },
  })

  const filteredReminders = reminders?.filter(
    (reminder) =>
      reminder.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reminder.invoice_number.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Get overdue invoices (förfallna fakturor)
  const now = new Date()
  const overdueInvoices = invoices?.filter(
    (invoice) =>
      (invoice.status === 'overdue' || 
       (invoice.status === 'sent' && new Date(invoice.due_date) < now))
  ) || []

  // Calculate days overdue
  const getDaysOverdue = (dueDate: string) => {
    const due = new Date(dueDate)
    const diff = now.getTime() - due.getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24))
  }

  // Calculate reminder fees and interest
  const calculateReminderCosts = (invoice: Invoice, level: number) => {
    const daysOverdue = getDaysOverdue(invoice.due_date)
    const fee = LATE_FEES[level as keyof typeof LATE_FEES]?.fee || 0
    const interestRate = LATE_FEES[level as keyof typeof LATE_FEES]?.interest || 0
    
    // Calculate interest: amount * rate * (days / 365)
    const interest = invoice.total_amount * interestRate * (daysOverdue / 365)
    const total = invoice.total_amount + fee + interest
    
    return {
      originalAmount: invoice.total_amount,
      fee,
      interest: Math.round(interest),
      total: Math.round(total),
      daysOverdue,
    }
  }

  const resetForm = () => {
    setSelectedInvoice(null)
    setReminderType(1)
    setReminderMethod('email')
    setCustomMessage('')
  }

  const handleCreateReminder = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setReminderType(1)
    setIsCreateOpen(true)
  }

  const handleSendReminder = () => {
    if (selectedInvoice) {
      createMutation.mutate({
        invoice_id: selectedInvoice.id,
        type: reminderMethod,
        message: customMessage,
      })
    }
  }

  const exportReminders = () => {
    const data = filteredReminders?.map(r => ({
      Datum: r.reminder_date,
      Faktura: r.invoice_number,
      Kund: r.customer_name,
      Nivå: r.reminder_level,
      Avgift: r.fee_amount,
      Status: statusLabels[r.status],
    })) || []
    
    const csv = [
      Object.keys(data[0] || {}).join(';'),
      ...data.map(row => Object.values(row).join(';'))
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `påminnelser_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  // Calculate totals
  const pendingCount = reminders?.filter(r => r.status === 'pending').length || 0
  const sentCount = reminders?.filter(r => r.status === 'sent').length || 0
  const totalFees = reminders?.reduce((sum, r) => sum + (r.fee_amount || 0), 0) || 0

  const costs = selectedInvoice ? calculateReminderCosts(selectedInvoice, reminderType) : null

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Laddar påminnelser...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Påminnelsehantering</h1>
          <p className="text-muted-foreground">Hantera betalningspåminnelser för förfallna fakturor</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportReminders}>
            <Download className="mr-2 h-4 w-4" />
            Exportera
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Väntande påminnelser</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Att skicka</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Skickade påminnelser</CardTitle>
            <Send className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{sentCount}</div>
            <p className="text-xs text-muted-foreground">Totalt skickade</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Påminnelseavgifter</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalFees)}</div>
            <p className="text-xs text-muted-foreground">Totala avgifter</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Förfallna fakturor</CardTitle>
            <Bell className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueInvoices.length}</div>
            <p className="text-xs text-muted-foreground">Kräver åtgärd</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Sök påminnelse, kund eller faktura..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Overdue Invoices Section */}
      <Card className="border-red-200">
        <CardHeader className="bg-red-50">
          <CardTitle className="flex items-center space-x-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <span>Förfallna Fakturor - Skapa Påminnelse</span>
          </CardTitle>
          <CardDescription className="text-red-600">
            {overdueInvoices.length} fakturor har passerat förfallodatumet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Faktura</TableHead>
                  <TableHead>Kund</TableHead>
                  <TableHead>Förfallodatum</TableHead>
                  <TableHead>Dagar försenad</TableHead>
                  <TableHead>Belopp</TableHead>
                  <TableHead className="text-right">Åtgärder</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overdueInvoices.map((invoice) => {
                  const daysOverdue = getDaysOverdue(invoice.due_date)
                  return (
                    <TableRow key={invoice.id} className={daysOverdue > 30 ? 'bg-red-50/50' : ''}>
                      <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                      <TableCell>{invoice.customer_name}</TableCell>
                      <TableCell className="text-red-600">{formatDate(invoice.due_date)}</TableCell>
                      <TableCell>
                        <Badge variant={daysOverdue > 30 ? 'destructive' : 'secondary'}>
                          {daysOverdue} dagar
                        </Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(invoice.total_amount)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => handleCreateReminder(invoice)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Skapa påminnelse
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {overdueInvoices.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Inga förfallna fakturor
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pending Reminders */}
      <Card>
        <CardHeader className="bg-amber-50">
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-amber-500" />
            <span>Väntande Påminnelser</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Faktura</TableHead>
                  <TableHead>Kund</TableHead>
                  <TableHead>Nivå</TableHead>
                  <TableHead>Påminnelsedatum</TableHead>
                  <TableHead>Avgift</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Åtgärder</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReminders?.filter(r => r.status === 'pending').map((reminder) => (
                  <TableRow key={reminder.id}>
                    <TableCell className="font-medium">{reminder.invoice_number}</TableCell>
                    <TableCell>{reminder.customer_name}</TableCell>
                    <TableCell>
                      <Badge variant={reminder.reminder_level === 1 ? 'default' : reminder.reminder_level === 2 ? 'secondary' : 'destructive'}>
                        Nivå {reminder.reminder_level}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(reminder.reminder_date)}</TableCell>
                    <TableCell>{formatCurrency(reminder.fee_amount)}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[reminder.status]}>
                        {statusLabels[reminder.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateMutation.mutate({ id: reminder.id, status: 'sent' })}
                        className="text-blue-600"
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Skicka
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateMutation.mutate({ id: reminder.id, status: 'resolved' })}
                        className="text-green-600"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Åtgärdad
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredReminders?.filter(r => r.status === 'pending').length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Inga väntande påminnelser
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* All Reminders History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Påminnelsehistorik</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Faktura</TableHead>
                  <TableHead>Kund</TableHead>
                  <TableHead>Nivå</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead>Avgift</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReminders?.map((reminder) => (
                  <TableRow key={reminder.id}>
                    <TableCell className="font-medium">{reminder.invoice_number}</TableCell>
                    <TableCell>{reminder.customer_name}</TableCell>
                    <TableCell>
                      <Badge variant={reminder.reminder_level === 1 ? 'default' : reminder.reminder_level === 2 ? 'secondary' : 'destructive'}>
                        Nivå {reminder.reminder_level}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(reminder.reminder_date)}</TableCell>
                    <TableCell>{formatCurrency(reminder.fee_amount)}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[reminder.status]}>
                        {statusLabels[reminder.status]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create Reminder Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Skapa påminnelse</DialogTitle>
            <DialogDescription>
              Konfigurera och förhandsgranska påminnelse för faktura {selectedInvoice?.invoice_number}
            </DialogDescription>
          </DialogHeader>
          
          {selectedInvoice && (
            <div className="space-y-6">
              {/* Invoice Info */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Kund:</span>
                  <span className="font-medium">{selectedInvoice.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ursprungligt belopp:</span>
                  <span className="font-medium">{formatCurrency(selectedInvoice.total_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Förfallodatum:</span>
                  <span className="font-medium text-red-600">{formatDate(selectedInvoice.due_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dagar försenad:</span>
                  <Badge variant="destructive">{getDaysOverdue(selectedInvoice.due_date)} dagar</Badge>
                </div>
              </div>

              {/* Reminder Type */}
              <div className="space-y-2">
                <Label>Påminnelse typ</Label>
                <div className="grid grid-cols-3 gap-2">
                  {([1, 2, 3] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setReminderType(level)}
                      className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                        reminderType === level
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-lg font-bold mb-1">{level}</div>
                      <div className="text-xs">
                        {level === 1 && 'Första påminnelsen'}
                        {level === 2 && 'Andra påminnelsen'}
                        {level === 3 && 'Inkasso'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cost Calculation Preview */}
              {costs && (
                <div className="bg-amber-50 p-4 rounded-lg space-y-2">
                  <h4 className="font-medium flex items-center">
                    <Calculator className="h-4 w-4 mr-2" />
                    Kostnadsberäkning
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Ursprungligt belopp:</span>
                      <span>{formatCurrency(costs.originalAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Påminnelseavgift:</span>
                      <span className={costs.fee > 0 ? 'text-red-600' : ''}>
                        {costs.fee > 0 ? `+${formatCurrency(costs.fee)}` : formatCurrency(0)}
                      </span>
                    </div>
                    {costs.interest > 0 && (
                      <div className="flex justify-between">
                        <span>Ränta ({costs.daysOverdue} dagar @ 16%):</span>
                        <span className="text-red-600">+{formatCurrency(costs.interest)}</span>
                      </div>
                    )}
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Totalt att betala:</span>
                        <span className={reminderType >= 2 ? 'text-red-600' : ''}>
                          {formatCurrency(costs.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Reminder Method */}
              <div className="space-y-2">
                <Label>Sändningsmetod</Label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setReminderMethod('email')}
                    className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-colors ${
                      reminderMethod === 'email'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Mail className="h-5 w-5" />
                    <span className="text-sm">E-post</span>
                  </button>
                  <button
                    onClick={() => setReminderMethod('sms')}
                    className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-colors ${
                      reminderMethod === 'sms'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <MessageSquare className="h-5 w-5" />
                    <span className="text-sm">SMS</span>
                  </button>
                  <button
                    onClick={() => setReminderMethod('both')}
                    className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-colors ${
                      reminderMethod === 'both'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex gap-1">
                      <Mail className="h-4 w-4" />
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <span className="text-sm">Båda</span>
                  </button>
                </div>
              </div>

              {/* Custom Message */}
              <div className="space-y-2">
                <Label htmlFor="message">Eget meddelande (valfritt)</Label>
                <textarea
                  id="message"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Lägg till ett personligt meddelande till kunden..."
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
              Avbryt
            </Button>
            <Button 
              onClick={handleSendReminder}
              disabled={createMutation.isPending}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              {createMutation.isPending ? 'Skickar...' : 'Skicka påminnelse'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
