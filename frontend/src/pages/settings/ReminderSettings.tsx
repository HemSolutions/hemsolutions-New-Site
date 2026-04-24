import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, Save, Plus, Trash2, Edit2, Clock, AlertCircle, Send } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog'
import { Textarea } from '../../components/ui/textarea'
import { getReminderTemplates, createReminderTemplate, updateReminderTemplate, deleteReminderTemplate } from '../../api'
import { toast } from 'sonner'
import type { ReminderTemplate } from '../../types'

const DEFAULT_TEMPLATES = [
  {
    level: 1,
    name: 'Första påminnelse',
    subject: 'Påminnelse om förfallen faktura',
    body: `Hej,

Detta är en vänlig påminnelse om att faktura [FAKTURANUMMER] på [BELOPP] kr förföll till betalning den [FÖRFALLODATUM].

Om du redan har betalat, vänligen bortse från detta meddelande.

Med vänliga hälsningar,
[FORETAGSNAMN]`,
    days_after_due: 7,
    fee_amount: 60,
    is_active: true,
  },
  {
    level: 2,
    name: 'Andra påminnelse',
    subject: 'Andra påminnelse - förfallen faktura',
    body: `Hej,

Vi har tidigare påmint dig om faktura [FAKTURANUMMER] på [BELOPP] kr som förföll till betalning den [FÖRFALLODATUM].

En påminnelseavgift på [AVGIFT] kr har tillkommit. Nytt totalbelopp: [TOTALT_BELOPP] kr.

Vänligen betala omgående för att undvika ytterligare påminnelseavgifter.

Med vänliga hälsningar,
[FORETAGSNAMN]`,
    days_after_due: 14,
    fee_amount: 180,
    is_active: true,
  },
  {
    level: 3,
    name: 'Tredje påminnelse - Betalningsuppmaning',
    subject: 'Sista påminnelse innan inkasso - Faktura [FAKTURANUMMER]',
    body: `Hej,

Trots tidigare påminnelser har vi inte mottagit betalning för faktura [FAKTURANUMMER] på [BELOPP] kr.

En ytterligare påminnelseavgift på [AVGIFT] kr har tillkommit. Nytt totalbelopp: [TOTALT_BELOPP] kr.

Om vi inte mottar betalning inom 7 dagar kommer ärendet att gå till inkasso, vilket kan medföra ytterligare kostnader.

Med vänliga hälsningar,
[FORETAGSNAMN]`,
    days_after_due: 21,
    fee_amount: 180,
    is_active: true,
  },
]

const VARIABLES = [
  { name: '[FAKTURANUMMER]', description: 'Fakturanummer' },
  { name: '[BELOPP]', description: 'Ursprungligt fakturabelopp' },
  { name: '[FÖRFALLODATUM]', description: 'Fakturans förfallodatum' },
  { name: '[AVGIFT]', description: 'Påminnelseavgift för denna nivå' },
  { name: '[TOTALT_BELOPP]', description: 'Totalt belopp inklusive avgifter' },
  { name: '[FORETAGSNAMN]', description: 'Ditt företagsnamn' },
  { name: '[KUNDNAMN]', description: 'Kundens namn' },
]

