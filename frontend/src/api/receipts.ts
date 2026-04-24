import axios from 'axios';
import type { Receipt, ReceiptItem } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Get all receipts
export async function getReceipts(): Promise<Receipt[]> {
  const response = await api.get<Receipt[]>('/receipts.php');
  return response.data;
}

// Get single receipt with details
export interface ReceiptWithItems extends Receipt {
  items?: ReceiptItem[];
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
}

export async function getReceipt(id: number): Promise<ReceiptWithItems> {
  const response = await api.get<ReceiptWithItems>(`/receipts.php?id=${id}`);
  return response.data;
}

// Create new receipt
export interface CreateReceiptData {
  customer_id: number;
  items: Array<{
    article_id: number;
    quantity: number;
    unit_price: number;
  }>;
  payment_method: 'cash' | 'card' | 'swish' | 'bank';
  issue_date?: string;
  notes?: string;
}

export async function createReceipt(data: CreateReceiptData): Promise<Receipt> {
  const response = await api.post<Receipt>('/receipts.php', data);
  return response.data;
}

// Delete receipt
export async function deleteReceipt(id: number): Promise<void> {
  await api.delete(`/receipts.php?id=${id}`);
}

// Email receipt
export interface EmailReceiptData {
  to: string;
  subject?: string;
  message?: string;
  attach_pdf?: boolean;
}

export async function emailReceipt(id: number, data: EmailReceiptData): Promise<{ success: boolean; message: string }> {
  const response = await api.post<{ success: boolean; message: string }>(`/receipts.php?id=${id}&action=email`, data);
  return response.data;
}

// Get receipt items
export async function getReceiptItems(receiptId: number): Promise<ReceiptItem[]> {
  const response = await api.get<ReceiptItem[]>(`/receipt-items.php?receipt_id=${receiptId}`);
  return response.data;
}

// Generate receipt PDF (client-side generation helper)
export function generateReceiptPDFBlobUrl(receiptId: number): string {
  return `${API_BASE_URL}/pdf/receipt.php?id=${receiptId}`;
}

// Download receipt PDF from server
export async function downloadReceiptPDF(receiptId: number): Promise<Blob> {
  const response = await api.get(`/pdf/receipt.php?id=${receiptId}`, {
    responseType: 'blob',
  });
  return response.data;
}

// Search receipts
export interface SearchReceiptFilters {
  customer_id?: number;
  payment_method?: string;
  start_date?: string;
  end_date?: string;
}

export async function searchReceipts(filters: SearchReceiptFilters): Promise<Receipt[]> {
  const params = new URLSearchParams();
  if (filters.customer_id) params.append('customer_id', filters.customer_id.toString());
  if (filters.payment_method) params.append('payment_method', filters.payment_method);
  if (filters.start_date) params.append('start_date', filters.start_date);
  if (filters.end_date) params.append('end_date', filters.end_date);
  
  const response = await api.get<Receipt[]>(`/receipts.php?${params.toString()}`);
  return response.data;
}

// Get receipt statistics
export interface ReceiptStats {
  total_count: number;
  total_amount: number;
  by_payment_method: Record<string, { count: number; amount: number }>;
}

export async function getReceiptStats(): Promise<ReceiptStats> {
  const response = await api.get<ReceiptStats>('/receipts.php?action=stats');
  return response.data;
}

// Get today's receipts
export async function getTodayReceipts(): Promise<Receipt[]> {
  const today = new Date().toISOString().split('T')[0];
  const response = await api.get<Receipt[]>(`/receipts.php?start_date=${today}&end_date=${today}`);
  return response.data;
}
