import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, Cookie, Settings, Info } from 'lucide-react';

export function Cookiepolicy() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <button 
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('Tillbaka', 'Back')}
        </button>

        <div className="bg-white rounded-xl shadow-sm p-8 md:p-12">
          <div className="flex items-center gap-3 mb-8">
            <Cookie className="w-8 h-8 text-teal-600" />
            <h1 className="text-3xl font-bold text-slate-800">Cookiepolicy</h1>
          </div>

          <div className="space-y-8 text-slate-700">
            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">Vad är cookies?</h2>
              <p className="leading-relaxed">
                Cookies är små textfiler som sparas på din dator eller mobila enhet när du besöker 
                en webbplats. De används för att webbplatsen ska fungera korrekt, förbättra 
                användarupplevelsen och samla in statistik.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">Vilka cookies använder vi?</h2>
              
              <div className="space-y-4 mt-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h3 className="font-semibold text-slate-800 mb-2">Nödvändiga cookies</h3>
                  <p className="text-sm leading-relaxed">
                    Dessa cookies är nödvändiga för att webbplatsen ska fungera säkert och korrekt. 
                    De möjliggör grundläggande funktioner som sidnavigering, inloggning och 
                    bokning. Dessa cookies kan inte stängas av.
                  </p>
                  <p className="text-sm text-slate-500 mt-2">
                    Exempel: session-cookies, CSRF-skydd, cookie-samtyckespopup.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg">
                  <h3 className="font-semibold text-slate-800 mb-2">Funktionella cookies</h3>
                  <p className="text-sm leading-relaxed">
                    Dessa cookies gör det möjligt för webbplatsen att komma ihåg dina val och 
                    inställningar, som språk, region och tidigare valda tjänster. De förbättrar 
                    din upplevelse genom att göra webbplatsen mer personlig.
                  </p>
                  <p className="text-sm text-slate-500 mt-2">
                    Exempel: språkinställning, tidigare valda tjänster, användarpreferenser.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg">
                  <h3 className="font-semibold text-slate-800 mb-2">Analytiska cookies</h3>
                  <p className="text-sm leading-relaxed">
                    Dessa cookies hjälper oss att förstå hur besökare använder webbplatsen genom 
                    att samla in anonymiserad information. Vi använder detta för att förbättra 
                    webbplatsens prestanda och användbarhet.
                  </p>
                  <p className="text-sm text-slate-500 mt-2">
                    Exempel: Google Analytics, besöksstatistik, sidvisningar, trafikkällor.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">Hur hanterar du cookies?</h2>
              <p className="leading-relaxed mb-2">
                Du kan när som helst ändra dina cookie-inställningar via länken "Cookie-inställningar" 
                i sidfoten. Du kan också stänga av cookies i din webbläsare, men det kan påverka 
                webbplatsens funktionalitet.
              </p>
              <p className="leading-relaxed">
                I de flesta webbläsare kan du hantera cookies under Inställningar &gt; Sekretess &gt; Cookies. 
                Kontakta oss om du behöver hjälp med detta.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">Tredjepartscookies</h2>
              <p className="leading-relaxed">
                Vi kan använda tredjepartstjänster som Google Analytics för att samla in anonymiserad 
                statistik. Dessa tjänster kan placera egna cookies. Vi delar inte din personliga 
                information med dessa tjänster.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">Kontakt</h2>
              <p className="leading-relaxed">
                Vid frågor om vår cookiepolicy, kontakta oss på info@hemsolutions.se.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-200 text-sm text-slate-500">
            <p>HemSolutions Sverige AB | Org.nr: 559574-8236 | Sparres Väg 22, 197 37 Bro</p>
            <p>Senast uppdaterad: {new Date().toLocaleDateString('sv-SE')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
