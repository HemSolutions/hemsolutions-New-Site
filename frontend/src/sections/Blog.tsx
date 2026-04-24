import { useEffect, useRef, useState } from 'react';
import { Calendar, Clock, ArrowRight, User, Sparkles, Home, Leaf, Shield, X, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  authorRole: string;
  date: string;
  readTime: string;
  icon: React.ElementType;
  color: string;
  tags: string[];
}

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: '5 enkla tips för att hålla hemmet rent mellan städningarna',
    excerpt: 'Upptäck våra bästa tips för att underhålla ett skinande rent hem. Från dagliga rutiner till smarta förvaringslösningar från HemSolutions experter.',
    content: `Att hålla hemmet rent mellan städningarna behöver inte vara ett tungt projekt. Med några enkla dagliga rutiner kan du njuta av ett fräscht hem hela veckan. Här är HemSolutions 5 bästa tips:

1. **Gör sängen varje morgon**
Det tar mindre än två minuter och ger direkt ett ordnat intryck i sovrummet. En bäddad säng sätter dessutom tonen för resten av dagen.

2. **Torka av köksbänken efter varje måltid**
Köksskötsel i realtid sparar timmar av gnuggande senare. Använd en mikrofiberduk och mild rengöring för att snabbt torka av ytor.

3. **Sortera posten direkt**
Pappershögar är en av de snabbaste vägarna till ett rörigt hem. Öppna posten direkt, släng skräpet och arkivera det viktiga.

4. **Investera i förvaringslådor**
Smart förvaring är halva städningen. Använd genomskinliga lådor i badrumsskåpet, under sängen och i garderober för att hålla ordning.

5. **Gör en kvartsstädning på fredag**
Sätt en timer på 15 minuter och plocka undan det värsta inför helgen. Det gör stor skillnad för känslan i hemmet.

**Bonus från HemSolutions:** Boka ett abonnemang med regelbunden städning så slipper du stressen helt. Våra städexperter sköter det grundliga arbetet, och du behöver bara underhålla mellan besöken.`,
    category: 'Städtips',
    author: 'Maria Persson',
    authorRole: 'Städexpert på HemSolutions',
    date: '16 apr 2026',
    readTime: '4 min',
    icon: Home,
    color: 'bg-blue-100 text-blue-600',
    tags: ['städtips', 'vardagsrutiner', 'hemstädning'],
  },
  {
    id: '2',
    title: 'Så fungerar RUT-avdraget 2026 – komplett guide från HemSolutions',
    excerpt: 'Allt du behöver veta om RUT-avdraget. Hur det fungerar, vad som ingår och hur du maximerar ditt avdrag med HemSolutions.',
    content: `RUT-avdraget är en av de smartaste förmånerna för svenska hushåll. Här förklarar vi allt du behöver veta för att dra nytta av det maximalt.

**Vad är RUT-avdraget?**
RUT står för Rengöring, Underhåll och Tvätt. Det är en skattereduktion som ger dig 50% rabatt på arbetskostnaden för hushållsnära tjänster. Det innebär att du betalar halva priset för städning, trädgårdshjälp och vissa reparationer.

**Vad ingår 2026?**
• Hemstädning och storstädning
• Fönsterputs
• Flyttstädning
• Trädgårdshjälp (gräsklippning, häckklippning)
• IT-support i hemmet
• Hämtning och lämning av tvätt

**Maxbelopp 2026:**
• 75 000 kr per person och år för dig under 65 år
• 50 000 kr per person och år om du är 65 år eller äldre

**Så fungerar det hos HemSolutions:**
1. Du betalar hela beloppet till oss (första fakturan)
2. Vi skickar underlag till Skatteverket
3. Skatteverket registrerar avdraget på din deklaration
4. Du får tillbaka 50% direkt på skatten, eller som skattereduktion

**Vanliga frågor:**
- *Kan jag dela avdraget med min partner?* Ja, ni kan dela på maxbeloppet.
- *Gäller det för företag?* Nej, RUT är endast för privatpersoner. Företag kan dock dra av städkostnader i sin bokföring.
- *Måste jag göra något själv?* Med HemSolutions sköter vi all administration. Du behöver bara godkänna uppgifterna på din deklaration.

**Tips för att maximera avdraget:**
Planera dina städtjänster över hela året. Ett månadsabonnemang på hemstädning är både ekonomiskt smart och ger dig ett städat hem året runt.

Boka en kostnadsfri konsultation med HemSolutions idag – vi guidar dig genom hela processen.`,
    category: 'Ekonomi',
    author: 'Johan Lindberg',
    authorRole: 'Ekonomiansvarig på HemSolutions',
    date: '15 apr 2026',
    readTime: '6 min',
    icon: Shield,
    color: 'bg-green-100 text-green-600',
    tags: ['RUT-avdrag', 'skatt', 'ekonomi', 'hemstädning'],
  },
  {
    id: '3',
    title: 'Ekologisk städning – så väljer du miljövänliga produkter',
    excerpt: 'Lär dig mer om hållbar städning och vilka produkter som är bäst för både dig och miljön. HemSolutions guide till grön städning.',
    content: `Miljövänlig städning handlar inte bara om att välja rätt produkter – det är en helhetsfilosofi. Så här städar du grönt med HemSolutions.

**Varför ekologisk städning?**
Vanliga rengöringsmedel innehåller ofta kemikalier som kan irritera hud och luftvägar, och som påverkar vattenmiljön negativt. Genom att välja miljövänliga alternativ skapar du ett hälsosammare hem och bidrar till en renare miljö.

**Svanenmärkta produkter**
Svanen är Nordens officiella miljömärkning. Svanenmärkta städprodukter:
• Innehåller inga onödiga kemikalier
• Är biologiskt nedbrytbara
• Testas för att inte skada vattenlevande organismer
• Fungerar lika bra som konventionella produkter

**DIY-alternativ som fungerar**
• **Fönsterputs:** Blanda ättika och vatten (1:1) för skinande rena fönster
• **Avlopp:** En halv deciliter bikarbonat följt av varmt vatten håller avloppet rent
• **Kök:** Citron och bikarbonat tar bort fett och lukt på naturlig väg
• **Badrum:** Ättikalösning mot kalkavlagringar

**HemSolutions miljöval**
När du bokar städning hos oss kan du välja vårt miljöpaket. Då använder vår personal enbart Svanenmärkta och miljövänliga produkter. Ingen extra kostnad – bara ett medvetet val för dig och planeten.

**Mikrofiber är nyckeln**
En mikrofiberduk kan ersätta mängder av engångsprodukter och kemikalier. Den fångar upp 99% av bakterier med bara vatten. Vi använder professionella mikrofiberdukar i alla våra städningar.

Vill du veta mer om grön städning? Fråga vår AI-assistent eller ring oss på 08-525 133 39.`,
    category: 'Hållbarhet',
    author: 'Lisa Karlsson',
    authorRole: 'Miljöansvarig på HemSolutions',
    date: '14 apr 2026',
    readTime: '5 min',
    icon: Leaf,
    color: 'bg-emerald-100 text-emerald-600',
    tags: ['miljö', 'hållbarhet', 'ekologisk städning', 'svanen'],
  },
  {
    id: '4',
    title: 'Vårförberedelser – gör hemmet redo för sommaren',
    excerpt: 'En komplett checklista för vårstädning från HemSolutions. Från fönsterputs till trädgårdsskötsel – vi guidar dig.',
    content: `Våren är den perfekta tiden att ge hemmet en ordentlig genomgång. Efter en lång vinter behöver både inne- och utemiljön lite extra kärlek. Här är HemSolutions kompletta vårstädchecklista.

**Inomhus:**

1. **Fönsterputs**
Vinterväder sliter på fönstren. Boka en ordentlig fönsterputsning – in- och utsida – så att vårsolen kan strömma in obehindrat. Vi putsar även karmar och fönsterbleck.

2. **Storstädning**
Dags för den där grundliga städningen du skjutit upp. Bakom kylskåpet, under sängen, ovanpå garderoberna – vi tar alla gömda ytor.

3. **Gardiner och textilier**
Tvätta eller dammsug gardiner. Byt till lättare sängkläder och vädra täcken och kuddar i vårsolen.

4. **Organisera**
Våren är utmärkt för att rensa ut. Sortera kläder, skor och prylar. Det som inte använts på ett år kan med fördel skänkas bort.

**Utomhus:**

5. **Trädgårdsskötsel**
Boka trädgårdshjälp hos HemSolutions:
• Gräsklippning och kantklippning
• Häckklippning
• Lövkrattning
• Ogräsbekämpning
• Plantering av vårblommor

6. **Uterum och balkong**
Torka av möbler, tvätta dynor och förbered uteplatser för kommande säsong.

7. **Gutters och takrännor**
Rengör takrännor från löv och smuts för att undvika vattenskador.

**Säsongsdeal från HemSolutions:**
Boka vårstädning + trädgårdshjälp i paket och få 15% rabatt. Erbjudandet gäller april–maj.

Gör hemmet redo för sommaren – boka din vårstädning idag!`,
    category: 'Säsong',
    author: 'Erik Svensson',
    authorRole: 'Säsongsansvarig på HemSolutions',
    date: '13 apr 2026',
    readTime: '7 min',
    icon: Sparkles,
    color: 'bg-amber-100 text-amber-600',
    tags: ['vårstädning', 'checklista', 'trädgård', 'säsong'],
  },
];

