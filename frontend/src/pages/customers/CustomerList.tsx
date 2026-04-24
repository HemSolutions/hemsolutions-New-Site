import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowUpDown,
  Building2,
  User,
} from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'
import { Badge } from '../../components/ui/badge'
import { getCustomersPaginated, deleteCustomer } from '../../api'
import type { Customer } from '../../types'

const ITEMS_PER_PAGE = 15

export default function CustomerList() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState<string>('name')
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC')
  const [deleteConfirm, setDeleteConfirm] = useState<Customer | null>(null)
  const [filterType, setFilterType] = useState<'all' | 'company' | 'private'>('all')

  const { data, isLoading } = useQuery({
    queryKey: ['customers', currentPage, searchTerm, sortBy, sortOrder, filterType],
    queryFn: () =>
      getCustomersPaginated({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: searchTerm,
        sort: sortBy,
        order: sortOrder,
      }),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      setDeleteConfirm(null)
    },
  })

  const customers = data?.customers ?? []
  const pagination = data?.pagination

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')
    } else {
      setSortBy(column)
      setSortOrder('ASC')
    }
    setCurrentPage(1)
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const getCustomerType = (customer: Customer) => {
    return customer.org_number ? 'company' : 'private'
  }

  const filteredCustomers = customers.filter((customer) => {
    if (filterType === 'all') return true
    return getCustomerType(customer) === filterType
  })

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kunder</h1>
          <p className="text-sm text-gray-500 mt-1">
            {pagination?.total ?? 0} kunder totalt
          </p>
        </div>
        <Button onClick={() => navigate('/admin/customers/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Ny kund
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Sök kundnummer, namn, e-post, telefon..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterType === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('all')}
          >
            <Filter className="mr-1 h-3 w-3" />
            Alla
          </Button>
          <Button
            variant={filterType === 'company' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('company')}
          >
            <Building2 className="mr-1 h-3 w-3" />
            Företag
          </Button>
          <Button
            variant={filterType === 'private' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('private')}
          >
            <User className="mr-1 h-3 w-3" />
            Privat
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-[100px]">
                <button
                  className="flex items-center gap-1 font-semibold text-gray-700 hover:text-gray-900"
                  onClick={() => handleSort('customer_number')}
                >
                  Kundnr
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  className="flex items-center gap-1 font-semibold text-gray-700 hover:text-gray-900"
                  onClick={() => handleSort('name')}
                >
                  Namn
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>E-post</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Adress</TableHead>
              <TableHead className="text-right">Åtgärder</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
                    Laddar kunder...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                  <User className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-lg font-medium">Inga kunder hittades</p>
                  <p className="text-sm">
                    {searchTerm
                      ? 'Försök med en annan sökterm'
                      : 'Klicka på "Ny kund" för att lägga till en kund'}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => (
                <TableRow key={customer.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      {customer.customer_number}
                      {getCustomerType(customer) === 'company' ? (
                        <Badge variant="secondary" className="text-xs">
                          <Building2 className="h-3 w-3 mr-1" />
                          Företag
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          <User className="h-3 w-3 mr-1" />
                          Privat
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-gray-900">{customer.name}</div>
                    {customer.org_number && (
                      <div className="text-xs text-gray-500">Org.nr: {customer.org_number}</div>
                    )}
                    {customer.person_number && (
                      <div className="text-xs text-gray-500">Pers.nr: {customer.person_number}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Mail className="h-3 w-3 text-gray-400" />
                      {customer.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {customer.phone && (
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3 text-gray-400" />
                          {customer.phone}
                        </div>
                      )}
                      {customer.mobile_phone && (
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3 text-gray-400" />
                          {customer.mobile_phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-start gap-1 text-sm">
                      <MapPin className="h-3 w-3 text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        {customer.address && <div>{customer.address}</div>}
                        <div className="text-gray-500">
                          {customer.postal_code} {customer.city}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/admin/customers/edit/${customer.id}`)}
                        title="Redigera"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteConfirm(customer)}
                        title="Ta bort"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Visar {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, pagination.total)} av{' '}
            {pagination.total} kunder
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600">
              Sida {currentPage} av {pagination.total_pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(pagination.total_pages, p + 1))}
              disabled={currentPage === pagination.total_pages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ta bort kund</DialogTitle>
            <DialogDescription>
              Är du säker på att du vill ta bort{' '}
              <span className="font-semibold">{deleteConfirm?.name}</span>? Denna åtgärd kan inte
              ångras.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Avbryt
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Tar bort...' : 'Ta bort'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
