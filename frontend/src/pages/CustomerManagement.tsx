import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Edit, Trash2, Mail, Phone } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
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
import { formatDate } from '../lib/utils'
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../api'
import type { Customer } from '../types'

export default function CustomerManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  const queryClient = useQueryClient()

  const { data: customers, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers,
  })

  const createMutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      setIsCreateOpen(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Customer> }) => updateCustomer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      setIsEditOpen(false)
      setSelectedCustomer(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })

  const filteredCustomers = customers?.filter(
    (customer: Customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.org_number?.includes(searchTerm) ?? false)
  )

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsEditOpen(true)
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Laddar kunder...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Kunder</h1>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Ny Kund
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Skapa ny kund</DialogTitle>
              <DialogDescription>
                Fyll i uppgifterna nedan för att skapa en ny kund.
              </DialogDescription>
            </DialogHeader>
            <CustomerForm
              onSubmit={(data) => createMutation.mutate(data as Omit<Customer, 'id' | 'created_at' | 'updated_at'>)}
              onCancel={() => setIsCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Sök kund namn, email eller org.nr..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Namn</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Org.nr</TableHead>
              <TableHead>Skapad</TableHead>
              <TableHead className="text-right">Åtgärder</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers?.map((customer: Customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Mail className="h-3 w-3" />
                    <span className="text-sm">{customer.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Phone className="h-3 w-3" />
                    <span className="text-sm">{customer.phone}</span>
                  </div>
                </TableCell>
                <TableCell>{customer.org_number || '-'}</TableCell>
                <TableCell>{formatDate(customer.created_at)}</TableCell>
                <TableCell className="text-right space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(customer)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(customer.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Customer Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Redigera kund</DialogTitle>
            <DialogDescription>
              Uppdatera kunduppgifter.
            </DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <CustomerForm
              customer={selectedCustomer}
              onSubmit={(data) => updateMutation.mutate({ id: selectedCustomer.id, data: data as Partial<Customer> })}
              onCancel={() => {
                setIsEditOpen(false)
                setSelectedCustomer(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface CustomerFormProps {
  customer?: Customer
  onSubmit: (data: Record<string, unknown>) => void
  onCancel: () => void
}

function CustomerForm({ customer, onSubmit, onCancel }: CustomerFormProps) {
  const [formData, setFormData] = useState({
    customer_number: customer?.customer_number || '',
    name: customer?.name || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    mobile_phone: customer?.mobile_phone || '',
    address: customer?.address || '',
    city: customer?.city || '',
    postal_code: customer?.postal_code || '',
    invoice_address_line1: customer?.invoice_address_line1 || '',
    invoice_address_line2: customer?.invoice_address_line2 || '',
    invoice_address_line3: customer?.invoice_address_line3 || '',
    invoice_postal_code: customer?.invoice_postal_code || '',
    invoice_city: customer?.invoice_city || '',
    org_number: customer?.org_number || '',
    person_number: customer?.person_number || '',
    payment_terms_days: customer?.payment_terms_days || 30,
    late_payment_interest: customer?.late_payment_interest || 8.0,
    discount_percent: customer?.discount_percent || 0,
    e_invoice: customer?.e_invoice || false,
    gln_number: customer?.gln_number || '',
    reference: customer?.reference || '',
    invoice_info: customer?.invoice_info || '',
    notes: customer?.notes || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData as Record<string, unknown>)
  }

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Namn *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="org_number">Org.nummer</Label>
          <Input
            id="org_number"
            value={formData.org_number}
            onChange={(e) => handleChange('org_number', e.target.value)}
            placeholder="556677-8899"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-post *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Telefon</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Adress</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => handleChange('address', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">Stad</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="postal_code">Postnummer</Label>
          <Input
            id="postal_code"
            value={formData.postal_code}
            onChange={(e) => handleChange('postal_code', e.target.value)}
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Avbryt
        </Button>
        <Button type="submit">
          {customer ? 'Spara ändringar' : 'Skapa kund'}
        </Button>
      </DialogFooter>
    </form>
  )
}
