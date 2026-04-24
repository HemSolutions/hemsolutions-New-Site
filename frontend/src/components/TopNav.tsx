import { useState, useRef, useEffect } from 'react'
import { Menu, User, Settings, CreditCard, Building2, LogOut, ChevronDown, Gift } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface TopNavProps {
  onMenuClick: () => void
  user?: {
    name: string
    email: string
    role: string
  }
  onLogout: () => void
  companyName?: string
}

export default function TopNav({ onMenuClick, user, onLogout, companyName = 'HemSolutions' }: TopNavProps) {
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleNavigate = (path: string) => {
    navigate(path)
    setDropdownOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 w-full" style={{ backgroundColor: '#1976D2' }}>
      <div className="flex h-14 items-center justify-between px-4 lg:px-6">
        {/* Left side - Hamburger + Logo */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onMenuClick}
            className="p-2 rounded hover:bg-white/20 text-white transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center space-x-2">
            <div className="h-7 w-7 bg-white rounded flex items-center justify-center">
              <span className="font-bold text-sm" style={{ color: '#1976D2' }}>HS</span>
            </div>
            <span className="font-semibold text-white text-lg tracking-tight hidden sm:block">
              {companyName}
            </span>
          </div>
        </div>

        {/* Right side - User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2 text-white hover:bg-white/20 px-3 py-1.5 rounded transition-colors"
          >
            <div className="h-7 w-7 bg-white/30 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <span className="hidden sm:block text-sm font-medium">
              {user?.name || 'Användare'}
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-lg border py-1 z-50">
              <div className="px-4 py-3 border-b">
                <p className="text-sm font-medium text-gray-900">{user?.name || 'Användare'}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
                <p className="text-xs mt-1 capitalize" style={{ color: '#1976D2' }}>{user?.role || 'Admin'}</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => handleNavigate('/admin/settings/profile')}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <User className="h-4 w-4 mr-3 text-gray-400" />
                  Min användarprofil
                </button>
                <button
                  onClick={() => handleNavigate('/admin/settings/company')}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Building2 className="h-4 w-4 mr-3 text-gray-400" />
                  Företagsinställningar
                </button>
                <button
                  onClick={() => handleNavigate('/admin/settings/subscription')}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <CreditCard className="h-4 w-4 mr-3 text-gray-400" />
                  Prenumeration
                </button>
                <button
                  onClick={() => handleNavigate('/admin/settings')}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Settings className="h-4 w-4 mr-3 text-gray-400" />
                  Företagskonto
                </button>
                <button
                  onClick={() => handleNavigate('/admin/settings/invite')}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Gift className="h-4 w-4 mr-3 text-gray-400" />
                  Tipsa vän
                </button>
              </div>

              <div className="border-t py-1">
                <button
                  onClick={() => {
                    setDropdownOpen(false)
                    onLogout()
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Logga ut
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
