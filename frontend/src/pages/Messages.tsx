import { useState } from 'react'
import { MessageSquare, Send, User, Clock } from 'lucide-react'

interface Message {
  id: string
  sender: string
  senderRole: string
  content: string
  timestamp: string
  type: 'incoming' | 'outgoing'
}

const sampleMessages: Message[] = [
  { id: '1', sender: 'Andersson Bygg AB', senderRole: 'Kund', content: 'Hej, kan vi ändra tiden för städningen till nästa vecka?', timestamp: '2024-04-18 09:30', type: 'incoming' },
  { id: '2', sender: 'Du', senderRole: 'Admin', content: 'Absolut, jag uppdaterar bokningen och skickar en bekräftelse.', timestamp: '2024-04-18 09:45', type: 'outgoing' },
  { id: '3', sender: 'Bergström Städ', senderRole: 'Kund', content: 'Tack för fakturan. Den är nu betald.', timestamp: '2024-04-18 14:20', type: 'incoming' },
  { id: '4', sender: 'Maria Lindgren', senderRole: 'Medarbetare', content: 'Jag är tillgänglig för extra pass på lördag om det behövs.', timestamp: '2024-04-19 08:15', type: 'incoming' },
  { id: '5', sender: 'Du', senderRole: 'Admin', content: 'Perfekt! Jag lägger in dig i schemat.', timestamp: '2024-04-19 08:30', type: 'outgoing' },
]

export default function Messages() {
  const [messages] = useState<Message[]>(sampleMessages)
  const [newMessage, setNewMessage] = useState('')

  const handleSend = () => {
    if (!newMessage.trim()) return
    setNewMessage('')
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Meddelanden</h1>
        <p className="text-sm text-gray-500">Kommunikation med kunder och medarbetare</p>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" style={{ color: '#1976D2' }} />
            <span className="font-semibold text-gray-900">Konversationer</span>
          </div>
        </div>

        <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-4 ${msg.type === 'outgoing' ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
            >
              <div className="flex items-start space-x-3">
                <div className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: msg.type === 'outgoing' ? '#1976D2' : '#E5E7EB' }}>
                  <User className="h-4 w-4" style={{ color: msg.type === 'outgoing' ? 'white' : '#6B7280' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">{msg.sender}</span>
                      <span className="text-xs text-gray-500">({msg.senderRole})</span>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-400">
                      <Clock className="h-3 w-3" />
                      <span>{msg.timestamp}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{msg.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <input
              type="text"
              placeholder="Skriv ett meddelande..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button
              onClick={handleSend}
              className="p-2 rounded-lg text-white"
              style={{ backgroundColor: '#1976D2' }}
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
