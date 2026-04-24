export interface Customer {
  id: number;
  // Customer number (auto-generated, editable)
  customer_number: string;
  // Basic info
  name: string;
  email: string;
  phone: string;
  mobile_phone: string;
  // Address
  address: string;
  city: string;
  postal_code: string;
  // Invoice address
  invoice_address_line1: string;
  invoice_address_line2: string;
  invoice_address_line3: string;
  invoice_postal_code: string;
  invoice_city: string;
  // Organization
  org_number: string;
  person_number: string; // YYYYMMDD-XXXX format
  // Payment
  payment_terms_days: number;
  late_payment_interest: number;
  discount_percent: number;
  // E-invoice
  e_invoice: boolean;
  gln_number: string;
  // Reference
  reference: string;
  // Additional
  invoice_info: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Worker {
  id: number;
  name: string;
  person_number?: string;
  email: string;
  phone?: string;
  address?: string;
  password?: string;
  status: 'available' | 'unavailable' | 'sick' | 'vacation';
  active: boolean;
  color?: string;
  role?: string;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: number;
  customer_id: number;
  worker_id: number;
  service_id?: number;
  start_time: string;
  end_time: string;
  duration_hours: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  notes: string;
  is_recurring: boolean;
  recurrence_rule?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  worker_name?: string;
  worker_color?: string;
  service_name?: string;
}

export interface Article {
  id: number;
  name: string;
  description: string;
  price: number;
  type: 'product' | 'service';
  vat_rate: number;
  is_rot_rut: boolean;
  unit: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerPrice {
  id: number;
  customer_id: number;
  article_id: number;
  custom_price: number;
  created_at: string;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  customer_id: number;
  customer_name: string;
  issue_date: string;
  due_date: string;
  total_amount: number;
  vat_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  is_rot_rut: boolean;
  rot_rut_amount: number;
  notes: string;
  reference?: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: number;
  invoice_id: number;
  article_id: number;
  article_name: string;
  quantity: number;
  unit_price: number;
  vat_rate: number;
  total_price: number;
}

export interface Receipt {
  id: number;
  receipt_number: string;
  customer_id: number;
  customer_name: string;
  issue_date: string;
  total_amount: number;
  vat_amount: number;
  payment_method: string;
  created_at: string;
}

export interface ReceiptItem {
  id: number;
  receipt_id: number;
  article_id: number;
  article_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Payment {
  id: number;
  invoice_id?: number;
  invoice_number?: string;
  customer_id: number;
  customer_name: string;
  amount: number;
  payment_date: string;
  payment_method: 'bank_transfer' | 'card' | 'swish' | 'cash';
  reference: string;
  created_at: string;
}

export interface Reminder {
  id: number;
  invoice_id: number;
  invoice_number: string;
  customer_id: number;
  customer_name: string;
  reminder_level: number;
  reminder_date: string;
  fee_amount: number;
  status: 'pending' | 'sent' | 'resolved';
  created_at: string;
}

// Extended Company Settings
export interface CompanySettings {
  id: number;
  company_name: string;
  org_number: string;
  vat_number: string;
  address: string;
  postal_code: string;
  city: string;
  phone: string;
  email: string;
  website: string;
  bankgiro: string;
  plusgiro: string;
  bank_account?: string;
  iban: string;
  swift: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceSettings {
  id: number;
  payment_terms_days: number;
  default_vat_rate: number;
  invoice_number_prefix: string;
  default_notes: string;
  default_footer: string;
  late_payment_interest_rate: number;
  reminder_fee_1: number;
  reminder_fee_2: number;
  reminder_fee_3: number;
  created_at: string;
  updated_at: string;
}

export interface RotRutSettings {
  id: number;
  rot_enabled: boolean;
  rut_enabled: boolean;
  rot_default_percentage: number;
  rut_default_percentage: number;
  rot_work_categories: string[];
  rut_work_categories: string[];
  created_at: string;
  updated_at: string;
}

export interface ReceiptSettings {
  id: number;
  receipt_number_prefix: string;
  default_notes: string;
  default_footer: string;
  show_vat_on_receipt: boolean;
  created_at: string;
  updated_at: string;
}

export interface VatRate {
  id: number;
  name: string;
  rate: number;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReminderTemplate {
  id: number;
  level: number;
  name: string;
  subject: string;
  body: string;
  days_after_due: number;
  fee_amount: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_sales_year: number;
  total_sales_month: number;
  outstanding_amount: number;
  overdue_amount: number;
  invoice_count: number;
  paid_invoice_count: number;
}

export interface TopCustomer {
  customer_id: number;
  customer_name: string;
  total_amount: number;
  invoice_count: number;
}

export interface PaymentWithInvoice extends Payment {
  invoice_number?: string;
}

export interface InvoiceWithCustomer extends Invoice {
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  items?: InvoiceItem[];
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'employee' | 'customer';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export * from './workers';
