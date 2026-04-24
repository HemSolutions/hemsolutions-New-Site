import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save, Building2, User, CreditCard, FileText, MapPin, StickyNote, Bell } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select'
import { getCustomer, createCustomer, updateCustomer } from '../../api'
import type { Customer } from '../../types'

interface CustomerFormData {
  customer_number: string
  name: string
  email: string
  phone: string
  mobile_phone: string
  address: string
  city: string
  postal_code: string
  invoice_address_line1: string
  invoice_address_line2: string
  invoice_address_line3: string
  invoice_postal_code: string
  invoice_city: string
  org_number: string
  person_number: string
  payment_terms_days: number
  late_payment_interest: number
  discount_percent: number
  e_invoice: boolean
  gln_number: string
  reference: string
  invoice_info: string
  notes: string
}

const emptyForm: CustomerFormData = {
  customer_number: '',
  name: '',
  email: '',
  phone: '',
  mobile_phone: '',
  address: '',
  city: '',
  postal_code: '',
  invoice_address_line1: '',
  invoice_address_line2: '',
  invoice_address_line3: '',
  invoice_postal_code: '',
  invoice_city: '',
  org_number: '',
  person_number: '',
  payment_terms_days: 30,
  late_payment_interest: 8.0,
  discount_percent: 0,
  e_invoice: false,
  gln_number: '',
  reference: '',
  invoice_info: '',
  notes: '',
}

const paymentTermsOptions = [
  { value: '10', label: '10 dagar' },
  { value: '15', label: '15 dagar' },
  { value: '30', label: '30 dagar' },
  { value: '60', label: '60 dagar' },
  { value: '90', label: '90 dagar' },
]

