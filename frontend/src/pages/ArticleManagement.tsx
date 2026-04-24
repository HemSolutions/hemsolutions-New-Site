import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Edit, Trash2, Package, Wrench, CheckCircle } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
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
import { formatCurrency } from '../lib/utils'
import { getArticles, createArticle, updateArticle, deleteArticle } from '../api'
import type { Article } from '../types'

export default function ArticleManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)

  const queryClient = useQueryClient()

  const { data: articles, isLoading } = useQuery({
    queryKey: ['articles'],
    queryFn: getArticles,
  })

  const createMutation = useMutation({
    mutationFn: createArticle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] })
      setIsCreateOpen(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Article> }) => updateArticle(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] })
      setIsEditOpen(false)
      setSelectedArticle(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteArticle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] })
    },
  })

  const filteredArticles = articles?.filter(
    (article) =>
      article.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (article: Article) => {
    setSelectedArticle(article)
    setIsEditOpen(true)
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Laddar artiklar...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Artiklar & Tjänster</h1>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Ny Artikel
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Skapa ny artikel/tjänst</DialogTitle>
              <DialogDescription>
                Fyll i uppgifterna nedan för att skapa en ny artikel eller tjänst.
              </DialogDescription>
            </DialogHeader>
            <ArticleForm
              onSubmit={(data) => createMutation.mutate(data)}
              onCancel={() => setIsCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Sök artikel eller tjänst..."
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
              <TableHead>Typ</TableHead>
              <TableHead>Pris</TableHead>
              <TableHead>Moms</TableHead>
              <TableHead>ROT/RUT</TableHead>
              <TableHead>Enhet</TableHead>
              <TableHead className="text-right">Åtgärder</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredArticles?.map((article) => (
              <TableRow key={article.id}>
                <TableCell>
                  <div className="font-medium">{article.name}</div>
                  <div className="text-sm text-muted-foreground">{article.description}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={article.type === 'product' ? 'default' : 'secondary'}>
                    {article.type === 'product' ? (
                      <Package className="h-3 w-3 mr-1" />
                    ) : (
                      <Wrench className="h-3 w-3 mr-1" />
                    )}
                    {article.type === 'product' ? 'Produkt' : 'Tjänst'}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{formatCurrency(article.price)}</TableCell>
                <TableCell>{article.vat_rate}%</TableCell>
                <TableCell>
                  {article.is_rot_rut ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>{article.unit}</TableCell>
                <TableCell className="text-right space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(article)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(article.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Article Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Redigera artikel/tjänst</DialogTitle>
            <DialogDescription>
              Uppdatera artikel-/tjänsteuppgifter.
            </DialogDescription>
          </DialogHeader>
          {selectedArticle && (
            <ArticleForm
              article={selectedArticle}
              onSubmit={(data) => updateMutation.mutate({ id: selectedArticle.id, data })}
              onCancel={() => {
                setIsEditOpen(false)
                setSelectedArticle(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface ArticleFormProps {
  article?: Article
  onSubmit: (data: Omit<Article, 'id' | 'created_at' | 'updated_at'>) => void
  onCancel: () => void
}

function ArticleForm({ article, onSubmit, onCancel }: ArticleFormProps) {
  const [formData, setFormData] = useState({
    name: article?.name || '',
    description: article?.description || '',
    price: article?.price || 0,
    type: article?.type || 'service',
    vat_rate: article?.vat_rate || 25,
    is_rot_rut: article?.is_rot_rut || false,
    unit: article?.unit || 'tim',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleChange = (field: string, value: string | number | boolean) => {
    setFormData({ ...formData, [field]: value })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        <Label htmlFor="description">Beskrivning</Label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Typ *</Label>
          <select
            id="type"
            value={formData.type}
            onChange={(e) => handleChange('type', e.target.value)}
            className="w-full h-10 rounded-md border border-input bg-background px-3"
            required
          >
            <option value="product">Produkt</option>
            <option value="service">Tjänst</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="unit">Enhet</Label>
          <select
            id="unit"
            value={formData.unit}
            onChange={(e) => handleChange('unit', e.target.value)}
            className="w-full h-10 rounded-md border border-input bg-background px-3"
          >
            <option value="st">Styck (st)</option>
            <option value="tim">Timmar (tim)</option>
            <option value="dag">Dagar (dag)</option>
            <option value="m²">Kvadratmeter (m²)</option>
            <option value="burk">Burk</option>
            <option value="set">Set</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Pris (exkl. moms) *</Label>
          <Input
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={(e) => handleChange('price', Number(e.target.value))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vat_rate">Momssats (%)</Label>
          <select
            id="vat_rate"
            value={formData.vat_rate}
            onChange={(e) => handleChange('vat_rate', Number(e.target.value))}
            className="w-full h-10 rounded-md border border-input bg-background px-3"
          >
            <option value={25}>25% (Standard)</option>
            <option value={12}>12% (Livsmedel, hotell)</option>
            <option value={6}>6% (Böcker, tidningar)</option>
            <option value={0}>0% (Exempt)</option>
          </select>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          id="is_rot_rut"
          type="checkbox"
          checked={formData.is_rot_rut}
          onChange={(e) => handleChange('is_rot_rut', e.target.checked)}
          className="rounded"
        />
        <Label htmlFor="is_rot_rut">ROT/RUT-berättigat</Label>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Avbryt
        </Button>
        <Button type="submit">
          {article ? 'Spara ändringar' : 'Skapa artikel'}
        </Button>
      </DialogFooter>
    </form>
  )
}
