import { useEffect, useRef, useState } from 'react';
import { Star, Quote } from 'lucide-react';

interface Testimonial {
  quote: string;
  author: string;
  location: string;
  rating: number;
  service: string;
}

const testimonials: Testimonial[] = [
  {
    quote: 'HemSolutions överträffade alla mina förväntningar! Efter att ha testat flera städföretag i Stockholm har jag äntligen hittat ett som verkligen bryr sig om kvalitet. Mitt hem har aldrig varit så rent.',
    author: 'Anna Lindqvist',
    location: 'Stockholm',
    rating: 5,
    service: 'Hemstädning',
  },
  {
    quote: 'Fantastisk service från HemSolutions! Professionellt bemötande från första kontakt till färdig städning. Personalen är högt kvalificerad och noggrann. Rekommenderas varmt!',
    author: 'Mikael Johansson',
    location: 'Solna',
    rating: 5,
    service: 'Storstädning',
  },
  {
    quote: 'Otroligt nöjd med HemSolutions! De kom i tid, var noggranna och lämnade mitt hem skinande rent. Med RUT-avdrag blev det dessutom väldigt prisvärt.',
    author: 'Sofia Eriksson',
    location: 'Sundbyberg',
    rating: 5,
    service: 'Flyttstädning',
  },
  {
    quote: 'Jag blev så imponerad av HemSolutions professionalism. De lyssnade på mina önskemål och anpassade städningen perfekt. RUT-avdraget hanterades smidigt.',
    author: 'Lars Andersson',
    location: 'Lidingö',
    rating: 5,
    service: 'Fönsterputs',
  },
  {
    quote: 'Äntligen ett städföretag som förstår vad kunder vill ha! Pålitliga, noggranna och trevliga. Jag har redan rekommenderat dem till alla mina grannar i Stockholm.',
    author: 'Emma Nilsson',
    location: 'Nacka',
    rating: 5,
    service: 'Hemstädning',
  },
  {
    quote: 'HemSolutions kontorsstädning är outstanding! Vårt kontor har aldrig varit så rent och trivsamt. Proffsiga, kunniga och alltid i tid.',
    author: 'Peter Karlsson',
    location: 'Kista',
    rating: 5,
    service: 'Kontorsstädning',
  },
];

export function Testimonials() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
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

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="testimonials"
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
            Vad våra kunder säger
          </h2>
          <p className="text-lg text-slate-600">
            Vi är stolta över att ha så nöjda kunder i Stockholm och Mälardalen. 
            Läs vad de tycker om HemSolutions tjänster.
          </p>
        </div>

        {/* Featured Testimonial */}
        <div
          className={`mb-12 transition-all duration-700 delay-100 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-3xl p-8 lg:p-12 text-white">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="lg:w-2/3">
                <Quote className="w-12 h-12 text-teal-200 mb-4" />
                <blockquote className="text-xl lg:text-2xl font-medium leading-relaxed mb-6">
                  "{testimonials[activeIndex].quote}"
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold">
                      {testimonials[activeIndex].author.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold">{testimonials[activeIndex].author}</p>
                    <p className="text-teal-100">{testimonials[activeIndex].location}</p>
                  </div>
                </div>
              </div>
              <div className="lg:w-1/3 flex flex-col items-center">
                <div className="flex gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-8 h-8 text-amber-300 fill-amber-300"
                    />
                  ))}
                </div>
                <p className="text-5xl font-bold">4.9</p>
                <p className="text-teal-100">Genomsnittligt betyg</p>
                <p className="text-sm text-teal-200 mt-2">Baserat på 500+ omdömen</p>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.slice(0, 6).map((testimonial, index) => (
            <div
              key={index}
              className={`relative bg-slate-50 rounded-2xl p-6 transition-all duration-500 hover:shadow-card-hover cursor-pointer ${
                activeIndex === index ? 'ring-2 ring-teal-500' : ''
              } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: `${index * 100 + 200}ms` }}
              onClick={() => setActiveIndex(index)}
            >
              {/* Quote Icon */}
              <div className="absolute -top-3 left-6 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
                <Quote className="w-3 h-3 text-white" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < testimonial.rating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-slate-700 leading-relaxed mb-4 text-sm line-clamp-3">
                "{testimonial.quote}"
              </blockquote>

              {/* Service Badge */}
              <span className="inline-block bg-teal-100 text-teal-700 text-xs px-2 py-1 rounded-full mb-4">
                {testimonial.service}
              </span>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                  <span className="text-teal-600 font-semibold text-sm">
                    {testimonial.author.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-slate-800 text-sm">{testimonial.author}</div>
                  <div className="text-xs text-slate-500">{testimonial.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                activeIndex === index ? 'w-6 bg-teal-500' : 'bg-slate-300'
              }`}
            />
          ))}
        </div>

        {/* CTA */}
        <div
          className={`mt-12 text-center transition-all duration-700 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-slate-600 mb-4">
            Vill du också uppleva skillnaden med HemSolutions?
          </p>
          <a
            href="#"
            className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            Boka din första städning
          </a>
        </div>
      </div>
    </section>
  );
}
