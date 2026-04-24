import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Building2, Save, Upload, X } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { getCompanySettings, updateCompanySettings, uploadCompanyLogo } from '../../api'
import { toast } from 'sonner'

export default function CompanySettings() {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: settings, isLoading } = useQuery({
    queryKey: ['companySettings'],
    queryFn: getCompanySettings,
  })

  const updateMutation = useMutation({
    mutationFn: updateCompanySettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companySettings'] })
      toast.success('Företagsinställningar sparade!')
    },
    onError: () => {
      toast.error('Kunde inte spara inställningarna')
    },
  })

  const uploadMutation = useMutation({
    mutationFn: uploadCompanyLogo,
    onSuccess: (data) => {
      setFormData(prev => ({ ...prev, logo_url: data.logo_url }))
      toast.success('Logotyp uppladdad!')
    },
    onError: () => {
      toast.error('Kunde inte ladda upp logotyp')
    },
  })

  const [formData, setFormData] = useState({
    company_name: '',
    org_number: '',
    vat_number: '',
    address: '',
    postal_code: '',
    city: '',
    phone: '',
    email: '',
    website: '',
    bankgiro: '',
    plusgiro: '',
    iban: '',
    swift: '',
    logo_url: '',
  })

  useEffect(() => {
    if (settings) {
      setFormData({
        company_name: settings.company_name || '',
        org_number: settings.org_number || '',
        vat_number: settings.vat_number || '',
        address: settings.address || '',
        postal_code: settings.postal_code || '',
        city: settings.city || '',
        phone: settings.phone || '',
        email: settings.email || '',
        website: settings.website || '',
        bankgiro: settings.bankgiro || '',
        plusgiro: settings.plusgiro || '',
        iban: settings.iban || '',
        swift: settings.swift || '',
        logo_url: settings.logo_url || '',
      })
    }
  }, [settings])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate(formData)
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadMutation.mutate(file)
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Laddar inställningar...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Företagsinställningar</h1>
        <p className="text-muted-foreground">Hantera företagsinformation och betalningsuppgifter</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>Företagsinformation</span>
            </CardTitle>
            <CardDescription>
              Information som visas på fakturor och andra dokument
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">Företagsnamn *</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => handleChange('company_name', e.target.value)}
                  placeholder="HemSolutions Sverige AB"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org_number">Organisationsnummer</Label>
                <Input
                  id="org_number"
                  value={formData.org_number}
                  onChange={(e) => handleChange('org_number', e.target.value)}
                  placeholder="559123-4567"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vat_number">Momsregistreringsnummer (VAT)</Label>
              <Input
                id="vat_number"
                value={formData.vat_number}
                onChange={(e) => handleChange('vat_number', e.target.value)}
                placeholder="SE559123456701"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adress</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Företagsvägen 12"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postal_code">Postnummer</Label>
                <Input
                  id="postal_code"
                  value={formData.postal_code}
                  onChange={(e) => handleChange('postal_code', e.target.value)}
                  placeholder="211 55"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Stad</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="Malmö"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="070-123 45 67"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-post</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="info@hemsolutions.se"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Webbplats</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="www.hemsolutions.se"
              />
            </div>

            {/* Logo Upload */}
            <div className="space-y-2 pt-4 border-t">
              <Label>Företagslogotyp</Label>
              <div className="flex items-center space-x-4">
                {formData.logo_url ? (
                  <div className="relative">
                    <img
                      src={formData.logo_url}
                      alt="Företagslogotyp"
                      className="h-20 w-20 object-contain border rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleChange('logo_url', '')}
                      className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="h-20 w-20 bg-gray-100 border-2 border-dashed rounded-lg flex items-center justify-center text-gray-400">
                    Ingen logotyp
                  </div>
                )}
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadMutation.isPending}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {uploadMutation.isPending ? 'Laddar upp...' : 'Ladda upp logotyp'}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    Rekommenderad storlek: 200x200px, PNG eller JPG
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bank Details */}
        <Card>
          <CardHeader>
            <CardTitle>Betalningsinformation</CardTitle>
            <CardDescription>
              Betalningsuppgifter som visas på fakturor
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankgiro">Bankgiro</Label>
                <Input
                  id="bankgiro"
                  value={formData.bankgiro}
                  onChange={(e) => handleChange('bankgiro', e.target.value)}
                  placeholder="123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plusgiro">Plusgiro</Label>
                <Input
                  id="plusgiro"
                  value={formData.plusgiro}
                  onChange={(e) => handleChange('plusgiro', e.target.value)}
                  placeholder="12 34 56-7"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="iban">IBAN</Label>
              <Input
                id="iban"
                value={formData.iban}
                onChange={(e) => handleChange('iban', e.target.value)}
                placeholder="SE45 5000 0000 0580 1234 5678"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="swift">SWIFT/BIC</Label>
              <Input
                id="swift"
                value={formData.swift}
                onChange={(e) => handleChange('swift', e.target.value)}
                placeholder="ESSESESS"
              />
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
