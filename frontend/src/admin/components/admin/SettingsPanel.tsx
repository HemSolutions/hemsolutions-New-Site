import { useState, useEffect } from 'react';
import { Save, Upload, Building2, FileText, Mail, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SettingsPanel({ apiBaseUrl, view }: { apiBaseUrl: string; view: string }) {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [logoPreview, setLogoPreview] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${apiBaseUrl}/settings`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          const s: Record<string, string> = {};
          data.settings.forEach((item: any) => { s[item.key] = item.value; });
          setSettings(s);
          if (s.company_logo) setLogoPreview(s.company_logo);
        }
      }
    } catch (e) { console.error(e); }
  };

  const updateSetting = async (key: string, value: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      await fetch(`${apiBaseUrl}/settings/${key}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ value })
      });
    } catch (e) { console.error(e); }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setLogoPreview(result);
      setSettings(prev => ({ ...prev, company_logo: result }));
      updateSetting('company_logo', result);
    };
    reader.readAsDataURL(file);
  };

  const saveAll = async () => {
    setIsSubmitting(true);
    setMessage('');
    try {
      for (const [key, value] of Object.entries(settings)) {
        await updateSetting(key, value);
      }
      setMessage('Inställningar sparade!');
    } catch (e) {
      setMessage('Fel vid sparande.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const getActiveTab = () => {
    if (view === 'settings-company') return 'company';
    if (view === 'settings-invoice') return 'invoice';
    if (view === 'settings-email') return 'email';
    if (view === 'settings-users') return 'users';
    return 'company';
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Inställningar</h1>
        <Button onClick={saveAll} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Sparar...' : 'Spara alla'}
        </Button>
      </div>

      {message && (
        <div className={`p-3 rounded-lg ${message.includes('!') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message}
        </div>
      )}

      <Tabs defaultValue={getActiveTab()}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="company"><Building2 className="h-4 w-4 mr-1" /> Företag</TabsTrigger>
          <TabsTrigger value="invoice"><FileText className="h-4 w-4 mr-1" /> Faktura</TabsTrigger>
          <TabsTrigger value="email"><Mail className="h-4 w-4 mr-1" /> Email/SMS</TabsTrigger>
          <TabsTrigger value="users"><Users className="h-4 w-4 mr-1" /> Användare</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Företagsinformation</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Logotyp</Label>
                <div className="mt-2">
                  {logoPreview && <img src={logoPreview} alt="Logo" className="h-20 mb-2 object-contain" />}
                  <Input type="file" accept="image/*" onChange={handleLogoUpload} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Företagsnamn</Label><Input value={settings.company_name || ''} onChange={e => updateField('company_name', e.target.value)} /></div>
                <div><Label>Adress</Label><Input value={settings.company_address || ''} onChange={e => updateField('company_address', e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Postnummer</Label><Input value={settings.company_postcode || ''} onChange={e => updateField('company_postcode', e.target.value)} /></div>
                <div><Label>Ort</Label><Input value={settings.company_city || ''} onChange={e => updateField('company_city', e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Telefon</Label><Input value={settings.company_phone || ''} onChange={e => updateField('company_phone', e.target.value)} /></div>
                <div><Label>E-post</Label><Input value={settings.company_email || ''} onChange={e => updateField('company_email', e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Org.nr</Label><Input value={settings.company_org_number || ''} onChange={e => updateField('company_org_number', e.target.value)} /></div>
                <div><Label>Momsreg.nr</Label><Input value={settings.company_vat_number || ''} onChange={e => updateField('company_vat_number', e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Bankgiro</Label><Input value={settings.company_bankgiro || ''} onChange={e => updateField('company_bankgiro', e.target.value)} /></div>
                <div><Label>Bankkonto</Label><Input value={settings.company_bank_account || ''} onChange={e => updateField('company_bank_account', e.target.value)} /></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoice" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Fakturainställningar</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Nästa fakturanummer</Label><Input type="number" value={settings.next_invoice_number || '1000'} onChange={e => updateField('next_invoice_number', e.target.value)} /></div>
                <div><Label>Standard betalningsvillkor (dagar)</Label><Input type="number" value={settings.default_payment_terms || '14'} onChange={e => updateField('default_payment_terms', e.target.value)} /></div>
              </div>
              <div>
                <Label>Standard moms (%)</Label>
                <Input type="number" value={settings.default_vat || '25'} onChange={e => updateField('default_vat', e.target.value)} />
              </div>
              <div>
                <Label>Fakturameddelande (fotnot)</Label>
                <Input value={settings.invoice_footer || ''} onChange={e => updateField('invoice_footer', e.target.value)} placeholder="t.ex. Betalningsvillkor: 14 dagar netto" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>E-post & SMS</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>SMTP Server</Label><Input value={settings.smtp_host || ''} onChange={e => updateField('smtp_host', e.target.value)} /></div>
                <div><Label>SMTP Port</Label><Input value={settings.smtp_port || '587'} onChange={e => updateField('smtp_port', e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>SMTP Användare</Label><Input value={settings.smtp_user || ''} onChange={e => updateField('smtp_user', e.target.value)} /></div>
                <div><Label>SMTP Lösenord</Label><Input type="password" value={settings.smtp_pass || ''} onChange={e => updateField('smtp_pass', e.target.value)} /></div>
              </div>
              <div>
                <Label>Avsändaradress</Label>
                <Input value={settings.email_from || ''} onChange={e => updateField('email_from', e.target.value)} placeholder="info@hemsolutions.se" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>46elks Användare</Label><Input value={settings.sms_username || ''} onChange={e => updateField('sms_username', e.target.value)} /></div>
                <div><Label>46elks Lösenord</Label><Input type="password" value={settings.sms_password || ''} onChange={e => updateField('sms_password', e.target.value)} /></div>
              </div>
              <div>
                <Label>SMS Avsändare</Label>
                <Input value={settings.sms_from || ''} onChange={e => updateField('sms_from', e.target.value)} placeholder="HemSolutions" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Användare</CardTitle></CardHeader>
            <CardContent>
              <p className="text-gray-500">Användarhantering kommer snart. Använd backend-admin för att hantera användare.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
