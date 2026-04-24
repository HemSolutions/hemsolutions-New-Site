import { MapPin, Phone, Mail, Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';
import type { View } from '@/App';

interface FooterProps {
  onLogin: () => void;
  onWorkerLogin: () => void;
  onAdminLogin: () => void;
  onNavigate?: (view: View) => void;
}

export function Footer({ onLogin, onWorkerLogin, onAdminLogin, onNavigate }: FooterProps) {
  const serviceLinks = [
    { label: 'Hemstädning - 199 kr/tim', href: '#services' },
    { label: 'Storstädning', href: '#services' },
    { label: 'Fönsterputs - 89 kr/fönster', href: '#services' },
    { label: 'Flyttstädning', href: '#services' },
    { label: 'Trädgårdshjälp', href: '#services' },
    { label: 'Kontorsstädning - 249 kr/tim', href: '#services' },
  ];

  const companyLinks = [
    { label: 'Om HemSolutions', href: '#about' },
    { label: 'Vårt team', href: '#about' },
    { label: 'Jobba hos oss', href: '#careers' },
    { label: 'Hållbarhet', href: '#' },
    { label: 'Blogg', href: '#blog' },
  ];

  const infoLinks = [
    { label: 'HemSolutions App för iPhone', href: '#' },
    { label: 'HemSolutions App för Android', href: '#' },
    { label: 'Om RUT-avdraget', href: '#' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Kontakta oss', action: 'contact' },
  ];

  const legalLinks = [
    { label: 'Allmänna villkor', action: 'allmannavillkor' },
    { label: 'Integritetspolicy', action: 'integritetspolicy' },
    { label: 'Cookiepolicy', action: 'cookiepolicy' },
    { label: 'Tillgänglighetsredogörelse', action: 'tillganglighetsredogorelse' },
  ];

  return (
    <footer className="bg-slate-800 text-slate-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <img 
                src="/hemsolutions-logo.png" 
                alt="HemSolutions Sverige AB" 
                className="w-14 h-14 object-contain"
              />
              <div>
                <span className="text-xl font-bold text-white">HemSolutions</span>
                <p className="text-sm text-slate-400">Sverige AB</p>
              </div>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-teal-400 mt-0.5" />
                <div>
                  <p className="text-white font-medium">HemSolutions Sverige AB</p>
                  <p>Sparres Väg 22</p>
                  <p>197 37 Bro</p>
                  <p className="text-teal-400 text-sm font-medium">Org.nr: 559574-8236</p>
                  <p className="text-slate-400 text-sm">Stockholm & Mälardalen</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-teal-400" />
                <a href="tel:081234567" className="hover:text-teal-400 transition-colors">08-525 133 39</a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-teal-400" />
                <a href="mailto:info@hemsolutions.se" className="hover:text-teal-400 transition-colors">
                  info@hemsolutions.se
                </a>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center hover:bg-teal-500 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center hover:bg-teal-500 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center hover:bg-teal-500 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center hover:bg-teal-500 transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-4">Våra tjänster</h3>
            <ul className="space-y-3">
              {serviceLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="hover:text-teal-400 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Om HemSolutions</h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="hover:text-teal-400 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Mer information</h3>
            <ul className="space-y-3">
              {infoLinks.map((link) => (
                <li key={link.label}>
                  {'action' in link ? (
                    <button
                      onClick={() => onNavigate?.(link.action as View)}
                      className="hover:text-teal-400 transition-colors"
                    >
                      {link.label}
                    </button>
                  ) : (
                    <a
                      href={link.href}
                      className="hover:text-teal-400 transition-colors"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>

            {/* Portal Links */}
            <div className="mt-6 pt-6 border-t border-slate-700">
              <h4 className="text-white font-semibold mb-3">Portaler</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={onLogin}
                    className="hover:text-teal-400 transition-colors"
                  >
                    Kundportal
                  </button>
                </li>
                <li>
                  <button
                    onClick={onWorkerLogin}
                    className="hover:text-teal-400 transition-colors"
                  >
                    Medarbetarportal
                  </button>
                </li>
                <li>
                  <button
                    onClick={onAdminLogin}
                    className="hover:text-teal-400 transition-colors"
                  >
                    Admin
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">
              © {new Date().getFullYear()} HemSolutions Sverige AB. Alla rättigheter förbehållna.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              {legalLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => onNavigate?.(link.action as View)}
                  className="hover:text-teal-400 transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
