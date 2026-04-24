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

export interface Message {
  id: number;
  sender_type: 'admin' | 'worker' | 'customer';
  sender_id: number;
  sender_name: string;
  recipient_type: 'admin' | 'worker' | 'customer';
  recipient_id: number;
  recipient_name: string;
  content: string;
  channel: 'app' | 'sms' | 'email' | 'all';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  attachments: string;
  created_at: string;
}

export interface Reklamation {
  id: number;
  customer_id: number;
  customer_name: string;
  title: string;
  description: string;
  status: 'new' | 'processing' | 'resolved' | 'rejected';
  images: string;
  share_with_customer: boolean;
  share_with_worker: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReklamationComment {
  id: number;
  reklamation_id: number;
  author_type: 'admin' | 'worker' | 'customer';
  author_name: string;
  content: string;
  created_at: string;
}
