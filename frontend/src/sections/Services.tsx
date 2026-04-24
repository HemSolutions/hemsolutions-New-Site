import { useEffect, useRef, useState } from 'react';
import { Sparkles, Home, Wind, Truck, TreePine, Building2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface Service {
  icon: React.ElementType;
  title: string;
  description: string;
  image: string;
  originalPrice: string;
  rutPrice: string;
  finalPrice: string;
  serviceId: string;
  unit: string;
}

interface ServicesProps {
  onBookNow?: () => void;
}

const services: Service[] = [
  {
    icon: Home,
    title: 'Hemstädning',
    description: 'Regelbunden städning för dig som vill komma hem till skinande rent. Vår högt kvalificerade personal skräddarsyr städningen efter dina behov.',
    image: '/cleaner-hemsolutions.jpg',
    originalPrice: '498 kr/timme',
    rutPrice: '249 kr/timme',
    finalPrice: '199 kr/timme',
    serviceId: 'hemstadning',
    unit: 'timme',
  },
  {
    icon: Sparkles,
    title: 'Storstädning',
    description: 'En grundlig nystart för hemmet – perfekt inför högtider, fester eller som vardagslyx. Vi rengör alla ytor noggrant.',
    image: '/hero-livingroom.jpg',
    originalPrice: '573 kr/timme',
    rutPrice: '286 kr/timme',
    finalPrice: '229 kr/timme',
    serviceId: 'storstadning',
    unit: 'timme',
  },
  {
    icon: Wind,
    title: 'Fönsterputs',
    description: 'Skinande rena fönster, antingen på abonnemang eller som engångstjänst. Vi putsar både in- och utsida.',
    image: '/window-cleaner-hemsolutions.jpg',
    originalPrice: '223 kr/fönster',
    rutPrice: '111 kr/fönster',
    finalPrice: '89 kr/fönster',
    serviceId: 'fonsterputs',
    unit: 'fönster',
  },
  {
    icon: Truck,
    title: 'Flyttstädning',
    description: 'Professionell flyttstädning som klarar besiktningen. Vi garanterar att städningen godkänns av hyresvärd eller köpare.',
    image: '/cleaner-hemsolutions.jpg',
    originalPrice: '623 kr/timme',
    rutPrice: '311 kr/timme',
    finalPrice: '249 kr/timme',
    serviceId: 'flyttstadning',
    unit: 'timme',
  },
  {
    icon: TreePine,
    title: 'Trädgårdshjälp',
    description: 'Erfaren personal som ser till att du får en vacker trädgård. Från gräsklippning till häckklippning.',
    image: '/gardener-stadpro.jpg',
    originalPrice: '498 kr/timme',
    rutPrice: '249 kr/timme',
    finalPrice: '199 kr/timme',
    serviceId: 'tradgard',
    unit: 'timme',
  },
  {
    icon: Building2,
    title: 'Kontorsstädning',
    description: 'Vi hjälper dig att hålla kontoret rent, trivsamt och representativt. Skapa en bättre arbetsmiljö.',
    image: '/office-cleaning-hemsolutions.jpg',
    originalPrice: '623 kr/timme',
    rutPrice: '311 kr/timme',
    finalPrice: '249 kr/timme',
    serviceId: 'kontor',
    unit: 'timme',
  },
];

export function Services({ onBookNow }: ServicesProps) {
  const { translate } = useLanguage();
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
      id="services"
      ref={sectionRef}
      className="py-20 lg:py-28 bg-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 mb-6">
            {translate('services.headline')}
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            {translate('services.subheadline')}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service, index) => (
            <div
              key={service.title}
              className={`group relative bg-white rounded-2xl border border-slate-100 overflow-hidden transition-all duration-500 hover:shadow-card-hover hover:-translate-y-2 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 100 + 200}ms` }}
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center justify-between">
                    <span className="inline-block bg-teal-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      {service.finalPrice}
                    </span>
                    <span className="text-white/70 text-xs line-through">
                      {service.originalPrice}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center">
                    <service.icon className="w-6 h-6 text-teal-500" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">{service.title}</h3>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  {service.description}
                </p>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    Efter RUT: {service.rutPrice}
                  </span>
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                    Nya kunder: {service.finalPrice}
                  </span>
                </div>
                <Button 
                  onClick={onBookNow}
                  variant="ghost" 
                  className="inline-flex items-center gap-2 text-teal-500 font-semibold text-sm group/btn p-0 hover:bg-transparent hover:text-teal-600"
                >
                  Boka nu
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          className={`mt-12 text-center transition-all duration-700 delay-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-slate-600 mb-4">
            Inte säker på vilken tjänst du behöver? Kontakta oss för en kostnadsfri konsultation.
          </p>
          <Button
            onClick={onBookNow}
            className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white"
          >
            Få hjälp att välja
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
