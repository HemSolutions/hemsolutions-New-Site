export interface BotResponse {
  text: string;
  suggestions?: { label: string; action: string }[];
}

export function getBotResponses(): Record<string, BotResponse> {
  return {
    default: {
      text: 'Hej! Jag är HemSolutions AI-assistent. Hur kan jag hjälpa dig idag?',
      suggestions: [
        { label: 'Boka städning', action: 'boka' },
        { label: 'Våra priser', action: 'priser' },
        { label: 'RUT-avdrag', action: 'rut' },
        { label: 'Kontakta oss', action: 'kontakt' },
      ],
    },
    boka: {
      text: 'Självklart! Jag kan hjälpa dig att boka städning. Klicka på "Boka nu" för att komma till vår bokningssida, eller välj en tjänst nedan.\n\nVåra priser med RUT-avdrag:\n• Hemstädning: 199 kr/tim\n• Fönsterputs: 89 kr/fönster\n• Kontorsstädning: 249 kr/tim\n\nNya kunder får 20% rabatt!',
      suggestions: [
        { label: '📅 Boka nu', action: 'book_now' },
        { label: 'Hemstädning', action: 'hemstadning' },
        { label: 'Fönsterputs', action: 'fonsterputs' },
        { label: 'Storstädning', action: 'storstadning' },
      ],
    },
    book_now: {
      text: 'Jag skickar dig till vår bokningssida...',
      suggestions: [],
    },
    tjanster: {
      text: 'HemSolutions erbjuder följande tjänster i Stockholm och Mälardalen:\n\n🏠 Hemstädning: 498 kr/tim (199 kr/tim efter RUT + rabatt)\n✨ Storstädning: 573 kr/tim (229 kr/tim efter RUT + rabatt)\n🪟 Fönsterputs: 223 kr/fönster (89 kr/fönster efter RUT + rabatt)\n📦 Flyttstädning: 623 kr/tim (249 kr/tim efter RUT + rabatt)\n🏢 Kontorsstädning: 623 kr/tim (249 kr/tim efter RUT + rabatt)\n🌳 Trädgårdshjälp: 498 kr/tim (199 kr/tim efter RUT + rabatt)\n\nAlla priser inkluderar nöjd-kund-garanti!',
      suggestions: [
        { label: '📅 Boka tjänst', action: 'book_now' },
        { label: 'Mer om hemstädning', action: 'hemstadning' },
        { label: 'Mer om RUT-avdrag', action: 'rut' },
      ],
    },
    priser: {
      text: 'Våra priser är konkurrenskraftiga och inkluderar alltid nöjd-kund-garanti. Med RUT-avdrag betalar du bara halva priset!\n\n💰 Prislista (efter RUT + rabatt):\n• Hemstädning: 199 kr/tim\n• Fönsterputs: 89 kr/fönster\n• Kontorsstädning: 249 kr/tim\n• Storstädning: 229 kr/tim\n• Flyttstädning: 249 kr/tim\n• Trädgårdshjälp: 199 kr/tim\n\n🎉 Nya kunder får 20% rabatt!\n\n📍 Exempel: 4 timmar hemstädning = 796 kr totalt (efter RUT + rabatt)',
      suggestions: [
        { label: '📅 Boka nu', action: 'book_now' },
        { label: 'RUT-avdrag info', action: 'rut' },
        { label: 'Ny kund-rabatt', action: 'nykund' },
      ],
    },
    rut: {
      text: 'RUT-avdraget ger dig 50% rabatt på arbetskostnaden för hushållsnära tjänster. Vi hanterar all administration åt dig – du behöver bara godkänna på din deklaration!\n\n📋 Så fungerar det:\n1. Du betalar hela beloppet till oss\n2. Vi skickar underlag till Skatteverket\n3. Du får tillbaka 50% direkt på skatten\n\n💡 Exempel på priser efter RUT:\n• Hemstädning: 498 kr/tim → 199 kr/tim\n• Fönsterputs: 223 kr/fönster → 89 kr/fönster\n• Maxbelopp: 75 000 kr per person och år\n\n🎉 Som ny kund får du ytterligare 20% rabatt!',
      suggestions: [
        { label: '📅 Boka med RUT', action: 'book_now' },
        { label: 'Våra priser', action: 'priser' },
        { label: 'Kontakta oss', action: 'kontakt' },
      ],
    },
    hjalp: {
      text: 'Jag är här för att hjälpa! Du kan fråga mig om:\n• Bokning av städtjänster\n• Priser och RUT-avdrag\n• Våra tjänster och vad som ingår\n• Kontaktuppgifter och öppettider\n• Avbokning och ombokning\n• Vår personal och kvalitet\n• Betalningsalternativ\n• Garanti och försäkring\n• Områden vi täcker\n\nVill du prata med en människa? Ring oss på 08-525 133 39.',
      suggestions: [
        { label: '📅 Boka städning', action: 'boka' },
        { label: 'Våra priser', action: 'priser' },
        { label: '📞 Ring oss', action: 'kontakt' },
      ],
    },
    hemstadning: {
      text: 'Hemstädning är vår mest populära tjänst! Vi skräddarsyr städningen efter dina behov.\n\n💰 Pris: 498 kr/tim (199 kr/tim efter RUT + rabatt)\n\n✅ Vad ingår:\n• Dammsugning och våttorkning av golv\n• Dammtorkning av ytor\n• Rengöring av kök och badrum\n• Tömning av sopkorgar\n• Bäddning av sängar (vid önskemål)\n\n📍 Exempel: 4 timmar = 796 kr totalt\n\nInga bindningstider – prova oss riskfritt!',
      suggestions: [
        { label: '📅 Boka hemstädning', action: 'book_now' },
        { label: 'Se alla priser', action: 'priser' },
        { label: 'Vad ingår?', action: 'tjanster' },
      ],
    },
    storstadning: {
      text: 'Storstädning är perfekt för en grundlig nystart! Vi rengör alla ytor, bakom möbler, och i alla hörn.\n\n💰 Pris: 573 kr/tim (229 kr/tim efter RUT + rabatt)\n\n✅ Perfekt inför:\n• Högtider och fester\n• Vårstädning\n• Inför försäljning av bostad\n• När du vill ha en ordentlig genomgång\n\nVi tar med alla rengöringsmedel och utrustning!',
      suggestions: [
        { label: '📅 Boka storstädning', action: 'book_now' },
        { label: 'Se priser', action: 'priser' },
        { label: 'Checklista', action: 'tjanster' },
      ],
    },
    fonsterputs: {
      text: 'Vår fönsterputstjänst ger dig skinande rena fönster!\n\n💰 Pris: 223 kr/fönster (89 kr/fönster efter RUT + rabatt)\n\n✅ Vad ingår:\n• Putsning av in- och utsida\n• Rengöring av karmar och fönsterbleck\n• Tillgängliga fönster upp till 3 våningar\n\n💡 Tips: Boka 10 fönsterpaket för 890 kr (efter RUT)!\n\n📍 Exempel: 10 fönster = 890 kr totalt',
      suggestions: [
        { label: '📅 Boka fönsterputs', action: 'book_now' },
        { label: 'Boka abonnemang', action: 'book_now' },
        { label: 'Se priser', action: 'priser' },
      ],
    },
    kontor: {
      text: 'Kontorsstädning för företag i Stockholm!\n\n💰 Pris: 623 kr/tim (249 kr/tim efter RUT + rabatt)\n\n✅ Fördelar:\n• Skapar en bättre arbetsmiljö\n• Minskar sjukfrånvaro\n• Professionellt intryck för kunder\n• Flexibla städtider (kvällar/helger)\n\n📞 Kontakta oss för en kostnadsfri offert!\nTelefon: 08-525 133 39',
      suggestions: [
        { label: '📞 Få offert', action: 'kontakt' },
        { label: '📅 Boka möte', action: 'kontakt' },
        { label: 'Företagsavtal', action: 'kontakt' },
      ],
    },
    kontakt: {
      text: 'Du kan nå HemSolutions på flera sätt:\n\n📞 Telefon: 08-525 133 39\n📧 E-post: info@hemsolutions.se\n📍 Adress: Sparres Väg 22, 197 37 Bro\n\n🕐 Öppettider:\n• Måndag-fredag: 08:00-17:00\n• Lördag: 09:00-14:00\n• Söndag: Stängt\n\n💻 Boka online dygnet runt på vår hemsida!\n\nVi svarar vanligtvis inom 24 timmar.',
      suggestions: [
        { label: '📅 Boka online', action: 'book_now' },
        { label: '📞 Ring nu', action: 'call' },
        { label: '✉️ Skicka e-post', action: 'email' },
      ],
    },
    call: {
      text: 'Du kan ringa oss på:\n\n📞 08-525 133 39\n\n🕐 Telefontid:\n• Måndag-fredag: 08:00-17:00\n• Lördag: 09:00-14:00\n• Söndag: Stängt\n\nVi hjälper dig gärna med din bokning!',
      suggestions: [
        { label: '📅 Boka online', action: 'book_now' },
        { label: 'Tillbaka', action: 'default' },
      ],
    },
    email: {
      text: 'Skicka e-post till oss:\n\n📧 info@hemsolutions.se\n\nVi svarar vanligtvis inom 24 timmar.\n\nFör jobbansökningar: jobb@hemsolutions.se',
      suggestions: [
        { label: '📅 Boka online', action: 'book_now' },
        { label: 'Tillbaka', action: 'default' },
      ],
    },
    oppettider: {
      text: 'Våra öppettider:\n\n📞 Telefontid:\n• Måndag-fredag: 08:00-17:00\n• Lördag: 09:00-14:00\n• Söndag: Stängt\n\n🧹 Städtjänster:\n• Måndag-lördag: 07:00-20:00\n• Söndag: Efter överenskommelse\n\n💻 Boka online dygnet runt!',
      suggestions: [
        { label: '📅 Boka online', action: 'book_now' },
        { label: '📞 Kontakta oss', action: 'kontakt' },
      ],
    },
    nykund: {
      text: 'Som ny kund hos HemSolutions får du fantastiska erbjudanden!\n\n🎉 20% rabatt på alla städtjänster!\n\nEfter RUT-avdrag + rabatt:\n• Hemstädning: Endast 199 kr/tim\n• Fönsterputs: Endast 89 kr/fönster\n• Storstädning: Endast 229 kr/tim\n• Kontorsstädning: Endast 249 kr/tim\n\n✅ Inga bindningstider\n✅ Nöjd-kund-garanti\n✅ Prova oss riskfritt!\n\n📍 Exempel: 4 timmar hemstädning = 796 kr totalt!',
      suggestions: [
        { label: '📅 Boka nu', action: 'book_now' },
        { label: 'Se alla priser', action: 'priser' },
        { label: 'Våra tjänster', action: 'tjanster' },
      ],
    },
    garanti: {
      text: 'HemSolutions lämnar alltid nöjd-kund-garanti!\n\n✅ Vad innebär det?\n• Om du inte är nöjd med städningen, kommer vi tillbaka och åtgärdar det kostnadsfritt\n• Gäller inom 24 timmar efter städning\n• Inga frågor ställdes – vi vill att du ska vara 100% nöjd\n\nDin trygghet är vår prioritet!',
      suggestions: [
        { label: '📅 Boka med garanti', action: 'book_now' },
        { label: 'Läs villkor', action: 'tjanster' },
        { label: '📞 Kontakta oss', action: 'kontakt' },
      ],
    },
    betalning: {
      text: 'Hos HemSolutions erbjuder vi flera smidiga betalningsalternativ:\n\n💳 Betalningssätt:\n• Autogiro (månadsvis)\n• Faktura (14 dagar)\n• Swish (direktbetalning)\n• Kortbetalning online\n\n📄 Fakturering:\n• Månadsfaktura för abonnemang\n• Enkelfaktura för engångsbokningar\n• RUT-avdrag hanteras automatiskt\n\nAlltid säkra betalningar!',
      suggestions: [
        { label: '📅 Boka nu', action: 'book_now' },
        { label: 'Frågor om faktura', action: 'kontakt' },
        { label: 'Autogiro', action: 'kontakt' },
      ],
    },
    avbokning: {
      text: 'Av- och ombokning hos HemSolutions är enkelt och flexibelt!\n\n📋 Regler:\n• Avboka senast 24 timmar innan – kostnadsfritt\n• Avbokning inom 24 timmar – debiteras 50%\n• Omboka när som helst i vår app eller online\n\nVi förstår att planer kan ändras – därför gör vi det enkelt för dig!',
      suggestions: [
        { label: 'Omboka', action: 'kontakt' },
        { label: 'Avboka', action: 'kontakt' },
        { label: '📞 Kundtjänst', action: 'kontakt' },
      ],
    },
    personal: {
      text: 'Vår personal är vår största styrka!\n\n👥 Om vårt team:\n• Högt kvalificerad personal med lång erfarenhet\n• Noggrant utvalda och utbildade medarbetare\n• Bakgrundskontroller för din trygghet\n• Samma städare vid abonnemang (om möjligt)\n\nVi investerar kontinuerligt i vår personal för att säkerställa högsta kvalitet!',
      suggestions: [
        { label: '📅 Boka nu', action: 'book_now' },
        { label: 'Jobba hos oss', action: 'kontakt' },
        { label: 'Läs mer om oss', action: 'tjanster' },
      ],
    },
    omrade: {
      text: 'HemSolutions verkar i Stockholm och Mälardalen!\n\n📍 Vi erbjuder tjänster i:\n• Stockholm stad\n• Solna och Sundbyberg\n• Lidingö och Nacka\n• Huddinge och Botkyrka\n• Upplands-Bro och Bro\n• Samt närliggande områden\n\nKontakta oss för att se om vi täcker ditt område!',
      suggestions: [
        { label: '📞 Kontakta oss', action: 'kontakt' },
        { label: '📅 Boka nu', action: 'book_now' },
      ],
    },
    flyttstadning: {
      text: 'Flyttstädning från HemSolutions – vi garanterar godkänd besiktning!\n\n💰 Pris: 623 kr/tim (249 kr/tim efter RUT + rabatt)\n\n✅ Vad ingår:\n• Grundlig rengöring av alla rum\n• Kök inklusive vitvaror\n• Badrum och toaletter\n• Fönsterputs (inomhus)\n• Golv och lister\n\n🛡️ Vi lämnar alltid garanti på flyttstädning!',
      suggestions: [
        { label: '📅 Boka flyttstädning', action: 'book_now' },
        { label: 'Få offert', action: 'kontakt' },
        { label: 'Vad ingår?', action: 'tjanster' },
      ],
    },
    tradgard: {
      text: 'Trädgårdshjälp från HemSolutions – skapa en vacker utemiljö!\n\n💰 Pris: 498 kr/tim (199 kr/tim efter RUT + rabatt)\n\n✅ Vad vi hjälper med:\n• Gräsklippning\n• Häckklippning\n• Ogräsbekämpning\n• Lövkrattning\n• Plantering och skötsel\n\n🌸 Säsongserbjudande: Vår- och höststädning av trädgård!',
      suggestions: [
        { label: '📅 Boka trädgårdshjälp', action: 'book_now' },
        { label: 'Säsongserbjudande', action: 'priser' },
        { label: 'Få offert', action: 'kontakt' },
      ],
    },
    miljo: {
      text: 'HemSolutions erbjuder miljövänlig städning med Svanenmärkta produkter!\n\n🌱 Vårt miljöval:\n• Svanenmärkta rengöringsmedel\n• Mikrofiberdukar som minskar kemikaliebehov\n• Biologiskt nedbrytbara produkter\n• Återanvändbara material\n\n💚 När du bokar städning kan du välja vårt miljöpaket utan extra kostnad. Bra för dig – och för planeten!',
      suggestions: [
        { label: '📅 Boka grön städning', action: 'book_now' },
        { label: 'Läs mer', action: 'tjanster' },
        { label: 'Kontakta oss', action: 'kontakt' },
      ],
    },
    abonnemang: {
      text: 'Med ett städabonnemang hos HemSolutions får du ett alltid rent hem utan att lyfta ett finger!\n\n📅 Fördelar med abonnemang:\n• Samma städare vid varje besök\n• Fast tid varje vecka/varannan vecka\n• Månadsfaktura med autogiro\n• Prioriterad bokning vid ändringar\n• 10% lojalitetsrabatt efter 6 månader\n\nVi skräddarsyr frekvensen efter dina behov!',
      suggestions: [
        { label: '📅 Boka abonnemang', action: 'book_now' },
        { label: 'Se priser', action: 'priser' },
        { label: 'Kontakta oss', action: 'kontakt' },
      ],
    },
    rekrytering: {
      text: 'Vill du jobba hos HemSolutions? Vi söker alltid duktiga medarbetare!\n\n👷 Vad vi erbjuder:\n• Konkurrenskraftig lön\n• Flexibla arbetstider\n• Utbildning och certifiering\n• Arbetskläder och utrustning\n• Trevligt arbetsklimat\n\n📧 Skicka CV och personligt brev till jobb@hemsolutions.se\n📞 Eller ring oss på 08-525 133 39 för mer information.',
      suggestions: [
        { label: 'Kontakta oss', action: 'kontakt' },
        { label: 'Om HemSolutions', action: 'tjanster' },
      ],
    },
    trygghet: {
      text: 'Din trygghet är vår högsta prioritet hos HemSolutions!\n\n🛡️ Så skapar vi trygghet:\n• All personal är noggrant utvald och bakgrundskontrollerad\n• Vi innehar ansvarsförsäkring\n• Nöjd-kund-garanti på alla tjänster\n• Samma städare vid abonnemang\n• Transparenta priser – inga dolda avgifter\n• GDPR-säker hantering av dina uppgifter\n\nLäs mer om våra villkor och försäkringar på hemsolutions.se.',
      suggestions: [
        { label: '📅 Boka tryggt', action: 'book_now' },
        { label: 'Läs villkor', action: 'tjanster' },
        { label: '📞 Kontakta oss', action: 'kontakt' },
      ],
    },
    tid: {
      text: 'Hur lång tid tar städningen? Det beror på tjänst och bostadens storlek:\n\n⏱️ Uppskattade tider:\n• Hemstädning 2-rumslägenhet: 2–3 timmar\n• Hemstädning villa 5 rum: 4–6 timmar\n• Storstädning lägenhet: 4–5 timmar\n• Fönsterputs 10 fönster: 1–2 timmar\n• Flyttstädning 3 rum: 5–7 timmar\n\nVi ger alltid en tidsuppskattning vid bokning!',
      suggestions: [
        { label: '📅 Boka nu', action: 'book_now' },
        { label: 'Få offert', action: 'kontakt' },
        { label: 'Våra priser', action: 'priser' },
      ],
    },
    semester: {
      text: 'Behöver du städning inför eller efter semestern? HemSolutions hjälper dig!\n\n✈️ Semestererbjudanden:\n• Inför semester: Storstädning + fönsterputs i paket med 15% rabatt\n• Efter semester: Kom hem till ett nystädat hem – boka inför hemkomsten\n• Sommarstädning: Trädgårdshjälp + altanrengöring\n\n📅 Boka i god tid – sommaren är vår högsäsong!',
      suggestions: [
        { label: '📅 Boka semesterstäd', action: 'book_now' },
        { label: 'Se priser', action: 'priser' },
        { label: 'Kontakta oss', action: 'kontakt' },
      ],
    },
    allergi: {
      text: 'Har du allergier? HemSolutions anpassar städningen för dig!\n\n🤧 Allergianpassad städning:\n• Svanenmärkta, parfymfria produkter\n• HEPA-filter i dammsugare för att fånga allergener\n• Extra noggrann dammtorkning\n• Ingen användning av starka kemikalier\n• Mikrofiberdukar som fångar damm effektivt\n\nMeddela oss dina allergier vid bokning så anpassar vi oss!',
      suggestions: [
        { label: '📅 Boka allergianpassad', action: 'book_now' },
        { label: 'Miljöval', action: 'miljo' },
        { label: 'Kontakta oss', action: 'kontakt' },
      ],
    },
    jul: {
      text: 'Få hemmet redo för julen med HemSolutions!\n\n🎄 Julstädning:\n• Storstädning inför julhelgen\n• Fönsterputs för extra ljusinsläpp\n• Dukning och förberedelser\n• Städning efter nyårsfesten\n\n❄️ Vintererbjudande:\nBoka julstädning senast 15 december och få 15% rabatt på storstädning!\n\n📅 Boka tidigt – december är en mycket populär månad!',
      suggestions: [
        { label: '📅 Boka julstädning', action: 'book_now' },
        { label: 'Se priser', action: 'priser' },
        { label: 'Kontakta oss', action: 'kontakt' },
      ],
    },
    ovning: {
      text: 'Vad är skillnaden mellan storstädning och hemstädning?\n\n🏠 Hemstädning (regelbunden):\n• Dammsugning och våttorkning\n• Kök och badrum\n• Tömning av sopkorgar\n• Ytdammtorkning\n• Passar veckovis eller varannan vecka\n\n✨ Storstädning (grundlig):\n• Allt i hemstädning PLUS\n• Bakom och under möbler\n• Inuti skåp och lådor (vid önskemål)\n• Fönsterbleck och lister\n• Grundlig badrumsrengöring med kalkborttagning\n• Passar 2–4 gånger per år\n\nBåda tjänsterna inkluderar nöjd-kund-garanti!',
      suggestions: [
        { label: '📅 Boka storstädning', action: 'book_now' },
        { label: '📅 Boka hemstädning', action: 'book_now' },
        { label: 'Se priser', action: 'priser' },
      ],
    },
    checklista: {
      text: 'Inför städningen – en enkel checklista från HemSolutions:\n\n📋 Förbered inför städaren kommer:\n• Plocka undan kläder och personliga föremål\n• Sätt undan värdesaker\n• Informera om särskilda önskemål eller känsliga ytor\n• Se till att städaren har tillgång till bostaden\n• Förvara husdjur i ett separat rum (om möjligt)\n\n✅ Detta gör att städaren kan fokusera på att städa – och du får bästa resultat!',
      suggestions: [
        { label: '📅 Boka städning', action: 'book_now' },
        { label: 'Läs mer', action: 'tjanster' },
        { label: 'Kontakta oss', action: 'kontakt' },
      ],
    },
  };
}

