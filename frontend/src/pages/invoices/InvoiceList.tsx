import { useState, useMemo, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Search,
  Download,
  Eye,
  Trash2,
  Send,
  CheckCircle,
  FileText,
  X,
  Filter,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Printer,
  MoreHorizontal,
  Edit3,
  AlertCircle,
  Clock,
  Check,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { formatCurrency, formatDateShort, cn } from '../../lib/utils';
import { generateInvoicePDF, openPDFInNewTab } from '../../lib/pdf';
import {
  getInvoices,
  getInvoice,
  deleteInvoice,
  markInvoiceAsSent,
  markInvoiceAsPaid,
} from '../../api/invoices';
import type { Invoice, InvoiceWithCustomer } from '../../types';
import { toast } from 'sonner';
import InvoiceForm from './InvoiceForm';

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  draft: { label: 'Utkast', color: 'bg-gray-100 text-gray-800', icon: <FileText className="w-3.5 h-3.5" /> },
  sent: { label: 'Skickad', color: 'bg-blue-100 text-blue-800', icon: <Send className="w-3.5 h-3.5" /> },
  paid: { label: 'Betald', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  overdue: { label: 'Försenad', color: 'bg-red-100 text-red-800', icon: <AlertCircle className="w-3.5 h-3.5" /> },
  cancelled: { label: 'Avbruten', color: 'bg-gray-100 text-gray-500', icon: <X className="w-3.5 h-3.5" /> },
};

const filters = [
  { key: 'all', label: 'Alla' },
  { key: 'draft', label: 'Utkast' },
  { key: 'sent', label: 'Skickade' },
  { key: 'paid', label: 'Betalda' },
  { key: 'overdue', label: 'Försenade' },
];

export default function InvoiceList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const [invoiceType, setInvoiceType] = useState<'invoice' | 'rot' | 'rut'>('invoice');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const searchRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: getInvoices,
  });

  const { data: selectedInvoiceDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['invoice', selectedInvoice?.id],
    queryFn: () => getInvoice(selectedInvoice!.id),
    enabled: !!selectedInvoice && (isViewOpen || isEditOpen),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setIsDeleteOpen(false);
      setInvoiceToDelete(null);
      toast.success('Faktura raderad');
    },
    onError: () => {
      toast.error('Kunde inte radera faktura');
    },
  });

  const markAsSentMutation = useMutation({
    mutationFn: markInvoiceAsSent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Faktura markerad som skickad');
    },
    onError: () => {
      toast.error('Kunde inte markera som skickad');
    },
  });

  const markAsPaidMutation = useMutation({
    mutationFn: markInvoiceAsPaid,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Faktura markerad som betald');
    },
    onError: () => {
      toast.error('Kunde inte markera som betald');
    },
  });

  const filteredInvoices = useMemo(() => {
    if (!invoices) return [];
    return invoices.filter((invoice) => {
      const matchesSearch =
        invoice.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (invoice.id?.toString() || '').includes(searchTerm);
      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchTerm, statusFilter]);

  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredInvoices.slice(start, start + itemsPerPage);
  }, [filteredInvoices, currentPage]);

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

  const handleView = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsViewOpen(true);
  };

  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsEditOpen(true);
  };

  const handleDelete = (invoice: Invoice) => {
    setInvoiceToDelete(invoice);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (invoiceToDelete) {
      deleteMutation.mutate(invoiceToDelete.id);
    }
  };

  const handleGeneratePDF = async (invoice: Invoice) => {
    try {
      const details = await getInvoice(invoice.id);
      const doc = generateInvoicePDF(details);
      openPDFInNewTab(doc, `Faktura-${invoice.invoice_number}.pdf`);
      toast.success('PDF genererad');
    } catch (error) {
      toast.error('Kunde inte generera PDF');
    }
  };

  const handleCreateNew = (type: 'invoice' | 'rot' | 'rut') => {
    setInvoiceType(type);
    setSelectedInvoice(null);
    setIsCreateOpen(true);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchTerm]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-muted-foreground">Laddar fakturor...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fakturor</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {filteredInvoices.length} fakturor totalt
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Ny faktura
              <ChevronDown className="ml-2 h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => handleCreateNew('invoice')}>
              <FileText className="mr-2 h-4 w-4" />
              Skapa ny faktura
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleCreateNew('rot')}>
              <FileText className="mr-2 h-4 w-4 text-orange-500" />
              Skapa ny ROT
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleCreateNew('rut')}>
              <FileText className="mr-2 h-4 w-4 text-green-500" />
              Skapa ny RUT
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
        <div className="flex flex-wrap gap-1.5">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={cn(
                'px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors',
                statusFilter === f.key
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex-1 w-full lg:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchRef}
              placeholder="Sök fakturanummer, kund..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full lg:w-80"
            />
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="border rounded-lg bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
              <TableHead className="w-[140px]">Fakturanummer</TableHead>
              <TableHead>Kund</TableHead>
              <TableHead className="w-[110px]">Datum</TableHead>
              <TableHead className="w-[120px] text-right">Belopp</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="w-[160px] text-right">Åtgärder</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-3 text-gray-300" />
                  <p>Inga fakturor hittades</p>
                  <p className="text-sm mt-1">Prova att ändra sökningen eller filtren</p>
                </TableCell>
              </TableRow>
            ) : (
              paginatedInvoices.map((invoice) => {
                const status = statusConfig[invoice.status];
                return (
                  <TableRow key={invoice.id} className="hover:bg-gray-50/50">
                    <TableCell className="font-medium text-slate-900">
                      {invoice.invoice_number}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-900">{invoice.customer_name}</div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {formatDateShort(invoice.issue_date)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(invoice.total_amount)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          status.color,
                          'font-medium flex items-center gap-1 w-fit cursor-default border-0'
                        )}
                      >
                        {status.icon}
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleView(invoice)}
                          title="Visa"
                        >
                          <Eye className="h-4 w-4 text-gray-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(invoice)}
                          title="Redigera"
                        >
                          <Edit3 className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleGeneratePDF(invoice)}
                          title="PDF"
                        >
                          <Download className="h-4 w-4 text-gray-600" />
                        </Button>
                        {invoice.status === 'draft' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => markAsSentMutation.mutate(invoice.id)}
                            title="Skicka"
                          >
                            <Send className="h-4 w-4 text-blue-600" />
                          </Button>
                        )}
                        {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => markAsPaidMutation.mutate(invoice.id)}
                            title="Markera betald"
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDelete(invoice)}
                          title="Radera"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50/50">
            <div className="text-sm text-muted-foreground">
              Visar {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredInvoices.length)} av {filteredInvoices.length}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm px-2">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Invoice Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto p-0 gap-0">
          <InvoiceForm
            mode="create"
            invoiceType={invoiceType}
            onClose={() => setIsCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Invoice Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto p-0 gap-0">
          {selectedInvoiceDetails && (
            <InvoiceForm
              mode="edit"
              invoice={selectedInvoiceDetails}
              invoiceType={invoiceType}
              onClose={() => setIsEditOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Invoice Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Faktura {selectedInvoice?.invoice_number}
            </DialogTitle>
          </DialogHeader>
          {isLoadingDetails ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : selectedInvoiceDetails ? (
            <InvoiceView
              invoice={selectedInvoiceDetails}
              onClose={() => setIsViewOpen(false)}
              onGeneratePDF={() => handleGeneratePDF(selectedInvoiceDetails)}
              onEdit={() => {
                setIsViewOpen(false);
                handleEdit(selectedInvoice!);
              }}
              onMarkPaid={() => markAsPaidMutation.mutate(selectedInvoiceDetails.id)}
              onMarkSent={() => markAsSentMutation.mutate(selectedInvoiceDetails.id)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Radera faktura</DialogTitle>
            <DialogDescription>
              Är du säker på att du vill radera faktura{' '}
              <span className="font-medium">{invoiceToDelete?.invoice_number}</span>? Denna åtgärd kan inte ångras.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Avbryt
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Raderar...' : 'Radera'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Invoice View Component
function InvoiceView({
  invoice,
  onClose,
  onGeneratePDF,
  onEdit,
  onMarkPaid,
  onMarkSent,
}: {
  invoice: InvoiceWithCustomer;
  onClose: () => void;
  onGeneratePDF: () => void;
  onEdit: () => void;
  onMarkPaid: () => void;
  onMarkSent: () => void;
}) {
  const status = statusConfig[invoice.status];
  const subtotal = invoice.total_amount - invoice.vat_amount;

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <div className={cn('p-3 rounded-lg flex items-center justify-between', status.color)}>
        <span className="font-medium flex items-center gap-2">
          {status.icon}
          {status.label}
        </span>
        <span className="text-sm">{formatDateShort(invoice.issue_date)}</span>
      </div>

      {/* Customer & Invoice Info */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Kund</h3>
          <p className="font-medium text-lg">{invoice.customer_name}</p>
          {invoice.customer_email && <p className="text-sm text-muted-foreground">{invoice.customer_email}</p>}
          {invoice.customer_address && <p className="text-sm text-muted-foreground">{invoice.customer_address}</p>}
          {invoice.customer_phone && <p className="text-sm text-muted-foreground">{invoice.customer_phone}</p>}
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Fakturadetaljer</h3>
          <div className="text-sm space-y-1">
            <p>Fakturadatum: <span className="font-medium">{formatDateShort(invoice.issue_date)}</span></p>
            <p>Förfallodatum: <span className="font-medium">{formatDateShort(invoice.due_date)}</span></p>
            {invoice.reference && <p>Referens: <span className="font-medium">{invoice.reference}</span></p>}
          </div>
        </div>
      </div>

      {/* Line Items */}
      {invoice.items && invoice.items.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Artiklar / Tjänster
          </h3>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Beskrivning</TableHead>
                  <TableHead className="text-right">Antal</TableHead>
                  <TableHead className="text-right">À-pris</TableHead>
                  <TableHead className="text-right">Moms</TableHead>
                  <TableHead className="text-right">Belopp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.article_name}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                    <TableCell className="text-right">{item.vat_rate}%</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.total_price)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Totals */}
      <div className="border-t pt-4">
        <div className="max-w-xs ml-auto space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Nettosumma:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Moms:</span>
            <span>{formatCurrency(invoice.vat_amount)}</span>
          </div>
          {invoice.is_rot_rut && invoice.rot_rut_amount > 0 && (
            <div className="flex justify-between text-sm text-blue-600">
              <span>ROT/RUT-avdrag:</span>
              <span>-{formatCurrency(invoice.rot_rut_amount)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold pt-2 border-t">
            <span>Att betala:</span>
            <span>{formatCurrency(invoice.total_amount)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="bg-gray-50 p-3 rounded-lg">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Anteckningar
          </h3>
          <p className="text-sm whitespace-pre-wrap">{invoice.notes}</p>
        </div>
      )}

      {/* Actions */}
      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={onClose}>
          Stäng
        </Button>
        <Button variant="outline" onClick={onGeneratePDF}>
          <Download className="mr-2 h-4 w-4" />
          PDF
        </Button>
        <Button variant="outline" onClick={onGeneratePDF}>
          <Printer className="mr-2 h-4 w-4" />
          Skriv ut
        </Button>
        {invoice.status === 'draft' && (
          <>
            <Button variant="outline" onClick={onEdit}>
              <Edit3 className="mr-2 h-4 w-4" />
              Redigera
            </Button>
            <Button onClick={onMarkSent}>
              <Send className="mr-2 h-4 w-4" />
              Skicka
            </Button>
          </>
        )}
        {(invoice.status === 'sent' || invoice.status === 'overdue') && (
          <Button onClick={onMarkPaid} className="bg-green-600 hover:bg-green-700">
            <CheckCircle className="mr-2 h-4 w-4" />
            Markera betald
          </Button>
        )}
      </DialogFooter>
    </div>
  );
}
