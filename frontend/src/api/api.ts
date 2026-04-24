import axios from 'axios'

// API Base URL - Change this to your Render backend URL when deployed
// For local development: http://localhost:3001
// For production: https://your-app.onrender.com
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// Request interceptor - add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ============ AUTH ============
export const auth = {
  register: (data: { email: string; password: string; name: string; phone?: string; address?: string; postcode?: string; city?: string }) =>
    api.post('/auth/register', data).then(r => r.data),
  
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }).then(r => r.data),
  
  getMe: () => api.get('/auth/me').then(r => r.data),
  
  updateProfile: (data: Partial<{ name: string; phone: string; address: string; postcode: string; city: string }>) =>
    api.patch('/auth/me', data).then(r => r.data),
}

// ============ BOOKINGS ============
export const bookings = {
  getAvailableSlots: (date: string, serviceId?: string) =>
    api.get('/bookings/available-slots', { params: { date, service_id: serviceId } }).then(r => r.data),
  
  getAll: (params?: { status?: string; date_from?: string; date_to?: string; limit?: number; offset?: number }) =>
    api.get('/bookings', { params }).then(r => r.data),
  
  getById: (id: number) => api.get(`/bookings/${id}`).then(r => r.data),
  
  create: (data: {
    service_type: string
    booking_date: string
    time_slot: string
    hours: number
    address: string
    postcode: string
    city: string
    notes?: string
    customer_name?: string
    customer_email?: string
    customer_phone?: string
  }) => api.post('/bookings', data).then(r => r.data),
  
  update: (id: number, data: Partial<{
    service_type: string
    booking_date: string
    time_slot: string
    hours: number
    address: string
    postcode: string
    city: string
    notes: string
    status: string
    worker_id: number
    payment_status: string
  }>) => api.patch(`/bookings/${id}`, data).then(r => r.data),
  
  cancel: (id: number) => api.delete(`/bookings/${id}`).then(r => r.data),
}

// ============ CUSTOMERS ============
export const customers = {
  getAll: (params?: { search?: string; limit?: number; offset?: number }) =>
    api.get('/customers', { params }).then(r => r.data),
  
  getById: (id: number) => api.get(`/customers/${id}`).then(r => r.data),
}

// ============ WORKERS ============
export const workers = {
  getAll: () => api.get('/workers').then(r => r.data),
  
  create: (data: { name: string; email: string; phone: string; skills?: string[]; availability?: object }) =>
    api.post('/workers', data).then(r => r.data),
  
  getBookings: (id: number) => api.get(`/workers/${id}/bookings`).then(r => r.data),
}

// ============ INVOICES ============
export const invoices = {
  getAll: (params?: { status?: string; limit?: number; offset?: number }) =>
    api.get('/invoices', { params }).then(r => r.data),
  
  create: (data: { booking_id: number; due_date_days?: number }) =>
    api.post('/invoices', data).then(r => r.data),
}

// ============ PAYMENTS ============
export const payments = {
  createIntent: (invoice_id: number) =>
    api.post('/payments/create-intent', { invoice_id }).then(r => r.data),
  
  swish: (invoice_id: number, phone: string) =>
    api.post('/payments/swish', { invoice_id, phone }).then(r => r.data),
}

// ============ ADMIN ============
export const admin = {
  getStats: () => api.get('/admin/stats').then(r => r.data),
  
  getNotifications: (params?: { status?: string; limit?: number }) =>
    api.get('/admin/notifications', { params }).then(r => r.data),
}

// ============ CONTACT ============
export const contact = {
  send: (data: { name: string; email: string; phone?: string; subject: string; message: string }) =>
    api.post('/contact', data).then(r => r.data),
}

// ============ SETTINGS ============
export const settings = {
  getAll: () => api.get('/settings').then(r => r.data),
  
  update: (key: string, value: string, description?: string) =>
    api.put(`/settings/${key}`, { value, description }).then(r => r.data),
}

// ============ HEALTH ============
export const health = {
  check: () => api.get('/health').then(r => r.data),
}

export default api
