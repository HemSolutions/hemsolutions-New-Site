// Stub API for workers
export const getWorkers = async () => {
  const res = await fetch('/api/workers.php');
  return res.json();
};

export const createWorker = async (data: any) => {
  const res = await fetch('/api/workers.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const updateWorker = async (id: number, data: any) => {
  const res = await fetch(`/api/workers.php?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const deleteWorker = async (id: number) => {
  const res = await fetch(`/api/workers.php?id=${id}`, {
    method: 'DELETE',
  });
  return res.json();
};
