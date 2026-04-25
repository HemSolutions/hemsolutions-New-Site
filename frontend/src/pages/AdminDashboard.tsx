import { Routes, Route } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Dashboard from './Dashboard'
import InvoiceManagement from './InvoiceManagement'
import ReceiptManagement from './ReceiptManagement'
import CustomerManagement from './CustomerManagement'
import CustomerForm from './customers/CustomerForm'
import CustomerList from './customers/CustomerList'
import ArticleManagement from './ArticleManagement'
import PaymentManagement from './PaymentManagement'
import ReminderManagement from './ReminderManagement'
import Reports from './Reports'
import SettingsPage from './Settings'
import WorkersList from './WorkersList'
import Messages from './Messages'
import Reklamation from './Reklamation'
import CalendarPage from './CalendarPage'

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
          <Route path="/invoices/new" element={<InvoiceManagement />} />
          <Route path="/invoices/new-rot" element={<InvoiceManagement />} />
          <Route path="/invoices/new-rut" element={<InvoiceManagement />} />
          <Route path="/invoices/apply-rot" element={<InvoiceManagement />} />
          <Route path="/invoices/apply-rut" element={<InvoiceManagement />} />
          <Route path="/invoices/:id" element={<InvoiceManagement />} />
          <Route path="/receipts" element={<ReceiptManagement />} />
          <Route path="/customers" element={<CustomerList />} />
          <Route path="/customers/new" element={<CustomerForm />} />
          <Route path="/customers/:id" element={<CustomerManagement />} />
          <Route path="/articles" element={<ArticleManagement />} />
          <Route path="/payments" element={<PaymentManagement />} />
          <Route path="/payments/new" element={<PaymentManagement />} />
          <Route path="/reminders" element={<ReminderManagement />} />
          <Route path="/reminders/new" element={<ReminderManagement />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/reports/*" element={<Reports />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/workers" element={<WorkersList />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/reklamation" element={<Reklamation />} />
          <Route path="/calendar" element={<CalendarPage />} />
        </Routes>
      </main>
    </div>
  )
}
