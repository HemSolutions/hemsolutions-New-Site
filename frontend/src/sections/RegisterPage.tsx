import { useState } from 'react';

import { ArrowLeft, Eye, EyeOff, CheckCircle, AlertCircle, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';

interface RegisterPageProps {
  onBack: () => void;
}

export function RegisterPage({ onBack }: RegisterPageProps) {
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    personnummer: '',
    address: '',
    postcode: '',
    password: '',
    confirmPassword: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePersonnummerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length <= 12) {
      setFormData(prev => ({
        ...prev,
        personnummer: val.length > 8 ? `${val.slice(0, 8)}-${val.slice(8)}` : val
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Lösenorden matchar inte.');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Lösenordet måste vara minst 6 tecken.');
      return;
    }
    
    if (!agreeTerms) {
      setError('Du måste godkänna villkoren.');
      return;
    }
    
    setIsLoading(true);
    
    const success = await register(
      {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        personnummer: formData.personnummer,
        address: formData.address,
        postcode: formData.postcode,
      },
      formData.password
    );
    
    if (success) {
      setSuccess(true);
    } else {
      setError('E-postadressen är redan registrerad.');
    }
    
    setIsLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 pt-20 pb-12">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Välkommen till HemSolutions!</h2>
            <p className="text-slate-600 mb-6">
              Ditt konto har skapats. Du kan nu logga in och boka din första städning.
            </p>
            <Button onClick={onBack} className="w-full bg-teal-500 hover:bg-teal-600">
              Gå tillbaka
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 pt-20 pb-12">
      <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <img 
              src="/hemsolutions-logo.png" 
              alt="HemSolutions" 
              className="w-10 h-10 object-contain"
            />
            <div>
              <h1 className="text-xl font-bold text-slate-800">HemSolutions</h1>
              <p className="text-xs text-slate-500">Sverige AB</p>
            </div>
          </div>
        </div>

        {/* Registration Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold text-slate-800">Skapa konto</h2>
            <p className="text-slate-500">Fyll i dina uppgifter för att komma igång</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {/* Name Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Förnamn *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="Anna"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="mt-1.5"
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Efternamn *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Andersson"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="mt-1.5"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">E-postadress *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="anna@example.com"
                value={formData.email}
                onChange={handleChange}
                className="mt-1.5"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone">Telefonnummer *</Label>
              <div className="relative mt-1.5">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="phone"
                  name="phone"
                  placeholder="070-123 45 67"
                  value={formData.phone}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Personnummer */}
            <div>
              <Label htmlFor="personnummer">Personnummer (för RUT-avdrag)</Label>
              <Input
                id="personnummer"
                name="personnummer"
                placeholder="ÅÅÅÅMMDD-XXXX"
                value={formData.personnummer}
                onChange={handlePersonnummerChange}
                className="mt-1.5"
                maxLength={13}
              />
              <p className="text-xs text-slate-500 mt-1">Behövs för att kunna använda RUT-avdrag</p>
            </div>

            {/* Address */}
            <div>
              <Label htmlFor="address">Adress</Label>
              <div className="relative mt-1.5">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="address"
                  name="address"
                  placeholder="Storgatan 1"
                  value={formData.address}
                  onChange={handleChange}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Postcode */}
            <div>
              <Label htmlFor="postcode">Postnummer</Label>
              <Input
                id="postcode"
                name="postcode"
                placeholder="123 45"
                value={formData.postcode}
                onChange={(e) => setFormData(prev => ({ ...prev, postcode: e.target.value.replace(/\D/g, '').slice(0, 5) }))}
                className="mt-1.5"
                maxLength={5}
              />
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password">Lösenord *</Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minst 6 tecken"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <Label htmlFor="confirmPassword">Bekräfta lösenord *</Label>
              <div className="relative mt-1.5">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Upprepa lösenordet"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3 pt-2">
              <Checkbox
                id="terms"
                checked={agreeTerms}
                onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
              />
              <Label htmlFor="terms" className="text-sm font-normal cursor-pointer">
                Jag godkänner{' '}
                <a href="#" className="text-teal-600 hover:underline">allmänna villkoren</a>
                {' '}och{' '}
                <a href="#" className="text-teal-600 hover:underline">integritetspolicyn</a>
              </Label>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-teal-500 hover:bg-teal-600 h-12"
              disabled={isLoading}
            >
              {isLoading ? 'Skapar konto...' : 'Skapa konto'}
            </Button>

            <p className="text-center text-sm text-slate-600">
              Har du redan ett konto?{' '}
              <button
                type="button"
                onClick={onBack}
                className="text-teal-600 hover:underline font-medium"
              >
                Logga in
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
