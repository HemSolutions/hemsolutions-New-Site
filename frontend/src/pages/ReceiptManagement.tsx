import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Search,
  Download,
  Eye,
  Trash2,
  FileText,
  X,
  Filter,
  Calendar,
  RotateCcw,
  Mail,
  CreditCard,
  Banknote,
  Smartphone,
  ArrowRightLeft,
  Printer,
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
import { generateReceiptPDF, openPDFInNewTab } from '../lib/pdf';
import {
  getReceipts,
  getReceipt,
  createReceipt,
  deleteReceipt,
  emailReceipt,
} from '../api/receipts';
import { getCustomers, getArticles } from '../api';
import type { Receipt, Customer, Article } from '../types';
import { toast } from 'sonner';

const paymentMethodLabels: Record<string, string> = {
  swish: 'Swish',
  card: 'Kort',
  bank_transfer: 'Banköverföring',
  bank: 'Banköverföring',
  cash: 'Kontant',
};

const paymentMethodIcons: Record<string, React.ReactNode> = {
  swish: <Smartphone className="h-4 w-4" />,
  card: <CreditCard className="h-4 w-4" />,
  bank_transfer: <ArrowRightLeft className="h-4 w-4" />,
  bank: <ArrowRightLeft className="h-4 w-4" />,
  cash: <Banknote className="h-4 w-4" />,
};

const paymentMethodColors: Record<string, string> = {
  swish: 'bg-purple-100 text-purple-800 border-purple-200',
  card: 'bg-blue-100 text-blue-800 border-blue-200',
  bank_transfer: 'bg-green-100 text-green-800 border-green-200',
  bank: 'bg-green-100 text-green-800 border-green-200',
  cash: 'bg-amber-100 text-amber-800 border-amber-200',
};

