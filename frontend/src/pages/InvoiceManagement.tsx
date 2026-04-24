import { useState, useMemo } from 'react';
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
  Calendar,
  RotateCcw,
  Edit3,
  Mail,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Label } from '../components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { formatCurrency, formatDate, formatDateShort, cn } from '../lib/utils';
import { generateInvoicePDF, openPDFInNewTab } from '../lib/pdf';
import {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  sendInvoice,
  markInvoiceAsSent,
  markInvoiceAsPaid,
} from '../api/invoices';
import { getCustomers, getArticles } from '../api';
import type { Invoice, Customer, Article, InvoiceWithCustomer, InvoiceItem } from '../types';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
  sent: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  paid: 'bg-green-100 text-green-800 hover:bg-green-200',
  overdue: 'bg-red-100 text-red-800 hover:bg-red-200',
  cancelled: 'bg-gray-100 text-gray-500 hover:bg-gray-200',
};

const statusLabels: Record<string, string> = {
  draft: 'Utkast',
  sent: 'Skickad',
  paid: 'Betald',
  overdue: 'Förfallen',
  cancelled: 'Avbruten',
};

export default function InvoiceManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [customerFilter, setCustomerFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [sendEmail, setSendEmail] = useState('');

  const queryClient = useQueryClient();

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: getInvoices,
  });

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers,
  });

  const { data: articles } = useQuery({
    queryKey: ['articles'],
    queryFn: getArticles,
  });

  const { data: selectedInvoiceDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['invoice', selectedInvoice?.id],
    queryFn: () => getInvoice(selectedInvoice!.id),
    enabled: !!selectedInvoice && (isViewOpen || isEditOpen || isSendOpen),
  });

  const createMutation = useMutation({
    mutationFn: createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setIsCreateOpen(false);
      toast.success('Faktura skapad');
    },
    onError: () => {
      toast.error('Kunde inte skapa faktura');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Invoice> }) => updateInvoice(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', selectedInvoice?.id] });
      setIsEditOpen(false);
      toast.success('Faktura uppdaterad');
    },
    onError: () => {
      toast.error('Kunde inte uppdatera faktura');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
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

  const sendInvoiceMutation = useMutation({
    mutationFn: ({ id, email }: { id: number; email: string }) => sendInvoice(id, { to: email, attach_pdf: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setIsSendOpen(false);
      setSendEmail('');
      toast.success('Faktura skickad via e-post');
    },
    onError: () => {
      toast.error('Kunde inte skicka faktura');
    },
  });

  const filteredInvoices = useMemo(() => {
    if (!invoices) return [];
    
    return invoices.filter((invoice) => {
      const matchesSearch =
        invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (invoice.id?.toString() || '').includes(searchTerm);
      
      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
      const matchesCustomer = customerFilter === 'all' || invoice.customer_id.toString() === customerFilter;
      
      const matchesDateFrom = !dateFrom || new Date(invoice.issue_date) >= new Date(dateFrom);
      const matchesDateTo = !dateTo || new Date(invoice.issue_date) <= new Date(dateTo);
      
      return matchesSearch && matchesStatus && matchesCustomer && matchesDateFrom && matchesDateTo;
    });
  }, [invoices, searchTerm, statusFilter, customerFilter, dateFrom, dateTo]);

  const clearFilters = () => {
    setStatusFilter('all');
    setCustomerFilter('all');
    setDateFrom('');
    setDateTo('');
    setSearchTerm('');
  };

  const hasActiveFilters = statusFilter !== 'all' || customerFilter !== 'all' || dateFrom || dateTo;

  const handleGeneratePDF = async (invoice: InvoiceWithCustomer) => {
    try {
      const doc = generateInvoicePDF(invoice);
      openPDFInNewTab(doc, `Faktura-${invoice.invoice_number}.pdf`);
      toast.success('PDF öppnad i ny flik');
    } catch (error) {
      toast.error('Kunde inte generera PDF');
    }
  };

  const handleOpenSendDialog = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    const customer = customers?.find(c => c.id === invoice.customer_id);
    setSendEmail(customer?.email || '');
    setIsSendOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fakturor</h1>
          <p className="text-muted-foreground">Hantera fakturor och fakturering</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Ny Faktura
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Skapa ny faktura</DialogTitle>
              <DialogDescription>
                Fyll i uppgifterna nedan för att skapa en ny faktura.
              </DialogDescription>
            </DialogHeader>
            <CreateInvoiceForm
              customers={customers || []}
              articles={articles || []}
              onSubmit={(data) => createMutation.mutate(data)}
              onCancel={() => setIsCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Sök fakturanummer eller kund..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alla statusar</SelectItem>
                <SelectItem value="draft">Utkast</SelectItem>
                <SelectItem value="sent">Skickad</SelectItem>
                <SelectItem value="paid">Betald</SelectItem>
                <SelectItem value="overdue">Förfallen</SelectItem>
              </SelectContent>
            </Select>
            <Select value={customerFilter} onValueChange={setCustomerFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Kund" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alla kunder</SelectItem>
                {customers?.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id.toString()}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button variant="ghost" size="icon" onClick={clearFilters}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Date Filters */}
        <div className="flex gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Från:</span>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-auto"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Till:</span>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-auto"
            />
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fakturanummer</TableHead>
              <TableHead>Kund</TableHead>
              <TableHead>Datum</TableHead>
              <TableHead>Förfallodatum</TableHead>
              <TableHead>Belopp</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Åtgärder</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Inga fakturor hittades
                </TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                  <TableCell>{invoice.customer_name}</TableCell>
                  <TableCell>{formatDateShort(invoice.issue_date)}</TableCell>
                  <TableCell>
                    <span className={cn(
                      invoice.status === 'overdue' && 'text-red-600 font-medium'
                    )}>
                      {formatDateShort(invoice.due_date)}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">{formatCurrency(invoice.total_amount)}</TableCell>
                  <TableCell>
                    <Badge className={cn(statusColors[invoice.status], 'cursor-default')}>
                      {statusLabels[invoice.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedInvoice(invoice);
                          setIsViewOpen(true);
                        }}
                        title="Visa detaljer"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={async () => {
                          const details = await getInvoice(invoice.id);
                          handleGeneratePDF(details);
                        }}
                        title="Generera PDF"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      {invoice.status === 'draft' && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setIsEditOpen(true);
                            }}
                            title="Redigera"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenSendDialog(invoice)}
                            title="Skicka faktura"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteMutation.mutate(invoice.id)}
                            title="Radera"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {invoice.status === 'sent' && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenSendDialog(invoice)}
                            title="Skicka påminnelse"
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => markAsPaidMutation.mutate(invoice.id)}
                            title="Markera som betald"
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                        </>
                      )}
                      {invoice.status === 'overdue' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => markAsPaidMutation.mutate(invoice.id)}
                          title="Markera som betald"
                        >
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

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
            <div className="space-y-6">
              {/* Status Banner */}
              <div className={cn(
                'p-3 rounded-lg flex items-center justify-between',
                statusColors[selectedInvoiceDetails.status].replace('hover:bg-gray-200', '').replace('hover:bg-blue-200', '').replace('hover:bg-green-200', '').replace('hover:bg-red-200', '')
              )}>
                <span className="font-medium">{statusLabels[selectedInvoiceDetails.status]}</span>
                <span className="text-sm">{formatDate(selectedInvoiceDetails.issue_date)}</span>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Kund</Label>
                  <p className="font-medium">{selectedInvoiceDetails.customer_name}</p>
                  {selectedInvoiceDetails.customer_email && (
                    <p className="text-sm text-muted-foreground">{selectedInvoiceDetails.customer_email}</p>
                  )}
                  {selectedInvoiceDetails.customer_address && (
                    <p className="text-sm text-muted-foreground">{selectedInvoiceDetails.customer_address}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Fakturadetaljer</Label>
                  <p className="text-sm">Fakturadatum: {formatDate(selectedInvoiceDetails.issue_date)}</p>
                  <p className="text-sm">Förfallodatum: {formatDate(selectedInvoiceDetails.due_date)}</p>
                  {selectedInvoiceDetails.reference && (
                    <p className="text-sm">Referens: {selectedInvoiceDetails.reference}</p>
                  )}
                </div>
              </div>

              {/* Line Items */}
              {selectedInvoiceDetails.items && selectedInvoiceDetails.items.length > 0 && (
                <div>
                  <Label className="text-muted-foreground mb-2 block">Artiklar/Tjänster</Label>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Artikel</TableHead>
                          <TableHead className="text-right">Antal</TableHead>
                          <TableHead className="text-right">À-pris</TableHead>
                          <TableHead className="text-right">Moms</TableHead>
                          <TableHead className="text-right">Totalt</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedInvoiceDetails.items.map((item) => (
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

              {/* Summary */}
              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Nettosumma:</span>
                    <span>{formatCurrency(selectedInvoiceDetails.total_amount - selectedInvoiceDetails.vat_amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Moms:</span>
                    <span>{formatCurrency(selectedInvoiceDetails.vat_amount)}</span>
                  </div>
                  {selectedInvoiceDetails.is_rot_rut && selectedInvoiceDetails.rot_rut_amount > 0 && (
                    <div className="flex justify-between text-sm text-blue-600">
                      <span>ROT/RUT-avdrag:</span>
                      <span>-{formatCurrency(selectedInvoiceDetails.rot_rut_amount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Att betala:</span>
                    <span>{formatCurrency(selectedInvoiceDetails.total_amount)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedInvoiceDetails.notes && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider">Anteckningar</Label>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{selectedInvoiceDetails.notes}</p>
                </div>
              )}

              {/* Actions */}
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setIsViewOpen(false)}>
                  Stäng
                </Button>
                <Button
                  onClick={() => handleGeneratePDF(selectedInvoiceDetails)}
                  variant="outline"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  PDF
                </Button>
                {selectedInvoiceDetails.status === 'draft' && (
                  <>
                    <Button
                      onClick={() => {
                        setIsViewOpen(false);
                        setIsEditOpen(true);
                      }}
                    >
                      <Edit3 className="mr-2 h-4 w-4" />
                      Redigera
                    </Button>
                    <Button
                      onClick={() => handleOpenSendDialog(selectedInvoiceDetails)}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Skicka
                    </Button>
                  </>
                )}
                {(selectedInvoiceDetails.status === 'sent' || selectedInvoiceDetails.status === 'overdue') && (
                  <Button
                    onClick={() => markAsPaidMutation.mutate(selectedInvoiceDetails.id)}
                    variant="default"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Markera betald
                  </Button>
                )}
              </DialogFooter>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Edit Invoice Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Redigera faktura</DialogTitle>
            <DialogDescription>
              Redigera faktura {selectedInvoice?.invoice_number}
            </DialogDescription>
          </DialogHeader>
          {selectedInvoiceDetails && (
            <EditInvoiceForm
              invoice={selectedInvoiceDetails}
              customers={customers || []}
              articles={articles || []}
              onSubmit={(data) => updateMutation.mutate({ id: selectedInvoiceDetails.id, data })}
              onCancel={() => setIsEditOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Send Invoice Dialog */}
      <Dialog open={isSendOpen} onOpenChange={setIsSendOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Skicka faktura</DialogTitle>
            <DialogDescription>
              Faktura {selectedInvoice?.invoice_number} skickas som PDF till kund.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>E-postadress</Label>
              <Input
                type="email"
                value={sendEmail}
                onChange={(e) => setSendEmail(e.target.value)}
                placeholder="kund@exempel.se"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSendOpen(false)}>
              Avbryt
            </Button>
            <Button
              onClick={() => selectedInvoice && sendInvoiceMutation.mutate({ id: selectedInvoice.id, email: sendEmail })}
              disabled={!sendEmail || sendInvoiceMutation.isPending}
            >
              {sendInvoiceMutation.isPending ? 'Skickar...' : 'Skicka faktura'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Create Invoice Form Component
interface CreateInvoiceFormProps {
  customers: Customer[];
  articles: Article[];
  onSubmit: (data: {
    customer_id: number;
    items: { article_id: number; quantity: number; unit_price: number }[];
    issue_date: string;
    due_date: string;
    notes: string;
    is_rot_rut: boolean;
    reference?: string;
  }) => void;
  onCancel: () => void;
}

function CreateInvoiceForm({ customers, articles, onSubmit, onCancel }: CreateInvoiceFormProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<number | ''>('');
  const [items, setItems] = useState<Array<{ article_id: number; quantity: number; unit_price: number; vat_rate: number }>>([]);
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  });
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [isRotRut, setIsRotRut] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.email?.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const addItem = () => {
    setItems([...items, { article_id: 0, quantity: 1, unit_price: 0, vat_rate: 25 }]);
  };

  const updateItem = (index: number, field: string, value: number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === 'article_id') {
      const article = articles.find((a) => a.id === value);
      if (article) {
        newItems[index].unit_price = article.price;
        newItems[index].vat_rate = article.vat_rate;
      }
    }
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCustomer && items.length > 0) {
      onSubmit({
        customer_id: Number(selectedCustomer),
        items: items.filter((item) => item.article_id > 0).map(({ vat_rate, ...rest }) => rest),
        issue_date: issueDate,
        due_date: dueDate,
        notes,
        is_rot_rut: isRotRut,
        reference: reference || undefined,
      });
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  const vatAmount = items.reduce((sum, item) => {
    const itemTotal = item.quantity * item.unit_price;
    return sum + itemTotal * (item.vat_rate / 100);
  }, 0);
  const rotRutAmount = isRotRut ? subtotal * 0.3 : 0; // 30% deduction as example
  const totalAmount = subtotal + vatAmount - rotRutAmount;

  const selectedCustomerData = customers.find(c => c.id === selectedCustomer);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Selector */}
      <div className="space-y-2">
        <Label>Kund *</Label>
        <div className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Sök kund..."
                value={selectedCustomerData ? selectedCustomerData.name : customerSearch}
                onChange={(e) => {
                  if (!selectedCustomerData) {
                    setCustomerSearch(e.target.value);
                    setShowCustomerDropdown(true);
                  }
                }}
                onFocus={() => setShowCustomerDropdown(true)}
                className="pl-9"
              />
            </div>
            {selectedCustomerData && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSelectedCustomer('');
                  setCustomerSearch('');
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {showCustomerDropdown && filteredCustomers.length > 0 && !selectedCustomerData && (
            <div className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
              {filteredCustomers.map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => {
                    setSelectedCustomer(customer.id);
                    setCustomerSearch(customer.name);
                    setShowCustomerDropdown(false);
                  }}
                >
                  <div className="font-medium">{customer.name}</div>
                  <div className="text-sm text-muted-foreground">{customer.email}</div>
                </button>
              ))}
            </div>
          )}
        </div>
        {selectedCustomerData && (
          <div className="bg-gray-50 p-3 rounded-lg text-sm">
            <p><strong>{selectedCustomerData.name}</strong></p>
            <p>{selectedCustomerData.address}</p>
            <p>{selectedCustomerData.postal_code} {selectedCustomerData.city}</p>
            <p>{selectedCustomerData.email}</p>
            {selectedCustomerData.org_number && <p>Org.nr: {selectedCustomerData.org_number}</p>}
          </div>
        )}
      </div>

      {/* Dates and Reference */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Fakturadatum *</Label>
          <Input
            type="date"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Förfallodatum *</Label>
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Referens</Label>
          <Input
            placeholder="t.ex. Order #123"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
          />
        </div>
      </div>

      {/* ROT/RUT Toggle */}
      <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
        <input
          type="checkbox"
          id="rot-rut"
          checked={isRotRut}
          onChange={(e) => setIsRotRut(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <Label htmlFor="rot-rut" className="text-sm font-medium cursor-pointer mb-0">
          ROT/RUT-berättigat arbete (30% avdrag tillämpas)
        </Label>
      </div>

      {/* Line Items */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Artiklar/Tjänster *</Label>
        </div>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <Select
                  value={item.article_id.toString()}
                  onValueChange={(value) => updateItem(index, 'article_id', Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Välj artikel..." />
                  </SelectTrigger>
                  <SelectContent>
                    {articles.map((article) => (
                      <SelectItem key={article.id} value={article.id.toString()}>
                        {article.name} - {formatCurrency(article.price)}/{article.unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-24">
                <Input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                  placeholder="Antal"
                />
              </div>
              <div className="w-28">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unit_price}
                  onChange={(e) => updateItem(index, 'unit_price', Number(e.target.value))}
                  placeholder="À-pris"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeItem(index)}
                className="shrink-0"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={addItem}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Lägg till artikel
        </Button>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label>Anteckningar / Villkor</Label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="Ange eventuella anteckningar eller betalningsvillkor..."
          rows={3}
        />
      </div>

      {/* Summary */}
      <div className="border-t pt-4 bg-gray-50 p-4 rounded-lg">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Nettosumma:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Moms:</span>
            <span>{formatCurrency(vatAmount)}</span>
          </div>
          {isRotRut && rotRutAmount > 0 && (
            <div className="flex justify-between text-sm text-blue-600">
              <span>ROT/RUT-avdrag:</span>
              <span>-{formatCurrency(rotRutAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold pt-2 border-t">
            <span>Att betala:</span>
            <span>{formatCurrency(totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <DialogFooter className="gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Avbryt
        </Button>
        <Button
          type="submit"
          disabled={items.length === 0 || !selectedCustomer}
        >
          Skapa faktura
        </Button>
      </DialogFooter>
    </form>
  );
}

// Edit Invoice Form Component
interface EditInvoiceFormProps {
  invoice: InvoiceWithCustomer;
  customers: Customer[];
  articles: Article[];
  onSubmit: (data: Partial<Invoice>) => void;
  onCancel: () => void;
}

function EditInvoiceForm({ invoice, customers, articles, onSubmit, onCancel }: EditInvoiceFormProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<number>(invoice.customer_id);
  const [items, setItems] = useState<Array<{ article_id: number; quantity: number; unit_price: number; vat_rate: number }>>(
    invoice.items?.map(item => ({ 
      article_id: item.article_id, 
      quantity: item.quantity, 
      unit_price: item.unit_price,
      vat_rate: item.vat_rate 
    })) || []
  );
  const [issueDate, setIssueDate] = useState(invoice.issue_date);
  const [dueDate, setDueDate] = useState(invoice.due_date);
  const [reference, setReference] = useState(invoice.reference || '');
  const [notes, setNotes] = useState(invoice.notes || '');
  const [isRotRut, setIsRotRut] = useState(invoice.is_rot_rut);

  const addItem = () => {
    setItems([...items, { article_id: 0, quantity: 1, unit_price: 0, vat_rate: 25 }]);
  };

  const updateItem = (index: number, field: string, value: number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === 'article_id') {
      const article = articles.find((a) => a.id === value);
      if (article) {
        newItems[index].unit_price = article.price;
        newItems[index].vat_rate = article.vat_rate;
      }
    }
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
    const vatAmount = items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unit_price;
      return sum + itemTotal * (item.vat_rate / 100);
    }, 0);
    const rotRutAmount = isRotRut ? subtotal * 0.3 : 0;
    const totalAmount = subtotal + vatAmount - rotRutAmount;

    onSubmit({
      customer_id: selectedCustomer,
      issue_date: issueDate,
      due_date: dueDate,
      notes,
      is_rot_rut: isRotRut,
      total_amount: totalAmount,
      vat_amount: vatAmount,
      rot_rut_amount: rotRutAmount,
      reference: reference || undefined,
    });
  };

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  const vatAmount = items.reduce((sum, item) => {
    const itemTotal = item.quantity * item.unit_price;
    return sum + itemTotal * (item.vat_rate / 100);
  }, 0);
  const rotRutAmount = isRotRut ? subtotal * 0.3 : 0;
  const totalAmount = subtotal + vatAmount - rotRutAmount;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer */}
      <div className="space-y-2">
        <Label>Kund *</Label>
        <Select
          value={selectedCustomer.toString()}
          onValueChange={(value) => setSelectedCustomer(Number(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Välj kund..." />
          </SelectTrigger>
          <SelectContent>
            {customers.map((customer) => (
              <SelectItem key={customer.id} value={customer.id.toString()}>
                {customer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Dates and Reference */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Fakturadatum *</Label>
          <Input
            type="date"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Förfallodatum *</Label>
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Referens</Label>
          <Input
            placeholder="t.ex. Order #123"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
          />
        </div>
      </div>

      {/* ROT/RUT */}
      <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
        <input
          type="checkbox"
          id="edit-rot-rut"
          checked={isRotRut}
          onChange={(e) => setIsRotRut(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <Label htmlFor="edit-rot-rut" className="text-sm font-medium cursor-pointer mb-0">
          ROT/RUT-berättigat arbete
        </Label>
      </div>

      {/* Line Items */}
      <div className="space-y-3">
        <Label>Artiklar/Tjänster</Label>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <Select
                  value={item.article_id.toString()}
                  onValueChange={(value) => updateItem(index, 'article_id', Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Välj artikel..." />
                  </SelectTrigger>
                  <SelectContent>
                    {articles.map((article) => (
                      <SelectItem key={article.id} value={article.id.toString()}>
                        {article.name} - {formatCurrency(article.price)}/{article.unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-24">
                <Input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                />
              </div>
              <div className="w-28">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unit_price}
                  onChange={(e) => updateItem(index, 'unit_price', Number(e.target.value))}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeItem(index)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" onClick={addItem} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Lägg till artikel
        </Button>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label>Anteckningar</Label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
          rows={3}
        />
      </div>

      {/* Summary */}
      <div className="border-t pt-4 bg-gray-50 p-4 rounded-lg">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Nettosumma:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Moms:</span>
            <span>{formatCurrency(vatAmount)}</span>
          </div>
          {isRotRut && rotRutAmount > 0 && (
            <div className="flex justify-between text-sm text-blue-600">
              <span>ROT/RUT-avdrag:</span>
              <span>-{formatCurrency(rotRutAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold pt-2 border-t">
            <span>Att betala:</span>
            <span>{formatCurrency(totalAmount)}</span>
          </div>
        </div>
      </div>

      <DialogFooter className="gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Avbryt
        </Button>
        <Button type="submit" disabled={items.length === 0}>
          Spara ändringar
        </Button>
      </DialogFooter>
    </form>
  );
}
