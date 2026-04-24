import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, Shield, Lock, Eye, Database, Share2, Cookie } from 'lucide-react';

export function Integritetspolicy() {
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
            <Shield className="w-8 h-8 text-teal-600" />
            <h1 className="text-3xl font-bold text-slate-800">Integritetspolicy</h1>
          </div>

          <div className="space-y-8 text-slate-700">
            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">1. Vem är vi?</h2>
              <p className="leading-relaxed">
                HemSolutions Sverige AB, org.nr 559574-8236, Sparres Väg 22, 197 37 Bro, 
                är personuppgiftsansvarig för behandlingen av dina personuppgifter. 
                Vi tar din integritet på största allvar och hanterar alla personuppgifter 
                i enlighet med EU:s dataskyddsförordning (GDPR).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">2. Vilka uppgifter samlar vi in?</h2>
              <p className="leading-relaxed mb-2">Vi samlar in följande personuppgifter:</p>
              <ul className="list-disc list-inside space-y-1 leading-relaxed">
                <li>Namn, adress, telefonnummer och e-postadress</li>
                <li>Postnummer och bostadsort</li>
                <li>Personnummer (för RUT-avdrag och fakturering)</li>
                <li>Betalningsuppgifter (vid kortbetalning eller Swish)</li>
                <li>Bokningshistorik och preferenser</li>
                <li>IP-adress och webbläsarinformation (via cookies)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">3. Varför samlar vi in uppgifter?</h2>
              <p className="leading-relaxed mb-2">Vi behandlar dina personuppgifter för följande ändamål:</p>
              <ul className="list-disc list-inside space-y-1 leading-relaxed">
                <li>Att tillhandahålla och administrera våra tjänster</li>
                <li>Att skicka bokningsbekräftelser och påminnelser</li>
                <li>Att hantera betalningar och fakturering (inklusive RUT-avdrag)</li>
                <li>Att kommunicera med dig angående din bokning</li>
                <li>Att förbättra våra tjänster och webbplats</li>
                <li>Att uppfylla lagstadgade krav</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">4. Rättslig grund</h2>
              <p className="leading-relaxed">
                Behandlingen grundar sig på avtal (när du bokar en tjänst), rättslig förpliktelse 
                (bokföring och skatteregler), och samtycke (marknadsföring och cookies).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">5. Hur länge sparar vi uppgifter?</h2>
              <p className="leading-relaxed">
                Vi sparar dina personuppgifter så länge som det är nödvändigt för ändamålet 
                med behandlingen. Bokningsuppgifter sparas i upp till 7 år enligt bokföringslagen. 
                Du kan när som helst begära radering av dina uppgifter (med undantag för vad lagen kräver).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">6. Delning av uppgifter</h2>
              <p className="leading-relaxed">
                Vi delar inte dina personuppgifter med tredje part för marknadsföringsändamål. 
                Uppgifter kan delas med betalningsleverantörer (Stripe, Swish), bokföringsleverantörer 
                och myndigheter vid lagstadgade krav. Alla leverantörer är noggrant utvalda och 
                uppfyller GDPR-kraven.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">7. Dina rättigheter</h2>
              <p className="leading-relaxed mb-2">Du har följande rättigheter enligt GDPR:</p>
              <ul className="list-disc list-inside space-y-1 leading-relaxed">
                <li>Rätt till tillgång (få veta vilka uppgifter vi har om dig)</li>
                <li>Rätt till rättelse (ä felaktiga uppgifter)</li>
                <li>Rätt till radering ("rätten att bli glömd")</li>
                <li>Rätt till begränsning av behandling</li>
                <li>Rätt till dataportabilitet</li>
                <li>Rätt att invända mot behandling</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">8. Cookies</h2>
              <p className="leading-relaxed">
                Vi använder cookies för att förbättra din upplevelse. Läs mer i vår Cookiepolicy. 
                Du kan när som helst ändra dina cookie-inställningar via länken i sidfoten.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">9. Kontakt</h2>
              <p className="leading-relaxed">
                Vid frågor om vår integritetspolicy eller för att utöva dina rättigheter, 
                kontakta oss på info@hemsolutions.se eller skriv till: 
                HemSolutions Sverige AB, Sparres Väg 22, 197 37 Bro.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">10. Ändringar</h2>
              <p className="leading-relaxed">
                Vi kan komma att uppdatera denna policy. Ändringar meddelas via e-post och på vår webbplats. 
                Senaste versionen finns alltid tillgänglig på www.hemsolutions.se.
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
