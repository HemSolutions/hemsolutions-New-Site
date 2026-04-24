import axios from 'axios'
import type {
  Customer,
  Article,
  Invoice,
  InvoiceWithCustomer,
  Receipt,
  Payment,
  Reminder,
  CompanySettings,
  InvoiceSettings,
  RotRutSettings,
  ReceiptSettings,
  VatRate,
  ReminderTemplate,
  DashboardStats,
  TopCustomer,
  PaymentWithInvoice,
  CustomerPrice,
  User,
} from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Customers - backward compatible (returns array)
export const getCustomers = () => api.get<Customer[]>('/customers.php').then(r => r.data)

// Customers - paginated with search (returns { customers, pagination })
export const getCustomersPaginated = (params?: { page?: number; limit?: number; search?: string; sort?: string; order?: string }) => {
  const queryParams = new URLSearchParams()
  if (params?.page) queryParams.append('page', String(params.page))
  if (params?.limit) queryParams.append('limit', String(params.limit))
  if (params?.search) queryParams.append('search', params.search)
  if (params?.sort) queryParams.append('sort', params.sort)
  if (params?.order) queryParams.append('order', params.order)
  const query = queryParams.toString()
  return api.get<{ customers: Customer[]; pagination: { page: number; limit: number; total: number; total_pages: number } }>(`/customers.php${query ? '?' + query : ''}`).then(r => r.data)
}

export const getCustomer = (id: number) => api.get<Customer>(`/customers.php?id=${id}`).then(r => r.data)
export const createCustomer = (data: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) =>
  api.post<Customer>('/customers.php', data).then(r => r.data)
export const updateCustomer = (id: number, data: Partial<Customer>) =>
  api.put<Customer>(`/customers.php?id=${id}`, data).then(r => r.data)
export const deleteCustomer = (id: number) =>
  api.delete(`/customers.php?id=${id}`).then(r => r.data)

// Articles
export const getArticles = () => api.get<Article[]>('/articles.php').then(r => r.data)
export const getArticle = (id: number) => api.get<Article>(`/articles.php?id=${id}`).then(r => r.data)
export const createArticle = (data: Omit<Article, 'id' | 'created_at' | 'updated_at'>) =>
  api.post<Article>('/articles.php', data).then(r => r.data)
export const updateArticle = (id: number, data: Partial<Article>) =>
  api.put<Article>(`/articles.php?id=${id}`, data).then(r => r.data)
export const deleteArticle = (id: number) =>
  api.delete(`/articles.php?id=${id}`).then(r => r.data)

// Customer Prices
export const getCustomerPrices = (customerId: number) =>
  api.get<CustomerPrice[]>(`/customer-prices.php?customer_id=${customerId}`).then(r => r.data)
export const setCustomerPrice = (data: Omit<CustomerPrice, 'id' | 'created_at'>) =>
  api.post<CustomerPrice>('/customer-prices.php', data).then(r => r.data)

// Invoices
export const getInvoices = () => api.get<Invoice[]>('/invoices.php').then(r => r.data)
export const getInvoice = (id: number) => api.get<InvoiceWithCustomer>(`/invoices.php?id=${id}`).then(r => r.data)
export const createInvoice = (data: {
  customer_id: number
  items: { article_id: number; quantity: number; unit_price: number }[]
  issue_date: string
  due_date: string
  notes: string
  is_rot_rut: boolean
}) => api.post<Invoice>('/invoices.php', data).then(r => r.data)
export const updateInvoice = (id: number, data: Partial<Invoice>) =>
  api.put<Invoice>(`/invoices.php?id=${id}`, data).then(r => r.data)
export const deleteInvoice = (id: number) =>
  api.delete(`/invoices.php?id=${id}`).then(r => r.data)

