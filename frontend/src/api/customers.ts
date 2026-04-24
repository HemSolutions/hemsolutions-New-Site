export const getCustomers = async () => {
  const res = await fetch('/api/customers.php');
  return res.json();
};

export const getCustomer = async (id: number) => {
  const res = await fetch(`/api/customers.php?id=${id}`);
  return res.json();
};

export const createCustomer = async (data: any) => {
  const res = await fetch('/api/customers.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const updateCustomer = async (id: number, data: any) => {
  const res = await fetch(`/api/customers.php?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const deleteCustomer = async (id: number) => {
  const res = await fetch(`/api/customers.php?id=${id}`, {
    method: 'DELETE',
  });
  return res.json();
};
