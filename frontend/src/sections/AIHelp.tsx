import { useEffect, useRef, useState } from 'react';
import {
  Bot, MessageSquare, Calculator, Calendar, HelpCircle,
  CheckCircle, ArrowRight, Sparkles, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getBotResponses, getResponseKey } from '@/lib/chatResponses';

interface AIFeature {
  icon: React.ElementType;
  title: string;
  description: string;
  action: string;
}

interface AIHelpProps {
  onBookNow?: () => void;
}

const aiFeatures: AIFeature[] = [
  {
    icon: MessageSquare,
    title: 'Smart Chatbot',
    description: 'Få svar på dina frågor direkt. Vår AI hjälper dig dygnet runt med bokning, priser och information om HemSolutions.',
    action: 'Starta chatt',
  },
  {
    icon: Calculator,
    title: 'Prisberäknare',
    description: 'Få en snabb uppskattning av vad din städning kommer att kosta, inklusive RUT-avdrag och eventuella rabatter.',
    action: 'Beräkna pris',
  },
  {
    icon: Calendar,
    title: 'Smart Bokning',
    description: 'Låt AI:n föreslå den bästa tiden för din städning baserat på dina preferenser och vårt schema.',
    action: 'Boka smart',
  },
  {
    icon: HelpCircle,
    title: 'FAQ Assistant',
    description: 'Hitta svar på vanliga frågor om våra tjänster, RUT-avdrag och bokningsprocessen hos HemSolutions.',
    action: 'Ställ fråga',
  },
];

const benefits = [
  'Tillgänglig 24/7 – alltid redo att hjälpa',
  'Svar på sekunder – ingen väntetid',
  'Personliga rekommendationer',
  'Direktbokning utan krångel',
];

interface ChatMessage {
  text: string;
  isUser: boolean;
  suggestions?: { label: string; action: string }[];
}