const featuredArticle = {
  title: 'Din guide till en stressfri vardag med professionell städhjälp från HemSolutions',
  content: `Upptäck hur du kan få mer tid över till det du älskar genom att låta HemSolutions sköta städningen.

I dagens hektiska vardag är tid vårt mest värdefulla tillgång. Mellan jobb, familj, träning och sociala åtaganden är det lätt att hemmets skötsel hamnar längst ner på listan. Det är här HemSolutions kommer in i bilden.

**Fler timmar i veckan**
En genomsnittlig svensk spenderar 6–8 timmar i veckan på hushållssysslor. Genom att överlåta städningen till HemSolutions frigör du den tiden för sådant som verkligen betyder något – att leka med barnen, träna, läsa en bok eller bara vila.

**Professionell kvalitet**
Vår personal är noggrant utvald, utbildad och erfaren. Vi kommer med rätt utrustning, rätt produkter och ett systematiskt arbetssätt som ger ett resultat du sällan uppnår själv.

**Flexibilitet**
Vi anpassar oss efter ditt schema. Morgon, dag, kväll eller helg – du väljer. Vid abonnemang skickar vi samma städare vid varje besök, vilket skapar trygghet och kontinuitet.

**Kostnadseffektivt**
Med RUT-avdrag betalar du bara halva priset. När du räknar på vad din tid är värd blir professionell städning en investering snarare än en kostnad.

**Börja idag**
Boka en provstädning och upplev skillnaden. Nöjd-kund-garanti ingår alltid. Kontakta oss på 08-525 133 39 eller boka direkt på hemsolutions.se.`,
  author: 'HemSolutions Teamet',
  readTime: '8 min läsning',
};

