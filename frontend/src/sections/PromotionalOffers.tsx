import { useEffect, useRef, useState } from 'react';
import { Sparkles, Percent, Gift, Clock, ArrowRight, Check, Zap, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PromotionalOffersProps {
  onBookNow?: () => void;
}

interface Offer {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  discount: string;
  originalPrice: string;
  finalPrice: string;
  rutPrice: string;
  badge: string;
  badgeColor: string;
  features: string[];
  validUntil: string;
  popular?: boolean;
}

const offers: Offer[] = [
  {
    id: '1',
    title: 'Prova-på Städning',
    subtitle: 'En gång för nya kunder',
    description: 'Upplev skillnaden med professionell städning från HemSolutions. Perfekt för dig som vill testa våra tjänster en gång.',
    discount: '20%',
    originalPrice: '498 kr/tim',
    finalPrice: '199 kr/tim',
    rutPrice: '199 kr/tim',
    badge: 'Mest populär',
    badgeColor: 'bg-amber-400',
    features: [
      'Efter RUT + rabatt: 199 kr/tim',
      'Gäller endast första städningen',
      'Inga bindningstider',
      'Nöjd-kund-garanti',
    ],
    validUntil: 'Löpande erbjudande',
    popular: true,
  },
  {
    id: '2',
    title: 'Veckostädning',
    subtitle: 'Regelbunden städning',
    description: 'Boka veckovis städning och få ett konstant rent hem. Efter 3 månader justeras priset till ordinarie nivå.',
    discount: '15%',
    originalPrice: '498 kr/tim',
    finalPrice: '199 kr/tim',
    rutPrice: '199 kr/tim',
    badge: 'Spara 3 000 kr/år',
    badgeColor: 'bg-green-500',
    features: [
      'Första 3 mån: 199 kr/tim (efter RUT)',
      'Därefter: 300 kr/tim (efter RUT)',
      'Samma städare varje gång',
      'Prioriterad bokning',
    ],
    validUntil: 'Löpande erbjudande',
  },
  {
    id: '3',
    title: 'Fönsterputs Paket',
    subtitle: '10 fönster',
    description: 'Boka fönsterputs för hela hemmet och få ett specialpris. Skinande rena fönster in- och utvändigt.',
    discount: '25%',
    originalPrice: '1 780 kr',
    finalPrice: '890 kr',
    rutPrice: '890 kr',
    badge: 'Bästa pris',
    badgeColor: 'bg-teal-500',
    features: [
      'Efter RUT + rabatt: 890 kr',
      'In- och utsida',
      'Karmar och bleck ingår',
      'Boka nu – betala vid städning',
    ],
    validUntil: 'Löpande erbjudande',
  },
];

const stats = [
  { value: '500+', label: 'Nöjda kunder' },
  { value: '4.9', label: 'Kundbetyg' },
  { value: '25+', label: 'Medarbetare' },
  { value: '100%', label: 'Nöjd-kund-garanti' },
];

export function PromotionalOffers({ onBookNow }: PromotionalOffersProps) {
  const [isVisible, setIsVisible] = useState(false);
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

  return (
    <section
      ref={sectionRef}
      className="py-20 lg:py-28 bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 relative overflow-hidden"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-400/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div
          className={`text-center mb-16 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4" />
            Aktuella erbjudanden
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Spara pengar på städning
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Ta del av våra exklusiva erbjudanden från HemSolutions. Med RUT-avdrag betalar du bara halva priset!
          </p>
        </div>

        {/* Stats Bar */}
        <div
          className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 transition-all duration-700 delay-100 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center"
            >
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-slate-300">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {offers.map((offer, index) => (
            <div
              key={offer.id}
              className={`relative bg-white rounded-2xl overflow-hidden transition-all duration-500 hover:scale-105 ${
                offer.popular ? 'ring-4 ring-amber-400' : ''
              } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: `${index * 150 + 200}ms` }}
            >
              {offer.popular && (
                <div className="absolute top-0 right-0 bg-amber-400 text-slate-900 text-xs font-bold px-4 py-1 rounded-bl-xl">
                  MEST POPULÄR
                </div>
              )}

              <div className={`${offer.badgeColor} p-6`}>
                <div className="flex items-center justify-between">
                  <Badge className="bg-white/90 text-slate-800">{offer.badge}</Badge>
                  <div className="flex items-center gap-1 text-white">
                    <Percent className="w-4 h-4" />
                    <span className="font-bold">{offer.discount} rabatt</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mt-4">{offer.title}</h3>
                <p className="text-white/80">{offer.subtitle}</p>
              </div>

              <div className="p-6">
                <p className="text-slate-600 mb-6">{offer.description}</p>

                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl font-bold text-teal-600">{offer.finalPrice}</span>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-slate-400 line-through text-sm">{offer.originalPrice}</span>
                  <span className="text-xs text-green-600 font-medium">efter RUT-avdrag</span>
                </div>

                <ul className="space-y-3 mb-6">
                  {offer.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                  <Clock className="w-3 h-3" />
                  Giltig till: {offer.validUntil}
                </div>

                <Button
                  onClick={onBookNow}
                  className={`w-full ${
                    offer.popular
                      ? 'bg-amber-400 hover:bg-amber-500 text-slate-900'
                      : 'bg-teal-500 hover:bg-teal-600 text-white'
                  }`}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Boka nu
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div
          className={`mt-16 flex flex-wrap justify-center gap-6 transition-all duration-700 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {[
            { icon: Check, text: 'Nöjd-kund-garanti' },
            { icon: Star, text: '4.9/5 kundbetyg' },
            { icon: Gift, text: 'RUT-avdrag 50%' },
            { icon: Zap, text: 'Snabb bokning' },
          ].map((badge, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full"
            >
              <badge.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{badge.text}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          className={`mt-12 text-center transition-all duration-700 delay-600 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-slate-300 mb-4">
            Har du frågor om våra erbjudanden? Kontakta oss så hjälper vi dig!
          </p>
          <Button
            variant="outline"
            size="lg"
            className="border-white text-white hover:bg-white hover:text-slate-900"
          >
            Kontakta oss
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
}
