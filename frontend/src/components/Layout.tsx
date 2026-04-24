import { useState, useEffect, ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  Receipt,
  Users,
  Package,
  CreditCard,
  Bell,
  BarChart3,
  Settings,
  ChevronRight,
  ChevronDown,
  Plus,
  List,
  MessageSquare,
  CalendarDays,
  AlertTriangle,
} from 'lucide-react'
import TopNav from './TopNav'

interface LayoutProps {
  children: ReactNode
  onLogout: () => void
  user?: {
    name: string
    email: string
    role: string
  }
}

// Simple building icon wrapper
function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18" /><path d="M5 21V7l8-4 8 4v14" /><path d="M9 21v-6h6v6" />
    </svg>
  )
}

interface MenuSection {
  key: string
  icon: React.ElementType
  label: string
  path: string
  children?: { path: string; label: string; icon: React.ElementType }[]
}

const menuSections: MenuSection[] = [
  {
    key: 'overview',
    icon: LayoutDashboard,
    label: 'Översikt',
    path: '/admin',
  },
  {
    key: 'invoices',
    icon: FileText,
    label: 'Faktura',
    path: '/admin/invoices',
    children: [
      { path: '/admin/invoices', label: 'Fakturor', icon: List },
      { path: '/admin/invoices/new', label: 'Ny faktura', icon: Plus },
    ],
  },
  {
    key: 'receipts',
    icon: Receipt,
    label: 'Kvitto',
    path: '/admin/receipts',
    children: [
      { path: '/admin/receipts', label: 'Kvitton', icon: List },
      { path: '/admin/receipts/new', label: 'Nytt kvitto', icon: Plus },
    ],
  },
  {
    key: 'customers',
    icon: Users,
    label: 'Kund',
    path: '/admin/customers',
    children: [
      { path: '/admin/customers', label: 'Kunder', icon: List },
      { path: '/admin/customers/new', label: 'Ny kund', icon: Plus },
    ],
  },
  {
    key: 'articles',
    icon: Package,
    label: 'Artikel',
    path: '/admin/articles',
    children: [
      { path: '/admin/articles', label: 'Artiklar', icon: List },
      { path: '/admin/articles/new', label: 'Ny artikel', icon: Plus },
    ],
  },
  {
    key: 'payments',
    icon: CreditCard,
    label: 'Betalning',
    path: '/admin/payments',
    children: [
      { path: '/admin/payments', label: 'Inbetalningar', icon: List },
    ],
  },
  {
    key: 'reminders',
    icon: Bell,
    label: 'Påminnelse',
    path: '/admin/reminders',
    children: [
      { path: '/admin/reminders', label: 'Påminnelser', icon: List },
    ],
  },
  {
    key: 'reports',
    icon: BarChart3,
    label: 'Rapporter',
    path: '/admin/reports',
    children: [
      { path: '/admin/reports', label: 'Översikt rapporter', icon: List },
    ],
  },
  {
    key: 'calendar',
    icon: CalendarDays,
    label: 'Kalender',
    path: '/admin/calendar',
  },
  {
    key: 'workers',
    icon: Users,
    label: 'Medarbetare',
    path: '/admin/workers',
  },
  {
    key: 'messages',
    icon: MessageSquare,
    label: 'Meddelanden',
    path: '/admin/messages',
  },
  {
    key: 'reklamation',
    icon: AlertTriangle,
    label: 'Reklamation',
    path: '/admin/reklamation',
  },
  {
    key: 'settings',
    icon: Settings,
    label: 'Inställningar',
    path: '/admin/settings',
    children: [
      { path: '/admin/settings/company', label: 'Företag', icon: BuildingIcon },
      { path: '/admin/settings/invoice', label: 'Faktura', icon: FileText },
      { path: '/admin/settings/rotrut', label: 'ROT/RUT', icon: Settings },
      { path: '/admin/settings/receipt', label: 'Kvitto', icon: Receipt },
      { path: '/admin/settings/vat', label: 'Moms', icon: CreditCard },
      { path: '/admin/settings/reminders', label: 'Påminnelser', icon: Bell },
    ],
  },
]

export default function Layout({ children, onLogout, user }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<string[]>(['invoices', 'customers'])
  const location = useLocation()

  // Auto-expand section based on current route
  useEffect(() => {
    const currentPath = location.pathname
    for (const section of menuSections) {
      if (section.children && currentPath.startsWith(section.path) && section.path !== '/admin') {
        setExpandedSections((prev) =>
          prev.includes(section.key) ? prev : [...prev, section.key]
        )
      }
    }
  }, [location.pathname])

  const toggleSection = (key: string) => {
    setExpandedSections((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/')

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation - Blue BillingPoint style */}
      <TopNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} user={user} onLogout={onLogout} />

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transition-transform duration-300 lg:translate-x-0 lg:static lg:top-14 lg:h-[calc(100vh-3.5rem)] shadow-sm`}
          style={{ top: '3.5rem' }}
        >
          <div className="flex flex-col h-full overflow-y-auto">
            {/* Navigation */}
            <nav className="flex-1 py-2">
              {menuSections.map((section) => {
                const hasChildren = section.children && section.children.length > 0
                const isExpanded = expandedSections.includes(section.key)
                const sectionActive = isActive(section.path)

                return (
                  <div key={section.key}>
                    {/* Parent item */}
                    {hasChildren ? (
                      <button
                        onClick={() => toggleSection(section.key)}
                        className={`flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium transition-colors ${
                          sectionActive
                            ? 'text-blue-700 bg-blue-50'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <section.icon className="h-5 w-5" style={{ color: sectionActive ? '#1976D2' : '#6B7280' }} />
                          <span>{section.label}</span>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    ) : (
                      <NavLink
                        to={section.path}
                        onClick={() => setSidebarOpen(false)}
                        end={section.path === '/admin'}
                        className={({ isActive: active }) =>
                          `flex items-center space-x-3 px-4 py-2.5 text-sm font-medium transition-colors ${
                            active
                              ? 'text-blue-700 bg-blue-50'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`
                        }
                      >
                        <section.icon className="h-5 w-5" style={{ color: sectionActive ? '#1976D2' : '#6B7280' }} />
                        <span>{section.label}</span>
                      </NavLink>
                    )}

                    {/* Children */}
                    {isExpanded && section.children && section.children.length > 0 && (
                      <div className="bg-gray-50">
                        {section.children.map((child) => {
                          const childActive = location.pathname === child.path
                          return (
                            <NavLink
                              key={child.path}
                              to={child.path}
                              onClick={() => setSidebarOpen(false)}
                              className={({ isActive: active }) =>
                                `flex items-center space-x-3 pl-11 pr-4 py-2 text-sm transition-colors ${
                                  active
                                    ? 'text-blue-700 bg-blue-50 border-l-2 border-blue-600'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`
                              }
                            >
                              <span>{child.label}</span>
                            </NavLink>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </nav>

            {/* Bottom info */}
            <div className="p-4 border-t border-gray-200">
              <p className="text-xs text-gray-400 text-center">HemSolutions Billing v1.0</p>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 min-h-[calc(100vh-3.5rem)] p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
