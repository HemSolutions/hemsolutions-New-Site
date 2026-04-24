import { useEffect, useRef, useState } from 'react';
import { ArrowRight, MapPin, Award, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function About() {
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
      id="about"
      ref={sectionRef}
      className="py-20 lg:py-28 bg-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div
            className={`transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            }`}
          >
            <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              Om HemSolutions
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 mb-6 leading-tight">
              Högt kvalificerad personal med lång erfarenhet
            </h2>
            
            <div className="space-y-4 text-slate-600 leading-relaxed mb-8">
              <p>
                <span className="font-semibold text-slate-800">HemSolutions Sverige AB är ett ledande städföretag i Stockholm.</span> Vi erbjuder professionella städtjänster av högsta kvalitet för både privatpersoner och företag.
              </p>
              <p>
                Vår styrka ligger i vår högt kvalificerade personal med lång erfarenhet från branschen. Varje medarbetare är noggrant utvald och utbildad för att säkerställa att vi all levererar ett resultat som överträffar dina förväntningar.
              </p>
              <p>
                Vi tror på att bygga långsiktiga relationer med våra kunder. Därför lägger vi stor vikt vid att förstå dina specifika behov och anpassa våra tjänster därefter. Inget hem är för stort, för litet eller för komplicerat för oss.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-teal-500">500+</div>
                <div className="text-xs text-slate-600">Nöjda kunder</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-teal-500">4.9</div>
                <div className="text-xs text-slate-600">Kundbetyg</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-teal-500">25+</div>
                <div className="text-xs text-slate-600">Medarbetare</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-teal-500">100%</div>
                <div className="text-xs text-slate-600">Nöjd-kund-garanti</div>
              </div>
            </div>

            <Button
              variant="outline"
              className="group border-teal-500 text-teal-500 hover:bg-teal-50"
            >
              Lär känna vårt team
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          {/* Image */}
          <div
            className={`relative transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
            }`}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/team-hemsolutions.jpg"
                alt="HemSolutions Sverige AB team - professionella städare i Stockholm"
                className="w-full h-auto"
              />
              
              {/* Overlay Badge */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-teal-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">HemSolutions Sverige AB</p>
                    <p className="text-sm text-slate-600">Stockholm & Mälardalen</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-teal-100 rounded-full -z-10" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-amber-100 rounded-full -z-10" />
            
            {/* Experience Badge */}
            <div className="absolute -right-4 top-1/4 bg-white rounded-xl p-4 shadow-lg border border-slate-100">
              <div className="flex items-center gap-2">
                <Award className="w-8 h-8 text-teal-500" />
                <div>
                  <p className="font-bold text-slate-800">Certifierade</p>
                  <p className="text-xs text-slate-600">Städproffs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
