import { useEffect, useRef, useState } from 'react';
import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    question: 'Vad kostar hemstädning hos HemSolutions?',
    answer: 'Vår hemstädning kostar 498 kr/timme. Med RUT-avdrag betalar du bara 249 kr/timme. Som ny kund får du ytterligare 20% rabatt, vilket innebär att du betalar endast 199 kr/timme. Alla priser inkluderar nöjd-kund-garanti.',
    category: 'Priser'
  },
  {
    question: 'Hur fungerar RUT-avdraget?',
    answer: 'RUT-avdraget ger dig 50% rabatt på arbetskostnaden för hushållsnära tjänster. Hos HemSolutions hanterar vi all administration åt dig – du behöver bara godkänna uppgifterna på din deklaration. Maxbeloppet är 75 000 kr per person och år.',
    category: 'RUT-avdrag'
  },
  {
    question: 'Vilka områden täcker ni?',
    answer: 'HemSolutions verkar i Stockholm och Mälardalen, inklusive Stockholm stad, Solna, Sundbyberg, Lidingö, Nacka, Huddinge, Botkyrka, Upplands-Bro, Bro och närliggande områden. Ange ditt postnummer på vår startsida för att se om vi täcker ditt område.',
    category: 'Områden'
  },
  {
    question: 'Vad ingår i en hemstädning?',
    answer: 'Vår hemstädning inkluderar dammsugning och våttorkning av golv, dammtorkning av ytor, rengöring av kök och badrum, tömning av sopkorgar och bäddning av sängar (vid önskemål). Vi skräddarsyr städningen efter dina behov och önskemål.',
    category: 'Tjänster'
  },
  {
    question: 'Behöver jag vara hemma under städningen?',
    answer: 'Nej, du behöver inte vara hemma. Många av våra kunder lämnar nyckeln i ett kodlås, brevlåda eller via en nyckelbox. Vi har ansvarsförsäkring och noggrant utvald personal, så du kan känna dig trygg. Vid första städningen rekommenderar vi att du är hemma för att gå igenom dina önskemål.',
    category: 'Bokning'
  },
  {
    question: 'Hur bokar jag en städning?',
    answer: 'Du kan boka städning på flera sätt: via vår webbplats (boka online dygnet runt), genom att ringa oss på 08-525 133 39, eller via e-post till info@hemsolutions.se. Du får en bokningsbekräftelse direkt och påminnelser via SMS och e-post.',
    category: 'Bokning'
  },
  {
    question: 'Vad är nöjd-kund-garantin?',
    answer: 'HemSolutions lämnar alltid nöjd-kund-garanti. Om du inte är nöjd med städningen ska du meddela oss inom 24 timmar efter utfört arbete. Vi kommer då tillbaka kostnadsfritt och åtgärdar det du inte är nöjd med. Inga frågor ställdes – vi vill att du ska vara 100% nöjd.',
    category: 'Garanti'
  },
  {
    question: 'Hur fungerar avbokning och ombokning?',
    answer: 'Avbokning senast 24 timmar innan bokad tid är kostnadsfri. Avbokning inom 24 timmar debiteras med 50% av tjänstens pris. Ombokning kan göras kostnadsfritt senast 24 timmar innan. För abonnemang krävs skriftlig uppsägning med 30 dagars varsel.',
    category: 'Bokning'
  },
  {
    question: 'Tar ni med rengöringsmedel och utrustning?',
    answer: 'Ja, vår personal tar med alla nödvändiga rengöringsmedel och utrustning. Om du föredrar att vi använder specifika produkter (t.ex. vid allergier) kan du meddela oss detta i förväg. Vi erbjuder även ekologiska och miljövänliga alternativ.',
    category: 'Tjänster'
  },
  {
    question: 'Kan jag få samma städare varje gång?',
    answer: 'Ja, vid abonnemangsfstädning strävar vi efter att skicka samma städare vid varje besök. Det skapar kontinuitet och gör att städaren lär känna ditt hem och dina önskemål. Vid sjukdom eller semester ersätter vi med en annan noggrant utvald medarbetare.',
    category: 'Personal'
  },
  {
    question: 'Erbjuder ni städning för företag?',
    answer: 'Ja, vi erbjuder kontorsstädning för företag i Stockholm och Mälardalen. Priset är 623 kr/timme (249 kr/timme efter RUT-avdrag för mindre kontor). Vi erbjuder flexibla städtider, inklusive kvällar och helger, för att inte störa er verksamhet. Kontakta oss för en kostnadsfri offert.',
    category: 'Företag'
  },
  {
    question: 'Hur betalar jag för tjänsterna?',
    answer: 'Vi erbjuder flera betalningsalternativ: faktura (14 dagars betalningstid), autogiro (månadsvis), Swish (direktbetalning) och kortbetalning online. Vid abonnemang skickar vi en månadsfaktura. RUT-avdrag hanteras automatiskt och redovisas på din faktura.',
    category: 'Betalning'
  },
  {
    question: 'Vad är skillnaden mellan hemstädning och storstädning?',
    answer: 'Hemstädning är regelbunden städning av ytor, golv, kök och badrum – perfekt för veckovis eller varannanveckas underhåll. Storstädning är en grundlig genomgång av hela hemmet, inklusive bakom möbler, inuti skåp, fönsterbleck och lister. Storstädning rekommenderas 2–4 gånger per år.',
    category: 'Tjänster'
  },
  {
    question: 'Hur lång tid tar en flyttstädning?',
    answer: 'Tiden för flyttstädning beror på bostadens storlek. En lägenhet på 2 rum och kök tar vanligtvis 4–6 timmar, medan en villa på 5–6 rum kan ta 8–12 timmar. Vi ger alltid en tidsuppskattning vid bokning. Flyttstädningen inkluderar garanti – vi garanterar att besiktningen godkänns.',
    category: 'Tjänster'
  },
  {
    question: 'Är er personal försäkrad?',
    answer: 'Ja, HemSolutions innehar ansvarsförsäkring och vår personal är försäkrad under arbetet. Vid eventuell skada på egendom ska du meddela oss inom 24 timmar. Vi ersätter skador som orsakats av vår personal, med undantag för normalt slitage och värdesaker som kontanter eller smycken.',
    category: 'Trygghet'
  },
];