// Receipts
export const getReceipts = () => api.get<Receipt[]>('/receipts.php').then(r => r.data)
export const getReceipt = (id: number) => api.get<Receipt>(`/receipts.php?id=${id}`).then(r => r.data)
export const createReceipt = (data: {
  customer_id: number
  items: { article_id: number; quantity: number; unit_price: number }[]
  payment_method: string
}) => api.post<Receipt>('/receipts.php', data).then(r => r.data)
export const deleteReceipt = (id: number) =>
  api.delete(`/receipts.php?id=${id}`).then(r => r.data)

// Payments
export const getPayments = () => api.get<PaymentWithInvoice[]>('/payments.php').then(r => r.data)
export const getPayment = (id: number) => api.get<Payment>(`/payments.php?id=${id}`).then(r => r.data)
export const createPayment = (data: Omit<Payment, 'id' | 'customer_name' | 'created_at'>) =>
  api.post<Payment>('/payments.php', data).then(r => r.data)
export const deletePayment = (id: number) =>
  api.delete(`/payments.php?id=${id}`).then(r => r.data)

// Reminders
export const getReminders = () => api.get<Reminder[]>('/reminders.php').then(r => r.data)
export const createReminder = (data: { invoice_id: number; type?: string; message?: string }) =>
  api.post<Reminder>('/reminders.php', data).then(r => r.data)
export const updateReminder = (id: number, status: string) =>
  api.put<Reminder>(`/reminders.php?id=${id}`, { status }).then(r => r.data)

// Dashboard & Reports
export const getDashboardStats = () => api.get<DashboardStats>('/admin/dashboard-stats.php').then(r => r.data)
export const getTopCustomers = () => api.get<TopCustomer[]>('/admin/top-customers.php').then(r => r.data)
export const getOutstandingReminders = () => api.get<Reminder[]>('/admin/outstanding-reminders.php').then(r => r.data)
export const getRecentPayments = () => api.get<PaymentWithInvoice[]>('/admin/recent-payments.php').then(r => r.data)

// Company Settings
export const getCompanySettings = () => api.get<CompanySettings>('/settings/company.php').then(r => r.data)
export const updateCompanySettings = (data: Partial<CompanySettings>) =>
  api.put<CompanySettings>('/settings/company.php', data).then(r => r.data)
export const uploadCompanyLogo = (file: File) => {
  const formData = new FormData()
  formData.append('logo', file)
  return api.post('/settings/logo.php', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data)
}

// Invoice Settings
export const getInvoiceSettings = () => api.get<InvoiceSettings>('/settings/invoice.php').then(r => r.data)
export const updateInvoiceSettings = (data: Partial<InvoiceSettings>) =>
  api.put<InvoiceSettings>('/settings/invoice.php', data).then(r => r.data)

// ROT/RUT Settings
export const getRotRutSettings = () => api.get<RotRutSettings>('/settings/rotrut.php').then(r => r.data)
export const updateRotRutSettings = (data: Partial<RotRutSettings>) =>
  api.put<RotRutSettings>('/settings/rotrut.php', data).then(r => r.data)

// Receipt Settings
export const getReceiptSettings = () => api.get<ReceiptSettings>('/settings/receipt.php').then(r => r.data)
export const updateReceiptSettings = (data: Partial<ReceiptSettings>) =>
  api.put<ReceiptSettings>('/settings/receipt.php', data).then(r => r.data)

// VAT Rates
export const getVatRates = () => api.get<VatRate[]>('/settings/vat-rates.php').then(r => r.data)
export const createVatRate = (data: Omit<VatRate, 'id' | 'created_at' | 'updated_at'>) =>
  api.post<VatRate>('/settings/vat-rates.php', data).then(r => r.data)
export const updateVatRate = (id: number, data: Partial<VatRate>) =>
  api.put<VatRate>(`/settings/vat-rates.php?id=${id}`, data).then(r => r.data)
export const deleteVatRate = (id: number) =>
  api.delete(`/settings/vat-rates.php?id=${id}`).then(r => r.data)

// Reminder Templates
export const getReminderTemplates = () => api.get<ReminderTemplate[]>('/settings/reminder-templates.php').then(r => r.data)
export const createReminderTemplate = (data: Omit<ReminderTemplate, 'id' | 'created_at' | 'updated_at'>) =>
  api.post<ReminderTemplate>('/settings/reminder-templates.php', data).then(r => r.data)
