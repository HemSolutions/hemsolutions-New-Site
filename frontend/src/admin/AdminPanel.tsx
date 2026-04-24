// Legacy admin panel - now integrated into pages/AdminDashboard.tsx
import { useEffect } from 'react';

export function AdminPanel() {
  useEffect(() => {
    // Redirect to new admin dashboard
    window.location.href = '/admin';
  }, []);

  return <div>Redirecting to new admin dashboard...</div>;
}

