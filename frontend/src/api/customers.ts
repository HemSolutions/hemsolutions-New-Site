import axios from 'axios';
import type { Customer } from '../types';

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

export const getCustomers = async () => {
  const res = await api.get('/customers');
  return res.data.customers || res.data || [];
};

export const getCustomer = async (id: number) => {
  const res = await api.get(`/customers/${id}`);
  return res.data.customer || res.data;
};

export const createCustomer = async (data: any) => {
  const res = await api.post('/customers', data);
  return res.data.customer || res.data;
};

export const updateCustomer = async (id: number, data: any) => {
  const res = await api.put(`/customers/${id}`, data);
  return res.data.customer || res.data;
};

export const deleteCustomer = async (id: number) => {
  const res = await api.delete(`/customers/${id}`);
  return res.data;
};
