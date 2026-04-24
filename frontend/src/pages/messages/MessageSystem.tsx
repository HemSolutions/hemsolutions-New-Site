import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Send,
  Paperclip,
  Smartphone,
  Mail,
  MessageSquare,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  User,
  Building,
  Shield,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';
import { getMessages, sendMessage } from '../../api/messages';
import { getCustomers } from '../../api/customers';
import { getWorkers } from '../../api/workers';

interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  type: 'customer' | 'worker' | 'admin';
  lastMessage?: string;
  lastTime?: string;
  unread?: number;
}

interface ChatMessage {
  id: number;
  sender_type: string;
  sender_id: number;
  sender_name: string;
  content: string;
  channel: string;
  status: string;
  created_at: string;
  attachments: string[];
}

export default function MessageSystem() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [sendChannels, setSendChannels] = useState({ app: true, sms: false, email: false });
  const [attachments, setAttachments] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const queryClient = useQueryClient();

  const { data: customers } = useQuery<any[]>({
    queryKey: ['customers'],
    queryFn: getCustomers,
  });

  const { data: workers } = useQuery<any[]>({
    queryKey: ['workers'],
    queryFn: getWorkers,
  });

  const { data: allMessages } = useQuery({
    queryKey: ['messages'],
    queryFn: getMessages,
  });

  // Build contacts list from customers and workers
  const contacts: Contact[] = [];
  customers?.forEach((c: any) => {
    contacts.push({ id: c.id, name: c.name, email: c.email, phone: c.phone, type: 'customer' });
  });
  workers?.forEach((w: any) => {
    contacts.push({ id: w.id, name: w.name, email: w.email, phone: w.phone, type: 'worker' });
  });

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get conversation messages
  const conversationKey = selectedContact
    ? `admin:1:${selectedContact.type}:${selectedContact.id}`
    : null;

  const { data: conversationMessages, refetch: refetchMessages } = useQuery({
    queryKey: ['messages', conversationKey],
    queryFn: () =>
      fetch(
        `${import.meta.env.VITE_API_URL || '/api'}/messages.php?conversation=${conversationKey}`,
        { credentials: 'include' }
      ).then((r) => r.json()),
    enabled: !!selectedContact,
    refetchInterval: selectedContact ? 5000 : false,
  });

  const sendMutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      setMessageInput('');
      setAttachments([]);
      refetchMessages();
      toast.success('Meddelande skickat');
    },
    onError: () => toast.error('Kunde inte skicka meddelande'),
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages]);

  const handleSend = () => {
    if (!selectedContact || !messageInput.trim()) return;

    const channels: string[] = [];
    if (sendChannels.app) channels.push('app');
    if (sendChannels.sms) channels.push('sms');
    if (sendChannels.email) channels.push('email');

    const channel = channels.length === 3 ? 'all' : channels[0] || 'app';

    sendMutation.mutate({
      sender_type: 'admin',
      sender_id: 1,
      sender_name: 'Admin',
      recipient_type: selectedContact.type,
      recipient_id: selectedContact.id,
      recipient_name: selectedContact.name,
      content: messageInput.trim(),
      channel,
      channels: channels.length > 1 ? channels : undefined,
      attachments: attachments.map((f) => f.name),
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      case 'delivered':
        return <Check className="h-3 w-3 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      default:
        return <Clock className="h-3 w-3 text-gray-400" />;
    }
  };

  const getContactIcon = (type: string) => {
    switch (type) {
      case 'customer':
        return <Building className="h-4 w-4 text-blue-500" />;
      case 'worker':
        return <User className="h-4 w-4 text-green-500" />;
      default:
        return <Shield className="h-4 w-4 text-purple-500" />;
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Meddelanden</h1>
          <p className="text-muted-foreground">Skicka och hantera meddelanden</p>
        </div>
      </div>

      <div className="flex flex-1 border rounded-lg overflow-hidden bg-white">
        {/* Left sidebar - Contacts */}
        <div className="w-80 border-r flex flex-col bg-gray-50">
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Sök kontakter..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-white"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredContacts.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                Inga kontakter hittades
              </div>
            ) : (
              filteredContacts.map((contact) => (
                <button
                  key={`${contact.type}-${contact.id}`}
                  onClick={() => setSelectedContact(contact)}
                  className={`w-full text-left p-3 border-b hover:bg-white transition-colors flex items-center gap-3 ${
                    selectedContact?.id === contact.id && selectedContact?.type === contact.type
                      ? 'bg-white border-l-4 border-l-blue-600'
                      : ''
                  }`}
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                    {getContactIcon(contact.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{contact.name}</div>
                    <div className="text-xs text-gray-500 truncate">{contact.email}</div>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      contact.type === 'customer'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {contact.type === 'customer' ? 'Kund' : 'Arbetare'}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right side - Chat */}
        <div className="flex-1 flex flex-col">
          {selectedContact ? (
            <>
              {/* Chat header */}
              <div className="p-4 border-b flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    {getContactIcon(selectedContact.type)}
                  </div>
                  <div>
                    <div className="font-medium">{selectedContact.name}</div>
                    <div className="text-xs text-gray-500">
                      {selectedContact.email} · {selectedContact.phone || 'Inget telefonnummer'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {conversationMessages?.length === 0 && (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    Inga meddelanden än. Skriv ett meddelande nedan.
                  </div>
                )}
                {conversationMessages?.map((msg: ChatMessage) => {
                  const isMe = msg.sender_type === 'admin';
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          isMe
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border shadow-sm'
                        }`}
                      >
                        <div className="text-xs opacity-75 mb-1">
                          {msg.sender_name} · {new Date(msg.created_at).toLocaleString('sv-SE')}
                        </div>
                        <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {msg.attachments.map((att: string, i: number) => (
                              <div
                                key={i}
                                className={`text-xs flex items-center gap-1 ${
                                  isMe ? 'text-blue-200' : 'text-gray-500'
                                }`}
                              >
                                <Paperclip className="h-3 w-3" />
                                {att}
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-1 mt-1 justify-end">
                          <span className="text-xs opacity-60">
                            {msg.channel === 'sms'
                              ? 'SMS'
                              : msg.channel === 'email'
                              ? 'E-post'
                              : msg.channel === 'all'
                              ? 'Alla'
                              : 'App'}
                          </span>
                          {getStatusIcon(msg.status)}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <div className="p-4 border-t bg-white space-y-3">
                {/* Send options */}
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-500 font-medium">Skicka via:</span>
                  <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sendChannels.app}
                      onChange={(e) =>
                        setSendChannels({ ...sendChannels, app: e.target.checked })
                      }
                      className="rounded border-gray-300"
                    />
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                    App
                  </label>
                  <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sendChannels.sms}
                      onChange={(e) =>
                        setSendChannels({ ...sendChannels, sms: e.target.checked })
                      }
                      className="rounded border-gray-300"
                    />
                    <Smartphone className="h-4 w-4 text-green-600" />
                    SMS
                  </label>
                  <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sendChannels.email}
                      onChange={(e) =>
                        setSendChannels({ ...sendChannels, email: e.target.checked })
                      }
                      className="rounded border-gray-300"
                    />
                    <Mail className="h-4 w-4 text-purple-600" />
                    E-post
                  </label>
                  {sendChannels.app && sendChannels.sms && sendChannels.email && (
                    <span className="text-xs font-medium text-blue-600">Skicka alla tre</span>
                  )}
                </div>

                {/* Message input */}
                <div className="flex items-end gap-2">
                  <label className="cursor-pointer p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Paperclip className="h-5 w-5 text-gray-500" />
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                  <textarea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Skriv ett meddelande..."
                    className="flex-1 min-h-[60px] max-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                    rows={2}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!messageInput.trim() || sendMutation.isPending}
                    className="shrink-0"
                  >
                    <Send className="h-4 w-4 mr-1" />
                    Skicka
                  </Button>
                </div>

                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {attachments.map((file, i) => (
                      <span
                        key={i}
                        className="text-xs bg-gray-100 px-2 py-1 rounded-full flex items-center gap-1"
                      >
                        <Paperclip className="h-3 w-3" />
                        {file.name}
                        <button
                          onClick={() =>
                            setAttachments(attachments.filter((_, idx) => idx !== i))
                          }
                          className="text-red-500 hover:text-red-700 ml-1"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Välj en kontakt för att börja chatta</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
