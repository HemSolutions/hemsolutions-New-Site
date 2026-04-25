import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navigation } from './sections/Navigation';
import { Hero } from './sections/Hero';
import { Services } from './sections/Services';
import { TrustFeatures } from './sections/TrustFeatures';
import { About } from './sections/About';
import { MobileApp } from './sections/MobileApp';
import { Testimonials } from './sections/Testimonials';
import { Careers } from './sections/Careers';
import { Footer } from './sections/Footer';
import { BookingFlow } from './sections/BookingFlow';
import { CustomerDashboard } from './sections/CustomerDashboard';
import { WorkerApp } from './sections/WorkerApp';
import { Blog } from './sections/Blog';
import { AIChatbot } from './sections/AIChatbot';
import { AIHelp } from './sections/AIHelp';
import { FAQ } from './sections/FAQ';
import { PromotionalOffers } from './sections/PromotionalOffers';
import { LoginPage } from './sections/LoginPage';
import { RegisterPage } from './sections/RegisterPage';
import { CookieConsent } from './components/CookieConsent';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AllmannaVillkor } from './pages/AllmannaVillkor';
import { Integritetspolicy } from './pages/Integritetspolicy';
import { Cookiepolicy } from './pages/Cookiepolicy';
import { Tillganglighetsredogorelse } from './pages/Tillganglighetsredogorelse';
import { ContactPage } from './pages/ContactPage';
import AdminDashboard from './pages/AdminDashboard';

function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBookNow = () => navigate('/booking');
  const handleLogin = () => navigate('/login');

  return (
    <>
      <Navigation scrolled={scrolled} onNavigate={(view: any) => {
        if (view === 'login') navigate('/login');
        else if (view === 'booking') navigate('/booking');
        else if (view === 'contact') navigate('/contact');
        else if (view === 'allmannavillkor') navigate('/allmanna-villkor');
        else if (view === 'integritetspolicy') navigate('/integritetspolicy');
        else if (view === 'cookiepolicy') navigate('/cookiepolicy');
        else if (view === 'tillganglighetsredogorelse') navigate('/tillganglighetsredogorelse');
        else navigate('/');
      }} currentView="home" />
      <main>
        <Hero onBookNow={handleBookNow} />
        <PromotionalOffers onBookNow={handleBookNow} />
        <Services onBookNow={handleBookNow} />
        <TrustFeatures />
        <AIHelp onBookNow={handleBookNow} />
        <About />
        <MobileApp />
        <Testimonials />
        <Blog />
        <FAQ />
        <Careers />
        <Footer 
          onLogin={handleLogin} 
          onWorkerLogin={handleLogin}
          onAdminLogin={handleLogin}
          onNavigate={(view: any) => {
            if (view === 'login') navigate('/login');
            else if (view === 'contact') navigate('/contact');
          }}
        />
        <AIChatbot onBookNow={handleBookNow} />
        <CookieConsent />
      </main>
    </>
  );
}

function AuthRedirect() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'worker') navigate('/worker');
      else navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  return null;
}

function AppContent() {
  const { logout } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/booking" element={<BookingFlow onBack={() => window.location.href = '/'} />} />
      <Route path="/dashboard" element={<CustomerDashboard onBack={() => window.location.href = '/'} />} />
      <Route path="/worker" element={<WorkerApp onBack={() => window.location.href = '/'} />} />
      <Route path="/login" element={<><AuthRedirect /><LoginPage onBack={() => window.location.href = '/'} /></>} />
      <Route path="/register" element={<RegisterPage onBack={() => window.location.href = '/'} />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/allmanna-villkor" element={<AllmannaVillkor />} />
      <Route path="/integritetspolicy" element={<Integritetspolicy />} />
      <Route path="/cookiepolicy" element={<Cookiepolicy />} />
      <Route path="/tillganglighetsredogorelse" element={<Tillganglighetsredogorelse />} />
      <Route path="/admin/*" element={<AdminDashboard onLogout={() => { logout(); window.location.href = '/'; }} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <LanguageProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </LanguageProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
