import axios from 'axios';
import type { Invoice, InvoiceWithCustomer, InvoiceItem } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://hemsolutions-api.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Get all invoices
export async function getInvoices(): Promise<Invoice[]> {
  const response = await api.get('/invoices');
  return response.data.invoices || response.data || [];
}

// Get single invoice with details
export async function getInvoice(id: number): Promise<InvoiceWithCustomer> {
  const response = await api.get(`/invoices/${id}`);
  return response.data.invoice || response.data;
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
  const response = await api.post('/invoices', data);
  return response.data.invoice || response.data;
}

// Update invoice
export async function updateInvoice(id: number, data: Partial<Invoice>): Promise<Invoice> {
  const response = await api.put(`/invoices/${id}`, data);
  return response.data.invoice || response.data;
}

// Delete invoice
export async function deleteInvoice(id: number): Promise<void> {
  await api.delete(`/invoices/${id}`);
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
  
  const response = await api.get(`/invoices?${params.toString()}`);
  return response.data.invoices || response.data || [];
}

// Get overdue invoices
export async function getOverdueInvoices(): Promise<Invoice[]> {
  return searchInvoices({ status: 'overdue' });
}
