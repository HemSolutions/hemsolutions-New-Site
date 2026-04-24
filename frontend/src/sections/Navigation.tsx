import { useState } from 'react';
import { Menu, X, ChevronDown, User, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';
import type { View } from '@/App';

interface NavigationProps {
  scrolled: boolean;
  onNavigate: (view: View) => void;
  currentView: View;
}

export function Navigation({ scrolled, onNavigate, currentView }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage } = useLanguage();

  const isLandingPage = currentView === 'home';

  const scrollToSection = (sectionId: string) => {
    if (!isLandingPage) {
      onNavigate('home');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        element?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <button 
            onClick={() => onNavigate('home')}
            className="flex items-center space-x-3"
          >
            <img 
              src="/hemsolutions-logo.png" 
              alt="HemSolutions Sverige AB" 
              className="w-12 h-12 object-contain"
            />
            <div className="hidden sm:flex flex-col">
              <span className={`text-lg font-bold leading-tight transition-colors ${
                scrolled ? 'text-slate-800' : 'text-white'
              }`}>
                HemSolutions
              </span>
              <span className={`text-xs leading-tight transition-colors ${
                scrolled ? 'text-slate-500' : 'text-white/70'
              }`}>
                Sverige AB
              </span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {/* Städning Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors hover:bg-white/10 ${
                  scrolled ? 'text-slate-700' : 'text-white'
                }`}>
                  Städning
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem onClick={() => scrollToSection('services')}>
                  Hemstädning - 199 kr/tim
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => scrollToSection('services')}>
                  Storstädning
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => scrollToSection('services')}>
                  Fönsterputs - 89 kr/fönster
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => scrollToSection('services')}>
                  Flyttstädning
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Trädgård Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors hover:bg-white/10 ${
                  scrolled ? 'text-slate-700' : 'text-white'
                }`}>
                  Trädgård
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem onClick={() => scrollToSection('services')}>
                  Trädgårdshjälp
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => scrollToSection('services')}>
                  Vår- och höststädning
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Företag Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors hover:bg-white/10 ${
                  scrolled ? 'text-slate-700' : 'text-white'
                }`}>
                  Företag
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem onClick={() => scrollToSection('services')}>
                  Kontorsstädning - 249 kr/tim
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => scrollToSection('services')}>
                  För bostadsrättsföreningar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Om oss Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors hover:bg-white/10 ${
                  scrolled ? 'text-slate-700' : 'text-white'
                }`}>
                  Om oss
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem onClick={() => scrollToSection('about')}>
                  Om HemSolutions
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => scrollToSection('trust')}>
                  Våra värderingar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => scrollToSection('testimonials')}>
                  Kundomdömen
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => scrollToSection('blog')}>
                  Blogg
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => scrollToSection('careers')}>
                  Jobba hos oss
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {/* Kontakt */}
            <button
              onClick={() => onNavigate('contact')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-white/10 ${
                scrolled ? 'text-slate-700' : 'text-white'
              }`}
            >
              Kontakt
            </button>
          </nav>

          {/* Right Side Actions */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Language Toggle */}
            <div className="flex items-center rounded-lg overflow-hidden border border-slate-200/30">
              <button
                onClick={() => setLanguage('sv')}
                className={`px-2 py-1.5 text-xs font-semibold transition-colors ${
                  language === 'sv'
                    ? scrolled
                      ? 'bg-teal-500 text-white'
                      : 'bg-white/20 text-white'
                    : scrolled
                      ? 'text-slate-600 hover:bg-slate-100'
                      : 'text-white/70 hover:bg-white/10'
                }`}
              >
                SWE
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1.5 text-xs font-semibold transition-colors ${
                  language === 'en'
                    ? scrolled
                      ? 'bg-teal-500 text-white'
                      : 'bg-white/20 text-white'
                    : scrolled
                      ? 'text-slate-600 hover:bg-slate-100'
                      : 'text-white/70 hover:bg-white/10'
                }`}
              >
                ENG
              </button>
            </div>

            {/* Login Button */}
            <Button
              variant="ghost"
              onClick={() => onNavigate('login')}
              className={`flex items-center gap-2 ${
                scrolled ? 'text-slate-700 hover:text-slate-900' : 'text-white hover:text-white hover:bg-white/10'
              }`}
            >
              <User className="w-4 h-4" />
              Logga in
            </Button>

            {/* CTA Button */}
            <Button
              onClick={() => onNavigate('booking')}
              className="bg-teal-500 hover:bg-teal-600 text-white shadow-button"
            >
              Boka nu
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`lg:hidden p-2 rounded-lg transition-colors ${
              scrolled ? 'text-slate-700' : 'text-white'
            }`}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t shadow-lg animate-slide-in-right">
          <div className="px-4 py-4 space-y-3">
            <button
              onClick={() => scrollToSection('services')}
              className="block w-full text-left px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
            >
              Städning
            </button>
            <button
              onClick={() => scrollToSection('services')}
              className="block w-full text-left px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
            >
              Trädgård
            </button>
            <button
              onClick={() => scrollToSection('services')}
              className="block w-full text-left px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
            >
              Företag
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="block w-full text-left px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
            >
              Om oss
            </button>
            <button
              onClick={() => {
                onNavigate('contact');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
            >
              Kontakt
            </button>
            <hr className="my-3" />
            {/* Mobile Language Toggle */}
            <div className="flex items-center justify-center gap-2 px-4 py-2">
              <button
                onClick={() => setLanguage('sv')}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex-1 transition-colors ${
                  language === 'sv' ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                🇸🇪 Svenska
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex-1 transition-colors ${
                  language === 'en' ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                🇬🇧 English
              </button>
            </div>
            <hr className="my-3" />
            <Button
              variant="outline"
              onClick={() => {
                onNavigate('login');
                setMobileMenuOpen(false);
              }}
              className="w-full justify-center"
            >
              <User className="w-4 h-4 mr-2" />
              Logga in
            </Button>
            <Button
              onClick={() => {
                onNavigate('booking');
                setMobileMenuOpen(false);
              }}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white"
            >
              Boka nu
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
