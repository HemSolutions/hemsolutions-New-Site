import { useEffect, useRef, useState } from 'react';
import { Shield, Settings, Zap, CheckCircle } from 'lucide-react';

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  benefits: string[];
}

const features: Feature[] = [
  {
    icon: Shield,
    title: 'Tryggt',
    description: 'Din trygghet är vår högsta prioritet. All vår personal är noggrant utvald, bakgrundskontrollerad och försäkrad. Vi lämnar alltid nöjd-kund-garanti på allt arbete.',
    benefits: [
      'Bakgrundskontrollerad personal',
      'Ansvarsförsäkring ingår',
      'Nöjd-kund-garanti',
      'Löpande utbildning',
    ],
  },
  {
    icon: Settings,
    title: 'Flexibelt',
    description: 'Vi anpassar oss efter dina behov och önskemål. Välj mellan engångsbokningar eller abonnemang. Ändra eller avboka enkelt utan extra kostnad.',
    benefits: [
      'Skräddarsydda lösningar',
      'Enkel av- och ombokning',
      'Ingen bindningstid',
      'Valfri städfrekvens',
    ],
  },
  {
    icon: Zap,
    title: 'Enkelt',
    description: 'Boka städning på under 2 minuter. Vår AI-assistent hjälper dig dygnet runt. Betala smidigt med autogiro och få påminnelser via SMS.',
    benefits: [
      'Boka online dygnet runt',
      'AI-assistent tillgänglig 24/7',
      'Automatisk betalning',
      'Påminnelser via SMS',
    ],
  },
];

export function TrustFeatures() {
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
      id="trust"
      ref={sectionRef}
      className="py-20 lg:py-28 bg-slate-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 mb-6">
            Mer än bara städning
          </h2>
          <p className="text-lg text-slate-600">
            Vi tror på att skapa en upplevelse som överträffar dina förväntningar. 
            Det är därför våra kunder väljer att stanna hos HemSolutions.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`relative bg-white rounded-2xl p-8 shadow-card transition-all duration-500 hover:shadow-card-hover ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 150 + 200}ms` }}
            >
              {/* Icon */}
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 animate-float">
                <feature.icon className="w-8 h-8 text-white" />
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-slate-800 mb-4">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-slate-600 leading-relaxed mb-6">
                {feature.description}
              </p>

              {/* Benefits List */}
              <ul className="space-y-3">
                {feature.benefits.map((benefit, benefitIndex) => (
                  <li
                    key={benefitIndex}
                    className="flex items-center gap-3 text-sm text-slate-700"
                  >
                    <CheckCircle className="w-5 h-5 text-teal-500 flex-shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
