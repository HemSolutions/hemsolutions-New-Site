import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Plus,
  Trash2,
  Save,
  Send,
  Printer,
  Eye,
  X,
  ChevronDown,
  Building2,
  Calculator,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
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
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { formatCurrency, formatDateShort, cn } from '../../lib/utils';
import { generateInvoicePDF, openPDFInNewTab } from '../../lib/pdf';
import { createInvoice, updateInvoice, getInvoice } from '../../api/invoices';
import { getCustomers, getArticles } from '../../api';
import type { InvoiceWithCustomer, Customer, Article, InvoiceItem } from '../../types';
import { toast } from 'sonner';

interface InvoiceFormProps {
  mode: 'create' | 'edit';
  invoice?: InvoiceWithCustomer;
  invoiceType?: 'invoice' | 'rot' | 'rut';
  onClose: () => void;
}

const paymentTerms = [
  { value: '10', label: '10 dagar' },
  { value: '14', label: '14 dagar' },
  { value: '30', label: '30 dagar' },
  { value: '60', label: '60 dagar' },
  { value: '90', label: '90 dagar' },
];

const vatRates = [
  { value: 25, label: '25%' },
  { value: 12, label: '12%' },
  { value: 6, label: '6%' },
  { value: 0, label: '0%' },
];

interface LineItem {
  id?: number;
  article_id: number | '';
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  vat_rate: number;
  total_price: number;
  is_rot_rut: boolean;
  material_cost?: number;
  labor_cost?: number;
}

