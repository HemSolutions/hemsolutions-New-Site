// Stub API for messages
export const getMessages = async (filters?: any) => {
  const res = await fetch('/api/messages.php');
  return res.json();
};

export const sendMessage = async (data: any) => {
  const res = await fetch('/api/messages.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};
