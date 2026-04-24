import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CalendarDays } from 'lucide-react';
import Calendar, { type CalendarView } from '../components/Calendar';
import BookingModal, { type BookingFormData } from '../components/BookingModal';
import { getBookings, createBooking, updateBooking, deleteBooking, getWorkers, getCustomers, getArticles } from '../api';
import type { Booking } from '../types';

export default function CalendarPage() {
  const [view, setView] = useState<CalendarView>('month');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => getBookings(),
  });

  const { data: workers = [] } = useQuery({
    queryKey: ['workers'],
    queryFn: getWorkers,
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers,
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: getArticles,
  });

  const createMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Bokning skapad');
      setIsModalOpen(false);
    },
    onError: () => toast.error('Kunde inte skapa bokning'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Booking> }) => updateBooking(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Bokning uppdaterad');
      setIsModalOpen(false);
      setSelectedBooking(null);
    },
    onError: () => toast.error('Kunde inte uppdatera bokning'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Bokning borttagen');
      setIsModalOpen(false);
      setSelectedBooking(null);
    },
    onError: () => toast.error('Kunde inte ta bort bokning'),
  });

  const handleDateClick = useCallback((date: Date) => {
    setSelectedDate(date);
    setSelectedBooking(null);
    setIsModalOpen(true);
  }, []);

  const handleBookingClick = useCallback((booking: Booking) => {
    setSelectedBooking(booking);
    setSelectedDate(undefined);
    setIsModalOpen(true);
  }, []);

  const handleBookingDrop = useCallback((bookingId: number, newDate: Date) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const oldStart = new Date(booking.start_time.replace(' ', 'T'));
    const oldEnd = new Date(booking.end_time.replace(' ', 'T'));
    const duration = oldEnd.getTime() - oldStart.getTime();

    const newStart = new Date(newDate);
    newStart.setHours(oldStart.getHours(), oldStart.getMinutes(), 0, 0);

    const newEnd = new Date(newStart.getTime() + duration);

    updateMutation.mutate({
      id: bookingId,
      data: {
        start_time: newStart.toISOString().replace('T', ' ').substring(0, 19),
        end_time: newEnd.toISOString().replace('T', ' ').substring(0, 19),
      },
    });
  }, [bookings, updateMutation]);

  const handleSave = useCallback((formData: BookingFormData) => {
    if (formData.id) {
      updateMutation.mutate({
        id: formData.id,
        data: {
          customer_id: formData.customer_id || 0,
          worker_id: formData.worker_id,
          service_id: formData.service_id || 0,
          start_time: formData.start_time.replace('T', ' '),
          end_time: formData.end_time.replace('T', ' '),
          duration_hours: formData.duration_hours + (formData.duration_minutes / 60),
          status: formData.status,
          notes: formData.notes,
          is_recurring: formData.is_recurring,
          recurrence_rule: formData.recurrence_rule,
        },
      });
    } else {
      createMutation.mutate({
        customer_id: formData.customer_id || 0,
        worker_id: formData.worker_id,
        service_id: formData.service_id || 0,
        start_time: formData.start_time.replace('T', ' '),
        end_time: formData.end_time.replace('T', ' '),
        duration_hours: formData.duration_hours + (formData.duration_minutes / 60),
        status: formData.status,
        notes: formData.notes,
        is_recurring: formData.is_recurring,
        recurrence_rule: formData.recurrence_rule,
      });
    }
  }, [createMutation, updateMutation]);

  const handleDelete = useCallback((id: number) => {
    if (confirm('Är du säker på att du vill ta bort denna bokning?')) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

  if (bookingsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <CalendarDays className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kalender</h1>
            <p className="text-sm text-gray-500">Schemalägg och hantera bokningar</p>
          </div>
        </div>
        <button
          onClick={() => {
            setSelectedDate(new Date());
            setSelectedBooking(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          + Ny bokning
        </button>
      </div>

      <div className="flex-1 min-h-0">
        <Calendar
          bookings={bookings}
          view={view}
          onViewChange={setView}
          onDateClick={handleDateClick}
          onBookingClick={handleBookingClick}
          onBookingDrop={handleBookingDrop}
        />
      </div>

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedBooking(null); }}
        onSave={handleSave}
        onDelete={selectedBooking ? handleDelete : undefined}
        booking={selectedBooking}
        initialDate={selectedDate}
        customers={customers}
        workers={workers}
        services={services}
      />
    </div>
  );
}
