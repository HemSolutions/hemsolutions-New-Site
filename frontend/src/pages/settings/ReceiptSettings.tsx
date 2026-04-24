import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Receipt, Save, ToggleLeft, ToggleRight } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Textarea } from '../../components/ui/textarea'
import { getReceiptSettings, updateReceiptSettings } from '../../api'
import { toast } from 'sonner'

export default function ReceiptSettings() {
  const queryClient = useQueryClient()

  const { data: settings, isLoading } = useQuery({
    queryKey: ['receiptSettings'],
    queryFn: getReceiptSettings,
  })

  const updateMutation = useMutation({
    mutationFn: updateReceiptSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receiptSettings'] })
      toast.success('Kvittoinställningar sparade!')
    },
    onError: () => {
      toast.error('Kunde inte spara inställningarna')
    },
  })

  const [formData, setFormData] = useState({
    receipt_number_prefix: 'K',
    default_notes: '',
    default_footer: '',
    show_vat_on_receipt: true,
  })

  useEffect(() => {
    if (settings) {
      setFormData({
        receipt_number_prefix: settings.receipt_number_prefix || 'K',
        default_notes: settings.default_notes || '',
        default_footer: settings.default_footer || '',
        show_vat_on_receipt: settings.show_vat_on_receipt ?? true,
      })
    }
  }, [settings])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate(formData)
  }

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Laddar inställningar...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Kvittoinställningar</h1>
        <p className="text-muted-foreground">Standardinställningar för nya kvitton</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Receipt className="h-5 w-5" />
              <span>Standardinställningar</span>
            </CardTitle>
            <CardDescription>
              Grundläggande inställningar som gäller för alla nya kvitton
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="receipt_number_prefix">Kvittonummer prefix</Label>
              <Input
                id="receipt_number_prefix"
                value={formData.receipt_number_prefix}
                onChange={(e) => handleChange('receipt_number_prefix', e.target.value)}
                placeholder="K"
                maxLength={5}
              />
              <p className="text-xs text-muted-foreground">
                Prefix före kvittonumret (t.ex. K0001)
              </p>
            </div>

            <div className="flex items-center space-x-4 pt-4 border-t">
              <button
                type="button"
                onClick={() => handleChange('show_vat_on_receipt', !formData.show_vat_on_receipt)}
                className="flex items-center space-x-2"
              >
                {formData.show_vat_on_receipt ? (
                  <ToggleRight className="h-6 w-6 text-green-600" />
                ) : (
                  <ToggleLeft className="h-6 w-6 text-gray-400" />
                )}
              </button>
              <div>
                <Label className="cursor-pointer" onClick={() => handleChange('show_vat_on_receipt', !formData.show_vat_on_receipt)}>
                  Visa moms på kvitton
                </Label>
                <p className="text-xs text-muted-foreground">
                  Inkludera momsuppdelning på kvitton (krävs för företag)
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
              Text som automatiskt läggs till på nya kvitton
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="default_notes">Standardnotering</Label>
              <Textarea
                id="default_notes"
                value={formData.default_notes}
                onChange={(e) => handleChange('default_notes', e.target.value)}
                placeholder="Tack för ditt köp!"
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Visas på kvittot som en notering till kunden
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="default_footer">Sidfotstext</Label>
              <Textarea
                id="default_footer"
                value={formData.default_footer}
                onChange={(e) => handleChange('default_footer', e.target.value)}
                placeholder="Välkommen åter!"
                rows={2}
              />
              <p className="text-xs text-muted-foreground">
                Text som visas längst ner på kvittot
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Receipt Information */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-yellow-900 text-base">Om kvitton</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-yellow-800 space-y-2">
            <p>
              Kvitton används för direktbetalningar och försäljning utan kredit.
              Till skillnad från fakturor krävs ingen betalningsuppföljning för kvitton.
            </p>
            <p>
              För företag är det viktigt att moms visas på kvitton för bokföringssyfte.
              Privata säljare kan välja att dölja moms på kvitton.
            </p>
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