export default function ReminderSettings() {
  const queryClient = useQueryClient()

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['reminderTemplates'],
    queryFn: getReminderTemplates,
  })

  const createMutation = useMutation({
    mutationFn: createReminderTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminderTemplates'] })
      toast.success('Påminnelsemall skapad!')
      setIsDialogOpen(false)
    },
    onError: () => {
      toast.error('Kunde inte skapa mall')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ReminderTemplate> }) => updateReminderTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminderTemplates'] })
      toast.success('Påminnelsemall uppdaterad!')
      setIsDialogOpen(false)
    },
    onError: () => {
      toast.error('Kunde inte uppdatera mall')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteReminderTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminderTemplates'] })
      toast.success('Påminnelsemall borttagen!')
    },
    onError: () => {
      toast.error('Kunde inte ta bort mall')
    },
  })

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<ReminderTemplate | null>(null)
  const [formData, setFormData] = useState({
    level: 1,
    name: '',
    subject: '',
    body: '',
    days_after_due: 7,
    fee_amount: 60,
    is_active: true,
  })

  useEffect(() => {
    // Seed default templates if none exist
    if (!isLoading && templates.length === 0) {
      DEFAULT_TEMPLATES.forEach((template, index) => {
        setTimeout(() => createMutation.mutate(template), index * 100)
      })
    }
  }, [templates, isLoading])

  useEffect(() => {
    if (editingTemplate) {
      setFormData({
        level: editingTemplate.level,
        name: editingTemplate.name,
        subject: editingTemplate.subject,
        body: editingTemplate.body,
        days_after_due: editingTemplate.days_after_due,
        fee_amount: editingTemplate.fee_amount,
        is_active: editingTemplate.is_active,
      })
    } else {
      setFormData({
        level: templates.length + 1,
        name: '',
        subject: '',
        body: '',
        days_after_due: 7,
        fee_amount: 60,
        is_active: true,
      })
    }
  }, [editingTemplate, templates.length])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingTemplate) {
      updateMutation.mutate({ id: editingTemplate.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleEdit = (template: ReminderTemplate) => {
    setEditingTemplate(template)
    setIsDialogOpen(true)
  }

  const handleNew = () => {
    setEditingTemplate(null)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm('Är du säker på att du vill ta bort denna påminnelsemall?')) {
      deleteMutation.mutate(id)
    }
  }

  const insertVariable = (variable: string) => {
    setFormData(prev => ({ ...prev, body: prev.body + variable }))
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Laddar påminnelsemallar...</div>
  }

  const sortedTemplates = [...templates].sort((a, b) => a.level - b.level)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Påminnelseinställningar</h1>
          <p className="text-muted-foreground">Mallar och inställningar för påminnelser</p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" />
          Ny mall
        </Button>
      </div>

      {/* Templates List */}
      <div className="space-y-4">
        {sortedTemplates.map((template, index) => (
          <Card key={template.id} className={!template.is_active ? 'opacity-60' : undefined}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <span>Nivå {template.level}: {template.name}</span>
                      {!template.is_active && (
                        <span className="text-xs font-normal px-2 py-0.5 bg-gray-200 text-gray-600 rounded">
                          Inaktiv
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center space-x-4 mt-1">
                      <span className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{template.days_after_due} dagar efter förfallodatum</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <AlertCircle className="h-3 w-3" />
                        <span>{template.fee_amount} kr avgift</span>
                      </span>
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(template)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(template.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Ämne:</span>
                  <p className="text-sm">{template.subject}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Meddelande:</span>
                  <p className="text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded mt-1">{template.body}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {templates.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-muted-foreground">
                Inga påminnelsemallar. Klicka på "Ny mall" för att skapa en.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Redigera påminnelsemall' : 'Ny påminnelsemall'}
            </DialogTitle>
            <DialogDescription>
              Konfigurera mallen för påminnelse nivå {formData.level}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="level">Nivå</Label>
                <Input
                  id="level"
                  type="number"
                  value={formData.level}
                  onChange={(e) => setFormData(prev => ({ ...prev, level: parseInt(e.target.value) || 1 }))}
                  min={1}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Namn</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="t.ex. Första påminnelse"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Ämne (e-post)</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Påminnelse om förfallen faktura"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="days_after_due" className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Dagar efter förfallodatum</span>
                </Label>
                <Input
                  id="days_after_due"
                  type="number"
                  value={formData.days_after_due}
                  onChange={(e) => setFormData(prev => ({ ...prev, days_after_due: parseInt(e.target.value) || 0 }))}
                  min={1}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fee_amount" className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>Påminnelseavgift (kr)</span>
                </Label>
                <Input
                  id="fee_amount"
                  type="number"
                  value={formData.fee_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, fee_amount: parseInt(e.target.value) || 0 }))}
                  min={0}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Meddelandetext</Label>
              <Textarea
                id="body"
                value={formData.body}
                onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                rows={8}
                required
              />
            </div>

            {/* Variables */}
            <div className="space-y-2">
              <Label>Tillgängliga variabler (klicka för att infoga)</Label>
              <div className="flex flex-wrap gap-2">
                {VARIABLES.map((variable) => (
                  <button
                    key={variable.name}
                    type="button"
                    onClick={() => insertVariable(variable.name)}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
                    title={variable.description}
                  >
                    {variable.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="is_active" className="cursor-pointer">
                Aktiv (kan användas för påminnelser)
              </Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Avbryt
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                <Save className="mr-2 h-4 w-4" />
                {createMutation.isPending || updateMutation.isPending 
                  ? 'Sparar...' 
                  : (editingTemplate ? 'Uppdatera' : 'Skapa')
                }
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Information */}
      <Card className="bg-amber-50 border-amber-200">
        <CardHeader>
          <CardTitle className="text-amber-900 text-base flex items-center space-x-2">
            <Send className="h-4 w-4" />
            <span>Automatiska påminnelser</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-amber-800 space-y-2">
          <p>
            Påminnelser skickas automatiskt via e-post när en faktura har förfallit.
            Varje nivå representerar en successivt starkare påminnelse med högre avgift.
          </p>
          <p>
            <strong>Viktigt:</strong> Påminnelseavgifter får inte överstiga 60 kr för första påminnelsen
            och 180 kr för andra och tredje påminnelsen enligt svensk lag.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
