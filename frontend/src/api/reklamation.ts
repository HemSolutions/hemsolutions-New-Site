// Stub API for reklamation
export const getReklamationer = async () => {
  const res = await fetch('/api/reklamation.php');
  return res.json();
};

export const deleteReklamation = async (id: number) => {
  const res = await fetch(`/api/reklamation.php?id=${id}`, {
    method: 'DELETE',
  });
  return res.json();
};

export const createReklamation = async (data: Record<string, unknown>) => {
  const res = await fetch('/api/reklamation.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const updateReklamation = async (id: number, data: Record<string, unknown>) => {
  const res = await fetch(`/api/reklamation.php?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};
