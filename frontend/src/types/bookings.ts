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
}

export interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  customerName: string;
  workerName: string;
  status: string;
  color?: string;
}
