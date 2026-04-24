import axios from 'axios';
import type { Invoice, InvoiceWithCustomer, InvoiceItem } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Get all invoices
export async function getInvoices(): Promise<Invoice[]> {
  const response = await api.get<Invoice[]>('/invoices.php');
  return response.data;
}

// Get single invoice with details
export async function getInvoice(id: number): Promise<InvoiceWithCustomer> {
  const response = await api.get<InvoiceWithCustomer>(`/invoices.php?id=${id}`);
  return response.data;
}

// Create new invoice
export interface CreateInvoiceData {
  customer_id: number;
  items: Array<{
    article_id: number;
    quantity: number;
    unit_price: number;
  }>;
  issue_date: string;
  due_date: string;
  notes: string;
  is_rot_rut: boolean;
  reference?: string;
}

export async function createInvoice(data: CreateInvoiceData): Promise<Invoice> {
  const response = await api.post<Invoice>('/invoices.php', data);
  return response.data;
}

// Update invoice
export async function updateInvoice(id: number, data: Partial<Invoice>): Promise<Invoice> {
  const response = await api.put<Invoice>(`/invoices.php?id=${id}`, data);
  return response.data;
}

// Delete invoice
export async function deleteInvoice(id: number): Promise<void> {
  await api.delete(`/invoices.php?id=${id}`);
}

// Mark invoice as sent
export async function markInvoiceAsSent(id: number): Promise<Invoice> {
  return updateInvoice(id, { status: 'sent' });
}

// Mark invoice as paid
export async function markInvoiceAsPaid(id: number): Promise<Invoice> {
  return updateInvoice(id, { status: 'paid' });
}

// Cancel invoice
export async function cancelInvoice(id: number): Promise<Invoice> {
  return updateInvoice(id, { status: 'cancelled' });
}

// Send invoice via email
export interface SendInvoiceData {
  to: string;
  subject?: string;
  message?: string;
  attach_pdf?: boolean;
}

export async function sendInvoice(id: number, data: SendInvoiceData): Promise<{ success: boolean; message: string }> {
  const response = await api.post<{ success: boolean; message: string }>(`/invoices.php?id=${id}&action=send`, data);
  return response.data;
}

// Get invoice items
export async function getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]> {
  const response = await api.get<InvoiceItem[]>(`/invoice-items.php?invoice_id=${invoiceId}`);
  return response.data;
}

// Generate invoice PDF (client-side generation helper)
export function generateInvoicePDFBlobUrl(invoiceId: number): string {
  return `${API_BASE_URL}/pdf/invoice.php?id=${invoiceId}`;
}

// Download invoice PDF from server
export async function downloadInvoicePDF(invoiceId: number): Promise<Blob> {
  const response = await api.get(`/pdf/invoice.php?id=${invoiceId}`, {
    responseType: 'blob',
  });
  return response.data;
}

// Search invoices
export interface SearchInvoiceFilters {
  status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  customer_id?: number;
  start_date?: string;
  end_date?: string;
}

export async function searchInvoices(filters: SearchInvoiceFilters): Promise<Invoice[]> {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.customer_id) params.append('customer_id', filters.customer_id.toString());
  if (filters.start_date) params.append('start_date', filters.start_date);
  if (filters.end_date) params.append('end_date', filters.end_date);
  
  const response = await api.get<Invoice[]>(`/invoices.php?${params.toString()}`);
  return response.data;
}

// Get overdue invoices
export async function getOverdueInvoices(): Promise<Invoice[]> {
  const response = await api.get<Invoice[]>('/invoices.php?status=overdue');
  return response.data;
}

// Get invoice statistics
export interface InvoiceStats {
  total_count: number;
  draft_count: number;
  sent_count: number;
  paid_count: number;
  overdue_count: number;
  total_amount: number;
  outstanding_amount: number;
}

export async function getInvoiceStats(): Promise<InvoiceStats> {
  const response = await api.get<InvoiceStats>('/invoices.php?action=stats');
  return response.data;
}
