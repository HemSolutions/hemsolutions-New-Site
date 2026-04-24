import { useState, useEffect } from 'react';
import { Search, Sparkles, Shield, Clock, Star, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Swedish postcode to area mapping for Stockholm and Mälardalen
const postcodeAreas: Record<string, string> = {
  // Stockholm City (all central postcodes)
  '111': 'Stockholm City', '112': 'Stockholm City', '113': 'Stockholm City',
  '114': 'Stockholm City', '115': 'Stockholm City', '116': 'Stockholm City',
  '117': 'Stockholm City', '118': 'Stockholm City',
  // Bromma / Vällingby
  '161': 'Bromma', '162': 'Vällingby', '163': 'Spånga', '165': 'Hässelby',
  '167': 'Bromma', '168': 'Bromma',
  // Älvsjö / Bandhagen
  '125': 'Älvsjö', '124': 'Bandhagen', '122': 'Enskede',
  // Farsta / Skarpnäck
  '123': 'Farsta', '128': 'Skarpnäck',
  // Nacka / Saltsjöbaden
  '131': 'Nacka', '133': 'Saltsjöbaden', '132': 'Nacka',
  // Lidingö
  '181': 'Lidingö', '182': 'Lidingö',
  // Solna / Sundbyberg
  '169': 'Solna', '171': 'Solna', '172': 'Sundbyberg', '174': 'Sundbyberg',
  // Danderyd / Täby
  '186': 'Danderyd', '183': 'Täby', '187': 'Täby',
  // Sollentuna / Upplands Väsby
  '191': 'Sollentuna', '194': 'Upplands Väsby',
  // Järfälla / Kista
  '175': 'Järfälla', '176': 'Järfälla', '164': 'Kista',
  // Botkyrka / Huddinge
  '141': 'Huddinge', '145': 'Norsborg', '147': 'Tumba', '148': 'Tumba',
  // Haninge / Tyresö
  '136': 'Haninge', '137': 'Tyresö',
  // Södertälje
  '151': 'Södertälje', '152': 'Södertälje',
  // Upplands-Bro / Bro
  '197': 'Bro', '196': 'Upplands-Bro', '195': 'Upplands-Bro',
  // Västerås
  '721': 'Västerås', '722': 'Västerås', '723': 'Västerås',
  // Eskilstuna
  '631': 'Eskilstuna',
};

function getAreaFromPostcode(postcode: string): string | null {
  const clean = postcode.replace(/\s/g, '').substring(0, 3);
  return postcodeAreas[clean] || null;
}

import { useLanguage } from '@/contexts/LanguageContext';

interface HeroProps {
  onBookNow: () => void;
}

export function Hero({ onBookNow }: HeroProps) {
  const { translate } = useLanguage();
  const [postcode, setPostcode] = useState('');
  const [areaName, setAreaName] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handlePostcodeChange = (value: string) => {
    setPostcode(value);
    if (value.length >= 3) {
      const area = getAreaFromPostcode(value);
      setAreaName(area);
    } else {
      setAreaName(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (postcode.trim()) {
      onBookNow();
    }
  };

  const trustBadges = [
    { icon: Shield, text: translate('hero.guarantee') },
    { icon: Clock, text: translate('hero.qualified') },
    { icon: Star, text: translate('hero.rating') },
  ];

  return (
    <section className="relative min-h-screen flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/hero-livingroom.jpg"
          alt="Bright Scandinavian living room"
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/60 to-slate-900/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="max-w-2xl">
          {/* Promo Badge */}
          <div
            className={`inline-flex items-center gap-2 bg-amber-400 text-slate-900 px-4 py-2 rounded-full text-sm font-semibold mb-6 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            {translate('hero.promo')}
          </div>

          {/* Main Headline */}
          <h1
            className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4 transition-all duration-700 delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            {translate('hero.headline')}
          </h1>

          {/* Subheadline */}
          <p
            className={`text-xl sm:text-2xl text-white/90 mb-6 transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            {translate('hero.subheadline')}
          </p>

          {/* Location Badge */}
          <div
            className={`flex items-center gap-2 text-white/80 mb-8 transition-all duration-700 delay-250 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <MapPin className="w-5 h-5" />
            <span>{translate('hero.location')}</span>
          </div>

          {/* Postcode Input Form */}
          <form
            onSubmit={handleSubmit}
            className={`flex flex-col sm:flex-row gap-3 mb-6 transition-all duration-700 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder={translate('hero.postcodePlaceholder')}
                value={postcode}
                onChange={(e) => handlePostcodeChange(e.target.value)}
                className="pl-12 h-14 text-lg bg-white border-0 rounded-xl shadow-lg placeholder:text-slate-400"
                maxLength={6}
              />
              {areaName && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white/95 backdrop-blur rounded-lg px-3 py-2 text-sm text-teal-700 font-medium shadow-lg z-20">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  {areaName} – {translate('hero.areaCovered')}
                </div>
              )}
            </div>
            <Button
              type="submit"
              size="lg"
              className="h-14 px-8 bg-teal-500 hover:bg-teal-600 text-white text-lg font-semibold rounded-xl shadow-button transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {translate('hero.cta')}
            </Button>
          </form>

          {/* Terms */}
          <p
            className={`text-sm text-white/70 mb-10 transition-all duration-700 delay-400 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            {translate('hero.terms')}
          </p>

          {/* Trust Badges */}
          <div
            className={`flex flex-wrap gap-4 transition-all duration-700 delay-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            {trustBadges.map((badge, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full"
              >
                <badge.icon className="w-5 h-5 text-teal-400" />
                <span className="text-white text-sm font-medium">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-white/50 rounded-full" />
        </div>
      </div>
    </section>
  );
}
