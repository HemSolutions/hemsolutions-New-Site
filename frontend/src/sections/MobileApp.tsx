import { useEffect, useRef, useState } from 'react';
import { Calendar, Clock, FileText, Star, CreditCard, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  { icon: Calendar, text: 'Se dina bokningar' },
  { icon: Clock, text: 'Boka tjänster med ett klick' },
  { icon: FileText, text: 'Av- och omboka enkelt' },
  { icon: FileText, text: 'Uppdatera dina städinstruktioner' },
  { icon: Star, text: 'Lämna feedback och betyg' },
  { icon: CreditCard, text: 'Hantera fakturor' },
];

export function MobileApp() {
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
      className="py-20 lg:py-28 bg-slate-900"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Phone Mockup */}
          <div
            className={`relative flex justify-center transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="relative">
              <img
                src="/app-mockup.jpg"
                alt="HemSolutions App - Boka städning enkelt"
                className="w-64 lg:w-80 h-auto rounded-3xl shadow-2xl"
              />
              
              {/* Floating Badge */}
              <div 
                className="absolute -right-4 top-1/4 bg-white rounded-xl p-3 shadow-lg animate-float"
                style={{ animationDelay: '0.5s' }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-500" />
                  </div>
                  <span className="text-sm font-medium text-slate-800">Bekräftad!</span>
                </div>
              </div>

              {/* Rating Badge */}
              <div 
                className="absolute -left-4 bottom-1/3 bg-white rounded-xl p-3 shadow-lg animate-float"
                style={{ animationDelay: '1s' }}
              >
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-medium text-slate-800">4.9</span>
                </div>
              </div>
            </div>

            {/* Decorative */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl -z-10" />
          </div>

          {/* Content */}
          <div
            className={`transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
            }`}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Allt du behöver på ett ställe.
            </h2>
            
            <p className="text-lg text-slate-300 leading-relaxed mb-8">
              Med HemSolutions app är det enklare än någonsin att boka och hantera din städning. 
              Du hittar allt du behöver för att boka, hantera och anpassa dina tjänster – 
              direkt i mobilen.
            </p>

            {/* Features List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 text-slate-300"
                >
                  <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-teal-400" />
                  </div>
                  <span className="text-sm">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* App Store Buttons */}
            <div className="flex flex-wrap gap-4">
              <Button
                variant="outline"
                className="bg-white text-slate-900 hover:bg-slate-100 border-0 h-14 px-6"
              >
                <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <div className="text-left">
                  <div className="text-xs text-slate-500">Ladda ner på</div>
                  <div className="text-sm font-semibold">App Store</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="bg-white text-slate-900 hover:bg-slate-100 border-0 h-14 px-6"
              >
                <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                </svg>
                <div className="text-left">
                  <div className="text-xs text-slate-500">Ladda ner på</div>
                  <div className="text-sm font-semibold">Google Play</div>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
