import { useState, useEffect } from 'react';
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
import { AdminPanel } from './sections/AdminPanel';
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

export type View = 'home' | 'booking' | 'dashboard' | 'worker' | 'admin' | 'login' | 'register' | 'allmannavillkor' | 'integritetspolicy' | 'cookiepolicy' | 'tillganglighetsredogorelse' | 'contact';

function AppContent() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      if (currentView === 'login' || currentView === 'register') {
        if (user.role === 'admin') setCurrentView('admin');
        else if (user.role === 'worker') setCurrentView('worker');
        else setCurrentView('dashboard');
      }
    }
  }, [isAuthenticated, user, currentView]);

  const handleBookNow = () => {
    setCurrentView('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogin = () => {
    setCurrentView('login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderView = () => {
    switch (currentView) {
      case 'booking':
        return <BookingFlow onBack={() => setCurrentView('home')} />;
      case 'dashboard':
        return <CustomerDashboard onBack={() => setCurrentView('home')} />;
      case 'worker':
        return <WorkerApp onBack={() => setCurrentView('home')} />;
      case 'admin':
        return <AdminPanel onBack={() => setCurrentView('home')} />;
      case 'login':
        return <LoginPage onBack={() => setCurrentView('home')} />;
      case 'register':
        return <RegisterPage onBack={() => setCurrentView('home')} />;
      case 'allmannavillkor':
        return <AllmannaVillkor />;
      case 'integritetspolicy':
        return <Integritetspolicy />;
      case 'cookiepolicy':
        return <Cookiepolicy />;
      case 'tillganglighetsredogorelse':
        return <Tillganglighetsredogorelse />;
      case 'contact':
        return <ContactPage />;
      default:
        return (
          <>
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
              onNavigate={setCurrentView}
            />
            <AIChatbot onBookNow={handleBookNow} />
            <CookieConsent />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {currentView === 'home' || currentView === 'contact' ? (
        <Navigation 
          scrolled={scrolled} 
          onNavigate={setCurrentView}
          currentView={currentView}
        />
      ) : null}
      <main>
        {renderView()}
      </main>
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
