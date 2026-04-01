import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Mic, MicOff, Volume2, Play, Pause, RotateCcw } from 'lucide-react';

export default function CookingMode({ steps, onExit, language, ui }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  const nextStep = useCallback(() => {
    if (currentIndex < steps.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, steps.length]);

  const prevStep = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition && !recognition) {
      const recog = new SpeechRecognition();
      recog.continuous = true;
      recog.interimResults = false;
      recog.lang = language === 'Español' ? 'es-ES' : 'en-US';

      recog.onresult = (event) => {
        const command = event.results[event.results.length - 1][0].transcript.toLowerCase();
        
        if (command.includes('next') || command.includes('siguiente')) {
          nextStep();
        } else if (command.includes('back') || command.includes('anterior') || command.includes('atrás') || command.includes('atras')) {
          prevStep();
        } else if (command.includes('exit') || command.includes('salir') || command.includes('stop') || command.includes('parar')) {
          onExit();
        }
      };

      setRecognition(recog);
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [language, nextStep, prevStep, onExit, recognition]);

  useEffect(() => {
    if (recognition) {
      recognition.onend = () => {
        if (isListening) {
          try {
            recognition.start();
          } catch (e) {
            console.error("Failed to restart recognition", e);
          }
        }
      };
    }
  }, [isListening, recognition]);

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
      setIsListening(false);
    } else {
      recognition?.start();
      setIsListening(true);
    }
  };

  if (!steps || steps.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-[#0A0A0A] flex flex-col animate-fade-in text-white overflow-hidden">
      <div className="p-6 md:p-10 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500">
            <Play size={24} fill="currentColor" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter italic text-yellow-500">{ui.cooking.title}</h2>
            <p className="text-white/40 text-[10px] md:text-sm font-medium uppercase tracking-widest">
              {ui.cooking.step} {currentIndex + 1} {ui.cooking.of} {steps.length}
            </p>
          </div>
        </div>
        <button 
          onClick={onExit}
          className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all text-white/40 hover:text-white"
        >
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-20 text-center relative overflow-y-auto">
        <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
          <div 
            className="h-full bg-yellow-500 transition-all duration-500" 
            style={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
          />
        </div>

        <div className="max-w-4xl space-y-6 md:space-y-8 animate-slide-up">
          <div className="flex justify-center mb-2 md:mb-4">
            <span className="px-3 md:px-4 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] font-black uppercase tracking-widest">
              {ui.cooking.instruction}
            </span>
          </div>
          <h1 className="text-2xl md:text-6xl font-black md:leading-[1.1] tracking-tight selection:bg-yellow-500/30 px-2 lg:px-0">
            {steps[currentIndex]}
          </h1>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-6 text-white/20">
          <div className="flex flex-col items-center gap-2">
            <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${isListening ? 'bg-yellow-500 border-yellow-500 text-black shadow-[0_0_30px_rgba(234,179,8,0.4)]' : 'bg-white/5 border-white/10 hover:border-white/20'}`} onClick={toggleListening}>
              {isListening ? <Mic size={24} /> : <MicOff size={24} />}
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest ${isListening ? 'text-yellow-500' : ''}`}>
              {isListening ? ui.cooking.listening : ui.cooking.voiceOff}
            </span>
          </div>
        </div>

        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex gap-4 text-[9px] font-bold uppercase tracking-[0.2em] text-white/10 whitespace-nowrap">
          {ui.cooking.commands.map((cmd, idx) => (
            <div key={cmd} className="flex items-center gap-4">
              <span>"{cmd}"</span>
              {idx < ui.cooking.commands.length - 1 && <span>•</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="p-8 md:p-12 border-t border-white/5 flex justify-between items-center bg-white/[0.02]">
        <button 
          onClick={prevStep}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 md:gap-4 px-4 md:px-10 py-3 md:py-6 rounded-2xl md:rounded-[32px] bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="hidden sm:inline text-[10px] md:text-sm">{ui.cooking.previous}</span>
        </button>

        <div className="flex gap-2">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`w-2 h-2 rounded-full transition-all duration-300 ${i === currentIndex ? 'bg-yellow-500 w-8' : 'bg-white/10'}`} 
            />
          ))}
        </div>

        <button 
          onClick={currentIndex === steps.length - 1 ? onExit : nextStep}
          className="flex items-center gap-2 md:gap-4 px-4 md:px-10 py-3 md:py-6 rounded-2xl md:rounded-[32px] bg-yellow-500 text-black font-black uppercase tracking-widest hover:bg-yellow-400 transition-all group"
        >
          <span className="hidden sm:inline text-[10px] md:text-sm">{currentIndex === steps.length - 1 ? ui.cooking.finish : ui.cooking.next}</span>
          {currentIndex === steps.length - 1 ? <RotateCcw size={18} /> : <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />}
        </button>
      </div>
    </div>
  );
}
