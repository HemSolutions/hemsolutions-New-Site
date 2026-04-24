import { useState, useEffect } from 'react';
import { X, Cookie } from 'lucide-react';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    functional: false,
    analytics: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowBanner(true);
    } else {
      setPreferences(JSON.parse(consent));
    }
  }, []);

  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      functional: true,
      analytics: true,
    };
    localStorage.setItem('cookieConsent', JSON.stringify(allAccepted));
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setPreferences(allAccepted);
    setShowBanner(false);
    setShowSettings(false);
  };

  const acceptSelected = () => {
    localStorage.setItem('cookieConsent', JSON.stringify(preferences));
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setShowBanner(false);
    setShowSettings(false);
  };

  const rejectAll = () => {
    const minimal = {
      necessary: true,
      functional: false,
      analytics: false,
    };
    localStorage.setItem('cookieConsent', JSON.stringify(minimal));
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setPreferences(minimal);
    setShowBanner(false);
    setShowSettings(false);
  };

  if (!showBanner && !showSettings) return null;

  return (
    <>
      {/* Main Banner */}
      {showBanner && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <Cookie className="w-6 h-6 text-teal-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-slate-800 font-medium mb-1">
                    Vi använder cookies
                  </p>
                  <p className="text-slate-600 text-sm">
                    Vi använder cookies för att förbättra din upplevelse, analysera trafik och personalisera innehåll. 
                    Nödvändiga cookies är alltid aktiva. Läs mer i vår{' '}
                    <a href="/cookiepolicy.html" className="text-teal-600 hover:underline">
                      Cookiepolicy
                    </a>{' '}
                    och{' '}
                    <a href="/integritetspolicy.html" className="text-teal-600 hover:underline">
                      Integritetspolicy
                    </a>.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 flex-shrink-0">
                <button
                  onClick={() => setShowSettings(true)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Inställningar
                </button>
                <button
                  onClick={rejectAll}
                  className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Endast nödvändiga
                </button>
                <button
                  onClick={acceptAll}
                  className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Acceptera alla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-800">Cookie-inställningar</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-slate-600 mb-6">
                Här kan du välja vilka cookies du vill acceptera. Nödvändiga cookies kan inte stängas av eftersom de behövs för att webbplatsen ska fungera.
              </p>

              <div className="space-y-4">
                {/* Necessary Cookies */}
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-slate-800">Nödvändiga cookies</h3>
                      <p className="text-sm text-slate-600">Alltid aktiva</p>
                    </div>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={preferences.necessary}
                        disabled
                        className="w-5 h-5 accent-teal-600 cursor-not-allowed opacity-50"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">
                    Dessa cookies är nödvändiga för att webbplatsen ska fungera säkert och korrekt. De kan inte stängas av.
                  </p>
                </div>

                {/* Functional Cookies */}
                <div className="p-4 bg-white border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-slate-800">Funktionella cookies</h3>
                    </div>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={preferences.functional}
                        onChange={(e) => setPreferences(prev => ({ ...prev, functional: e.target.checked }))}
                        className="w-5 h-5 accent-teal-600 cursor-pointer"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">
                    Dessa cookies gör det möjligt för webbplatsen att komma ihåg dina val och inställningar, som språk och region.
                  </p>
                </div>

                {/* Analytics Cookies */}
                <div className="p-4 bg-white border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-slate-800">Analytiska cookies</h3>
                    </div>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={preferences.analytics}
                        onChange={(e) => setPreferences(prev => ({ ...prev, analytics: e.target.checked }))}
                        className="w-5 h-5 accent-teal-600 cursor-pointer"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">
                    Dessa cookies hjälper oss att förstå hur besökare använder webbplatsen genom att samla in anonymiserad information.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200">
                <a 
                  href="/cookiepolicy.html" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-teal-600 hover:underline text-sm"
                >
                  Läs vår fullständiga Cookiepolicy →
                </a>
              </div>

              <div className="flex flex-wrap gap-3 mt-6">
                <button
                  onClick={rejectAll}
                  className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Endast nödvändiga
                </button>
                <button
                  onClick={acceptSelected}
                  className="flex-1 px-4 py-2 text-sm font-medium text-teal-700 border border-teal-300 rounded-lg hover:bg-teal-50 transition-colors"
                >
                  Spara val
                </button>
                <button
                  onClick={acceptAll}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Acceptera alla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
