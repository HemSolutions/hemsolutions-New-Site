import { useState, useEffect } from 'react';
import { CreditCard, Loader2, Search, Plus, Download, Eye, Calendar, User } from 'lucide-react';

interface Receipt {
  id: string;
  receipt_number: string;
  customer_name: string;
  customer_email: string;
  invoice_number: string;
  amount: number;
  payment_method: 'card' | 'swish' | 'bank_transfer' | 'cash';
  payment_date: string;
  notes: string;
  created_at: string;
}

interface ReceiptsManagementProps {
  apiBaseUrl: string;
}

export default function ReceiptsManagement({ apiBaseUrl }: ReceiptsManagementProps) {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchReceipts();
  }, [apiBaseUrl]);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiBaseUrl}/api/receipts`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Kunde inte hämta kvitton');
      }
      
      const data = await response.json();
      setReceipts(data.receipts || data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ett fel uppstod');
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodText = (method: string) => {
    const methodMap: Record<string, string> = {
      card: 'Kort',
      swish: 'Swish',
      bank_transfer: 'Banköverföring',
      cash: 'Kontant'
    };
    return methodMap[method] || method;
  };

  const getPaymentMethodClass = (method: string) => {
    const classMap: Record<string, string> = {
      card: 'bg-blue-100 text-blue-700',
      swish: 'bg-purple-100 text-purple-700',
      bank_transfer: 'bg-green-100 text-green-700',
      cash: 'bg-yellow-100 text-yellow-700'
    };
    return classMap[method] || 'bg-gray-100 text-gray-700';
  };

  const filteredReceipts = receipts.filter(receipt =>
    receipt.receipt_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receipt.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receipt.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Laddar kvitton...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">Fel: {error}</p>
        <button 
          onClick={fetchReceipts}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Försök igen
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <CreditCard className="w-6 h-6" />
          Kvitton
        </h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          Nytt Kvitto
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Sök kvitton..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Kvittonr</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Kund</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Faktura</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Belopp</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Betalningsmetod</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Betalningsdatum</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Åtgärder</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredReceipts.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  Inga kvitton hittades
                </td>
              </tr>
            ) : (
              filteredReceipts.map((receipt) => (
                <tr key={receipt.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {receipt.receipt_number}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">{receipt.customer_name}</div>
                        <div className="text-sm text-gray-500">{receipt.customer_email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {receipt.invoice_number || '-'}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {receipt.amount?.toLocaleString('sv-SE')} kr
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPaymentMethodClass(receipt.payment_method)}`}>
                      {getPaymentMethodText(receipt.payment_method)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(receipt.payment_date).toLocaleDateString('sv-SE')}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="p-1 hover:bg-gray-100 rounded" title="Visa">
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded" title="Ladda ner PDF">
                        <Download className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
