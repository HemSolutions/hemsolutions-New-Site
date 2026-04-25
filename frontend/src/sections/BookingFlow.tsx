import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Check, MapPin, Calendar, Clock, Home, Sparkles, Wind, Truck, TreePine, Building2, CreditCard, FileText, Banknote, QrCode, Search, ChevronDown, ExternalLink, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { createBooking } from '@/api';

interface BookingFlowProps {
  onBack: () => void;
}

type Step = 'service' | 'address' | 'datetime' | 'details' | 'payment' | 'confirmation' | 'autogiro' | 'stripe' | 'swish';
type CleaningFrequency = 'one-time' | 'weekly' | 'bi-weekly';

interface Service {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  originalPrice: number;
  rutPrice: number;
  finalPrice: number;
  unit: string;
}

const services: Service[] = [
  { 
    id: 'hemstadning', 
    icon: Home, 
    title: 'Hemstädning', 
    description: 'Regelbunden städning för ditt hem',
    originalPrice: 498,
    rutPrice: 249,
    finalPrice: 199,
    unit: 'timme'
  },
  { 
    id: 'storstadning', 
    icon: Sparkles, 
    title: 'Storstädning', 
    description: 'Grundlig städning av hela hemmet',
    originalPrice: 573,
    rutPrice: 286,
    finalPrice: 229,
    unit: 'timme'
  },
  { 
    id: 'fonsterputs', 
    icon: Wind, 
    title: 'Fönsterputs', 
    description: 'Skinande rena fönster',
    originalPrice: 223,
    rutPrice: 111,
    finalPrice: 89,
    unit: 'fönster'
  },
  { 
    id: 'flyttstadning', 
    icon: Truck, 
    title: 'Flyttstädning', 
    description: 'Städning vid flytt',
    originalPrice: 623,
    rutPrice: 311,
    finalPrice: 249,
    unit: 'timme'
  },
  { 
    id: 'tradgard', 
    icon: TreePine, 
    title: 'Trädgårdshjälp', 
    description: 'Skötsel av din trädgård',
    originalPrice: 498,
    rutPrice: 249,
    finalPrice: 199,
    unit: 'timme'
  },
  { 
    id: 'kontor', 
    icon: Building2, 
    title: 'Kontorsstädning', 
    description: 'Städning för företag',
    originalPrice: 623,
    rutPrice: 311,
    finalPrice: 249,
    unit: 'timme'
  },
];

const timeSlots = [
  { id: 'morning', label: 'Morgon', time: '08:00 - 12:00' },
  { id: 'afternoon', label: 'Eftermiddag', time: '13:00 - 17:00' },
];

// Mock address data for Swedish postcodes
const mockAddresses: Record<string, string[]> = {
  '12345': ['Storgatan 1', 'Storgatan 2', 'Storgatan 3', 'Kungsgatan 10', 'Kungsgatan 12'],
  '19737': ['Sparres Väg 1', 'Sparres Väg 2', 'Sparres Väg 22', 'Brovägen 5', 'Brovägen 10'],
  '11122': ['Drottninggatan 1', 'Drottninggatan 5', 'Drottninggatan 10', 'Sergels Torg 1'],
  '17234': ['Solnavägen 10', 'Solnavägen 15', 'Sankt Eriksgatan 20', 'Sankt Eriksgatan 25'],
};

