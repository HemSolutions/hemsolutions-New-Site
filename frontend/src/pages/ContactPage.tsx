import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { contact as contactApi } from '@/api/api';

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');

    try {
      const response = await contactApi.send(formData);
      if (response.message) {
        setStatus('success');
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      }
    } catch (error: any) {
      setStatus('error');
      setErrorMsg(error.response?.data?.error || 'Något gick fel. Försök igen senare.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-slate-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Kontakta oss</h1>
          <p className="text-lg text-slate-300 max-w-2xl">
            Har du frågor eller vill boka en städning? Fyll i formuläret nedan så återkommer vi så snart som möjligt.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Skicka ett meddelande</h2>

            {status === 'success' ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-800 mb-2">Tack för ditt meddelande!</h3>
                <p className="text-slate-600 mb-6">
                  Vi har mottagit ditt meddelande och återkommer så snart vi kan.
                </p>
                <Button onClick={() => setStatus('idle')} variant="outline">
                  Skicka ett nytt meddelande
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="name">Namn *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Ditt namn"
                      required
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-post *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="din@epost.se"
                      required
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="08-525 133 39"
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Ämne *</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Vad gäller ditt ärende?"
                      required
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Meddelande *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Beskriv ditt ärende..."
                    required
                    rows={6}
                    className="w-full"
                  />
                </div>

                {status === 'error' && (
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="w-5 h-5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={status === 'sending'}
                  className="w-full bg-teal-500 hover:bg-teal-600 text-white py-3 text-lg"
                >
                  {status === 'sending' ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                      Skickar...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="w-5 h-5" />
                      Skicka meddelande
                    </span>
                  )}
                </Button>

                <p className="text-sm text-slate-500 text-center">
                  Genom att skicka detta formulär godkänner du vår{' '}
                  <button className="text-teal-600 hover:underline">integritetspolicy</button>.
                </p>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Kontaktuppgifter</h2>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Adress</h3>
                    <p className="text-slate-600">HemSolutions Sverige AB</p>
                    <p className="text-slate-600">Sparres Väg 22</p>
                    <p className="text-slate-600">197 37 Bro</p>
                    <p className="text-teal-600 text-sm font-medium">Org.nr: 559574-8236</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Telefon</h3>
                    <a href="tel:0852513339" className="text-teal-600 hover:underline text-lg">
                      08-525 133 39
                    </a>
                    <p className="text-slate-500 text-sm">Vardagar 08:00 - 17:00</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">E-post</h3>
                    <a href="mailto:info@hemsolutions.se" className="text-teal-600 hover:underline text-lg">
                      info@hemsolutions.se
                    </a>
                    <p className="text-slate-500 text-sm">Vi svarar inom 24 timmar</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Öppettider</h3>
                    <p className="text-slate-600">Måndag - Fredag: 08:00 - 17:00</p>
                    <p className="text-slate-600">Lördag: 09:00 - 14:00</p>
                    <p className="text-slate-600">Söndag: Stängt</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map placeholder */}
            <div className="bg-slate-200 rounded-xl h-64 flex items-center justify-center">
              <div className="text-center text-slate-500">
                <MapPin className="w-8 h-8 mx-auto mb-2" />
                <p>Karta kommer snart</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
