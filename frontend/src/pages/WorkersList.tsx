import { useState } from 'react'
import { Users, Search, Plus, Star, Phone, Mail, MapPin, CheckCircle, XCircle } from 'lucide-react'

interface Worker {
  id: string
  name: string
  email: string
  phone: string
  address: string
  skills: string[]
  rating: number
  status: 'active' | 'inactive' | 'busy'
  completed_jobs: number
}

const sampleWorkers: Worker[] = [
  { id: '1', name: 'Anna Svensson', email: 'anna@hemsolutions.se', phone: '070-123 45 67', address: 'Storgatan 1, Stockholm', skills: ['Städning', 'Fönsterputs'], rating: 4.8, status: 'active', completed_jobs: 142 },
  { id: '2', name: 'Erik Johansson', email: 'erik@hemsolutions.se', phone: '070-234 56 78', address: 'Kungsgatan 5, Stockholm', skills: ['Flyttstäd', 'Trädgård'], rating: 4.5, status: 'busy', completed_jobs: 89 },
  { id: '3', name: 'Maria Lindgren', email: 'maria@hemsolutions.se', phone: '070-345 67 89', address: 'Drottninggatan 10, Stockholm', skills: ['Städning', 'Trädgård', 'Snöskottning'], rating: 4.9, status: 'active', completed_jobs: 201 },
  { id: '4', name: 'Lars Andersson', email: 'lars@hemsolutions.se', phone: '070-456 78 90', address: 'Sveavägen 15, Stockholm', skills: ['Fönsterputs', 'Snöskottning'], rating: 4.2, status: 'inactive', completed_jobs: 56 },
  { id: '5', name: 'Sofia Eriksson', email: 'sofia@hemsolutions.se', phone: '070-567 89 01', address: 'Birger Jarlsgatan 20, Stockholm', skills: ['Städning', 'Flyttstäd'], rating: 4.7, status: 'active', completed_jobs: 178 },
]

export default function WorkersList() {
  const [searchTerm, setSearchTerm] = useState('')

  const filtered = sampleWorkers.filter((w) =>
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      busy: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-gray-100 text-gray-800',
    }
    const labels: Record<string, string> = {
      active: 'Aktiv',
      busy: 'Upptagen',
      inactive: 'Inaktiv',
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        {status === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
        {status === 'inactive' && <XCircle className="h-3 w-3 mr-1" />}
        {labels[status]}
      </span>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medarbetare</h1>
          <p className="text-sm text-gray-500">Hantera personal och arbetare</p>
        </div>
        <button
          className="px-4 py-2 text-sm font-medium text-white rounded-lg flex items-center space-x-2"
          style={{ backgroundColor: '#1976D2' }}
        >
          <Plus className="h-4 w-4" />
          <span>Ny medarbetare</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b border-gray-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Sök medarbetare..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Namn</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kontakt</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kompetenser</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Betyg</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Uppdrag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((worker) => (
                <tr key={worker.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-medium" style={{ backgroundColor: '#1976D2' }}>
                        {worker.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{worker.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1 text-xs text-gray-600">
                        <Mail className="h-3 w-3" />
                        <span>{worker.email}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-600">
                        <Phone className="h-3 w-3" />
                        <span>{worker.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {worker.skills.map((skill) => (
                        <span key={skill} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">{statusBadge(worker.status)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-medium text-gray-900">{worker.rating}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-900">{worker.completed_jobs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
