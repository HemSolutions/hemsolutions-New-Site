import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, FileText, Shield, Scale } from 'lucide-react';

export function AllmannaVillkor() {
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
            <FileText className="w-8 h-8 text-teal-600" />
            <h1 className="text-3xl font-bold text-slate-800">Allmänna villkor</h1>
          </div>

          <div className="space-y-8 text-slate-700">
            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">1. Om HemSolutions Sverige AB</h2>
              <p className="leading-relaxed">
                HemSolutions Sverige AB, org.nr 559574-8236, med adress Sparres Väg 22, 197 37 Bro, 
                tillhandahåller städ- och hushållstjänster i Stockholm och Mälardalen. 
                Dessa allmänna villkor gäller för alla avtal om tjänster som tillhandahålls av HemSolutions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">2. Tjänster och priser</h2>
              <p className="leading-relaxed mb-2">
                HemSolutions erbjuder följande tjänster: hemstädning, storstädning, flyttstädning, 
                fönsterputs, kontorsstädning och trädgårdshjälp. Aktuella priser anges på vår webbplats 
                och i bokningsbekräftelsen. Priserna anges i svenska kronor (SEK) inklusive moms 
                om inte annat anges.
              </p>
              <p className="leading-relaxed">
                RUT-avdrag tillämpas i enlighet med gällande skatteregler. Kunden ansvarar för att 
                uppfylla kraven för RUT-avdrag och att uppgifterna är korrekta.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">3. Bokning och avbokning</h2>
              <p className="leading-relaxed mb-2">
                Bokning kan göras via vår webbplats, per telefon eller e-post. Bokningsbekräftelse 
                skickas via e-post och SMS. Avbokning senast 24 timmar innan bokad tid är kostnadsfri. 
                Avbokning inom 24 timmar debiteras med 50% av tjänstens pris.
              </p>
              <p className="leading-relaxed">
                För abonnemang krävs skriftlig uppsägning med 30 dagars varsel. 
                HemSolutions förbehåller sig rätten att stänga av abonnemang vid utebliven betalning.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">4. Utförande och nöjd-kund-garanti</h2>
              <p className="leading-relaxed">
                HemSolutions lämnar nöjd-kund-garanti på alla städtjänster. Om kunden inte är nöjd 
                med städningen ska detta meddelas inom 24 timmar efter utfört arbete. 
                HemSolutions kommer då tillbaka kostnadsfritt och åtgärdar det kunden inte är nöjd med.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">5. Betalning</h2>
              <p className="leading-relaxed">
                Betalning sker via faktura, kortbetalning eller Swish enligt överenskommelse. 
                Fakturor ska betalas inom 14 dagar från fakturadatum. Vid försenad betalning utgår 
                påminnelseavgift och dröjsmålsränta enligt räntelagen.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">6. Ansvar och försäkring</h2>
              <p className="leading-relaxed">
                HemSolutions innehar ansvarsförsäkring och personalen är noggrant utvald och utbildad. 
                Vid skada som orsakats av HemSolutions personal ersätts skadan via vår försäkring. 
                Kunden ansvarar för att värdeföremål och känslig utrustning förvaras säkert innan 
                städningen påbörjas.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">7. Personuppgifter</h2>
              <p className="leading-relaxed">
                HemSolutions behandlar personuppgifter i enlighet med GDPR. Läs mer i vår 
                Integritetspolicy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">8. Ändring av villkor</h2>
              <p className="leading-relaxed">
                HemSolutions förbehåller sig rätten att ändra dessa villkor. Ändringar meddelas 
                via e-post och på vår webbplats minst 30 dagar innan de träder i kraft.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">9. Kontakt</h2>
              <p className="leading-relaxed">
                Vid frågor om villkoren, kontakta oss på info@hemsolutions.se eller 08-525 133 39.
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
