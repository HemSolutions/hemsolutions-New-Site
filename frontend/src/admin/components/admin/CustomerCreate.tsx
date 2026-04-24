import { useState, useEffect } from 'react';
import { Plus, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export default function CustomerCreate({ apiBaseUrl }: { apiBaseUrl: string }) {
  const [customerType, setCustomerType] = useState<'private' | 'company'>('private');
  const [rutRot, setRutRot] = useState(false);
  const [name, setName] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [address3, setAddress3] = useState('');
  const [postcode, setPostcode] = useState('');
  const [city, setCity] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('14');
  const [discount, setDiscount] = useState('0');
  const [customerNumber, setCustomerNumber] = useState('');
  const [ourContact, setOurContact] = useState('');
  const [customerContact, setCustomerContact] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [email, setEmail] = useState('');
  const [personalNumber, setPersonalNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (!name || !email || !phone || !address1 || !postcode || !city) {
      setMessage('Fyll i alla obligatoriska fält (namn, e-post, telefon, adress, postnummer, ort).');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const token = localStorage.getItem('auth_token');
      const customerData = {
        name,
        email,
        phone,
        address: [address1, address2, address3].filter(Boolean).join(', '),
        postcode,
        city,
        customer_type: customerType,
        rut_rot: rutRot,
        payment_terms: parseInt(paymentTerms),
        discount: parseFloat(discount),
        customer_number: customerNumber,
        our_contact: ourContact,
        customer_contact: customerContact,
        website,
        personal_number: personalNumber,
        notes,
        org_number: customerType === 'company' ? personalNumber : null
      };

      const res = await fetch(`${apiBaseUrl}/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(customerData)
      });

      if (res.ok) {
        setMessage('Kund sparad!');
        // Reset form
        setName('');
        setAddress1('');
        setAddress2('');
        setAddress3('');
        setPostcode('');
        setCity('');
        setPhone('');
        setEmail('');
        setPersonalNumber('');
        setNotes('');
        setCustomerNumber('');
        setOurContact('');
        setCustomerContact('');
        setWebsite('');
        setDiscount('0');
        setRutRot(false);
      } else {
        const err = await res.json();
        setMessage(err.error || 'Kunde inte spara kund.');
      }
    } catch (e) {
      setMessage('Nätverksfel. Försök igen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Skapa ny kund</h1>
        <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Sparar...' : 'Spara kund'}
        </Button>
      </div>

      {message && (
        <div className={`p-3 rounded-lg ${message.includes('!') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message}
        </div>
      )}

      {/* Customer Type */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Typ av kund</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={customerType} onValueChange={(v) => setCustomerType(v as 'private' | 'company')} className="flex gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="private" id="private" />
              <Label htmlFor="private">Privatperson</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="company" id="company" />
              <Label htmlFor="company">Företag</Label>
            </div>
          </RadioGroup>

          <div className="flex items-center gap-2 mt-4">
            <Checkbox checked={rutRot} onCheckedChange={() => setRutRot(!rutRot)} />
            <Label>RUT eller ROT</Label>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Address */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Fakturaadress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Namn *</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="För- och efternamn / Företagsnamn" />
          </div>
          <div>
            <Label>Adressrad 1 *</Label>
            <Input value={address1} onChange={e => setAddress1(e.target.value)} placeholder="Gata och nummer" />
          </div>
          <div>
            <Label>Adressrad 2</Label>
            <Input value={address2} onChange={e => setAddress2(e.target.value)} placeholder="C/O, våning, etc." />
          </div>
          <div>
            <Label>Adressrad 3</Label>
            <Input value={address3} onChange={e => setAddress3(e.target.value)} placeholder="Extra adressrad" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Postnummer *</Label>
              <Input value={postcode} onChange={e => setPostcode(e.target.value)} placeholder="t.ex. 123 45" />
            </div>
            <div>
              <Label>Ort *</Label>
              <Input value={city} onChange={e => setCity(e.target.value)} placeholder="t.ex. Stockholm" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Betalning</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Betalningsvillkor (dagar)</Label>
              <Input type="number" value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} />
            </div>
            <div>
              <Label>Rabatt (%)</Label>
              <Input type="number" value={discount} onChange={e => setDiscount(e.target.value)} placeholder="0" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Kundinformation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Kundnummer</Label>
              <Input value={customerNumber} onChange={e => setCustomerNumber(e.target.value)} placeholder="Auto-genereras om tomt" />
            </div>
            <div>
              <Label>Vår kontakt</Label>
              <Input value={ourContact} onChange={e => setOurContact(e.target.value)} placeholder="t.ex. Per Persson" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Kundens kontakt</Label>
              <Input value={customerContact} onChange={e => setCustomerContact(e.target.value)} placeholder="t.ex. Anna Andersson" />
            </div>
            <div>
              <Label>Telefon *</Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="t.ex. 070-123 45 67" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Hemsida</Label>
              <Input value={website} onChange={e => setWebsite(e.target.value)} placeholder="www.exempel.se" />
            </div>
            <div>
              <Label>E-post *</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="namn@exempel.se" />
            </div>
          </div>
          <div>
            <Label>{customerType === 'company' ? 'Organisationsnummer' : 'Personnummer'}</Label>
            <Input value={personalNumber} onChange={e => setPersonalNumber(e.target.value)} 
              placeholder={customerType === 'company' ? "t.ex. 556123-4567" : "t.ex. ÅÅÅÅMMDD-XXXX"} />
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Anteckningar</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea 
            value={notes} 
            onChange={e => setNotes(e.target.value)}
            className="w-full p-3 border rounded-lg min-h-[100px] text-sm"
            placeholder="Interna anteckningar om kunden..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