export function BookingFlow({ onBack }: BookingFlowProps) {
  const [currentStep, setCurrentStep] = useState<Step>('service');
  const [selectedService, setSelectedService] = useState<string>('');
  const [cleaningFrequency, setCleaningFrequency] = useState<CleaningFrequency>('one-time');
  
  // Address fields
  const [postcode, setPostcode] = useState('');
  const [address, setAddress] = useState('');
  const [availableAddresses, setAvailableAddresses] = useState<string[]>([]);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [apartmentNumber, setApartmentNumber] = useState('');
  const [portCode, setPortCode] = useState('');
  const [propertyType, setPropertyType] = useState('villa');
  
  // Other fields
  const [hours, setHours] = useState('2');
  const [windows, setWindows] = useState('4');
  const [date, setDate] = useState<Date>();
  const [timeSlot, setTimeSlot] = useState('');
  
  // Personal details
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [personnummer, setPersonnummer] = useState('');
  
  // Options
  const [rutDeduction, setRutDeduction] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('invoice');
  const [isNewCustomer, setIsNewCustomer] = useState(true);
  
  // Booking submission states
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState('');

  const steps = [
    { id: 'service', label: 'Tjänst', number: 1 },
    { id: 'address', label: 'Adress', number: 2 },
    { id: 'datetime', label: 'Tid', number: 3 },
    { id: 'details', label: 'Detaljer', number: 4 },
    { id: 'payment', label: 'Betalning', number: 5 },
  ];

  const selectedServiceData = services.find(s => s.id === selectedService);

  // Handle postcode lookup
  useEffect(() => {
    if (postcode.length === 5) {
      const addresses = mockAddresses[postcode] || [
        `${postcode} Exempelgatan 1`,
        `${postcode} Exempelgatan 2`,
        `${postcode} Testvägen 10`,
        `${postcode} Testvägen 15`,
      ];
      setAvailableAddresses(addresses);
      setShowAddressDropdown(true);
    } else {
      setAvailableAddresses([]);
      setShowAddressDropdown(false);
    }
  }, [postcode]);

  // Submit booking to backend when reaching confirmation step
  useEffect(() => {
    if (currentStep === 'confirmation' && !bookingSubmitted && !bookingSubmitting) {
      const submitBooking = async () => {
        setBookingSubmitting(true);
        setBookingError('');
        
        try {
          const result = await createBooking({
            service_type: selectedServiceData?.title || 'Hemstädning',
            booking_date: date ? format(date, 'yyyy-MM-dd') : '',
            time_slot: timeSlots.find(t => t.id === timeSlot)?.time || '',
            hours: parseInt(hours) || 2,
            address: `${address}${apartmentNumber ? ', Lgh ' + apartmentNumber : ''}`,
            postcode,
            city: 'Stockholm',
            notes: `Betalning: ${paymentMethod}, RUT: ${rutDeduction ? 'Ja' : 'Nej'}, Ny kund: ${isNewCustomer ? 'Ja' : 'Nej'}`,
            customer_name: `${firstName} ${lastName}`,
            customer_email: email,
            customer_phone: phone,
          });
          
          if (result.success) {
            setBookingSubmitted(true);
          } else {
            setBookingError(result.message || 'Ett fel uppstod vid bokningen. Försök igen.');
          }
        } catch (error) {
          console.error('Booking submission error:', error);
          setBookingError('Kunde inte skicka bokningen. Kontrollera din internetanslutning.');
        } finally {
          setBookingSubmitting(false);
        }
      };
      
      submitBooking();
    }
  }, [currentStep]);

  const calculatePrice = () => {
    if (!selectedServiceData) return { original: 0, afterRut: 0, withoutRut: 0, final: 0, details: '' };
    
    let quantity = selectedServiceData.id === 'fonsterputs' ? parseInt(windows) || 1 : parseInt(hours) || 2;
    const originalPrice = selectedServiceData.originalPrice * quantity;
    const afterRut = selectedServiceData.rutPrice * quantity;
    
    // Price without RUT (just new customer discount if applicable)
    const withoutRut = isNewCustomer ? originalPrice * 0.8 : originalPrice;
    
    // Final price depends on RUT checkbox
    const final = rutDeduction 
      ? (isNewCustomer ? selectedServiceData.finalPrice * quantity : afterRut)
      : withoutRut;
    
    let details = '';
    if (selectedServiceData.id === 'hemstadning' && (cleaningFrequency === 'weekly' || cleaningFrequency === 'bi-weekly')) {
      details = 'Första 3 månaderna: 199 kr/tim. Därefter: 300 kr/tim (efter RUT).';
    }
    
    return {
      original: originalPrice,
      afterRut: afterRut,
      withoutRut: Math.round(withoutRut),
      final: Math.round(final),
      details
    };
  };

  const prices = calculatePrice();

  const canProceed = () => {
    switch (currentStep) {
      case 'service':
        return selectedService !== '';
      case 'address':
        return postcode.length === 5 && address.trim() !== '';
      case 'datetime':
        return date && timeSlot;
      case 'details':
        return firstName && lastName && email && phone && personnummer.length >= 10 && termsAccepted;
      case 'payment':
        return paymentMethod !== '';
      default:
        return false;
    }
  };

  const handleNext = () => {
    switch (currentStep) {
      case 'service':
        setCurrentStep('address');
        break;
      case 'address':
        setCurrentStep('datetime');
        break;
      case 'datetime':
        setCurrentStep('details');
        break;
      case 'details':
        setCurrentStep('payment');
        break;
      case 'payment':
        // Redirect to payment method specific page
        if (paymentMethod === 'autogiro') {
          setCurrentStep('autogiro');
        } else if (paymentMethod === 'card') {
          setCurrentStep('stripe');
        } else if (paymentMethod === 'swish') {
          setCurrentStep('swish');
        } else {
          setCurrentStep('confirmation');
        }
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'address':
        setCurrentStep('service');
        break;
      case 'datetime':
        setCurrentStep('address');
        break;
      case 'details':
        setCurrentStep('datetime');
        break;
      case 'payment':
        setCurrentStep('details');
        break;
      case 'confirmation':
        setCurrentStep('payment');
        break;
      case 'autogiro':
      case 'stripe':
      case 'swish':
        setCurrentStep('payment');
        break;
    }
  };

  const formatPersonnummer = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 8) {
      return digits;
    } else if (digits.length <= 12) {
      return `${digits.slice(0, 8)}-${digits.slice(8)}`;
    }
    return `${digits.slice(0, 8)}-${digits.slice(8, 12)}`;
  };

  const handlePersonnummerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPersonnummer(e.target.value);
    setPersonnummer(formatted);
  };

  const renderServiceStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Välj tjänst</h2>
        <p className="text-slate-600">Vilken typ av städning behöver du? Med RUT-avdrag betalar du halva priset!</p>
      </div>

      {/* Cleaning Frequency Selection - Only show for hemstädning */}
      {selectedService === 'hemstadning' && (
        <div className="bg-amber-50 rounded-xl p-4 mb-4">
          <Label className="mb-3 block font-semibold">Hur ofta vill du ha städning?</Label>
          <RadioGroup
            value={cleaningFrequency}
            onValueChange={(value) => setCleaningFrequency(value as CleaningFrequency)}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
            <div>
              <RadioGroupItem
                value="one-time"
                id="one-time"
                className="peer sr-only"
              />
              <Label
                htmlFor="one-time"
                className="flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all peer-data-[state=checked]:border-teal-500 peer-data-[state=checked]:bg-teal-50 hover:border-teal-300 bg-white"
              >
                <span className="font-medium">En gång</span>
                <span className="text-sm text-slate-500">Prova-på</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem
                value="weekly"
                id="weekly"
                className="peer sr-only"
              />
              <Label
                htmlFor="weekly"
                className="flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all peer-data-[state=checked]:border-teal-500 peer-data-[state=checked]:bg-teal-50 hover:border-teal-300 bg-white"
              >
                <span className="font-medium">Varje vecka</span>
                <span className="text-sm text-slate-500">3 mån: 199 kr/tim</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem
                value="bi-weekly"
                id="bi-weekly"
                className="peer sr-only"
              />
              <Label
                htmlFor="bi-weekly"
                className="flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all peer-data-[state=checked]:border-teal-500 peer-data-[state=checked]:bg-teal-50 hover:border-teal-300 bg-white"
              >
                <span className="font-medium">Varannan vecka</span>
                <span className="text-sm text-slate-500">3 mån: 199 kr/tim</span>
              </Label>
            </div>
          </RadioGroup>
          {cleaningFrequency !== 'one-time' && (
            <p className="text-sm text-amber-700 mt-3">
              <strong>Obs:</strong> Efter 3 månader blir priset 300 kr/tim (efter RUT).
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service) => (
          <button
            key={service.id}
            onClick={() => setSelectedService(service.id)}
            className={`relative p-6 rounded-xl border-2 text-left transition-all ${
              selectedService === service.id
                ? 'border-teal-500 bg-teal-50'
                : 'border-slate-200 hover:border-teal-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                selectedService === service.id ? 'bg-teal-500' : 'bg-slate-100'
              }`}>
                <service.icon className={`w-6 h-6 ${
                  selectedService === service.id ? 'text-white' : 'text-slate-600'
                }`} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800">{service.title}</h3>
                <p className="text-sm text-slate-600 mt-1">{service.description}</p>
                <div className="mt-2">
                  <span className="text-sm font-medium text-teal-600">{service.finalPrice} kr/{service.unit}</span>
                  <span className="text-xs text-slate-400 line-through ml-2">{service.originalPrice} kr</span>
                  <span className="text-xs text-green-600 ml-2">efter RUT</span>
                </div>
              </div>
            </div>
            {selectedService === service.id && (
              <div className="absolute top-4 right-4 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );

  const renderAddressStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Var ska vi städa?</h2>
        <p className="text-slate-600">Ange adressen där städningen ska utföras</p>
      </div>

      <div className="space-y-4">
        {/* Postcode */}
        <div>
          <Label htmlFor="postcode">Postnummer *</Label>
          <div className="relative mt-1.5">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              id="postcode"
              placeholder="t.ex. 123 45"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value.replace(/\D/g, '').slice(0, 5))}
              className="pl-10 h-12"
              maxLength={5}
            />
          </div>
          <p className="text-sm text-slate-500 mt-1">Skriv ditt postnummer för att se tillgängliga adresser</p>
        </div>

        {/* Address with dropdown */}
        <div className="relative">
          <Label htmlFor="address">Adress *</Label>
          <div className="relative mt-1.5">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              id="address"
              placeholder="Välj eller skriv din adress"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onFocus={() => postcode.length === 5 && setShowAddressDropdown(true)}
              className="pl-10 h-12"
            />
            {availableAddresses.length > 0 && (
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            )}
          </div>
          
          {/* Address Dropdown */}
          {showAddressDropdown && availableAddresses.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              <div className="p-2 text-xs text-slate-500 border-b">Välj adress:</div>
              {availableAddresses.map((addr, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setAddress(addr);
                    setShowAddressDropdown(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-teal-500" />
                    <span>{addr}, {postcode}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="apartment">Lägenhetsnummer (valfritt)</Label>
            <Input
              id="apartment"
              placeholder="t.ex. 1201"
              value={apartmentNumber}
              onChange={(e) => setApartmentNumber(e.target.value)}
              className="mt-1.5 h-12"
            />
          </div>
          <div>
            <Label htmlFor="portcode">Portkod (valfritt)</Label>
            <Input
              id="portcode"
              placeholder="t.ex. 1234"
              value={portCode}
              onChange={(e) => setPortCode(e.target.value)}
              className="mt-1.5 h-12"
            />
          </div>
        </div>

        <div>
          <Label>Bostadstyp *</Label>
          <RadioGroup
            value={propertyType}
            onValueChange={setPropertyType}
            className="grid grid-cols-3 gap-4 mt-1.5"
          >
            {['villa', 'lagenhet', 'kontor'].map((type) => (
              <div key={type}>
                <RadioGroupItem
                  value={type}
                  id={type}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={type}
                  className="flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all peer-data-[state=checked]:border-teal-500 peer-data-[state=checked]:bg-teal-50 hover:border-teal-300"
                >
                  <span className="font-medium capitalize">
                    {type === 'lagenhet' ? 'Lägenhet' : type === 'villa' ? 'Villa' : 'Kontor'}
                  </span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {selectedService === 'fonsterputs' ? (
          <div>
            <Label htmlFor="windows">Antal fönster *</Label>
            <Input
              id="windows"
              type="number"
              placeholder="t.ex. 8"
              value={windows}
              onChange={(e) => setWindows(e.target.value)}
              className="mt-1.5 h-12"
            />
            <p className="text-sm text-slate-500 mt-1">89 kr/fönster efter RUT</p>
          </div>
        ) : (
          <div>
            <Label htmlFor="hours">Antal timmar *</Label>
            <Input
              id="hours"
              type="number"
              placeholder="t.ex. 3"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="mt-1.5 h-12"
            />
            <p className="text-sm text-slate-500 mt-1">
              {selectedServiceData?.finalPrice} kr/tim efter RUT
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderDateTimeStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Välj datum och tid</h2>
        <p className="text-slate-600">När passar det dig att vi kommer?</p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="mb-2 block">Datum *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal h-12',
                  !date && 'text-muted-foreground'
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP', { locale: sv }) : 'Välj datum'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label className="mb-3 block">Tid *</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {timeSlots.map((slot) => (
              <button
                key={slot.id}
                onClick={() => setTimeSlot(slot.id)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  timeSlot === slot.id
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-slate-200 hover:border-teal-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span className="font-medium text-slate-800">{slot.label}</span>
                </div>
                <p className="text-sm text-slate-600 mt-1">{slot.time}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDetailsStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Dina uppgifter</h2>
        <p className="text-slate-600">Fyll i dina kontaktuppgifter för bokningen</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstname">Förnamn *</Label>
            <Input
              id="firstname"
              placeholder="t.ex. Anna"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-1.5 h-12"
            />
          </div>
          <div>
            <Label htmlFor="lastname">Efternamn *</Label>
            <Input
              id="lastname"
              placeholder="t.ex. Andersson"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-1.5 h-12"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="personnummer">Personnummer (ÅÅÅÅMMDD-XXXX) *</Label>
          <Input
            id="personnummer"
            placeholder="t.ex. 19850115-1234"
            value={personnummer}
            onChange={handlePersonnummerChange}
            className="mt-1.5 h-12"
            maxLength={13}
          />
          <p className="text-sm text-slate-500 mt-1">Behövs för RUT-avdrag</p>
        </div>

        <div>
          <Label htmlFor="email">E-post *</Label>
          <Input
            id="email"
            type="email"
            placeholder="t.ex. anna@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 h-12"
          />
        </div>

        <div>
          <Label htmlFor="phone">Telefon *</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="t.ex. 070-123 45 67"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1.5 h-12"
          />
        </div>

        <div className="flex items-start gap-3 p-4 bg-teal-50 rounded-xl">
          <Checkbox
            id="newcustomer"
            checked={isNewCustomer}
            onCheckedChange={(checked) => setIsNewCustomer(checked as boolean)}
          />
          <div>
            <Label htmlFor="newcustomer" className="font-medium text-slate-800">
              Jag är ny kund
            </Label>
            <p className="text-sm text-slate-600 mt-1">
              Få 20% rabatt på dina första 3 månader!
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl">
          <Checkbox
            id="rut"
            checked={rutDeduction}
            onCheckedChange={(checked) => setRutDeduction(checked as boolean)}
          />
          <div>
            <Label htmlFor="rut" className="font-medium text-slate-800">
              Jag vill använda RUT-avdrag
            </Label>
            <p className="text-sm text-slate-600 mt-1">
              Vi hanterar RUT-avdraget åt dig. Du får 50% avdrag på arbetskostnaden.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Checkbox
            id="terms"
            checked={termsAccepted}
            onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
          />
          <Label htmlFor="terms" className="text-sm">
            Jag godkänner{' '}
            <a href="#" className="text-teal-600 hover:underline">
              allmänna villkoren
            </a>{' '}
            och{' '}
            <a href="#" className="text-teal-600 hover:underline">
              integritetspolicyn
            </a>{' '}
            *
          </Label>
        </div>
      </div>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Betalning</h2>
        <p className="text-slate-600">Välj hur du vill betala för din städning</p>
      </div>

      {/* Price Summary */}
      <div className="bg-slate-50 rounded-xl p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Prisöversikt</h3>
        
        {/* Service details */}
        <div className="mb-4 pb-4 border-b">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Tjänst:</span>
            <span className="font-medium">{selectedServiceData?.title}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-slate-600">Antal:</span>
            <span className="font-medium">
              {selectedServiceData?.id === 'fonsterputs' 
                ? `${windows} fönster` 
                : `${hours} timmar`}
            </span>
          </div>
          {cleaningFrequency !== 'one-time' && selectedServiceData?.id === 'hemstadning' && (
            <div className="flex justify-between text-sm mt-1">
              <span className="text-slate-600">Frekvens:</span>
              <span className="font-medium">
                {cleaningFrequency === 'weekly' ? 'Varje vecka' : 'Varannan vecka'}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Ordinarie pris:</span>
            <span className="line-through">{prices.original} kr</span>
          </div>
          {rutDeduction && (
            <div className="flex justify-between text-green-600">
              <span>RUT-avdrag (50%):</span>
              <span>-{prices.original - prices.afterRut} kr</span>
            </div>
          )}
          {isNewCustomer && rutDeduction && (
            <div className="flex justify-between text-amber-600">
              <span>Ny kund-rabatt (20%):</span>
              <span>-{Math.round(prices.afterRut - (selectedServiceData?.finalPrice || 0) * (selectedServiceData?.id === 'fonsterputs' ? parseInt(windows) || 1 : parseInt(hours) || 2))} kr</span>
            </div>
          )}
          {isNewCustomer && !rutDeduction && (
            <div className="flex justify-between text-amber-600">
              <span>Ny kund-rabatt (20%):</span>
              <span>-{Math.round(prices.original * 0.2)} kr</span>
            </div>
          )}
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between font-semibold text-lg">
              <span className="text-slate-800">Att betala:</span>
              <span className="text-teal-600">{prices.final} kr</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {rutDeduction ? 'Pris efter RUT-avdrag' : 'Pris utan RUT-avdrag'}
            </p>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div>
        <Label className="mb-3 block">Betalningssätt *</Label>
        <RadioGroup
          value={paymentMethod}
          onValueChange={setPaymentMethod}
          className="space-y-3"
        >
          <div>
            <RadioGroupItem
              value="invoice"
              id="invoice"
              className="peer sr-only"
            />
            <Label
              htmlFor="invoice"
              className="flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all peer-data-[state=checked]:border-teal-500 peer-data-[state=checked]:bg-teal-50 hover:border-teal-300"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <span className="font-medium text-slate-800">Faktura</span>
                <p className="text-sm text-slate-500">Betala inom 14 dagar</p>
              </div>
            </Label>
          </div>

          <div>
            <RadioGroupItem
              value="autogiro"
              id="autogiro"
              className="peer sr-only"
            />
            <Label
              htmlFor="autogiro"
              className="flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all peer-data-[state=checked]:border-teal-500 peer-data-[state=checked]:bg-teal-50 hover:border-teal-300"
            >
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Banknote className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <span className="font-medium text-slate-800">Autogiro</span>
                <p className="text-sm text-slate-500">Smidig månadsbetalning via bank</p>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400" />
            </Label>
          </div>

          <div>
            <RadioGroupItem
              value="card"
              id="card"
              className="peer sr-only"
            />
            <Label
              htmlFor="card"
              className="flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all peer-data-[state=checked]:border-teal-500 peer-data-[state=checked]:bg-teal-50 hover:border-teal-300"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <span className="font-medium text-slate-800">Kortbetalning</span>
                <p className="text-sm text-slate-500">VISA, Mastercard - betala online</p>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400" />
            </Label>
          </div>

          <div>
            <RadioGroupItem
              value="swish"
              id="swish"
              className="peer sr-only"
            />
            <Label
              htmlFor="swish"
              className="flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all peer-data-[state=checked]:border-teal-500 peer-data-[state=checked]:bg-teal-50 hover:border-teal-300"
            >
              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                <QrCode className="w-6 h-6 text-pink-600" />
              </div>
              <div className="flex-1">
                <span className="font-medium text-slate-800">Swish</span>
                <p className="text-sm text-slate-500">Snabb mobilbetalning</p>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400" />
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="bg-amber-50 rounded-xl p-4">
        <p className="text-sm text-amber-800">
          <strong>Ny kund?</strong> Du får 20% rabatt på dina första 3 månader. 
          Erbjudandet aktiveras automatiskt vid din första bokning.
        </p>
      </div>
    </div>
  );

  // Autogiro Setup Page
  const renderAutogiroStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Banknote className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Konfigurera Autogiro</h2>
        <p className="text-slate-600">Anslut ditt bankkonto för automatisk betalning</p>
      </div>

      <div className="bg-slate-50 rounded-xl p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Betalningsinformation</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Belopp att betala:</span>
            <span className="font-semibold text-teal-600">{prices.final} kr</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Betalningsintervall:</span>
            <span>Månadsvis</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Första dragning:</span>
            <span>Efter städning</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="bank">Välj bank *</Label>
          <select id="bank" className="w-full p-3 border rounded-xl mt-1.5">
            <option value="">Välj din bank</option>
            <option value="seb">SEB</option>
            <option value="swedbank">Swedbank</option>
            <option value="nordea">Nordea</option>
            <option value="handelsbanken">Handelsbanken</option>
            <option value="danske">Danske Bank</option>
            <option value="ica">ICA Banken</option>
            <option value="lf">Länsförsäkringar</option>
          </select>
        </div>

        <div>
          <Label htmlFor="kontonr">Kontonummer *</Label>
          <Input
            id="kontonr"
            placeholder="t.ex. 1234 56 78901"
            className="mt-1.5 h-12"
          />
        </div>

        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            <strong>Så fungerar det:</strong><br />
            1. Du godkänner autogiro via din bank<br />
            2. Vi drar beloppet automatiskt varje månad<br />
            3. Du får faktura som underlag inför dragning
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={handleBack} className="flex-1">
          Tillbaka
        </Button>
        <Button onClick={() => setCurrentStep('confirmation')} className="flex-1 bg-green-600 hover:bg-green-700">
          Godkänn och fortsätt
        </Button>
      </div>
    </div>
  );

  // Stripe Payment Page
  const renderStripeStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Kortbetalning</h2>
        <p className="text-slate-600">Betala säkert med ditt kort</p>
      </div>

      <div className="bg-slate-50 rounded-xl p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Att betala</h3>
        <div className="text-center">
          <span className="text-3xl font-bold text-teal-600">{prices.final} kr</span>
          <p className="text-sm text-slate-500 mt-1">{rutDeduction ? 'Efter RUT-avdrag' : 'Utan RUT-avdrag'}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="cardname">Kortinnehavare *</Label>
          <Input
            id="cardname"
            placeholder="Namn på kortet"
            className="mt-1.5 h-12"
          />
        </div>

        <div>
          <Label htmlFor="cardnumber">Kortnummer *</Label>
          <Input
            id="cardnumber"
            placeholder="1234 5678 9012 3456"
            className="mt-1.5 h-12"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="expiry">Utgångsdatum *</Label>
            <Input
              id="expiry"
              placeholder="MM/ÅÅ"
              className="mt-1.5 h-12"
            />
          </div>
          <div>
            <Label htmlFor="cvc">CVC *</Label>
            <Input
              id="cvc"
              placeholder="123"
              className="mt-1.5 h-12"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="px-2 py-1 bg-slate-100 rounded">VISA</span>
          <span className="px-2 py-1 bg-slate-100 rounded">Mastercard</span>
          <span className="px-2 py-1 bg-slate-100 rounded">American Express</span>
        </div>

        <div className="bg-green-50 rounded-xl p-4">
          <p className="text-sm text-green-800">
            <strong>Säker betalning:</strong> Din betalning hanteras säkert via Stripe. 
            HemSolutions sparar aldrig dina kortuppgifter.
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={handleBack} className="flex-1">
          Tillbaka
        </Button>
        <Button onClick={() => setCurrentStep('confirmation')} className="flex-1 bg-purple-600 hover:bg-purple-700">
          Betala {prices.final} kr
        </Button>
      </div>
    </div>
  );

  // Swish Payment Page
  const renderSwishStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <QrCode className="w-8 h-8 text-pink-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Betala med Swish</h2>
        <p className="text-slate-600">Skanna QR-koden eller ange ditt telefonnummer</p>
      </div>

      <div className="bg-slate-50 rounded-xl p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Att betala</h3>
        <div className="text-center">
          <span className="text-3xl font-bold text-teal-600">{prices.final} kr</span>
          <p className="text-sm text-slate-500 mt-1">{rutDeduction ? 'Efter RUT-avdrag' : 'Utan RUT-avdrag'}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="swishphone">Swish-anslutet telefonnummer *</Label>
          <Input
            id="swishphone"
            placeholder="t.ex. 070-123 45 67"
            defaultValue={phone}
            className="mt-1.5 h-12"
          />
        </div>

        <div className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-8 text-center">
          <div className="w-32 h-32 bg-slate-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <QrCode className="w-16 h-16 text-slate-400" />
          </div>
          <p className="text-sm text-slate-600">QR-kod för Swish-betalning</p>
          <p className="text-xs text-slate-400 mt-1">Mottagare: HemSolutions Sverige AB</p>
        </div>

        <div className="bg-pink-50 rounded-xl p-4">
          <p className="text-sm text-pink-800">
            <strong>Så fungerar det:</strong><br />
            1. Öppna Swish-appen på din telefon<br />
            2. Skanna QR-koden eller sök på "HemSolutions"<br />
            3. Godkänn betalningen i appen
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={handleBack} className="flex-1">
          Tillbaka
        </Button>
        <Button onClick={() => setCurrentStep('confirmation')} className="flex-1 bg-pink-600 hover:bg-pink-700">
          Jag har betalat
        </Button>
      </div>
    </div>
  );

  const renderConfirmationStep = () => {
    if (bookingSubmitting) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Calendar className="w-8 h-8 text-teal-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Bearbetar din bokning...</h2>
          <p className="text-slate-600">Skickar bokningsdetaljer och e-postbekräftelse.</p>
        </div>
      );
    }
    
    if (bookingError) {
      return (
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Ett fel uppstod</h2>
          <p className="text-slate-600 mb-4 max-w-md mx-auto">{bookingError}</p>
          <p className="text-sm text-slate-500 mb-6">Din bokning kanske redan har sparats. Kontakta oss på info@hemsolutions.se om du är osäker.</p>
          <Button onClick={() => setCurrentStep('payment')} variant="outline" className="mr-3">
            Tillbaka till betalning
          </Button>
          <Button onClick={onBack} className="bg-teal-500 hover:bg-teal-600">
            Tillbaka till startsidan
          </Button>
        </div>
      );
    }
    
    return (
    <div className="text-center py-8">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Check className="w-10 h-10 text-green-500" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-4">
        Tack för din bokning!
      </h2>
      <p className="text-slate-600 mb-8 max-w-md mx-auto">
        Vi har skickat en bekräftelse till din e-post. En faktura på{' '}
        <strong className="text-teal-600">{prices.final} kr</strong> har genererats 
        och skickats till din e-postadress.
      </p>
      
      <div className="bg-slate-50 rounded-xl p-6 max-w-md mx-auto mb-8 text-left">
        <h3 className="font-semibold text-slate-800 mb-4">Bokningsöversikt</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Tjänst:</span>
            <span className="font-medium">{selectedServiceData?.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Adress:</span>
            <span className="font-medium">{address}, {postcode}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Datum:</span>
            <span className="font-medium">{date && format(date, 'PPP', { locale: sv })}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Tid:</span>
            <span className="font-medium">{timeSlots.find(t => t.id === timeSlot)?.label}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Betalning:</span>
            <span className="font-medium capitalize">
              {paymentMethod === 'invoice' ? 'Faktura' : 
               paymentMethod === 'autogiro' ? 'Autogiro' : 
               paymentMethod === 'card' ? 'Kort' : 'Swish'}
            </span>
          </div>
          <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
            <span className="text-slate-800">Totalt att betala:</span>
            <span className="text-teal-600">{prices.final} kr</span>
          </div>
        </div>
        {selectedServiceData?.id === 'hemstadning' && cleaningFrequency !== 'one-time' && (
          <div className="mt-4 p-3 bg-amber-50 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Obs:</strong> Efter 3 månader justeras priset till 300 kr/tim (efter RUT).
            </p>
          </div>
        )}
      </div>

      <div className="bg-teal-50 rounded-xl p-4 max-w-md mx-auto mb-8">
        <p className="text-sm text-teal-800">
          <strong>Vad händer nu?</strong><br />
          1. Du får en bekräftelse via e-post<br />
          2. Faktura skickas separat<br />
          3. Vi kontaktar dig innan städningen<br />
          4. Njut av ett skinande rent hem!
        </p>
      </div>

      <Button onClick={onBack} className="bg-teal-500 hover:bg-teal-600 text-white">
        Tillbaka till startsidan
      </Button>
    </div>
  );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'service':
        return renderServiceStep();
      case 'address':
        return renderAddressStep();
      case 'datetime':
        return renderDateTimeStep();
      case 'details':
        return renderDetailsStep();
      case 'payment':
        return renderPaymentStep();
      case 'autogiro':
        return renderAutogiroStep();
      case 'stripe':
        return renderStripeStep();
      case 'swish':
        return renderSwishStep();
      case 'confirmation':
        return renderConfirmationStep();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={currentStep === 'service' ? onBack : handleBack}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold">Boka städning</h1>
        </div>

        {/* Progress */}
        {currentStep !== 'confirmation' && currentStep !== 'autogiro' && currentStep !== 'stripe' && currentStep !== 'swish' && (
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                    steps.findIndex(s => s.id === currentStep) >= index
                      ? 'bg-teal-500 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {steps.findIndex(s => s.id === currentStep) > index ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={`ml-2 text-sm font-medium hidden sm:block ${
                    steps.findIndex(s => s.id === currentStep) >= index
                      ? 'text-slate-800'
                      : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`w-8 sm:w-16 h-0.5 mx-2 sm:mx-4 ${
                      steps.findIndex(s => s.id === currentStep) > index
                        ? 'bg-teal-500'
                        : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Content Card */}
        <div className="bg-white rounded-2xl shadow-card p-6 sm:p-8">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        {currentStep !== 'confirmation' && currentStep !== 'autogiro' && currentStep !== 'stripe' && currentStep !== 'swish' && (
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={currentStep === 'service' ? onBack : handleBack}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Tillbaka
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-teal-500 hover:bg-teal-600 text-white disabled:opacity-50"
            >
              {currentStep === 'payment' ? 'Fortsätt till betalning' : 'Fortsätt'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