const categories = ['Alla', ...Array.from(new Set(faqData.map(f => f.category)))];

export function FAQ() {
  const [isVisible, setIsVisible] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState('Alla');
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const filteredFAQs = activeCategory === 'Alla' 
    ? faqData 
    : faqData.filter(f => f.category === activeCategory);

  return (
    <section
      id="faq"
      ref={sectionRef}
      className="py-20 lg:py-28 bg-slate-50"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          className={`text-center mb-12 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <HelpCircle className="w-4 h-4" />
            Vanliga frågor
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">
            Frågor och svar
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Här har vi samlat de vanligaste frågorna om HemSolutions tjänster. 
            Hittar du inte svaret? Kontakta oss så hjälper vi dig.
          </p>
        </div>

        {/* Category Filters */}
        <div
          className={`flex flex-wrap justify-center gap-2 mb-10 transition-all duration-700 delay-100 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setOpenIndex(null); }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-teal-500 text-white'
                  : 'bg-white text-slate-600 hover:bg-teal-50 hover:text-teal-600 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div
          className={`space-y-3 transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {filteredFAQs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors"
              >
                <span className="font-semibold text-slate-800 pr-4">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-teal-500 flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-5 pb-5 text-slate-600 leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div
          className={`mt-12 text-center transition-all duration-700 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
            <MessageCircle className="w-10 h-10 text-teal-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              Har du fler frågor?
            </h3>
            <p className="text-slate-600 mb-4">
              Vårt team finns här för att hjälpa dig. Ring oss på{' '}
              <a href="tel:081234567" className="text-teal-600 font-medium">08-525 133 39</a>{' '}
              eller skicka e-post till{' '}
              <a href="mailto:info@hemsolutions.se" className="text-teal-600 font-medium">info@hemsolutions.se</a>.
            </p>
            <p className="text-sm text-slate-500">
              Öppettider: Måndag–fredag 08:00–17:00, Lördag 09:00–14:00
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