export default function ReceiptManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
  const [customerFilter, setCustomerFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');

  const queryClient = useQueryClient();

  const { data: receipts, isLoading } = useQuery({
    queryKey: ['receipts'],
    queryFn: getReceipts,
  });

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers,
  });

  const { data: articles } = useQuery({
    queryKey: ['articles'],
    queryFn: getArticles,
  });

  const { data: selectedReceiptDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['receipt', selectedReceipt?.id],
    queryFn: () => getReceipt(selectedReceipt!.id),
    enabled: !!selectedReceipt && (isViewOpen || isEmailOpen),
  });

  const createMutation = useMutation({
    mutationFn: createReceipt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receipts'] });
      setIsCreateOpen(false);
      toast.success('Kvitto skapat');
    },
    onError: () => {
      toast.error('Kunde inte skapa kvitto');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteReceipt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receipts'] });
      toast.success('Kvitto raderat');
    },
    onError: () => {
      toast.error('Kunde inte radera kvitto');
    },
  });

  const emailMutation = useMutation({
    mutationFn: ({ id, email }: { id: number; email: string }) =>
      emailReceipt(id, { to: email, attach_pdf: true }),
    onSuccess: () => {
      setIsEmailOpen(false);
      setEmailAddress('');
      toast.success('Kvitto skickat via e-post');
    },
    onError: () => {
      toast.error('Kunde inte skicka kvitto');
    },
  });

  const filteredReceipts = useMemo(() => {
    if (!receipts) return [];

    return receipts.filter((receipt) => {
      const matchesSearch =
        receipt.receipt_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        receipt.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (receipt.id?.toString() || '').includes(searchTerm);

      const matchesPaymentMethod =
        paymentMethodFilter === 'all' || receipt.payment_method === paymentMethodFilter;
      const matchesCustomer =
        customerFilter === 'all' || receipt.customer_id.toString() === customerFilter;

      const matchesDateFrom = !dateFrom || new Date(receipt.issue_date) >= new Date(dateFrom);
      const matchesDateTo = !dateTo || new Date(receipt.issue_date) <= new Date(dateTo);

      return matchesSearch && matchesPaymentMethod && matchesCustomer && matchesDateFrom && matchesDateTo;
    });
  }, [receipts, searchTerm, paymentMethodFilter, customerFilter, dateFrom, dateTo]);

  const clearFilters = () => {
    setPaymentMethodFilter('all');
    setCustomerFilter('all');
    setDateFrom('');
    setDateTo('');
    setSearchTerm('');
  };

  const hasActiveFilters =
    paymentMethodFilter !== 'all' || customerFilter !== 'all' || dateFrom || dateTo;

  const handleGeneratePDF = async (receipt: Receipt) => {
    try {
      const details = await getReceipt(receipt.id);
      const doc = generateReceiptPDF(details);
      openPDFInNewTab(doc, `Kvitto-${receipt.receipt_number}.pdf`);
      toast.success('PDF öppnad i ny flik');
    } catch (error) {
      toast.error('Kunde inte generera PDF');
    }
  };

  const handleOpenEmailDialog = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    const customer = customers?.find((c) => c.id === receipt.customer_id);
    setEmailAddress(customer?.email || '');
    setIsEmailOpen(true);
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
          <h1 className="text-2xl font-bold tracking-tight">Kvitton</h1>
          <p className="text-muted-foreground">Hantera kvitton och kontantbetalningar</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nytt Kvitto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Skapa nytt kvitto</DialogTitle>
              <DialogDescription>Fyll i uppgifterna nedan för att skapa ett nytt kvitto.</DialogDescription>
            </DialogHeader>
            <CreateReceiptForm
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
              placeholder="Sök kvittonummer eller kund..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
              <SelectTrigger className="w-[160px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Betalningsmetod" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alla metoder</SelectItem>
                <SelectItem value="swish">Swish</SelectItem>
                <SelectItem value="card">Kort</SelectItem>
                <SelectItem value="bank_transfer">Banköverföring</SelectItem>
                <SelectItem value="cash">Kontant</SelectItem>
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

      {/* Receipts Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kvittornummer</TableHead>
              <TableHead>Kund</TableHead>
              <TableHead>Datum</TableHead>
              <TableHead>Betalningsmetod</TableHead>
              <TableHead>Belopp</TableHead>
              <TableHead className="text-right">Åtgärder</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReceipts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Inga kvitton hittades
                </TableCell>
              </TableRow>
            ) : (
              filteredReceipts.map((receipt) => (
                <TableRow key={receipt.id}>
                  <TableCell className="font-medium">{receipt.receipt_number}</TableCell>
                  <TableCell>{receipt.customer_name}</TableCell>
                  <TableCell>{formatDateShort(receipt.issue_date)}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(paymentMethodColors[receipt.payment_method] || '')}
                    >
                      <span className="flex items-center gap-1">
                        {paymentMethodIcons[receipt.payment_method]}
                        {paymentMethodLabels[receipt.payment_method] || receipt.payment_method}
                      </span>
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(receipt.total_amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedReceipt(receipt);
                          setIsViewOpen(true);
                        }}
                        title="Visa detaljer"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleGeneratePDF(receipt)}
                        title="Generera PDF"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEmailDialog(receipt)}
                        title="E-posta kvitto"
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(receipt.id)}
                        title="Radera"
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

      {/* View Receipt Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Kvitto {selectedReceipt?.receipt_number}
            </DialogTitle>
          </DialogHeader>
          {isLoadingDetails ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : selectedReceiptDetails ? (
            <div className="space-y-6">
              {/* Receipt Header */}
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <h2 className="text-xl font-bold">KVITTO</h2>
                <p className="text-sm text-muted-foreground mt-1">HemSolutions Sverige AB</p>
              </div>

              {/* Receipt Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Kvittonummer</Label>
                  <p className="font-medium">{selectedReceiptDetails.receipt_number}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Datum</Label>
                  <p>{formatDate(selectedReceiptDetails.issue_date)}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Kund</Label>
                  <p className="font-medium">{selectedReceiptDetails.customer_name}</p>
                  {selectedReceiptDetails.customer_email && (
                    <p className="text-sm text-muted-foreground">
                      {selectedReceiptDetails.customer_email}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Betalningsmetod</Label>
                  <Badge
                    variant="outline"
                    className={cn(paymentMethodColors[selectedReceiptDetails.payment_method] || '')}
                  >
                    <span className="flex items-center gap-1">
                      {paymentMethodIcons[selectedReceiptDetails.payment_method]}
                      {paymentMethodLabels[selectedReceiptDetails.payment_method] ||
                        selectedReceiptDetails.payment_method}
                    </span>
                  </Badge>
                </div>
              </div>

              {/* Line Items */}
              {selectedReceiptDetails.items && selectedReceiptDetails.items.length > 0 && (
                <div>
                  <Label className="text-muted-foreground mb-2 block">Artiklar</Label>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Artikel</TableHead>
                          <TableHead className="text-right">Antal</TableHead>
                          <TableHead className="text-right">À-pris</TableHead>
                          <TableHead className="text-right">Totalt</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedReceiptDetails.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.article_name}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(item.unit_price)}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(item.total_price)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="border-t pt-4 bg-gray-50 p-4 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Nettosumma:</span>
                    <span>
                      {formatCurrency(
                        selectedReceiptDetails.total_amount - selectedReceiptDetails.vat_amount
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Moms (25%):</span>
                    <span>{formatCurrency(selectedReceiptDetails.vat_amount)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold pt-2 border-t">
                    <span>TOTALT</span>
                    <span>{formatCurrency(selectedReceiptDetails.total_amount)}</span>
                  </div>
                </div>
              </div>

              {/* Thank You */}
              <div className="text-center text-muted-foreground">
                <p>Tack för ditt köp!</p>
              </div>

              {/* Actions */}
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setIsViewOpen(false)}>
                  Stäng
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleGeneratePDF(selectedReceiptDetails)}
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Skriv ut
                </Button>
                <Button onClick={() => handleOpenEmailDialog(selectedReceiptDetails)}>
                  <Mail className="mr-2 h-4 w-4" />
                  E-posta
                </Button>
              </DialogFooter>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Email Receipt Dialog */}
      <Dialog open={isEmailOpen} onOpenChange={setIsEmailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Skicka kvitto via e-post</DialogTitle>
            <DialogDescription>
              Kvitto {selectedReceipt?.receipt_number} skickas som PDF.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>E-postadress</Label>
              <Input
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                placeholder="kund@exempel.se"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEmailOpen(false)}>
              Avbryt
            </Button>
            <Button
              onClick={() =>
                selectedReceipt && emailMutation.mutate({ id: selectedReceipt.id, email: emailAddress })
              }
              disabled={!emailAddress || emailMutation.isPending}
            >
              {emailMutation.isPending ? 'Skickar...' : 'Skicka kvitto'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Create Receipt Form Component
interface CreateReceiptFormProps {
  customers: Customer[];
  articles: Article[];
  onSubmit: (data: {
    customer_id: number;
    items: { article_id: number; quantity: number; unit_price: number }[];
    payment_method: 'cash' | 'card' | 'swish' | 'bank';
    issue_date: string;
    notes: string;
  }) => void;
  onCancel: () => void;
}

function CreateReceiptForm({ customers, articles, onSubmit, onCancel }: CreateReceiptFormProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<number | ''>('');
  const [items, setItems] = useState<
    Array<{ article_id: number; quantity: number; unit_price: number; vat_rate: number }>
  >([]);
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'swish' | 'bank'>('swish');
  const [notes, setNotes] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  const filteredCustomers = customers.filter(
    (c) =>
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
        items: items
          .filter((item) => item.article_id > 0)
          .map(({ vat_rate, ...rest }) => rest),
        payment_method: paymentMethod,
        issue_date: issueDate,
        notes,
      });
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  const vatAmount = items.reduce((sum, item) => {
    const itemTotal = item.quantity * item.unit_price;
    return sum + itemTotal * (item.vat_rate / 100);
  }, 0);
  const totalAmount = subtotal + vatAmount;

  const selectedCustomerData = customers.find((c) => c.id === selectedCustomer);

  const paymentMethods = [
    { value: 'swish', label: 'Swish', icon: Smartphone },
    { value: 'card', label: 'Kort', icon: CreditCard },
    { value: 'bank', label: 'Banköverföring', icon: ArrowRightLeft },
    { value: 'cash', label: 'Kontant', icon: Banknote },
  ];

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
            <p>
              <strong>{selectedCustomerData.name}</strong>
            </p>
            <p>{selectedCustomerData.address}</p>
            <p>
              {selectedCustomerData.postal_code} {selectedCustomerData.city}
            </p>
            {selectedCustomerData.phone && <p>Tel: {selectedCustomerData.phone}</p>}
          </div>
        )}
      </div>

      {/* Receipt Date */}
      <div className="space-y-2">
        <Label>Kvitto datum *</Label>
        <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} required />
      </div>

      {/* Payment Method */}
      <div className="space-y-2">
        <Label>Betalningsmetod *</Label>
        <div className="grid grid-cols-2 gap-2">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            return (
              <button
                key={method.value}
                type="button"
                onClick={() => setPaymentMethod(method.value as typeof paymentMethod)}
                className={cn(
                  'flex items-center gap-2 p-3 rounded-lg border transition-colors',
                  paymentMethod === method.value
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{method.label}</span>
              </button>
            );
          })}
        </div>
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
          className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="Valfria anteckningar..."
          rows={2}
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
          <div className="flex justify-between text-lg font-bold pt-2 border-t">
            <span>Totalt att betala:</span>
            <span>{formatCurrency(totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <DialogFooter className="gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Avbryt
        </Button>
        <Button type="submit" disabled={items.length === 0 || !selectedCustomer}>
          Skapa kvitto
        </Button>
      </DialogFooter>
    </form>
  );
}