export function Blog() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [showFeatured, setShowFeatured] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
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

  // Auto-scroll blog posts
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredPosts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeFilter]);

  const filteredPosts = activeFilter
    ? blogPosts.filter((post) => post.category === activeFilter || post.tags.includes(activeFilter.toLowerCase()))
    : blogPosts;

  const availableCategories = Array.from(new Set(blogPosts.map((p) => p.category)));
  const popularTags = ['Städtips', 'RUT-avdrag', 'Hållbarhet', 'Fönsterputs', 'Flyttstädning', 'Organisation'];

  return (
    <>
      <section
        id="blog"
        ref={sectionRef}
        className="py-20 lg:py-28 bg-slate-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div
            className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div>
              <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <Sparkles className="w-4 h-4" />
                Från HemSolutions blogg
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-800">
                Tips, guider & inspiration
              </h2>
              <p className="text-slate-600 mt-2">
                Lär dig mer om städning, organisation och hemskötsel från våra experter
              </p>
            </div>
            <button
              onClick={() => { setActiveFilter(null); window.scrollTo({ top: document.getElementById('blog')?.offsetTop || 0, behavior: 'smooth' }); }}
              className="inline-flex items-center gap-2 text-teal-600 font-semibold hover:text-teal-700 transition-colors"
            >
              {activeFilter ? 'Visa alla' : 'Se alla artiklar'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Featured Post */}
          <div
            className={`mb-8 transition-all duration-700 delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div 
              onClick={() => setShowFeatured(true)}
              className="bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow cursor-pointer"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="bg-gradient-to-br from-teal-500 to-teal-600 p-8 flex items-center">
                  <div className="text-white">
                    <Badge className="bg-white/20 text-white mb-4">Utvald artikel</Badge>
                    <h3 className="text-2xl font-bold mb-4">
                      {featuredArticle.title}
                    </h3>
                    <p className="text-teal-100 mb-6">
                      Upptäck hur du kan få mer tid över till det du älskar genom att låta HemSolutions sköta städningen.
                    </p>
                    <div className="flex items-center gap-4 text-sm text-teal-100">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {featuredArticle.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {featuredArticle.readTime}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <h4 className="font-semibold text-slate-800 mb-4">Populära ämnen</h4>
                  <div className="flex flex-wrap gap-2">
                    {popularTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={(e) => { e.stopPropagation(); setActiveFilter(tag === activeFilter ? null : tag); }}
                        className={`px-4 py-2 rounded-full text-sm transition-colors ${
                          activeFilter === tag
                            ? 'bg-teal-500 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-teal-100 hover:text-teal-700'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Blog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredPosts.map((post, index) => (
              <article
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className={`group bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-500 hover:-translate-y-1 cursor-pointer ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 100 + 200}ms` }}
              >
                <div className={`h-32 ${post.color} flex items-center justify-center`}>
                  <post.icon className="w-12 h-12" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary" className="text-xs">
                      {post.category}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {post.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Auto-rotating indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {filteredPosts.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentIndex === index ? 'w-6 bg-teal-500' : 'bg-slate-300'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Article Detail Modal */}
      {selectedPost && (
        <div 
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto"
          onClick={() => setSelectedPost(null)}
        >
          <div 
            className="bg-white rounded-2xl w-full max-w-2xl my-8 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`${selectedPost.color} p-8`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <selectedPost.icon className="w-8 h-8" />
                  <Badge className="bg-white/30 text-current">{selectedPost.category}</Badge>
                </div>
                <button 
                  onClick={() => setSelectedPost(null)}
                  className="p-2 hover:bg-black/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <h2 className="text-2xl font-bold mt-4 text-slate-900">{selectedPost.title}</h2>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              <div className="flex items-center gap-4 text-sm text-slate-500 mb-6 pb-6 border-b">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {selectedPost.author}, {selectedPost.authorRole}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {selectedPost.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {selectedPost.readTime}
                </span>
              </div>

              <div className="prose prose-slate max-w-none">
                {selectedPost.content.split('\n\n').map((paragraph, i) => {
                  if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                    return <h3 key={i} className="text-lg font-bold text-slate-800 mt-6 mb-3">{paragraph.replace(/\*\*/g, '')}</h3>;
                  }
                  if (paragraph.startsWith('• ')) {
                    const items = paragraph.split('\n').filter(l => l.trim().startsWith('•'));
                    return (
                      <ul key={i} className="list-disc pl-5 space-y-1 my-3">
                        {items.map((item, j) => (
                          <li key={j} className="text-slate-600">{item.replace('• ', '')}</li>
                        ))}
                      </ul>
                    );
                  }
                  return <p key={i} className="text-slate-600 leading-relaxed mb-4">{paragraph.replace(/\*\*/g, '')}</p>;
                })}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t">
                {selectedPost.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs">
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Featured Article Modal */}
      {showFeatured && (
        <div 
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto"
          onClick={() => setShowFeatured(false)}
        >
          <div 
            className="bg-white rounded-2xl w-full max-w-2xl my-8 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-br from-teal-500 to-teal-600 p-8">
              <div className="flex items-start justify-between">
                <Badge className="bg-white/20 text-white">Utvald artikel</Badge>
                <button 
                  onClick={() => setShowFeatured(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
              <h2 className="text-2xl font-bold mt-4 text-white">{featuredArticle.title}</h2>
            </div>
            <div className="p-8">
              <div className="flex items-center gap-4 text-sm text-slate-500 mb-6 pb-6 border-b">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {featuredArticle.author}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {featuredArticle.readTime}
                </span>
              </div>
              <div className="prose prose-slate max-w-none">
                {featuredArticle.content.split('\n\n').map((paragraph, i) => {
                  if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                    return <h3 key={i} className="text-lg font-bold text-slate-800 mt-6 mb-3">{paragraph.replace(/\*\*/g, '')}</h3>;
                  }
                  if (paragraph.startsWith('• ')) {
                    const items = paragraph.split('\n').filter(l => l.trim().startsWith('•'));
                    return (
                      <ul key={i} className="list-disc pl-5 space-y-1 my-3">
                        {items.map((item, j) => (
                          <li key={j} className="text-slate-600">{item.replace('• ', '')}</li>
                        ))}
                      </ul>
                    );
                  }
                  return <p key={i} className="text-slate-600 leading-relaxed mb-4">{paragraph.replace(/\*\*/g, '')}</p>;
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