export const updateReminderTemplate = (id: number, data: Partial<ReminderTemplate>) =>
  api.put<ReminderTemplate>(`/settings/reminder-templates.php?id=${id}`, data).then(r => r.data)
export const deleteReminderTemplate = (id: number) =>
  api.delete(`/settings/reminder-templates.php?id=${id}`).then(r => r.data)

// User Profile
export const getUserProfile = () => api.get<User>('/auth/profile.php').then(r => r.data)
export const updateUserProfile = (data: Partial<User>) =>
  api.put<User>('/auth/profile.php', data).then(r => r.data)

// Auth
export const login = (email: string, password: string) =>
  api.post<{ token: string; user: User }>('/auth/login.php', { email, password }).then(r => r.data)
export const logout = () => api.post('/auth/logout.php').then(r => r.data)

// PDF Generation
export const generateInvoicePDF = (invoiceId: number) =>
  api.get(`/pdf/invoice.php?id=${invoiceId}`, { responseType: 'blob' }).then(r => r.data)
export const generateReceiptPDF = (receiptId: number) =>
  api.get(`/pdf/receipt.php?id=${receiptId}`, { responseType: 'blob' }).then(r => r.data)

import type { Worker, Message, Reklamation, ReklamationComment } from '../types/workers'
import type { Booking } from '../types'

// Workers
export const getWorkers = () => api.get<Worker[]>('/workers.php').then(r => r.data)

// Bookings
export const getBookings = () => api.get<Booking[]>('/bookings.php').then(r => r.data)
export const createBooking = (data: Omit<Booking, 'id' | 'created_at' | 'updated_at'>) =>
  api.post<Booking>('/bookings.php', data).then(r => r.data)
export const updateBooking = (id: number, data: Partial<Booking>) =>
  api.put<Booking>(`/bookings.php?id=${id}`, data).then(r => r.data)
export const deleteBooking = (id: number) =>
  api.delete(`/bookings.php?id=${id}`).then(r => r.data)
export const getWorker = (id: number) => api.get<Worker>(`/workers.php?id=${id}`).then(r => r.data)
export const createWorker = (data: Omit<Worker, 'id' | 'created_at' | 'updated_at'>) =>
  api.post<Worker>('/workers.php', data).then(r => r.data)
export const updateWorker = (id: number, data: Partial<Worker>) =>
  api.put<Worker>(`/workers.php?id=${id}`, data).then(r => r.data)
export const deleteWorker = (id: number) =>
  api.delete(`/workers.php?id=${id}`).then(r => r.data)

// Messages
export const getMessages = () => api.get<Message[]>('/messages.php').then(r => r.data)
export const getConversation = (key: string) =>
  api.get<Message[]>(`/messages.php?conversation=${key}`).then(r => r.data)
export const sendMessage = (data: {
  sender_type: string
  sender_id: number
  sender_name: string
  recipient_type: string
  recipient_id: number
  recipient_name: string
  content: string
  channel?: string
  channels?: string[]
  attachments?: string[]
}) => api.post<Message>('/messages.php', data).then(r => r.data)
export const updateMessageStatus = (id: number, status: string) =>
  api.put(`/messages.php?id=${id}`, { status }).then(r => r.data)

// Reklamationer
export const getReklamationer = () => api.get<Reklamation[]>('/reklamation.php').then(r => r.data)
export const getReklamation = (id: number) => api.get<Reklamation>(`/reklamation.php?id=${id}`).then(r => r.data)
export const createReklamation = (data: FormData) =>
  api.post<Reklamation>('/reklamation.php', data).then(r => r.data)
export const updateReklamation = (id: number, data: Partial<Reklamation>) =>
  api.put<Reklamation>(`/reklamation.php?id=${id}`, data).then(r => r.data)
export const deleteReklamation = (id: number) =>
  api.delete(`/reklamation.php?id=${id}`).then(r => r.data)
