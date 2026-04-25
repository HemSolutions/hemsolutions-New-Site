import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://hemsolutions-api.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getBookings = async () => {
  const res = await api.get('/bookings');
  return res.data.bookings || res.data.data || res.data || [];
};

export const createBooking = async (data: any) => {
  const res = await api.post('/bookings', data);
  return res.data;
};

export const updateBooking = async (id: number, data: any) => {
  const res = await api.put(`/bookings/${id}`, data);
  return res.data;
};

export const deleteBooking = async (id: number) => {
  const res = await api.delete(`/bookings/${id}`);
  return res.data;
};
