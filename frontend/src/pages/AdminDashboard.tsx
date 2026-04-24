import { Routes, Route } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Dashboard from './Dashboard'
import Overview from './Overview'
import InvoiceManagement from './InvoiceManagement'
import ReceiptManagement from './ReceiptManagement'
import CustomerManagement from './CustomerManagement'
import ArticleManagement from './ArticleManagement'
import PaymentManagement from './PaymentManagement'
import ReminderManagement from './ReminderManagement'
import Reports from './Reports'
import SettingsPage from './Settings'

interface AdminDashboardProps {
  onLogout: () => void
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar onLogout={onLogout} />
      
      <main className="flex-1 p-4 lg:p-8 overflow-auto w-full">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/invoices" element={<InvoiceManagement />} />
          <Route path="/receipts" element={<ReceiptManagement />} />
          <Route path="/customers" element={<CustomerManagement />} />
          <Route path="/articles" element={<ArticleManagement />} />
          <Route path="/payments" element={<PaymentManagement />} />
          <Route path="/reminders" element={<ReminderManagement />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/reports/*" element={<Reports />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  )
}
