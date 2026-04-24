import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FileText, Save, Percent, Clock, AlertCircle } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Textarea } from '../../components/ui/textarea'
import { getInvoiceSettings, updateInvoiceSettings } from '../../api'
import { toast } from 'sonner'

export default function InvoiceSettings() {
  const queryClient = useQueryClient()

  const { data: settings, isLoading } = useQuery({
    queryKey: ['invoiceSettings'],
    queryFn: getInvoiceSettings,
  })

  const updateMutation = useMutation({
    mutationFn: updateInvoiceSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoiceSettings'] })
      toast.success('Fakturainställningar sparade!')
    },
    onError: () => {
      toast.error('Kunde inte spara inställningarna')
    },
  })

  const [formData, setFormData] = useState({
    payment_terms_days: 30,
    default_vat_rate: 25,
    invoice_number_prefix: 'F',
    default_notes: '',
    default_footer: '',
    late_payment_interest_rate: 8,
    reminder_fee_1: 60,
    reminder_fee_2: 180,
    reminder_fee_3: 180,
  })

  useEffect(() => {
    if (settings) {
      setFormData({
        payment_terms_days: settings.payment_terms_days || 30,
        default_vat_rate: settings.default_vat_rate || 25,
        invoice_number_prefix: settings.invoice_number_prefix || 'F',
        default_notes: settings.default_notes || '',
        default_footer: settings.default_footer || '',
        late_payment_interest_rate: settings.late_payment_interest_rate || 8,
        reminder_fee_1: settings.reminder_fee_1 || 60,
        reminder_fee_2: settings.reminder_fee_2 || 180,
        reminder_fee_3: settings.reminder_fee_3 || 180,
      })
    }
  }, [settings])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate(formData)
  }

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Laddar inställningar...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Fakturainställningar</h1>
        <p className="text-muted-foreground">Standardinställningar för nya fakturor</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Standardinställningar</span>
            </CardTitle>
            <CardDescription>
              Grundläggande inställningar som gäller för alla nya fakturor
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payment_terms_days" className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Betalningsvillkor (dagar)</span>
                </Label>
                <Input
                  id="payment_terms_days"
                  type="number"
                  value={formData.payment_terms_days}
                  onChange={(e) => handleChange('payment_terms_days', parseInt(e.target.value) || 0)}
                  min={1}
                  max={90}
                />
                <p className="text-xs text-muted-foreground">
                  Antal dagar från fakturadatum till förfallodatum
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="default_vat_rate" className="flex items-center space-x-2">
                  <Percent className="h-4 w-4" />
                  <span>Standard momssats</span>
                </Label>
                <Input
                  id="default_vat_rate"
                  type="number"
                  value={formData.default_vat_rate}
                  onChange={(e) => handleChange('default_vat_rate', parseInt(e.target.value) || 0)}
                  min={0}
                  max={100}
                />
                <p className="text-xs text-muted-foreground">
                  Procent (t.ex. 25 för 25%)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="invoice_number_prefix">Fakturanummer prefix</Label>
                <Input
                  id="invoice_number_prefix"
                  value={formData.invoice_number_prefix}
                  onChange={(e) => handleChange('invoice_number_prefix', e.target.value)}
                  placeholder="F"
                  maxLength={5}
                />
                <p className="text-xs text-muted-foreground">
                  Prefix före fakturanumret (t.ex. F0001)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Default Text */}
        <Card>
          <CardHeader>
            <CardTitle>Standardtext</CardTitle>
            <CardDescription>
              Text som automatiskt läggs till på nya fakturor
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="default_notes">Standardnotering</Label>
              <Textarea
                id="default_notes"
                value={formData.default_notes}
                onChange={(e) => handleChange('default_notes', e.target.value)}
                placeholder="Betalningsvillkor: 30 dagar netto. Vid försenad betalning debiteras dröjsmålsränta..."
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Visas på fakturan som en notering till kunden
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="default_footer">Sidfotstext</Label>
              <Textarea
                id="default_footer"
                value={formData.default_footer}
                onChange={(e) => handleChange('default_footer', e.target.value)}
                placeholder="Tack för att du handlar av oss!"
                rows={2}
              />
              <p className="text-xs text-muted-foreground">
                Text som visas längst ner på fakturan
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Late Payment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>Försenad betalning</span>
            </CardTitle>
            <CardDescription>
              Inställningar för påminnelser och dröjsmålsränta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="late_payment_interest_rate">Dröjsmålsränta (%)</Label>
              <Input
                id="late_payment_interest_rate"
                type="number"
                value={formData.late_payment_interest_rate}
                onChange={(e) => handleChange('late_payment_interest_rate', parseFloat(e.target.value) || 0)}
                min={0}
                max={100}
                step={0.1}
              />
              <p className="text-xs text-muted-foreground">
                Referensränta + 8% är standard enligt svensk lag
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="reminder_fee_1">Påminnelseavgift nivå 1 (kr)</Label>
                <Input
                  id="reminder_fee_1"
                  type="number"
                  value={formData.reminder_fee_1}
                  onChange={(e) => handleChange('reminder_fee_1', parseInt(e.target.value) || 0)}
                  min={0}
                />
                <p className="text-xs text-muted-foreground">
                  Första påminnelsen (max 60 kr)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reminder_fee_2">Påminnelseavgift nivå 2 (kr)</Label>
                <Input
                  id="reminder_fee_2"
                  type="number"
                  value={formData.reminder_fee_2}
                  onChange={(e) => handleChange('reminder_fee_2', parseInt(e.target.value) || 0)}
                  min={0}
                />
                <p className="text-xs text-muted-foreground">
                  Andra påminnelsen (max 180 kr)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reminder_fee_3">Påminnelseavgift nivå 3 (kr)</Label>
                <Input
                  id="reminder_fee_3"
                  type="number"
                  value={formData.reminder_fee_3}
                  onChange={(e) => handleChange('reminder_fee_3', parseInt(e.target.value) || 0)}
                  min={0}
                />
                <p className="text-xs text-muted-foreground">
                  Tredje påminnelsen (max 180 kr)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={updateMutation.isPending}>
            <Save className="mr-2 h-5 w-5" />
            {updateMutation.isPending ? 'Sparar...' : 'Spara Inställningar'}
          </Button>
        </div>
      </form>
    </div>
  )
}
