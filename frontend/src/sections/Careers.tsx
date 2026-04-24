import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Users, Heart, TrendingUp, Award, MapPin, X, CheckCircle, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';

const benefits = [
  { icon: Heart, text: 'Friskvårdsbidrag 5 000 kr/år' },
  { icon: TrendingUp, text: 'Karriärmöjligheter' },
  { icon: Award, text: 'Utbildning ingår' },
  { icon: Users, text: 'Fantastiskt team' },
];

const jobPositions = [
  {
    title: 'Städare/Städerska',
    location: 'Stockholm',
    type: 'Heltid/Deltid',
    description: 'Vi söker noggranna och pålitliga städare som vill arbeta i ett positivt team.',
    requirements: ['Erfarenhet av städning', 'Körkort (meriterande)', 'Svenska i tal och skrift'],
  },
  {
    title: 'Teamledare Städ',
    location: 'Stockholm',
    type: 'Heltid',
    description: 'Leda och coacha vårt städteam. Ansvara för kvalitet och kundnöjdhet.',
    requirements: ['Minst 2 års erfarenhet', 'Ledaregenskaper', 'Körkort krav'],
  },
  {
    title: 'Fönsterputsare',
    location: 'Stockholm & Mälardalen',
    type: 'Heltid/Deltid',
    description: 'Erfaren fönsterputsare för in- och utvändig putsning.',
    requirements: ['Erfarenhet av fönsterputs', 'Körkort krav', 'Höjdarbete'],
  },
  {
    title: 'Trädgårdsarbetare',
    location: 'Stockholm',
    type: 'Säsong',
    description: 'Skötsel av trädgårdar, gräsklippning och häckklippning.',
    requirements: ['Erfarenhet av trädgårdsarbete', 'Körkort meriterande', 'Fysiskt arbete'],
  },
];

export function Careers() {
  const [isVisible, setIsVisible] = useState(false);
  const [showJobs, setShowJobs] = useState(false);
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
    <>
      <section
        id="careers"
        ref={sectionRef}
        className="py-20 lg:py-28 bg-gradient-to-br from-teal-500 to-teal-600"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`text-center max-w-3xl mx-auto transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Users className="w-4 h-4" />
              Vi rekryterar!
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Vill du jobba på HemSolutions?
            </h2>
            
            <p className="text-lg text-teal-100 leading-relaxed mb-4">
              Vi söker högt kvalificerad personal som vill vara med och bygga Sveriges bästa städföretag. 
              Hos oss får du arbeta i ett positivt team med konkurrenskraftiga villkor.
            </p>

            <div className="flex items-center justify-center gap-2 text-teal-100 mb-8">
              <MapPin className="w-4 h-4" />
              <span>Stockholm & Mälardalen</span>
            </div>

            {/* Benefits */}
            <div className="flex flex-wrap justify-center gap-4 mb-10">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full"
                >
                  <benefit.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{benefit.text}</span>
                </div>
              ))}
            </div>

            <Button
              size="lg"
              onClick={() => setShowJobs(true)}
              className="bg-white text-teal-600 hover:bg-teal-50 h-14 px-8 text-lg font-semibold group"
            >
              Se lediga tjänster
              <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>

            <p className="text-sm text-teal-200 mt-6">
              Eller skicka din spontanansökan till{' '}
              <a href="mailto:jobb@hemsolutions.se" className="underline hover:text-white">
                jobb@hemsolutions.se
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Jobs Modal */}
      {showJobs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
            <div className="bg-teal-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Briefcase className="w-6 h-6 text-white" />
                <h3 className="font-semibold text-white">Lediga tjänster</h3>
              </div>
              <button onClick={() => setShowJobs(false)} className="p-2 hover:bg-white/20 rounded-lg">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {jobPositions.map((job, index) => (
                <div key={index} className="border rounded-xl p-4 hover:border-teal-500 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-lg text-slate-800">{job.title}</h4>
                    <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full">{job.type}</span>
                  </div>
                  <p className="text-sm text-slate-500 mb-2 flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> {job.location}
                  </p>
                  <p className="text-sm text-slate-600 mb-3">{job.description}</p>
                  <div className="mb-3">
                    <p className="text-xs font-medium text-slate-700 mb-1">Krav:</p>
                    <ul className="space-y-1">
                      {job.requirements.map((req, i) => (
                        <li key={i} className="text-xs text-slate-600 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-teal-500" /> {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <a 
                    href={`mailto:jobb@hemsolutions.se?subject=Ansökan: ${job.title}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700"
                  >
                    Ansök nu <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
            <div className="p-4 border-t bg-slate-50">
              <p className="text-sm text-slate-600 text-center">
                Hittade du ingen passande tjänst? Skicka en spontanansökan till{' '}
                <a href="mailto:jobb@hemsolutions.se" className="text-teal-600 font-medium">
                  jobb@hemsolutions.se
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