export default function CustomerForm() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const isEditMode = !!id

  const [formData, setFormData] = useState<CustomerFormData>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { data: existingCustomer, isLoading: isLoadingCustomer } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => getCustomer(Number(id)),
    enabled: isEditMode,
  })

  useEffect(() => {
    if (existingCustomer) {
      setFormData({
        customer_number: existingCustomer.customer_number || '',
        name: existingCustomer.name || '',
        email: existingCustomer.email || '',
        phone: existingCustomer.phone || '',
        mobile_phone: existingCustomer.mobile_phone || '',
        address: existingCustomer.address || '',
        city: existingCustomer.city || '',
        postal_code: existingCustomer.postal_code || '',
        invoice_address_line1: existingCustomer.invoice_address_line1 || '',
        invoice_address_line2: existingCustomer.invoice_address_line2 || '',
        invoice_address_line3: existingCustomer.invoice_address_line3 || '',
        invoice_postal_code: existingCustomer.invoice_postal_code || '',
        invoice_city: existingCustomer.invoice_city || '',
        org_number: existingCustomer.org_number || '',
        person_number: existingCustomer.person_number || '',
        payment_terms_days: existingCustomer.payment_terms_days || 30,
        late_payment_interest: existingCustomer.late_payment_interest || 8.0,
        discount_percent: existingCustomer.discount_percent || 0,
        e_invoice: existingCustomer.e_invoice || false,
        gln_number: existingCustomer.gln_number || '',
        reference: existingCustomer.reference || '',
        invoice_info: existingCustomer.invoice_info || '',
        notes: existingCustomer.notes || '',
      })
    }
  }, [existingCustomer])

  const createMutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      navigate('/admin/customers')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Customer> }) => updateCustomer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      queryClient.invalidateQueries({ queryKey: ['customer', id] })
      navigate('/admin/customers')
    },
  })

  const handleChange = (field: keyof CustomerFormData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Namn är obligatoriskt'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'E-post är obligatoriskt'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ogiltig e-postadress'
    }
    if (formData.person_number && !/^\d{8}-\d{4}$/.test(formData.person_number)) {
      newErrors.person_number = 'Format: YYYYMMDD-XXXX'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const submitData = {
      ...formData,
      payment_terms_days: Number(formData.payment_terms_days),
      late_payment_interest: Number(formData.late_payment_interest),
      discount_percent: Number(formData.discount_percent),
    }

    if (isEditMode) {
      updateMutation.mutate({ id: Number(id), data: submitData })
    } else {
      createMutation.mutate(submitData as Omit<Customer, 'id' | 'created_at' | 'updated_at'>)
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  if (isEditMode && isLoadingCustomer) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mr-3" />
        Laddar kund...
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => navigate('/admin/customers')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Redigera kund' : 'Ny kund'}
            </h1>
            <p className="text-sm text-gray-500">
              {isEditMode
                ? `Kundnummer: ${formData.customer_number}`
                : 'Fyll i kunduppgifterna nedan'}
            </p>
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? 'Sparar...' : 'Spara kund'}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Number & Invoice Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Kundinformation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer_number">
                  Kundnummer <span className="text-gray-400 text-xs">(auto-genereras om tom)</span>
                </Label>
                <Input
                  id="customer_number"
                  value={formData.customer_number}
                  onChange={(e) => handleChange('customer_number', e.target.value)}
                  placeholder="T.ex. K-1234"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoice_info">Fakturainformation</Label>
                <Textarea
                  id="invoice_info"
                  value={formData.invoice_info}
                  onChange={(e) => handleChange('invoice_info', e.target.value)}
                  placeholder="Information som ska visas på fakturan"
                  rows={2}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              {formData.org_number ? (
                <Building2 className="h-5 w-5 text-blue-600" />
              ) : (
                <User className="h-5 w-5 text-blue-600" />
              )}
              Kontaktuppgifter
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Namn <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Företagsnamn eller personnamn"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="org_number">Organisationsnummer</Label>
                <Input
                  id="org_number"
                  value={formData.org_number}
                  onChange={(e) => handleChange('org_number', e.target.value)}
                  placeholder="556677-8899"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="person_number">Personnummer</Label>
                <Input
                  id="person_number"
                  value={formData.person_number}
                  onChange={(e) => handleChange('person_number', e.target.value)}
                  placeholder="YYYYMMDD-XXXX"
                  className={errors.person_number ? 'border-red-500' : ''}
                />
                {errors.person_number && (
                  <p className="text-sm text-red-500">{errors.person_number}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="reference">Referens</Label>
                <Input
                  id="reference"
                  value={formData.reference}
                  onChange={(e) => handleChange('reference', e.target.value)}
                  placeholder="Referensperson"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">
                  E-post <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="namn@exempel.se"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="070-123 45 67"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mobile_phone">Mobiltelefon</Label>
                <Input
                  id="mobile_phone"
                  value={formData.mobile_phone}
                  onChange={(e) => handleChange('mobile_phone', e.target.value)}
                  placeholder="073-123 45 67"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                Adress
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Gatuadress"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postal_code">Postnummer</Label>
                <Input
                  id="postal_code"
                  value={formData.postal_code}
                  onChange={(e) => handleChange('postal_code', e.target.value)}
                  placeholder="123 45"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Ort</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="Stad"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoice Address */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Fakturaadress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invoice_address_line1">Fakturaadress rad 1</Label>
              <Input
                id="invoice_address_line1"
                value={formData.invoice_address_line1}
                onChange={(e) => handleChange('invoice_address_line1', e.target.value)}
                placeholder="Gatuadress eller företagsnamn"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoice_address_line2">Fakturaadress rad 2</Label>
              <Input
                id="invoice_address_line2"
                value={formData.invoice_address_line2}
                onChange={(e) => handleChange('invoice_address_line2', e.target.value)}
                placeholder="C/O, avdelning, etc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoice_address_line3">Fakturaadress rad 3</Label>
              <Input
                id="invoice_address_line3"
                value={formData.invoice_address_line3}
                onChange={(e) => handleChange('invoice_address_line3', e.target.value)}
                placeholder="Extra adressrad"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoice_postal_code">Postnummer</Label>
                <Input
                  id="invoice_postal_code"
                  value={formData.invoice_postal_code}
                  onChange={(e) => handleChange('invoice_postal_code', e.target.value)}
                  placeholder="123 45"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoice_city">Ort</Label>
                <Input
                  id="invoice_city"
                  value={formData.invoice_city}
                  onChange={(e) => handleChange('invoice_city', e.target.value)}
                  placeholder="Stad"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Terms */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Betalning
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payment_terms_days">Betalningsvillkor</Label>
                <Select
                  value={String(formData.payment_terms_days)}
                  onValueChange={(value) => handleChange('payment_terms_days', Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Välj betalningsvillkor" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentTermsOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="late_payment_interest">Dröjsmålsränta (%)</Label>
                <Input
                  id="late_payment_interest"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.late_payment_interest}
                  onChange={(e) => handleChange('late_payment_interest', Number(e.target.value))}
                  placeholder="8.0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount_percent">Rabatt (%)</Label>
                <Input
                  id="discount_percent"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.discount_percent}
                  onChange={(e) => handleChange('discount_percent', Number(e.target.value))}
                  placeholder="0"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* E-invoice */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-600" />
              E-faktura
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="e_invoice"
                checked={formData.e_invoice}
                onChange={(e) => handleChange('e_invoice', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="e_invoice" className="mb-0 cursor-pointer">
                Aktivera e-faktura för denna kund
              </Label>
            </div>
            {formData.e_invoice && (
              <div className="space-y-2">
                <Label htmlFor="gln_number">GLN-nummer</Label>
                <Input
                  id="gln_number"
                  value={formData.gln_number}
                  onChange={(e) => handleChange('gln_number', e.target.value)}
                  placeholder="T.ex. 1234567890123"
                />
                <p className="text-xs text-gray-500">
                  GLN (Global Location Number) krävs för att skicka e-fakturor
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <StickyNote className="h-5 w-5 text-blue-600" />
              Anteckningar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Övriga anteckningar om kunden..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit buttons */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/customers')}
            disabled={isSubmitting}
          >
            Avbryt
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Sparar...' : 'Spara kund'}
          </Button>
        </div>
      </form>
    </div>
  )
}
