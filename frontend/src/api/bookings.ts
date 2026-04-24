export const getBookings = async () => {
  const res = await fetch('/api/bookings.php');
  return res.json();
};

export const createBooking = async (data: any) => {
  const res = await fetch('/api/bookings.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const updateBooking = async (id: number, data: any) => {
  const res = await fetch(`/api/bookings.php?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const deleteBooking = async (id: number) => {
  const res = await fetch(`/api/bookings.php?id=${id}`, {
    method: 'DELETE',
  });
  return res.json();
};
