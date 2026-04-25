import { useState } from 'react';

import { 
  ArrowLeft, Mail, Lock, User, Eye, EyeOff, 
  Shield, Smartphone, CheckCircle, AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth, type UserRole } from '@/contexts/AuthContext';

interface LoginPageProps {
  onBack: () => void;
}

export function LoginPage({ onBack }: LoginPageProps) {
  const [activeRole, setActiveRole] = useState<UserRole>('customer');
  
  const { login, loginWithBankID, forgotPassword } = useAuth();
  
  // Email/Password login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // BankID login state
  const [personnummer, setPersonnummer] = useState('');
  const [bankIDStep, setBankIDStep] = useState<'input' | 'waiting' | 'success'>('input');
  
  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Redirect if already logged in - handled by parent component

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      if (!success) {
        setLoginError('Felaktig e-post eller lösenord. Försök igen.');
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      const message = error.response?.data?.message || error.message || 'Kunde inte ansluta till servern. Försök igen.';
      setLoginError(`Inloggning misslyckades: ${message}`);
    }
    setIsLoading(false);
  };

  const handleBankIDLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBankIDStep('waiting');
    
    // Simulate BankID waiting
    setTimeout(async () => {
      const success = await loginWithBankID(personnummer);
      if (success) {
        setBankIDStep('success');
      } else {
        setBankIDStep('input');
        setLoginError('Ingen användare hittades med detta personnummer.');
      }
    }, 2000);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await forgotPassword(forgotEmail);
    if (success) {
      setForgotSuccess(true);
    } else {
      setLoginError('Ingen användare hittades med denna e-postadress.');
    }
  };

  const getRoleTitle = () => {
    switch (activeRole) {
      case 'admin': return 'Admin-inloggning';
      case 'worker': return 'Medarbetar-inloggning';
      default: return 'Kund-inloggning';
    }
  };

  const getRoleDescription = () => {
    switch (activeRole) {
      case 'admin': return 'Logga in för att hantera systemet';
      case 'worker': return 'Logga in för att se ditt schema';
      default: return 'Logga in för att hantera dina bokningar';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 pt-20 pb-12">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
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

        {/* Role Selection */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <p className="text-sm text-slate-500 mb-3">Välj inloggningstyp:</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setActiveRole('customer')}
              className={`p-3 rounded-xl text-sm font-medium transition-all ${
                activeRole === 'customer' 
                  ? 'bg-teal-500 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <User className="w-5 h-5 mx-auto mb-1" />
              Kund
            </button>
            <button
              onClick={() => setActiveRole('worker')}
              className={`p-3 rounded-xl text-sm font-medium transition-all ${
                activeRole === 'worker' 
                  ? 'bg-teal-500 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }}`}
            >
              <Shield className="w-5 h-5 mx-auto mb-1" />
              Personal
            </button>
            <button
              onClick={() => setActiveRole('admin')}
              className={`p-3 rounded-xl text-sm font-medium transition-all ${
                activeRole === 'admin' 
                  ? 'bg-teal-500 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Lock className="w-5 h-5 mx-auto mb-1" />
              Admin
            </button>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold text-slate-800">{getRoleTitle()}</h2>
            <p className="text-slate-500">{getRoleDescription()}</p>
          </div>

          {showForgotPassword ? (
            <div className="p-6">
              {forgotSuccess ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">E-post skickad!</h3>
                  <p className="text-slate-600 mb-6">
                    Om det finns ett konto med denna e-postadress har vi skickat instruktioner för att återställa lösenordet.
                  </p>
                  <Button onClick={() => { setShowForgotPassword(false); setForgotSuccess(false); }}>
                    Tillbaka till inloggning
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <Label htmlFor="forgot-email">E-postadress</Label>
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="din@email.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="mt-1.5"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-teal-500 hover:bg-teal-600">
                    Skicka återställningslänk
                  </Button>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="w-full text-center text-sm text-slate-500 hover:text-teal-600"
                  >
                    Tillbaka till inloggning
                  </button>
                </form>
              )}
            </div>
          ) : (
            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  E-post
                </TabsTrigger>
                <TabsTrigger value="bankid" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  BankID
                </TabsTrigger>
              </TabsList>

              <TabsContent value="email" className="p-6">
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  {loginError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {loginError}
                    </div>
                  )}
                  
                  <div>
                    <Label htmlFor="email">E-postadress</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="din@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1.5"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Lösenord</Label>
                    <div className="relative mt-1.5">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Ditt lösenord"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
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

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded border-slate-300" />
                      <span className="text-slate-600">Kom ihåg mig</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-teal-600 hover:underline"
                    >
                      Glömt lösenord?
                    </button>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-teal-500 hover:bg-teal-600"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Loggar in...' : 'Logga in'}
                  </Button>
                </form>

                {activeRole === 'customer' && (
                  <div className="mt-6 pt-6 border-t text-center">
                    <p className="text-sm text-slate-600 mb-3">Har du inget konto?</p>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={onBack}
                    >
                      Gå tillbaka för att registrera
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="bankid" className="p-6">
                {bankIDStep === 'input' && (
                  <form onSubmit={handleBankIDLogin} className="space-y-4">
                    {loginError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {loginError}
                      </div>
                    )}
                    
                    <div>
                      <Label htmlFor="personnummer">Personnummer</Label>
                      <Input
                        id="personnummer"
                        placeholder="ÅÅÅÅMMDD-XXXX"
                        value={personnummer}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          if (val.length <= 12) {
                            setPersonnummer(val.length > 8 ? `${val.slice(0, 8)}-${val.slice(8)}` : val);
                          }
                        }}
                        className="mt-1.5"
                        maxLength={13}
                        required
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Ange ditt svenska personnummer
                      </p>
                    </div>

                    <Button type="submit" className="w-full bg-teal-500 hover:bg-teal-600">
                      <Smartphone className="w-4 h-4 mr-2" />
                      Öppna BankID
                    </Button>
                  </form>
                )}

                {bankIDStep === 'waiting' && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                      <Smartphone className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">
                      Starta BankID på din telefon
                    </h3>
                    <p className="text-slate-600">
                      Öppna BankID-appen och godkänn inloggningen
                    </p>
                  </div>
                )}

                {bankIDStep === 'success' && (
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">
                      Inloggning lyckades!
                    </h3>
                    <p className="text-slate-600">
                      Omdirigerar till din dashboard...
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-slate-100 rounded-xl">
          <p className="text-xs font-medium text-slate-500 mb-2">Demo-inloggningar:</p>
          <div className="space-y-1 text-xs text-slate-600">
            <p><strong>Kund:</strong> customer@demo.se / customer123</p>
            <p><strong>Personal:</strong> employee@hemsolutions.se / employee123</p>
            <p><strong>Admin:</strong> info@hemsolutions.se / Mzeeshan786</p>
          </div>
        </div>
      </div>
    </div>
  );
}