export default function InvoiceForm({ mode, invoice, invoiceType = 'invoice', onClose }: InvoiceFormProps) {
  const queryClient = useQueryClient();
  const [activeType, setActiveType] = useState<'invoice' | 'rot' | 'rut'>(invoiceType);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [paymentTermsDays, setPaymentTermsDays] = useState('30');
  const [yourReference, setYourReference] = useState('');
  const [ourReference, setOurReference] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | ''>('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [notes, setNotes] = useState('');
  const [isRotRut, setIsRotRut] = useState(false);
  const [personNumber, setPersonNumber] = useState('');
  const [materialCost, setMaterialCost] = useState(0);
  const [laborCost, setLaborCost] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<InvoiceWithCustomer | null>(null);

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers,
  });

  const { data: articles } = useQuery({
    queryKey: ['articles'],
    queryFn: getArticles,
  });

  // Load existing invoice data when editing
  useEffect(() => {
    if (mode === 'edit' && invoice) {
      setInvoiceNumber(invoice.invoice_number);
      setIssueDate(invoice.issue_date);
      setDueDate(invoice.due_date);
      setSelectedCustomerId(invoice.customer_id);
      setNotes(invoice.notes || '');
      setIsRotRut(invoice.is_rot_rut || false);
      setActiveType(invoice.is_rot_rut ? (invoice.rot_rut_amount > 0 ? 'rut' : 'rot') : 'invoice');
      if (invoice.items) {
        setLineItems(invoice.items.map((item) => ({
          id: item.id,
          article_id: item.article_id,
          description: item.article_name,
          quantity: item.quantity,
          unit: 'st',
          unit_price: item.unit_price,
          vat_rate: item.vat_rate,
          total_price: item.total_price,
          is_rot_rut: false,
        })));
      }
    }
  }, [mode, invoice]);

  // Auto-generate invoice number
  useEffect(() => {
    if (mode === 'create' && !invoiceNumber) {
      const year = new Date().getFullYear();
      const random = Math.floor(1000 + Math.random() * 9000);
      const prefix = activeType === 'invoice' ? 'F' : activeType === 'rot' ? 'ROT' : 'RUT';
      setInvoiceNumber(`${prefix}-${year}-${random}`);
    }
  }, [mode, activeType, invoiceNumber]);

  // Update due date when payment terms change
  useEffect(() => {
    const days = parseInt(paymentTermsDays);
    const issue = new Date(issueDate);
    const due = new Date(issue);
    due.setDate(due.getDate() + days);
    setDueDate(due.toISOString().split('T')[0]);
  }, [paymentTermsDays, issueDate]);

  // Update isRotRut when type changes
  useEffect(() => {
    setIsRotRut(activeType !== 'invoice');
  }, [activeType]);

  const selectedCustomer = useMemo(() =>
    customers?.find((c) => c.id === selectedCustomerId),
    [customers, selectedCustomerId]
  );

  const filteredCustomers = useMemo(() =>
    customers?.filter((c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.email?.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.org_number?.includes(customerSearch)
    ) || [],
    [customers, customerSearch]
  );

  // Calculate totals
  const netTotal = useMemo(() =>
    lineItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0),
    [lineItems]
  );

  const vatTotal = useMemo(() =>
    lineItems.reduce((sum, item) => {
      const itemNet = item.quantity * item.unit_price;
      return sum + itemNet * (item.vat_rate / 100);
    }, 0),
    [lineItems]
  );

  const grossTotal = useMemo(() => netTotal + vatTotal, [netTotal, vatTotal]);

  const rotRutDeduction = useMemo(() => {
    if (!isRotRut) return 0;
    const labor = activeType === 'rot' ? laborCost : netTotal;
    const rate = activeType === 'rot' ? 0.30 : 0.50;
    return labor * rate;
  }, [isRotRut, activeType, laborCost, netTotal]);

  const totalToPay = useMemo(() => grossTotal - rotRutDeduction, [grossTotal, rotRutDeduction]);

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        article_id: '',
        description: '',
        quantity: 1,
        unit: 'st',
        unit_price: 0,
        vat_rate: 25,
        total_price: 0,
        is_rot_rut: false,
      },
    ]);
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: unknown) => {
    const newItems = [...lineItems];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === 'article_id' && value) {
      const article = articles?.find((a) => a.id === Number(value));
      if (article) {
        newItems[index].description = article.name;
        newItems[index].unit_price = article.price;
        newItems[index].vat_rate = article.vat_rate;
        newItems[index].unit = article.unit;
        newItems[index].is_rot_rut = article.is_rot_rut;
      }
    }

    // Recalculate total price
    const qty = Number(newItems[index].quantity) || 0;
    const price = Number(newItems[index].unit_price) || 0;
    newItems[index].total_price = qty * price;

    setLineItems(newItems);
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const createMutation = useMutation({
    mutationFn: createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Faktura skapad');
      onClose();
    },
    onError: () => {
      toast.error('Kunde inte skapa faktura');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InvoiceWithCustomer> }) =>
      updateInvoice(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', invoice?.id] });
      toast.success('Faktura uppdaterad');
      onClose();
    },
    onError: () => {
      toast.error('Kunde inte uppdatera faktura');
    },
  });

  const buildInvoiceData = useCallback((): Partial<InvoiceWithCustomer> => {
    const items = lineItems
      .filter((item) => item.description && item.unit_price > 0)
      .map((item) => ({
        id: 0,
        invoice_id: invoice?.id || 0,
        article_id: Number(item.article_id) || 0,
        article_name: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        vat_rate: item.vat_rate,
        total_price: item.quantity * item.unit_price,
      }));

    return {
      customer_id: Number(selectedCustomerId),
      invoice_number: invoiceNumber,
      issue_date: issueDate,
      due_date: dueDate,
      total_amount: totalToPay,
      vat_amount: vatTotal,
      status: 'draft',
      is_rot_rut: isRotRut,
      rot_rut_amount: rotRutDeduction,
      notes,
      reference: yourReference || undefined,
      items: items.map(item => ({
        ...item,
        id: 0,
        invoice_id: 0,
      })),
    };
  }, [
    lineItems,
    selectedCustomerId,
    invoiceNumber,
    issueDate,
    dueDate,
    totalToPay,
    vatTotal,
    isRotRut,
    rotRutDeduction,
    notes,
    yourReference,
  ]);

  const handleSaveDraft = () => {
    const data = buildInvoiceData();
    if (mode === 'create') {
      createMutation.mutate(data as any);
    } else if (invoice) {
      updateMutation.mutate({ id: invoice.id, data });
    }
  };

  const handlePreview = () => {
    const data = buildInvoiceData();
    setPreviewData({
      ...data,
      id: invoice?.id || 0,
      customer_name: selectedCustomer?.name || '',
      customer_email: selectedCustomer?.email || '',
      customer_address: selectedCustomer?.address || '',
      customer_phone: selectedCustomer?.phone || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as InvoiceWithCustomer);
    setIsPreviewOpen(true);
  };

  const handleSend = () => {
    const data = buildInvoiceData();
    if (mode === 'create') {
      createMutation.mutate({ ...data, status: 'sent' } as any);
    } else if (invoice) {
      updateMutation.mutate({ id: invoice.id, data: { ...data, status: 'sent' } });
    }
  };

  const handlePrint = async () => {
    const data = buildInvoiceData();
    const preview: InvoiceWithCustomer = {
      ...data,
      id: invoice?.id || 0,
      customer_name: selectedCustomer?.name || '',
      customer_email: selectedCustomer?.email || '',
      customer_address: selectedCustomer?.address || '',
      customer_phone: selectedCustomer?.phone || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as InvoiceWithCustomer;
    const doc = generateInvoicePDF(preview);
    openPDFInNewTab(doc, `Faktura-${invoiceNumber}.pdf`);
  };

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomerId(customer.id);
    setCustomerSearch(customer.name);
    setShowCustomerDropdown(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-gray-50/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white border rounded-lg flex items-center justify-center shadow-sm">
            <Building2 className="h-6 w-6 text-gray-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold">
              {mode === 'create' ? 'Ny faktura' : `Redigera ${invoice?.invoice_number}`}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={() => setActiveType('invoice')}
                className={cn(
                  'px-3 py-1 rounded text-xs font-medium transition-colors',
                  activeType === 'invoice'
                    ? 'bg-slate-900 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                )}
              >
                Faktura
              </button>
              <button
                onClick={() => setActiveType('rot')}
                className={cn(
                  'px-3 py-1 rounded text-xs font-medium transition-colors',
                  activeType === 'rot'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                )}
              >
                ROT
              </button>
              <button
                onClick={() => setActiveType('rut')}
                className={cn(
                  'px-3 py-1 rounded text-xs font-medium transition-colors',
                  activeType === 'rut'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                )}
              >
                RUT
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeType !== 'invoice' && (
            <Badge variant="outline" className="text-xs">
              {activeType === 'rot' ? 'ROT-avdrag 30%' : 'RUT-avdrag 50%'}
            </Badge>
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Fakturanummer</Label>
              <Input value={invoiceNumber} readOnly className="bg-gray-50" />
            </div>
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
              <Label>Förfallodatum</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Betalningsvillkor</Label>
              <Select value={paymentTermsDays} onValueChange={setPaymentTermsDays}>
                <SelectTrigger>
                  <SelectValue placeholder="Välj betalningsvillkor..." />
                </SelectTrigger>
                <SelectContent>
                  {paymentTerms.map((term) => (
                    <SelectItem key={term.value} value={term.value}>
                      {term.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Er referens</Label>
              <Input
                placeholder="Kundens referens..."
                value={yourReference}
                onChange={(e) => setYourReference(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Vår referens</Label>
              <Input
                placeholder="Vår referens..."
                value={ourReference}
                onChange={(e) => setOurReference(e.target.value)}
              />
            </div>
          </div>

          {/* Customer Section */}
          <div className="border rounded-lg p-4 bg-white">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Kund
            </h3>
            <div className="relative">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Sök kund..."
                    value={selectedCustomer ? selectedCustomer.name : customerSearch}
                    onChange={(e) => {
                      if (!selectedCustomer) {
                        setCustomerSearch(e.target.value);
                        setShowCustomerDropdown(true);
                      }
                    }}
                    onFocus={() => setShowCustomerDropdown(true)}
                    className="pl-9"
                  />
                </div>
                {selectedCustomer && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedCustomerId('');
                      setCustomerSearch('');
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {showCustomerDropdown && filteredCustomers.length > 0 && !selectedCustomer && (
                <div className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      type="button"
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors border-b last:border-0"
                      onClick={() => handleSelectCustomer(customer)}
                    >
                      <div className="font-medium text-sm">{customer.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {customer.email} {customer.org_number && `| Org.nr: ${customer.org_number}`}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selectedCustomer && (
              <div className="mt-3 grid grid-cols-2 gap-4 text-sm bg-gray-50 p-3 rounded-lg">
                <div>
                  <p className="font-medium">{selectedCustomer.name}</p>
                  <p className="text-muted-foreground">{selectedCustomer.address}</p>
                  <p className="text-muted-foreground">
                    {selectedCustomer.postal_code} {selectedCustomer.city}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">{selectedCustomer.email}</p>
                  <p className="text-muted-foreground">{selectedCustomer.phone}</p>
                  {selectedCustomer.org_number && (
                    <p className="text-muted-foreground">Org.nr: {selectedCustomer.org_number}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ROT/RUT Section */}
          {activeType !== 'invoice' && (
            <div className="border rounded-lg p-4 bg-white">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {activeType === 'rot' ? 'ROT-avdrag' : 'RUT-avdrag'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Personnummer</Label>
                  <Input
                    placeholder="ÅÅÅÅMMDD-XXXX"
                    value={personNumber}
                    onChange={(e) => setPersonNumber(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Materialkostnad</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={materialCost}
                    onChange={(e) => setMaterialCost(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Arbete (lönekostnad)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={laborCost}
                    onChange={(e) => setLaborCost(Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="mt-3 p-3 bg-blue-50 rounded-lg text-sm flex items-center justify-between">
                <span>
                  {activeType === 'rot'
                    ? 'ROT-avdrag: 30% av arbetskostnaden'
                    : 'RUT-avdrag: 50% av totala kostnaden'}
                </span>
                <span className="font-semibold text-blue-700">
                  Avdrag: {formatCurrency(rotRutDeduction)}
                </span>
              </div>
            </div>
          )}

          {/* Line Items Table */}
          <div className="border rounded-lg bg-white overflow-hidden">
            <div className="px-4 py-3 border-b bg-gray-50/80 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Artiklar / Tjänster
              </h3>
              <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                <Plus className="h-4 w-4 mr-1.5" />
                Lägg till rad
              </Button>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                    <TableHead className="w-[40px]"></TableHead>
                    <TableHead>Beskrivning</TableHead>
                    <TableHead className="w-[90px]">Antal</TableHead>
                    <TableHead className="w-[70px]">Enhet</TableHead>
                    <TableHead className="w-[110px] text-right">Á-pris</TableHead>
                    <TableHead className="w-[80px]">Moms</TableHead>
                    <TableHead className="w-[110px] text-right">Belopp</TableHead>
                    {activeType !== 'invoice' && (
                      <TableHead className="w-[100px] text-right">{activeType === 'rot' ? 'ROT' : 'RUT'}-avdrag</TableHead>
                    )}
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={activeType !== 'invoice' ? 9 : 8} className="text-center py-8 text-muted-foreground">
                        <p>Inga rader tillagda ännu</p>
                        <Button variant="outline" size="sm" className="mt-2" onClick={addLineItem}>
                          <Plus className="h-4 w-4 mr-1" />
                          Lägg till första raden
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : (
                    lineItems.map((item, index) => (
                      <TableRow key={index} className="group">
                        <TableCell className="text-muted-foreground text-xs">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Select
                              value={item.article_id?.toString() || ''}
                              onValueChange={(value) => updateLineItem(index, 'article_id', Number(value))}
                            >
                              <SelectTrigger className="h-8 text-sm">
                                <SelectValue placeholder="Välj artikel..." />
                              </SelectTrigger>
                              <SelectContent>
                                {articles?.map((article) => (
                                  <SelectItem key={article.id} value={article.id.toString()}>
                                    {article.name} - {formatCurrency(article.price)}/{article.unit}
                                  </SelectItem>
                                )) || (
                                  <SelectItem value="">
                                    Inga artiklar
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                            <Input
                              placeholder="Beskrivning..."
                              value={item.description}
                              onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                              className="h-7 text-xs"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.1"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(index, 'quantity', Number(e.target.value))}
                            className="h-8 text-sm text-right"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={item.unit}
                            onChange={(e) => updateLineItem(index, 'unit', e.target.value)}
                            className="h-8 text-sm"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unit_price}
                            onChange={(e) => updateLineItem(index, 'unit_price', Number(e.target.value))}
                            className="h-8 text-sm text-right"
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={item.vat_rate.toString()}
                            onValueChange={(value) => updateLineItem(index, 'vat_rate', Number(value))}
                          >
                            <SelectTrigger className="h-8 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {vatRates.map((rate) => (
                                <SelectItem key={rate.value} value={rate.value.toString()}>
                                  {rate.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(item.total_price)}
                        </TableCell>
                        {activeType !== 'invoice' && (
                          <TableCell className="text-right text-sm text-blue-600">
                            {item.is_rot_rut ? formatCurrency(item.total_price * (activeType === 'rot' ? 0.3 : 0.5)) : '-'}
                          </TableCell>
                        )}
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeLineItem(index)}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full max-w-sm space-y-2 border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Nettosumma:</span>
                <span className="font-medium">{formatCurrency(netTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Moms:</span>
                <span className="font-medium">{formatCurrency(vatTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Brutto:</span>
                <span className="font-medium">{formatCurrency(grossTotal)}</span>
              </div>
              {isRotRut && rotRutDeduction > 0 && (
                <div className="flex justify-between text-sm text-blue-600">
                  <span>
                    {activeType === 'rot' ? 'ROT' : 'RUT'}-avdrag:
                  </span>
                  <span className="font-medium">-{formatCurrency(rotRutDeduction)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Att betala:</span>
                <span>{formatCurrency(totalToPay)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Anteckningar / Villkor</Label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-y"
              placeholder="Ange eventuella anteckningar eller betalningsvillkor..."
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-6 py-4 border-t bg-gray-50/80 flex items-center justify-between shrink-0">
        <Button variant="outline" onClick={onClose}>
          <X className="mr-2 h-4 w-4" />
          Avbryt
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="mr-2 h-4 w-4" />
            Förhandsgranska
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Skriv ut / PDF
          </Button>
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            {createMutation.isPending || updateMutation.isPending ? 'Sparar...' : 'Spara utkast'}
          </Button>
          <Button
            onClick={handleSend}
            disabled={createMutation.isPending || updateMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="mr-2 h-4 w-4" />
            {createMutation.isPending || updateMutation.isPending ? 'Skickar...' : 'Skicka faktura'}
          </Button>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Förhandsgranska faktura</DialogTitle>
          </DialogHeader>
          {previewData && (
            <div className="border rounded-lg p-6 bg-white space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">FAKTURA</h2>
                  <p className="text-sm text-muted-foreground mt-1">{previewData.invoice_number}</p>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <p>HemSolutions Sverige AB</p>
                  <p>Org.nr: 559123-4567</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <h4 className="font-semibold mb-1">Kund</h4>
                  <p>{previewData.customer_name}</p>
                  <p>{previewData.customer_address}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Fakturadetaljer</h4>
                  <p>Fakturadatum: {formatDateShort(previewData.issue_date)}</p>
                  <p>Förfallodatum: {formatDateShort(previewData.due_date)}</p>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Beskrivning</TableHead>
                    <TableHead className="text-right">Antal</TableHead>
                    <TableHead className="text-right">À-pris</TableHead>
                    <TableHead className="text-right">Belopp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.items?.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell>{item.article_name}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.total_price)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex justify-end">
                <div className="w-64 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Nettosumma:</span>
                    <span>{formatCurrency(netTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Moms:</span>
                    <span>{formatCurrency(vatTotal)}</span>
                  </div>
                  {isRotRut && rotRutDeduction > 0 && (
                    <div className="flex justify-between text-blue-600">
                      <span>{activeType === 'rot' ? 'ROT' : 'RUT'}-avdrag:</span>
                      <span>-{formatCurrency(rotRutDeduction)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Att betala:</span>
                    <span>{formatCurrency(totalToPay)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Click outside to close customer dropdown */}
      {showCustomerDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowCustomerDropdown(false)}
        />
      )}
    </div>
  );
}
