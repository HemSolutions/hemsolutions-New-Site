import { useState } from 'react'
import { ArrowLeft, Save, FilePlus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function InvoiceNew() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    customer_id: '',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: '',
    notes: '',
    items: [{ article_id: '', quantity: 1, unit_price: 0 }],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: API integration
    navigate('/admin/invoices')
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center space-x-3 mb-6">
        <button onClick={() => navigate('/admin/invoices')} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ny faktura</h1>
          <p className="text-sm text-gray-500">Skapa en ny faktura till kund</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kund *</label>
            <select
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.customer_id}
              onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
            >
              <option value="">Välj kund...</option>
              <option value="1">Andersson Bygg AB</option>
              <option value="2">Bergström Städ</option>
              <option value="3">Carlsson Fastigheter</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fakturadatum *</label>
            <input
              type="date"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.issue_date}
              onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Förfallodatum *</label>
            <input
              type="date"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Noteringar</label>
          <textarea
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Fakturanoteringar..."
          />
        </div>

        <div className="pt-4 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/admin/invoices')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Avbryt
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white rounded-lg flex items-center space-x-2"
            style={{ backgroundColor: '#1976D2' }}
          >
            <FilePlus className="h-4 w-4" />
            <span>Spara faktura</span>
          </button>
        </div>
      </form>
    </div>
  )
}
