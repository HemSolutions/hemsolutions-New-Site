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
  overdue: 'Försenad',
  cancelled: 'Avbruten',
};

const statusBadgeColors: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-800',
  sent: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-500',
};

// Mock data for fallback
const mockInvoices: Invoice[] = [
  {
    id: 1,
    invoice_number: 'F-2024-001',
    customer_id: 1,
    customer_name: 'Test Kund AB',
    issue_date: '2024-01-15',
    due_date: '2024-02-15',
    total_amount: 12500,
    vat_amount: 2500,
    status: 'paid',
    is_rot_rut: false,
    rot_rut_amount: 0,
    notes: '',
    reference: '',
    created_at: '2024-01-15',
    updated_at: '2024-01-15',
  },
  {
    id: 2,
    invoice_number: 'F-2024-002',
    customer_id: 2,
    customer_name: 'Anders Svensson',
    issue_date: '2024-01-20',
    due_date: '2024-02-20',
    total_amount: 8500,
    vat_amount: 1700,
    status: 'sent',
    is_rot_rut: false,
    rot_rut_amount: 0,
    notes: '',
    reference: '',
    created_at: '2024-01-20',
    updated_at: '2024-01-20',
  },
];

export default function InvoiceManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [sendEmail, setSendEmail] = useState('');
  const [sendSubject, setSendSubject] = useState('');
  const [sendMessage, setSendMessage] = useState('');
  const [newInvoice, setNewInvoice] = useState({
    customer_id: '',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    notes: '',
    reference: '',
    items: [] as { article_id: string; quantity: string; unit_price: string; description: string }[],
  });
  const [activeTab, setActiveTab] = useState('list');
  const queryClient = useQueryClient();

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: getInvoices,
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers,
  });

  const { data: articles = [] } = useQuery({
    queryKey: ['articles'],
    queryFn: getArticles,
  });

  const createMutation = useMutation({
    mutationFn: createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setShowCreateDialog(false);
      toast.success('Faktura skapad!');
      setNewInvoice({
        customer_id: '',
        issue_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        notes: '',
        reference: '',
        items: [],
      });
    },
    onError: (error: any) => {
      toast.error('Kunde inte skapa faktura: ' + (error?.response?.data?.error || error.message));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Invoice> }) => updateInvoice(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Faktura uppdaterad!');
    },
    onError: (error: any) => {
      toast.error('Kunde inte uppdatera: ' + (error?.response?.data?.error || error.message));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setShowDeleteDialog(false);
      setSelectedInvoice(null);
      toast.success('Faktura borttagen!');
    },
    onError: (error: any) => {
      toast.error('Kunde inte ta bort: ' + (error?.response?.data?.error || error.message));
    },
  });

  const filteredInvoices = useMemo(() => {
    let result = invoices.length > 0 ? invoices : mockInvoices;
    if (statusFilter !== 'all') {
      result = result.filter((inv: Invoice) => inv.status === statusFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((inv: Invoice) =>
        inv.invoice_number?.toLowerCase().includes(q) ||
        inv.customer_name?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [invoices, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    const list = invoices.length > 0 ? invoices : mockInvoices;
    return {
      total: list.length,
      totalAmount: list.reduce((sum: number, inv: Invoice) => sum + (inv.total_amount || 0), 0),
      paid: list.filter((inv: Invoice) => inv.status === 'paid').length,
      paidAmount: list.filter((inv: Invoice) => inv.status === 'paid').reduce((sum: number, inv: Invoice) => sum + (inv.total_amount || 0), 0),
      outstanding: list.filter((inv: Invoice) => inv.status === 'sent' || inv.status === 'overdue').length,
      outstandingAmount: list.filter((inv: Invoice) => inv.status === 'sent' || inv.status === 'overdue').reduce((sum: number, inv: Invoice) => sum + (inv.total_amount || 0), 0),
      overdue: list.filter((inv: Invoice) => inv.status === 'overdue').length,
    };
  }, [invoices]);

  const handleCreateInvoice = () => {
    const items = newInvoice.items
      .filter((item: any) => item.article_id && item.quantity)
      .map((item: any) => ({
        article_id: parseInt(item.article_id),
        quantity: parseFloat(item.quantity),
        unit_price: parseFloat(item.unit_price) || 0,
      }));

    if (!newInvoice.customer_id || items.length === 0) {
      toast.error('Välj kund och lägg till minst en artikel');
      return;
    }

    createMutation.mutate({
      customer_id: parseInt(newInvoice.customer_id),
      items,
      issue_date: newInvoice.issue_date,
      due_date: newInvoice.due_date,
      notes: newInvoice.notes,
      is_rot_rut: false,
      reference: newInvoice.reference,
    });
  };

  const handlePrintPDF = (invoice: Invoice) => {
    const pdfData: any = {
      ...invoice,
      items: (invoice as any).items || [],
    };
    const doc = generateInvoicePDF(pdfData);
    openPDFInNewTab(doc, `Faktura_${invoice.invoice_number}.pdf`);
  };

  const handleSendInvoice = () => {
    // TODO: Implement email sending via backend
    toast.success('Faktura skickad! (simulerat)');
    setShowSendDialog(false);
    if (selectedInvoice) {
      updateMutation.mutate({ id: selectedInvoice.id, data: { status: 'sent' } });
    }
  };

  const addItem = () => {
    setNewInvoice(prev => ({
      ...prev,
      items: [...prev.items, { article_id: '', quantity: '1', unit_price: '0', description: '' }],
    }));
  };

  const updateItem = (index: number, field: string, value: string) => {
    const updated = [...newInvoice.items];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'article_id') {
      const article = articles.find((a: Article) => a.id === parseInt(value));
      if (article) {
        updated[index].unit_price = String(article.price);
      }
    }
    setNewInvoice(prev => ({ ...prev, items: updated }));
  };

  const removeItem = (index: number) => {
    setNewInvoice(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const calculateTotal = () => {
    return newInvoice.items.reduce((total: number, item: any) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unit_price) || 0;
      return total + qty * price;
    }, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fakturor</h1>
          <p className="text-sm text-gray-500">Hantera fakturor, ROT/RUT och påminnelser</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Ny faktura
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Totalt antal</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Totalt belopp</p>
          <p className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Obetalda</p>
          <p className="text-2xl font-bold text-amber-600">{stats.outstanding}</p>
          <p className="text-xs text-gray-500">{formatCurrency(stats.outstandingAmount)}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Betald</p>
          <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
          <p className="text-xs text-gray-500">{formatCurrency(stats.paidAmount)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Sök fakturanummer eller kund..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alla</SelectItem>
            <SelectItem value="draft">Utkast</SelectItem>
            <SelectItem value="sent">Skickad</SelectItem>
            <SelectItem value="paid">Betald</SelectItem>
            <SelectItem value="overdue">Försenad</SelectItem>
            <SelectItem value="cancelled">Avbruten</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invoice Table */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fakturanr</TableHead>
              <TableHead>Kund</TableHead>
              <TableHead>Datum</TableHead>
              <TableHead>Förfallodatum</TableHead>
              <TableHead className="text-right">Belopp</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Åtgärder</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">Laddar...</TableCell>
              </TableRow>
            ) : filteredInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">Inga fakturor hittades</TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((invoice: Invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                  <TableCell>{invoice.customer_name}</TableCell>
                  <TableCell>{formatDateShort(invoice.issue_date)}</TableCell>
                  <TableCell>{formatDateShort(invoice.due_date)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(invoice.total_amount)}</TableCell>
                  <TableCell>
                    <Badge className={cn(statusBadgeColors[invoice.status] || 'bg-gray-100')}>
                      {statusLabels[invoice.status] || invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setSelectedInvoice(invoice); setShowViewDialog(true); }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handlePrintPDF(invoice)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      {invoice.status === 'draft' && (
                        <Button variant="ghost" size="icon" onClick={() => { setSelectedInvoice(invoice); setShowSendDialog(true); }}>
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => { setSelectedInvoice(invoice); setShowDeleteDialog(true); }}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Skapa ny faktura</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Kund</Label>
                <Select value={newInvoice.customer_id} onValueChange={(v) => setNewInvoice(prev => ({ ...prev, customer_id: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Välj kund" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((c: Customer) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Fakturadatum</Label>
                <Input type="date" value={newInvoice.issue_date} onChange={(e) => setNewInvoice(prev => ({ ...prev, issue_date: e.target.value }))} />
              </div>
              <div>
                <Label>Förfallodatum</Label>
                <Input type="date" value={newInvoice.due_date} onChange={(e) => setNewInvoice(prev => ({ ...prev, due_date: e.target.value }))} />
              </div>
              <div>
                <Label>Referens</Label>
                <Input value={newInvoice.reference} onChange={(e) => setNewInvoice(prev => ({ ...prev, reference: e.target.value }))} />
              </div>
            </div>

            <div>
              <Label>Artiklar</Label>
              {newInvoice.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 mt-2 items-end">
                  <div className="col-span-5">
                    <Select value={item.article_id} onValueChange={(v) => updateItem(index, 'article_id', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Välj artikel" />
                      </SelectTrigger>
                      <SelectContent>
                        {articles.map((a: Article) => (
                          <SelectItem key={a.id} value={String(a.id)}>{a.name} - {formatCurrency(a.price)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Input type="number" placeholder="Antal" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', e.target.value)} />
                  </div>
                  <div className="col-span-3">
                    <Input type="number" placeholder="Pris" value={item.unit_price} onChange={(e) => updateItem(index, 'unit_price', e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <Button variant="ghost" size="icon" onClick={() => removeItem(index)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" onClick={addItem} className="mt-2">
                <Plus className="h-4 w-4 mr-2" />
                Lägg till artikel
              </Button>
            </div>

            <div>
              <Label>Anteckningar</Label>
              <textarea
                className="w-full border rounded-md p-2 text-sm min-h-[80px]"
                value={newInvoice.notes}
                onChange={(e) => setNewInvoice(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-lg font-bold">
                Totalt: {formatCurrency(calculateTotal())}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Avbryt</Button>
                <Button onClick={handleCreateInvoice} disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Skapar...' : 'Skapa faktura'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Faktura {selectedInvoice?.invoice_number}</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">Kund:</span> {selectedInvoice.customer_name}</div>
                <div><span className="text-gray-500">Status:</span> {statusLabels[selectedInvoice.status]}</div>
                <div><span className="text-gray-500">Datum:</span> {formatDate(selectedInvoice.issue_date)}</div>
                <div><span className="text-gray-500">Förfallodatum:</span> {formatDate(selectedInvoice.due_date)}</div>
                <div><span className="text-gray-500">Belopp:</span> {formatCurrency(selectedInvoice.total_amount)}</div>
                <div><span className="text-gray-500">Moms:</span> {formatCurrency(selectedInvoice.vat_amount)}</div>
              </div>
              {selectedInvoice.notes && (
                <div>
                  <span className="text-gray-500 text-sm">Anteckningar:</span>
                  <p className="text-sm mt-1">{selectedInvoice.notes}</p>
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <Button onClick={() => handlePrintPDF(selectedInvoice)}>
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                {selectedInvoice.status === 'draft' && (
                  <Button onClick={() => updateMutation.mutate({ id: selectedInvoice.id, data: { status: 'sent' } })}>
                    <Send className="h-4 w-4 mr-2" />
                    Markera skickad
                  </Button>
                )}
                {selectedInvoice.status === 'sent' && (
                  <Button onClick={() => updateMutation.mutate({ id: selectedInvoice.id, data: { status: 'paid' } })}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Markera betald
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ta bort faktura</DialogTitle>
            <DialogDescription>
              Är du säker på att du vill ta bort faktura {selectedInvoice?.invoice_number}? Detta går inte att ångra.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Avbryt</Button>
            <Button variant="destructive" onClick={() => selectedInvoice && deleteMutation.mutate(selectedInvoice.id)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? 'Tar bort...' : 'Ta bort'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Skicka faktura</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>E-post</Label>
              <Input value={sendEmail} onChange={(e) => setSendEmail(e.target.value)} placeholder="kund@exempel.se" />
            </div>
            <div>
              <Label>Ämne</Label>
              <Input value={sendSubject} onChange={(e) => setSendSubject(e.target.value)} placeholder="Faktura från HemSolutions" />
            </div>
            <div>
              <Label>Meddelande</Label>
              <textarea className="w-full border rounded-md p-2 text-sm min-h-[80px]" value={sendMessage} onChange={(e) => setSendMessage(e.target.value)} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSendDialog(false)}>Avbryt</Button>
              <Button onClick={handleSendInvoice}>
                <Mail className="h-4 w-4 mr-2" />
                Skicka
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
