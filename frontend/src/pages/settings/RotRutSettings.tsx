import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Hammer, Save, Plus, X, Percent, ToggleLeft, ToggleRight } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { getRotRutSettings, updateRotRutSettings } from '../../api'
import { toast } from 'sonner'

const DEFAULT_ROT_CATEGORIES = [
  'Reparation och underhåll',
  'Om- och tillbyggnad',
  'Målning',
  'Takarbeten',
  'Fasadarbeten',
  'Dränering',
  'Kamin- och eldstadsarbeten',
  'Värmepump',
  'Golvbeläggning',
]

const DEFAULT_RUT_CATEGORIES = [
  'Städning',
  'Trädgårdsarbete',
  'Snöskottning',
  'Barnpassning',
  'Flyttjänster',
  'It-support',
  'Kläd- och textilvård',
  'Personlig omsorg',
  'Matlagning',
]

export default function RotRutSettings() {
  const queryClient = useQueryClient()

  const { data: settings, isLoading } = useQuery({
    queryKey: ['rotRutSettings'],
    queryFn: getRotRutSettings,
  })

  const updateMutation = useMutation({
    mutationFn: updateRotRutSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rotRutSettings'] })
      toast.success('ROT/RUT-inställningar sparade!')
    },
    onError: () => {
      toast.error('Kunde inte spara inställningarna')
    },
  })

  const [formData, setFormData] = useState({
    rot_enabled: true,
    rut_enabled: true,
    rot_default_percentage: 30,
    rut_default_percentage: 50,
    rot_work_categories: [] as string[],
    rut_work_categories: [] as string[],
  })

  const [newRotCategory, setNewRotCategory] = useState('')
  const [newRutCategory, setNewRutCategory] = useState('')

  useEffect(() => {
    if (settings) {
      setFormData({
        rot_enabled: settings.rot_enabled ?? true,
        rut_enabled: settings.rut_enabled ?? true,
        rot_default_percentage: settings.rot_default_percentage || 30,
        rut_default_percentage: settings.rut_default_percentage || 50,
        rot_work_categories: settings.rot_work_categories?.length > 0
          ? settings.rot_work_categories
          : DEFAULT_ROT_CATEGORIES,
        rut_work_categories: settings.rut_work_categories?.length > 0
          ? settings.rut_work_categories
          : DEFAULT_RUT_CATEGORIES,
      })
    }
  }, [settings])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate(formData)
  }

  const handleToggle = (field: 'rot_enabled' | 'rut_enabled') => {
    setFormData(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const handlePercentageChange = (field: 'rot_default_percentage' | 'rut_default_percentage', value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addCategory = (type: 'rot' | 'rut') => {
    if (type === 'rot' && newRotCategory.trim()) {
      setFormData(prev => ({
        ...prev,
        rot_work_categories: [...prev.rot_work_categories, newRotCategory.trim()],
      }))
      setNewRotCategory('')
    } else if (type === 'rut' && newRutCategory.trim()) {
      setFormData(prev => ({
        ...prev,
        rut_work_categories: [...prev.rut_work_categories, newRutCategory.trim()],
      }))
      setNewRutCategory('')
    }
  }

  const removeCategory = (type: 'rot' | 'rut', index: number) => {
    setFormData(prev => ({
      ...prev,
      [type === 'rot' ? 'rot_work_categories' : 'rut_work_categories']:
        prev[type === 'rot' ? 'rot_work_categories' : 'rut_work_categories'].filter((_, i) => i !== index),
    }))
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Laddar inställningar...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ROT/RUT-inställningar</h1>
        <p className="text-muted-foreground">Konfigurera skattereduktion för husarbete</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ROT Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Hammer className="h-5 w-5" />
                <span>ROT-avdrag (Reparation, Om- och Tillbyggnad)</span>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('rot_enabled')}
                className="flex items-center space-x-2 text-sm"
              >
                {formData.rot_enabled ? (
                  <>
                    <ToggleRight className="h-6 w-6 text-green-600" />
                    <span className="text-green-600">Aktiverad</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="h-6 w-6 text-gray-400" />
                    <span className="text-gray-400">Inaktiverad</span>
                  </>
                )}
              </button>
            </CardTitle>
            <CardDescription>
              Skattereduktion för reparation och underhåll av bostad
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rot_default_percentage" className="flex items-center space-x-2">
                <Percent className="h-4 w-4" />
                <span>Standard procentsats</span>
              </Label>
              <Input
                id="rot_default_percentage"
                type="number"
                value={formData.rot_default_percentage}
                onChange={(e) => handlePercentageChange('rot_default_percentage', parseInt(e.target.value) || 0)}
                min={0}
                max={100}
                disabled={!formData.rot_enabled}
              />
              <p className="text-xs text-muted-foreground">
                Max 30% av arbetskostnaden för ROT-arbeten
              </p>
            </div>

            <div className="space-y-2 pt-4">
              <Label>Arbetskategorier för ROT</Label>
              <div className="flex flex-wrap gap-2">
                {formData.rot_work_categories.map((category, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    <span>{category}</span>
                    <button
                      type="button"
                      onClick={() => removeCategory('rot', index)}
                      className="hover:text-blue-600"
                      disabled={!formData.rot_enabled}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2 mt-2">
                <Input
                  value={newRotCategory}
                  onChange={(e) => setNewRotCategory(e.target.value)}
                  placeholder="Lägg till ny kategori..."
                  disabled={!formData.rot_enabled}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory('rot'))}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => addCategory('rot')}
                  disabled={!formData.rot_enabled || !newRotCategory.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RUT Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Hammer className="h-5 w-5" />
                <span>RUT-avdrag (Rengöring, Underhåll och Tvätt)</span>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('rut_enabled')}
                className="flex items-center space-x-2 text-sm"
              >
                {formData.rut_enabled ? (
                  <>
                    <ToggleRight className="h-6 w-6 text-green-600" />
                    <span className="text-green-600">Aktiverad</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="h-6 w-6 text-gray-400" />
                    <span className="text-gray-400">Inaktiverad</span>
                  </>
                )}
              </button>
            </CardTitle>
            <CardDescription>
              Skattereduktion för hushållsnära tjänster
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rut_default_percentage" className="flex items-center space-x-2">
                <Percent className="h-4 w-4" />
                <span>Standard procentsats</span>
              </Label>
              <Input
                id="rut_default_percentage"
                type="number"
                value={formData.rut_default_percentage}
                onChange={(e) => handlePercentageChange('rut_default_percentage', parseInt(e.target.value) || 0)}
                min={0}
                max={100}
                disabled={!formData.rut_enabled}
              />
              <p className="text-xs text-muted-foreground">
                Max 50% av arbetskostnaden för RUT-arbeten
              </p>
            </div>

            <div className="space-y-2 pt-4">
              <Label>Arbetskategorier för RUT</Label>
              <div className="flex flex-wrap gap-2">
                {formData.rut_work_categories.map((category, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    <span>{category}</span>
                    <button
                      type="button"
                      onClick={() => removeCategory('rut', index)}
                      className="hover:text-green-600"
                      disabled={!formData.rut_enabled}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2 mt-2">
                <Input
                  value={newRutCategory}
                  onChange={(e) => setNewRutCategory(e.target.value)}
                  placeholder="Lägg till ny kategori..."
                  disabled={!formData.rut_enabled}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory('rut'))}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => addCategory('rut')}
                  disabled={!formData.rut_enabled || !newRutCategory.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Information */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900 text-base">Om ROT/RUT</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800 space-y-2">
            <p>
              <strong>ROT-avdrag:</strong> Gäller för reparation, om- och tillbyggnad av bostad.
              Max 30% av arbetskostnaden, tak 50 000 kr per person och år.
            </p>
            <p>
              <strong>RUT-avdrag:</strong> Gäller för hushållsnära tjänster som städning och trädgårdsarbete.
              Max 50% av arbetskostnaden, tak 75 000 kr per person och år (25 000 kr för förvärvsarbetande).
            </p>
            <p className="text-xs mt-2">
              Läs mer på <a href="https://www.skatteverket.se" target="_blank" rel="noopener noreferrer" className="underline">skatteverket.se</a>
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
