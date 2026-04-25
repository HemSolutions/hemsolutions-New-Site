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
  Worker,
  Booking,
} from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://hemsolutions-api.onrender.com/api'

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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

// ============ CUSTOMERS ============
export const getCustomers = () => api.get('/customers').then(r => r.data.customers || [])
export const getCustomersPaginated = (params?: { page?: number; limit?: number; search?: string; sort?: string; order?: string }) => {
  const queryParams = new URLSearchParams()
  if (params?.page) queryParams.append('page', String(params.page))
  if (params?.limit) queryParams.append('limit', String(params.limit))
  if (params?.search) queryParams.append('search', params.search)
  if (params?.sort) queryParams.append('sort', params.sort)
  if (params?.order) queryParams.append('order', params.order)
  const query = queryParams.toString()
  return api.get(`/customers${query ? '?' + query : ''}`).then(r => r.data)
}
export const getCustomer = (id: number) => api.get(`/customers/${id}`).then(r => r.data.customer || r.data)
export const createCustomer = (data: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) =>
  api.post('/customers', data).then(r => r.data.customer || r.data)
export const updateCustomer = (id: number, data: Partial<Customer>) =>
  api.put(`/customers/${id}`, data).then(r => r.data.customer || r.data)
export const deleteCustomer = (id: number) =>
  api.delete(`/customers/${id}`).then(r => r.data)

// ============ ARTICLES ============
export const getArticles = () => api.get('/services').then(r => r.data.data || r.data.services || r.data.articles || [])
export const createArticle = (data: Omit<Article, 'id' | 'created_at' | 'updated_at'>) =>
  api.post('/services', data).then(r => r.data.data || r.data)
export const updateArticle = (id: number, data: Partial<Article>) =>
  api.put(`/services/${id}`, data).then(r => r.data)
export const deleteArticle = (id: number) =>
  api.delete(`/services/${id}`).then(r => r.data)

// ============ INVOICES ============
export const getInvoices = () => api.get('/invoices').then(r => r.data.invoices || [])
export const getInvoice = (id: number) => api.get(`/invoices/${id}`).then(r => r.data.invoice || r.data)
export const createInvoice = (data: any) => api.post('/invoices', data).then(r => r.data.invoice || r.data)
export const updateInvoice = (id: number, data: Partial<Invoice>) =>
  api.put(`/invoices/${id}`, data).then(r => r.data)
export const deleteInvoice = (id: number) => api.delete(`/invoices/${id}`).then(r => r.data)

// ============ RECEIPTS ============
export const getReceipts = () => api.get('/invoices?type=receipt').then(r => r.data.invoices || [])

// ============ PAYMENTS ============
export const getPayments = () => api.get('/payments').then(r => r.data.payments || [])
export const createPayment = (data: Omit<Payment, 'id' | 'customer_name' | 'created_at'>) =>
  api.post('/payments', data).then(r => r.data.payment || r.data)
export const deletePayment = (id: number) => api.delete(`/payments/${id}`).then(r => r.data)

// ============ REMINDERS ============
export const getReminders = () => api.get('/reminders').then(r => r.data.reminders || [])
export const createReminder = (data: { invoice_id: number; type?: string; message?: string }) =>
  api.post('/reminders', data).then(r => r.data)
export const updateReminder = (id: number, status: string) =>
  api.put(`/reminders/${id}`, { status }).then(r => r.data)

// ============ DASHBOARD & REPORTS ============
export const getDashboardStats = () => api.get('/admin/stats').then(r => r.data)
export const getTopCustomers = () => api.get('/admin/dashboard').then(r => r.data.top_customers || [])
export const getOutstandingReminders = () => api.get('/reminders').then(r => r.data.reminders || [])
export const getRecentPayments = () => api.get('/payments').then(r => r.data.payments || [])

// ============ WORKERS ============
export const getWorkers = () => api.get('/workers').then(r => r.data.workers || [])
export const getWorker = (id: number) => api.get(`/workers/${id}`).then(r => r.data.worker || r.data)
export const createWorker = (data: Omit<Worker, 'id' | 'created_at' | 'updated_at'>) =>
  api.post('/workers', data).then(r => r.data.worker || r.data)
export const updateWorker = (id: number, data: Partial<Worker>) =>
  api.put(`/workers/${id}`, data).then(r => r.data)
export const deleteWorker = (id: number) => api.delete(`/workers/${id}`).then(r => r.data)

// ============ BOOKINGS ============
export const getBookings = () => api.get('/bookings').then(r => r.data.bookings || r.data.data || [])
export const createBooking = (data: any) => api.post('/bookings', data).then(r => r.data)
export const updateBooking = (id: number, data: Partial<Booking>) =>
  api.put(`/bookings/${id}`, data).then(r => r.data)
export const deleteBooking = (id: number) => api.delete(`/bookings/${id}`).then(r => r.data)

// ============ SETTINGS ============
export const getSettings = () => api.get('/settings').then(r => r.data.settings || [])
export const getSetting = (key: string) => api.get(`/settings/${key}`).then(r => r.data.setting || r.data)
export const updateSetting = (key: string, value: string, description?: string) =>
  api.put(`/settings/${key}`, { value, description }).then(r => r.data.setting || r.data)
export const getCompanySettings = async () => {
  const settings = await getSettings()
  const s: Record<string, string> = {}
  settings.forEach((item: any) => { s[item.key] = item.value })
  return s
}

// Settings stubs for compatibility
export const updateCompanySettings = (data: any) => api.put('/settings/company', data).then(r => r.data)
export const uploadCompanyLogo = (file: File) => {
  const formData = new FormData()
  formData.append('logo', file)
  return api.post('/settings/logo', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data)
}

export const getInvoiceSettings = () => api.get('/settings/invoice').then(r => r.data)
export const updateInvoiceSettings = (data: any) => api.put('/settings/invoice', data).then(r => r.data)

export const getReceiptSettings = () => api.get('/settings/receipt').then(r => r.data)
export const updateReceiptSettings = (data: any) => api.put('/settings/receipt', data).then(r => r.data)

export const getRotRutSettings = () => api.get('/settings/rotrut').then(r => r.data)
export const updateRotRutSettings = (data: any) => api.put('/settings/rotrut', data).then(r => r.data)

export const getVatRates = () => api.get('/settings/vat').then(r => r.data || [])
export const createVatRate = (data: any) => api.post('/settings/vat', data).then(r => r.data)
export const updateVatRate = (id: number, data: any) => api.put(`/settings/vat/${id}`, data).then(r => r.data)
export const deleteVatRate = (id: number) => api.delete(`/settings/vat/${id}`).then(r => r.data)

export const getReminderTemplates = () => api.get('/settings/reminders').then(r => r.data || [])
export const createReminderTemplate = (data: any) => api.post('/settings/reminders', data).then(r => r.data)
export const updateReminderTemplate = (id: number, data: any) => api.put(`/settings/reminders/${id}`, data).then(r => r.data)
export const deleteReminderTemplate = (id: number) => api.delete(`/settings/reminders/${id}`).then(r => r.data)

// ============ AUTH ============
export const login = (email: string, password: string) =>
  api.post('/auth/login', { email, password }).then(r => r.data)
export const logout = () => { localStorage.removeItem('auth_token'); localStorage.removeItem('user') }
export const getUserProfile = () => api.get('/auth/profile').then(r => r.data)

// ============ MESSAGES ============
export const getMessages = () => api.get('/contact').then(r => r.data)

export default api
