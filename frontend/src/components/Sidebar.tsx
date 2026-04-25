import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  Receipt,
  Users,
  Package,
  Wallet,
  AlertCircle,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Home,
  Search,
  Plus,
  ClipboardList,
} from 'lucide-react'
import { Button } from './ui/button'
import { cn } from '../lib/utils'

interface SidebarProps {
  onLogout: () => void
}

interface MenuItem {
  path?: string
  icon: React.ElementType
  label: string
  children?: { path: string; label: string; icon?: React.ElementType }[]
}

const menuItems: MenuItem[] = [
  { path: '/admin', icon: LayoutDashboard, label: 'Översikt' },
  {
    icon: FileText,
    label: 'Faktura',
    children: [
      { path: '/admin/invoices/new', label: 'Skapa ny', icon: Plus },
      { path: '/admin/invoices/new-rot', label: 'Skapa ny ROT', icon: Plus },
      { path: '/admin/invoices/new-rut', label: 'Skapa ny RUT', icon: Plus },
      { path: '/admin/invoices', label: 'Sök', icon: Search },
      { path: '/admin/invoices/apply-rot', label: 'Ansök ROT', icon: ClipboardList },
      { path: '/admin/invoices/apply-rut', label: 'Ansök RUT', icon: ClipboardList },
    ],
  },
  { path: '/admin/receipts', icon: Receipt, label: 'Kvitto' },
  {
    icon: Users,
    label: 'Kund',
    children: [
      { path: '/admin/customers/new', label: 'Skapa ny', icon: Plus },
      { path: '/admin/customers', label: 'Sök', icon: Search },
    ],
  },
  { path: '/admin/articles', icon: Package, label: 'Artikel' },
  {
    icon: Wallet,
    label: 'Betalning',
    children: [
      { path: '/admin/payments/new', label: 'Inbetaling', icon: Plus },
      { path: '/admin/payments', label: 'Sök', icon: Search },
    ],
  },
  {
    icon: AlertCircle,
    label: 'Påminnelse',
    children: [
      { path: '/admin/reminders/new', label: 'Skapa ny', icon: Plus },
      { path: '/admin/reminders', label: 'Sök', icon: Search },
    ],
  },
  { path: '/admin/reports', icon: BarChart3, label: 'Rapporter' },
  { path: '/admin/settings', icon: Settings, label: 'Inställningar' },
]

export default function Sidebar({ onLogout }: SidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    'Faktura': true,
    'Kund': false,
    'Betalning': false,
    'Påminnelse': false,
  })
  const location = useLocation()

  const toggleMenu = (label: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [label]: !prev[label]
    }))
  }

  const isMenuActive = (item: MenuItem) => {
    if (item.path && location.pathname === item.path) return true
    if (item.path === '/admin' && location.pathname === '/admin') return true
    if (item.children) {
      return item.children.some(child => location.pathname === child.path || location.pathname.startsWith(child.path + '/'))
    }
    return false
  }

  const isChildActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden bg-white border-b px-4 py-3 flex items-center justify-between fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">HS</span>
          </div>
          <span className="font-semibold text-lg">HemSolutions</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen overflow-y-auto',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
            <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">HS</span>
            </div>
            <div>
              <h1 className="font-bold text-lg">HemSolutions</h1>
              <p className="text-xs text-slate-400">Fakturering</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-1">
            {/* Dashboard - Always visible */}
            <NavLink
              to="/admin"
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors mb-2',
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                )
              }
              end
            >
              <Home className="h-5 w-5" />
              <span className="font-medium">Hem</span>
            </NavLink>

            <div className="border-t border-slate-800 my-4" />

            {menuItems.map((item) => (
              <div key={item.label}>
                {item.children ? (
                  <div>
                    <button
                      onClick={() => toggleMenu(item.label)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-3 rounded-lg transition-colors mb-1',
                        isMenuActive(item)
                          ? 'bg-slate-800 text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon className="h-5 w-5" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      {expandedMenus[item.label] ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    
                    {/* Submenu */}
                    {expandedMenus[item.label] && (
                      <div className="ml-4 space-y-1">
                        {item.children.map((child) => (
                          <NavLink
                            key={child.path}
                            to={child.path}
                            onClick={() => setSidebarOpen(false)}
                            className={() =>
                              cn(
                                'flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-sm',
                                isChildActive(child.path)
                                  ? 'bg-blue-600 text-white'
                                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                              )
                            }
                          >
                            {child.icon && <child.icon className="h-4 w-4" />}
                            <span>{child.label}</span>
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <NavLink
                    to={item.path!}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors mb-1',
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      )
                    }
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                )}
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-800 space-y-2">
            <NavLink
              to="/"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <Home className="h-4 w-4" />
              <span className="text-sm">Till hemsidan</span>
            </NavLink>
            
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800"
              onClick={onLogout}
            >
              <LogOut className="h-4 w-4 mr-3" />
              Logga ut
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content spacer for mobile */}
      <div className="lg:hidden h-14" />
    </>
  )
}
