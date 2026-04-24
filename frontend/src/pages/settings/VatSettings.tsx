import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Percent, Save, Plus, Trash2, Star, Check } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog'
import { getVatRates, createVatRate, updateVatRate, deleteVatRate } from '../../api'
import { toast } from 'sonner'
import type { VatRate } from '../../types'

const DEFAULT_VAT_RATES = [
  { name: 'Standard (25%)', rate: 25, is_default: true, is_active: true },
  { name: 'Matvaror (12%)', rate: 12, is_default: false, is_active: true },
  { name: 'Böcker (6%)', rate: 6, is_default: false, is_active: true },
  { name: 'Momsfri (0%)', rate: 0, is_default: false, is_active: true },
]

export default function VatSettings() {
  const queryClient = useQueryClient()

  const { data: vatRates = [], isLoading } = useQuery({
    queryKey: ['vatRates'],
    queryFn: getVatRates,
  })

  const createMutation = useMutation({
    mutationFn: createVatRate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vatRates'] })
      toast.success('Momssats skapad!')
      setIsDialogOpen(false)
      resetNewVatRate()
    },
    onError: () => {
      toast.error('Kunde inte skapa momssats')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<VatRate> }) => updateVatRate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vatRates'] })
      toast.success('Momssats uppdaterad!')
    },
    onError: () => {
      toast.error('Kunde inte uppdatera momssats')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteVatRate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vatRates'] })
      toast.success('Momssats borttagen!')
    },
    onError: () => {
      toast.error('Kunde inte ta bort momssats')
    },
  })

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newVatRate, setNewVatRate] = useState({
    name: '',
    rate: 25,
    is_default: false,
    is_active: true,
  })

  useEffect(() => {
    // Seed default VAT rates if none exist
    if (!isLoading && vatRates.length === 0) {
      DEFAULT_VAT_RATES.forEach((rate, index) => {
        setTimeout(() => createMutation.mutate(rate), index * 100)
      })
    }
  }, [vatRates, isLoading])

  const resetNewVatRate = () => {
    setNewVatRate({
      name: '',
      rate: 25,
      is_default: false,
      is_active: true,
    })
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(newVatRate)
  }

  const handleSetDefault = (id: number) => {
    // First unset all as default, then set the selected one
    vatRates.forEach(rate => {
      if (rate.is_default) {
        updateMutation.mutate({ id: rate.id, data: { is_default: false } })
      }
    })
    updateMutation.mutate({ id, data: { is_default: true } })
  }

  const handleToggleActive = (rate: VatRate) => {
    updateMutation.mutate({
      id: rate.id,
      data: { is_active: !rate.is_active },
    })
  }

  const handleDelete = (id: number) => {
    if (confirm('Är du säker på att du vill ta bort denna momssats?')) {
      deleteMutation.mutate(id)
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Laddar momssatser...</div>
  }

  const activeRates = vatRates.filter(r => r.is_active)
  const inactiveRates = vatRates.filter(r => !r.is_active)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Momssatser</h1>
          <p className="text-muted-foreground">Hantera momssatser för produkter och tjänster</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Ny momssats
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Lägg till momssats</DialogTitle>
              <DialogDescription>
                Skapa en ny momssats för användning på fakturor och kvitton
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Namn</Label>
                <Input
                  id="name"
                  value={newVatRate.name}
                  onChange={(e) => setNewVatRate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="t.ex. reducerad moms"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rate">Momssats (%)</Label>
                <Input
                  id="rate"
                  type="number"
                  value={newVatRate.rate}
                  onChange={(e) => setNewVatRate(prev => ({ ...prev, rate: parseFloat(e.target.value) || 0 }))}
                  min={0}
                  max={100}
                  step={0.01}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_default"
                  checked={newVatRate.is_default}
                  onChange={(e) => setNewVatRate(prev => ({ ...prev, is_default: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="is_default" className="cursor-pointer">
                  Sätt som standard
                </Label>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Avbryt
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Skapar...' : 'Skapa'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active VAT Rates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Percent className="h-5 w-5" />
            <span>Aktiva momssatser</span>
          </CardTitle>
          <CardDescription>
            Momssatser som kan användas på fakturor och kvitton
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {activeRates.map((rate) => (
              <div
                key={rate.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  rate.is_default ? 'bg-blue-50 border-blue-200' : 'bg-white'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`text-2xl font-bold ${rate.is_default ? 'text-blue-600' : 'text-gray-700'}`}>
                    {rate.rate}%
                  </div>
                  <div>
                    <div className="font-medium flex items-center space-x-2">
                      <span>{rate.name}</span>
                      {rate.is_default && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          <Star className="h-3 w-3 mr-1" />
                          Standard
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {rate.is_default ? 'Används som standard på nya artiklar' : 'Aktiv momssats'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {!rate.is_default && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetDefault(rate.id)}
                      title="Sätt som standard"
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleActive(rate)}
                    title="Inaktivera"
                  >
                    <Check className="h-4 w-4 text-green-600" />
                  </Button>
                  {!rate.is_default && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(rate.id)}
                      title="Ta bort"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {activeRates.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Inga aktiva momssatser. Lägg till en momssats för att komma igång.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Inactive VAT Rates */}
      {inactiveRates.length > 0 && (
        <Card className="opacity-75">
          <CardHeader>
            <CardTitle>Inaktiva momssatser</CardTitle>
            <CardDescription>
              Momssatser som för närvarande inte kan väljas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {inactiveRates.map((rate) => (
                <div
                  key={rate.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl font-bold text-gray-400">
                      {rate.rate}%
                    </div>
                    <div>
                      <div className="font-medium text-gray-600">{rate.name}</div>
                      <div className="text-sm text-muted-foreground">Inaktiv</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(rate)}
                      title="Aktivera"
                    >
                      <Check className="h-4 w-4 text-gray-400" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(rate.id)}
                      title="Ta bort"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* VAT Information */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900 text-base">Momssatser i Sverige</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <p>
            <strong>25% (Standard):</strong> Gäller för de flesta varor och tjänster
          </p>
          <p>
            <strong>12% (Reducerad):</strong> Gäller för matvaror, hotell, restaurang m.m.
          </p>
          <p>
            <strong>6% (Sänkt):</strong> Gäller för böcker, tidningar, taxi, konserter m.m.
          </p>
          <p>
            <strong>0% (Momsfri):</strong> Gäller för vissa varor och tjänster som är undantagna
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