export function getResponseKey(input: string): string {
  const lower = input.toLowerCase();

  if (/\b(boka|book|tid|beställ|bestalla|reservera)\b/.test(lower)) return 'boka';
  if (/\b(pris|kostnad|vad kostar|kr|billig|dyrt|kostar det)\b/.test(lower)) return 'priser';
  if (/\b(tjänst|service|vad erbjuder|erbjuder ni|städning|städa|alternativ)\b/.test(lower)) return 'tjanster';
  if (/\b(rut|avdrag|skatte|skatteverket|reduktion)\b/.test(lower)) return 'rut';
  if (/\b(hem|hemstädning|hemma|lägenhet|villa|bostad|hus)\b/.test(lower) && !/\b(flytt|stor)\b/.test(lower)) return 'hemstadning';
  if (/\b(stor|storstädning|grundlig|genomgång|nystart|vårstädning)\b/.test(lower)) return 'storstadning';
  if (/\b(fonster|fönster|fönsterputs|puts|fönsterputsning|fönsterbleck)\b/.test(lower)) return 'fonsterputs';
  if (/\b(kontor|företag|firma|arbetsplats|lokal|butik)\b/.test(lower)) return 'kontor';
  if (/\b(kontakt|ring|telefon|mail|epost|email|adress|besök|hitta|vart)\b/.test(lower)) return 'kontakt';
  if (/\b(ring|telefonnummer|nummer|samtal)\b/.test(lower) && !/\b(öppettider|när)\b/.test(lower)) return 'call';
  if (/\b(öppet|tid|när|öppettider|stänger|öppnar|vecka|helg|kväll)\b/.test(lower)) return 'oppettider';
  if (/\b(ny|nykund|rabatt|erbjudande|kampanj|deal|första gången|prova|testa)\b/.test(lower)) return 'nykund';
  if (/\b(garanti|nöjd|återkomma|missnöjd|klaga|åtgärda|inte nöjd)\b/.test(lower)) return 'garanti';
  if (/\b(betal|faktura|swish|kort|autogiro|bankgiro|inbetalning)\b/.test(lower)) return 'betalning';
  if (/\b(avbok|ombok|ändra|flytta|ställ in|cancel|reschedule)\b/.test(lower)) return 'avbokning';
  if (/\b(personal|städare|vem|arbetare|medarbetare|jobb|anställd)\b/.test(lower)) return 'personal';
  if (/\b(område|var|täcker|stockholm|bro|solna|sundbyberg|nacka|lidingö|botkyrka|huddinge|upplands)\b/.test(lower)) return 'omrade';
  if (/\b(flytt|flytta|flyttstäd|flyttstädning|besiktning|utflytt|utflyttning)\b/.test(lower)) return 'flyttstadning';
  if (/\b(trädgård|tradgard|gräsmatta|gräsklipp|häck|trädgårdshjälp|löv|plantering)\b/.test(lower)) return 'tradgard';
  if (/\b(miljö|eko|grön|svanen|biologisk|nedbrytbar|miljövänlig|hållbar)\b/.test(lower)) return 'miljo';
  if (/\b(abonnemang|prenumeration|regelbunden|veckovis|varje vecka|månadsvis|abonemang)\b/.test(lower)) return 'abonnemang';
  if (/\b(jobba|anställning|rekrytering|cv|arbete|lediga jobb|karriär|plats)\b/.test(lower)) return 'rekrytering';
  if (/\b(trygg|säker|sakerhet|försäkr|bakgrund|nyckel|lås|stöld|inbrott)\b/.test(lower)) return 'trygghet';
  if (/\b(lång tid|hur länge|tid tar|timmar|snabb|färdig|när är ni klara)\b/.test(lower)) return 'tid';
  if (/\b(semester|sommar|jul|nyår|påsk|helg|ledig|firande|fest)\b/.test(lower)) return 'semester';
  if (/\b(allergi|allergisk|astma|parfym|kemikalie|känslig|damn|djurallergi)\b/.test(lower)) return 'allergi';
  if (/\b(jul|julafton|nyårs|nyår|advent|ljus|gran)\b/.test(lower)) return 'jul';
  if (/\b(skillnad|jämför|olika|skillnader|storstäd|hemstäd|skillnaden)\b/.test(lower)) return 'ovning';
  if (/\b(checklista|förbered|innan|inför|göra innan|plocka undan|tips inför)\b/.test(lower)) return 'checklista';
  if (/\b(hej|hallå|hi|hello|hejsan|god dag|god kväll)\b/.test(lower)) return 'default';

  return 'hjalp';
}
