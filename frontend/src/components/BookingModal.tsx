import { useState, useEffect, useMemo } from 'react';
import { X, Plus, Trash2, Calendar, Clock, User, Wrench, Repeat, ChevronDown, Search } from 'lucide-react';
import type { Booking, Customer, Worker, Article } from '../types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: BookingFormData) => void;
  onDelete?: (id: number) => void;
  booking?: Booking | null;
  initialDate?: Date;
  customers: Customer[];
  workers: Worker[];
  services: Article[];
}

export interface BookingFormData {
  id?: number;
  customer_id?: number;
  new_customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  worker_id: number;
  service_id?: number;
  start_time: string;
  end_time: string;
  duration_hours: number;
  duration_minutes: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  notes: string;
  is_recurring: boolean;
  recurrence_rule?: string;
}

const HOURS_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES_OPTIONS = [0, 15, 30, 45];
const STATUS_OPTIONS: { value: 'confirmed' | 'pending' | 'cancelled'; label: string }[] = [
  { value: 'confirmed', label: 'Bekräftad' },
  { value: 'pending', label: 'Väntande' },
  { value: 'cancelled', label: 'Avbokad' },
];

function formatDateTimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function parseDateTimeLocal(value: string): Date {
  return new Date(value);
}

export default function BookingModal({ isOpen, onClose, onSave, onDelete, booking, initialDate, customers, workers, services }: BookingModalProps) {
  const isEditing = !!booking;

  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [isNewCustomer, setIsNewCustomer] = useState(false);

  const defaultDate = initialDate || new Date();
  const defaultEnd = new Date(defaultDate);
  defaultEnd.setHours(defaultEnd.getHours() + 2);

  const [form, setForm] = useState<BookingFormData>({
    worker_id: workers[0]?.id || 0,
    service_id: services[0]?.id,
    start_time: formatDateTimeLocal(defaultDate),
    end_time: formatDateTimeLocal(defaultEnd),
    duration_hours: 2,
    duration_minutes: 0,
    status: 'pending',
    notes: '',
    is_recurring: false,
    recurrence_rule: '',
  });

  // Populate form when editing
  useEffect(() => {
    if (booking) {
      const start = new Date(booking.start_time.replace(' ', 'T'));
      const end = new Date(booking.end_time.replace(' ', 'T'));
      const durationMs = end.getTime() - start.getTime();
      const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
      const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

      setForm({
        id: booking.id,
        customer_id: booking.customer_id,
        worker_id: booking.worker_id,
        service_id: booking.service_id,
        start_time: formatDateTimeLocal(start),
        end_time: formatDateTimeLocal(end),
        duration_hours: durationHours || 1,
        duration_minutes: durationMinutes,
        status: booking.status,
        notes: booking.notes || '',
        is_recurring: !!booking.is_recurring,
        recurrence_rule: booking.recurrence_rule || '',
      });
      setIsNewCustomer(false);
    } else if (initialDate) {
      const end = new Date(initialDate);
      end.setHours(end.getHours() + 2);
      setForm(prev => ({
        ...prev,
        start_time: formatDateTimeLocal(initialDate),
        end_time: formatDateTimeLocal(end),
        customer_id: undefined,
        notes: '',
        is_recurring: false,
      }));
      setIsNewCustomer(false);
    }
  }, [booking, initialDate]);

  // Auto-calculate end time when duration changes
  useEffect(() => {
    const start = parseDateTimeLocal(form.start_time);
    const totalMinutes = form.duration_hours * 60 + form.duration_minutes;
    const end = new Date(start.getTime() + totalMinutes * 60 * 1000);
    setForm(prev => ({ ...prev, end_time: formatDateTimeLocal(end) }));
  }, [form.duration_hours, form.duration_minutes]);

  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return customers;
    const q = customerSearch.toLowerCase();
    return customers.filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone?.includes(q));
  }, [customerSearch, customers]);

  const selectedCustomer = customers.find(c => c.id === form.customer_id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Redigera bokning' : 'Ny bokning'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Time Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Tid
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Startar</label>
                <input
                  type="datetime-local"
                  value={form.start_time}
                  onChange={e => setForm(prev => ({ ...prev, start_time: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slutar</label>
                <input
                  type="datetime-local"
                  value={form.end_time}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timmar</label>
                <select
                  value={form.duration_hours}
                  onChange={e => setForm(prev => ({ ...prev, duration_hours: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  {HOURS_OPTIONS.map(h => <option key={h} value={h}>{h} tim</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minuter</label>
                <select
                  value={form.duration_minutes}
                  onChange={e => setForm(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  {MINUTES_OPTIONS.map(m => <option key={m} value={m}>{m} min</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Worker & Service */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              Tilldelning
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Arbetare</label>
                <select
                  value={form.worker_id}
                  onChange={e => setForm(prev => ({ ...prev, worker_id: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                >
                  <option value={0}>Välj arbetare...</option>
                  {workers.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tjänst</label>
                <select
                  value={form.service_id || ''}
                  onChange={e => setForm(prev => ({ ...prev, service_id: e.target.value ? parseInt(e.target.value) : undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Välj tjänst...</option>
                  {services.filter(s => s.type === 'service').map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, status: opt.value }))}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    form.status === opt.value
                      ? opt.value === 'confirmed' ? 'bg-emerald-100 text-emerald-800 ring-2 ring-emerald-500'
                        : opt.value === 'pending' ? 'bg-amber-100 text-amber-800 ring-2 ring-amber-500'
                        : 'bg-red-100 text-red-800 ring-2 ring-red-500'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Customer Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
              <User className="w-4 h-4" />
              Kund
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => { setIsNewCustomer(false); setShowCustomerDropdown(false); }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!isNewCustomer ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Befintlig kund
              </button>
              <button
                type="button"
                onClick={() => { setIsNewCustomer(true); setForm(prev => ({ ...prev, customer_id: undefined })); }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isNewCustomer ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Ny kund
              </button>
            </div>

            {!isNewCustomer ? (
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={selectedCustomer ? selectedCustomer.name : customerSearch}
                    onChange={e => { setCustomerSearch(e.target.value); setShowCustomerDropdown(true); setForm(prev => ({ ...prev, customer_id: undefined })); }}
                    onFocus={() => setShowCustomerDropdown(true)}
                    placeholder="Sök kund..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  {selectedCustomer && (
                    <button
                      type="button"
                      onClick={() => { setForm(prev => ({ ...prev, customer_id: undefined })); setCustomerSearch(''); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                    >
                      <X className="w-3 h-3 text-gray-400" />
                    </button>
                  )}
                </div>
                {showCustomerDropdown && !selectedCustomer && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredCustomers.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-gray-500">Inga kunder hittades</div>
                    ) : (
                      filteredCustomers.map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => { setForm(prev => ({ ...prev, customer_id: c.id })); setCustomerSearch(''); setShowCustomerDropdown(false); }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex flex-col"
                        >
                          <span className="font-medium">{c.name}</span>
                          <span className="text-xs text-gray-500">{c.email} · {c.phone}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Namn</label>
                  <input
                    type="text"
                    value={form.new_customer?.name || ''}
                    onChange={e => setForm(prev => ({ ...prev, new_customer: { ...(prev.new_customer || {}), name: e.target.value } }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    required={isNewCustomer}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">E-post</label>
                    <input
                      type="email"
                      value={form.new_customer?.email || ''}
                      onChange={e => setForm(prev => ({ ...prev, new_customer: { ...(prev.new_customer || {}), email: e.target.value } }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                    <input
                      type="tel"
                      value={form.new_customer?.phone || ''}
                      onChange={e => setForm(prev => ({ ...prev, new_customer: { ...(prev.new_customer || {}), phone: e.target.value } }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kommentar</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm resize-none"
              placeholder="Anteckningar om bokningen..."
            />
          </div>

          {/* Recurring */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_recurring}
                onChange={e => setForm(prev => ({ ...prev, is_recurring: e.target.checked }))}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Återkommande bokning</span>
            </label>
            {form.is_recurring && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upprepningsregel</label>
                <select
                  value={form.recurrence_rule || ''}
                  onChange={e => setForm(prev => ({ ...prev, recurrence_rule: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Välj frekvens...</option>
                  <option value="FREQ=DAILY;INTERVAL=1">Varje dag</option>
                  <option value="FREQ=WEEKLY;INTERVAL=1">Varje vecka</option>
                  <option value="FREQ=WEEKLY;INTERVAL=2">Varannan vecka</option>
                  <option value="FREQ=MONTHLY;INTERVAL=1">Varje månad</option>
                </select>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div>
              {isEditing && onDelete && (
                <button
                  type="button"
                  onClick={() => booking && onDelete(booking.id)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Ta bort
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Avbryt
              </button>
              <button
                type="submit"
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                {isEditing ? 'Spara ändringar' : 'Spara bokning'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
