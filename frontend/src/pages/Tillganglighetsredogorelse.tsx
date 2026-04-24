import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, Accessibility, CheckCircle, AlertCircle } from 'lucide-react';

export function Tillganglighetsredogorelse() {
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
            <Accessibility className="w-8 h-8 text-teal-600" />
            <h1 className="text-3xl font-bold text-slate-800">Tillgänglighetsredogörelse</h1>
          </div>

          <div className="space-y-8 text-slate-700">
            <section>
              <p className="leading-relaxed mb-4">
                HemSolutions Sverige AB står bakom denna webbplats. Vi vill att så många som möjligt 
                ska kunna använda vår webbplats. Detta dokument beskriver hur hemsolutions.se 
                uppfyller lagen om tillgänglighet till digital offentlig service, eventuella 
                kända tillgänglighetsproblem och hur du kan rapportera brister till oss.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">Tillgänglighetsstatus</h2>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium">Denna webbplats är delvis förenlig med lagen om tillgänglighet till digital offentlig service.</span>
              </div>
              <p className="leading-relaxed">
                Vi arbetar kontinuerligt med att förbättra tillgängligheten och följer 
                Web Content Accessibility Guidelines (WCAG) 2.1 nivå AA så långt det är möjligt.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">Vad vi gör för tillgänglighet</h2>
              <ul className="list-disc list-inside space-y-2 leading-relaxed">
                <li>Webbplatsen är navigerbar med tangentbord</li>
                <li>Alla bilder har alternativ text (alt-text)</li>
                <li>Kontraster uppfyller WCAG 2.1 AA-krav</li>
                <li>Formulär har tydliga etiketter och felmeddelanden</li>
                <li>Textstorlek kan ändras i webbläsaren utan att innehåll försvinner</li>
                <li>Vi använder semantisk HTML för bättre skärmläsarstöd</li>
                <li>Webbsidans struktur är logisk och konsekvent</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">Kända tillgänglighetsproblem</h2>
              <div className="flex items-start gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="leading-relaxed">
                  Vissa PDF-dokument (fakturor, kvitton) kan vara svåra att läsa med skärmläsare. 
                  Vi arbetar med att förbättra detta.
                </p>
              </div>
              <p className="leading-relaxed">
                Om du upptäcker andra problem som inte finns med i listan ovan, 
                kontakta oss gärna så att vi kan åtgärda dem.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">Så här använder du tillgänglighetsfunktioner</h2>
              <div className="space-y-3">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h3 className="font-semibold text-slate-800 mb-1">Skärmläsare</h3>
                  <p className="text-sm leading-relaxed">
                    Webbplatsen är kompatibel med de vanligaste skärmläsarna (NVDA, JAWS, VoiceOver). 
                    Navigering fungerar med tangentbord och skärmläsare kan läsa upp innehållet.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h3 className="font-semibold text-slate-800 mb-1">Tangentbordsnavigering</h3>
                  <p className="text-sm leading-relaxed">
                    Du kan navigera på webbplatsen med Tab-tangenten. Tryck Enter för att aktivera 
                    länkar och knappar. Använd Esc för att stänga popup-fönster och modal-dialoger.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h3 className="font-semibold text-slate-800 mb-1">Textstorlek och zoom</h3>
                  <p className="text-sm leading-relaxed">
                    Du kan zooma in och ut med Ctrl/Cmd + +/- eller Ctrl/Cmd + scroll. 
                    Webbplatsen fungerar vid upp till 200% zoom.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">Rapportera tillgänglighetsproblem</h2>
              <p className="leading-relaxed mb-2">
                Om du upptäcker problem som inte finns beskrivna på denna sida, eller om du anser 
                att vi inte följer lagen om tillgänglighet till digital offentlig service, 
                kontakta oss:
              </p>
              <ul className="list-disc list-inside space-y-1 leading-relaxed">
                <li>E-post: info@hemsolutions.se</li>
                <li>Telefon: 08-525 133 39</li>
                <li>Post: HemSolutions Sverige AB, Sparres Väg 22, 197 37 Bro</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">Tillsynsmyndighet</h2>
              <p className="leading-relaxed">
                Myndigheten för digital förvaltning (Digg) är ansvarig för tillsyn över lagen om 
                tillgänglighet till digital offentlig service. Om du inte är nöjd med hur vi 
                hanterar dina synpunkter kan du kontakta Digg.
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
