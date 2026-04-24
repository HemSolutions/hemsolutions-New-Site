import { useState } from 'react'
import { AlertTriangle, Search, Filter, Eye, CheckCircle, XCircle, Clock } from 'lucide-react'

interface Reklamation {
  id: string
  customer: string
  invoice: string
  issue: string
  status: 'open' | 'in_progress' | 'resolved' | 'rejected'
  created_at: string
  priority: 'low' | 'medium' | 'high'
  amount: number
}

const sampleReklamationer: Reklamation[] = [
  { id: '1', customer: 'Andersson Bygg AB', invoice: 'F-2024-001', issue: 'Fakturerad för tjänst som inte utförts', status: 'open', created_at: '2024-04-15', priority: 'high', amount: 2500 },
  { id: '2', customer: 'Bergström Städ', invoice: 'F-2024-003', issue: 'Felaktigt momsbelopp på fakturan', status: 'in_progress', created_at: '2024-04-14', priority: 'medium', amount: 450 },
  { id: '3', customer: 'Carlsson Fastigheter', invoice: 'F-2024-005', issue: 'Kreditfaktura begärd', status: 'resolved', created_at: '2024-04-10', priority: 'low', amount: 1200 },
  { id: '4', customer: 'Dahlén Måleri', invoice: 'F-2024-008', issue: 'Prisdiskrepans mellan offert och faktura', status: 'open', created_at: '2024-04-18', priority: 'high', amount: 8500 },
  { id: '5', customer: 'Eklund Trädgård', invoice: 'F-2024-012', issue: 'Faktura skickad till fel adress', status: 'rejected', created_at: '2024-04-12', priority: 'low', amount: 800 },
]

export default function Reklamation() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<string>('all')

  const filtered = sampleReklamationer.filter((r) => {
    const matchesSearch = r.customer.toLowerCase().includes(searchTerm.toLowerCase()) || r.issue.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || r.status === filter
    return matchesSearch && matchesFilter
  })

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      open: 'bg-red-100 text-red-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      rejected: 'bg-gray-100 text-gray-800',
    }
    const labels: Record<string, string> = {
      open: 'Öppen',
      in_progress: 'Pågående',
      resolved: 'Löst',
      rejected: 'Avvisad',
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        {status === 'open' && <AlertTriangle className="h-3 w-3 mr-1" />}
        {status === 'resolved' && <CheckCircle className="h-3 w-3 mr-1" />}
        {status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
        {status === 'in_progress' && <Clock className="h-3 w-3 mr-1" />}
        {labels[status]}
      </span>
    )
  }

  const priorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-gray-100 text-gray-600',
      medium: 'bg-yellow-50 text-yellow-700',
      high: 'bg-red-50 text-red-700',
    }
    const labels: Record<string, string> = {
      low: 'Låg',
      medium: 'Medel',
      high: 'Hög',
    }
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[priority]}`}>
        {labels[priority]}
      </span>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reklamationer</h1>
          <p className="text-sm text-gray-500">Hantera kundreklamationer och kreditfakturor</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Sök reklamation..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">Alla status</option>
              <option value="open">Öppna</option>
              <option value="in_progress">Pågående</option>
              <option value="resolved">Lösta</option>
              <option value="rejected">Avvisade</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kund</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Faktura</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ärende</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prioritet</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Belopp</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Åtgärd</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{r.customer}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{r.invoice}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">{r.issue}</td>
                  <td className="px-4 py-3">{statusBadge(r.status)}</td>
                  <td className="px-4 py-3">{priorityBadge(r.priority)}</td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">{r.amount.toLocaleString('sv-SE')} kr</td>
                  <td className="px-4 py-3 text-center">
                    <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600">
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-8">
            <AlertTriangle className="h-10 w-10 mx-auto text-gray-300" />
            <p className="text-sm text-gray-500 mt-2">Inga reklamationer hittades</p>
          </div>
        )}
      </div>
    </div>
  )
}