export function AIHelp({ onBookNow }: AIHelpProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { text: 'Hej! Jag kan hjälpa dig med allt om HemSolutions tjänster. Vilken typ av städning behöver du?', isUser: false, suggestions: [
      { label: 'Hemstädning', action: 'hemstadning' },
      { label: 'Storstädning', action: 'storstadning' },
      { label: 'Se alla priser', action: 'priser' },
    ]}
  ]);
  const [chatInput, setChatInput] = useState('');
  const [calcHours, setCalcHours] = useState(2);
  const [calcService, setCalcService] = useState('hemstadning');
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

  const botResponses = getBotResponses();

  const handleChatSubmit = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { text: userMsg, isUser: true }]);
    setChatInput('');

    // Small delay for natural feel
    setTimeout(() => {
      const key = getResponseKey(userMsg);
      const response = botResponses[key] || botResponses.hjalp;
      setChatMessages(prev => [...prev, { 
        text: response.text, 
        isUser: false,
        suggestions: response.suggestions,
      }]);
    }, 600);
  };

  const handleSuggestionClick = (action: string) => {
    if (action === 'book_now') {
      if (onBookNow) {
        setShowChat(false);
        onBookNow();
      } else {
        setChatMessages(prev => [...prev, { 
          text: 'Klicka på "Boka nu"-knappen i menyn för att boka din städning!',
          isUser: false,
          suggestions: [
            { label: 'Tillbaka', action: 'default' },
          ],
        }]);
      }
      return;
    }

    const response = botResponses[action] || botResponses.hjalp;
    setChatMessages(prev => [...prev, { 
      text: response.text, 
      isUser: false,
      suggestions: response.suggestions,
    }]);
  };

  const calculatePrice = () => {
    const prices: Record<string, number> = {
      hemstadning: 199,
      storstadning: 229,
      fonsterputs: 89,
      flyttstadning: 249,
      kontor: 249,
      tradgard: 199,
    };
    return calcService === 'fonsterputs' ? prices[calcService] * calcHours : prices[calcService] * calcHours;
  };

  const handleFeatureClick = (action: string) => {
    if (action === 'Starta chatt') {
      setShowChat(true);
    } else if (action === 'Beräkna pris') {
      setShowCalculator(true);
    } else if (action === 'Boka smart' && onBookNow) {
      onBookNow();
    } else if (action === 'Ställ fråga') {
      setShowChat(true);
    }
  };

  return (
    <section
      ref={sectionRef}
      className="py-20 lg:py-28 bg-white relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div
            className={`transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            }`}
          >
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              AI-Driven Service
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 mb-6 leading-tight">
              Upplev framtidens städbokning med HemSolutions
            </h2>

            <p className="text-lg text-slate-600 leading-relaxed mb-8">
              Med vår avancerade AI-teknologi gör vi det enklare än någonsin att boka och hantera din städning.
              Få personlig hjälp, snabba svar och smarta rekommendationer – dygnet runt.
            </p>

            {/* Benefits */}
            <ul className="space-y-3 mb-8">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-3 text-slate-700">
                  <CheckCircle className="w-5 h-5 text-teal-500 flex-shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>

            <Button
              onClick={() => setShowChat(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white group"
            >
              <Bot className="w-5 h-5 mr-2" />
              Prova vår AI-assistent
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          {/* AI Features Grid */}
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 gap-4 transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
            }`}
          >
            {aiFeatures.map((feature, index) => (
              <div
                key={index}
                onClick={() => handleFeatureClick(feature.action)}
                className="group bg-slate-50 rounded-2xl p-6 hover:bg-purple-50 hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                  <feature.icon className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600 mb-4">{feature.description}</p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-purple-600 group-hover:gap-2 transition-all">
                  {feature.action}
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Demo Section */}
        <div
          className={`mt-16 bg-gradient-to-r from-purple-600 to-teal-600 rounded-3xl p-8 lg:p-12 transition-all duration-700 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="text-white">
              <h3 className="text-2xl font-bold mb-4">Se hur vår AI fungerar</h3>
              <p className="text-white/80 mb-6">
                Vår AI-assistent kan hjälpa dig med allt från att boka städning till att beräkna
                priser och besvara frågor. Prova själv och upplev skillnaden med HemSolutions!
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => setShowChat(true)}
                  className="bg-white text-purple-600 hover:bg-white/90"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Starta chatt
                </Button>
                <Button
                  onClick={() => setShowCalculator(true)}
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  Beräkna pris
                </Button>
              </div>
            </div>

            {/* Chat Preview */}
            <div className="bg-white rounded-2xl p-4 shadow-xl">
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="bg-slate-100 rounded-2xl rounded-tl-none px-4 py-2 max-w-[80%]">
                    <p className="text-sm text-slate-700">Hej! Jag kan hjälpa dig boka städning. Vilken typ av städning behöver du?</p>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <div className="bg-purple-500 rounded-2xl rounded-tr-none px-4 py-2 max-w-[80%]">
                    <p className="text-sm text-white">Jag behöver hemstädning för min lägenhet</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="bg-slate-100 rounded-2xl rounded-tl-none px-4 py-2 max-w-[80%]">
                    <p className="text-sm text-slate-700">Perfekt! Hemstädning kostar 398 kr/timme. Med RUT-avdrag betalar du bara 199 kr/timme. När vill du boka?</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <span className="px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-600">Hemstädning</span>
                  <span className="px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-600">Storstädning</span>
                  <span className="px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-600">Fönsterputs</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      {showChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="bg-purple-600 p-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">HemSolutions AI</h3>
                  <p className="text-xs text-purple-200">Online</p>
                </div>
              </div>
              <button onClick={() => setShowChat(false)} className="p-2 hover:bg-white/20 rounded-lg">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.isUser ? 'justify-end' : ''}`}>
                  {!msg.isUser && (
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-purple-600" />
                    </div>
                  )}
                  <div className={`rounded-2xl px-4 py-2 max-w-[85%] ${
                    msg.isUser ? 'bg-purple-500 text-white rounded-tr-none' : 'bg-slate-100 text-slate-700 rounded-tl-none'
                  }`}>
                    <p className="text-sm whitespace-pre-line">{msg.text}</p>
                    {!msg.isUser && msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {msg.suggestions.map((s, j) => (
                          <button
                            key={j}
                            onClick={() => handleSuggestionClick(s.action)}
                            className="px-2 py-1 bg-white rounded-full text-xs border border-slate-200 hover:border-purple-300 hover:text-purple-600 transition-colors"
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t flex gap-2 flex-shrink-0">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleChatSubmit()}
                placeholder="Skriv ett meddelande..."
                className="flex-1"
              />
              <Button onClick={handleChatSubmit} className="bg-purple-600 hover:bg-purple-700">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Calculator Modal */}
      {showCalculator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-teal-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calculator className="w-6 h-6 text-white" />
                <h3 className="font-semibold text-white">Prisberäknare</h3>
              </div>
              <button onClick={() => setShowCalculator(false)} className="p-2 hover:bg-white/20 rounded-lg">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tjänst</label>
                <select
                  value={calcService}
                  onChange={(e) => setCalcService(e.target.value)}
                  className="w-full p-3 border rounded-xl"
                >
                  <option value="hemstadning">Hemstädning - 199 kr/tim</option>
                  <option value="storstadning">Storstädning - 229 kr/tim</option>
                  <option value="fonsterputs">Fönsterputs - 89 kr/fönster</option>
                  <option value="flyttstadning">Flyttstädning - 249 kr/tim</option>
                  <option value="kontor">Kontorsstädning - 249 kr/tim</option>
                  <option value="tradgard">Trädgårdshjälp - 199 kr/tim</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {calcService === 'fonsterputs' ? 'Antal fönster' : 'Antal timmar'}
                </label>
                <Input
                  type="number"
                  value={calcHours}
                  onChange={(e) => setCalcHours(parseInt(e.target.value) || 1)}
                  min={1}
                  className="w-full"
                />
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm text-slate-600">Uppskattat pris (efter RUT + rabatt):</p>
                <p className="text-3xl font-bold text-teal-600">{calculatePrice()} kr</p>
                <p className="text-xs text-slate-500 mt-1">Inkluderar 50% RUT-avdrag och nykundsrabatt</p>
              </div>
              <Button
                onClick={() => {
                  setShowCalculator(false);
                  onBookNow?.();
                }}
                className="w-full bg-teal-500 hover:bg-teal-600"
              >
                Boka nu
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
