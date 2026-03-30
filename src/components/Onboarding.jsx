import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Globe, Key, Search, Sparkles, Flame } from 'lucide-react';

export default function Onboarding({ onComplete, language, setLanguage, showToast }) {
  const [step, setStep] = useState(0);
  const [sourceId, setSourceId] = useState("");
  const [apiKey, setLocalApiKey] = useState("");
  const [provider, setLocalProvider] = useState("google");
  const [modelId, setLocalModelId] = useState("gemini-2.0-flash");

  const sources = [
    { id: 'social', label: language === 'Español' ? 'Redes Sociales' : 'Social Media', icon: '📱' },
    { id: 'friend', label: language === 'Español' ? 'Por un Amigo' : 'From a Friend', icon: '🤝' },
    { id: 'search', label: language === 'Español' ? 'Buscador' : 'Search Engine', icon: '🔍' },
    { id: 'ads', label: language === 'Español' ? 'Publicidad' : 'Advertisement', icon: '📺' },
    { id: 'other', label: language === 'Español' ? 'Otro' : 'Other', icon: '✨' }
  ];

  const handleNext = () => {
    if (step === 1 && !sourceId) {
      showToast(language === 'Español' ? "Por favor selecciona cómo nos conociste" : "Please select how you heard about us", 'error');
      return;
    }
    if (step === 2 && !apiKey) {
      showToast(language === 'Español' ? "Por favor ingresa tu clave API" : "Please enter your API Key", 'error');
      return;
    }

    if (step < 2) {
      setStep(step + 1);
    } else {
      const selectedSource = sources.find(s => s.id === sourceId)?.label || "";
      onComplete({ apiKey, provider, modelId, source: selectedSource });
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSkip = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      onComplete({ apiKey: "", provider, modelId: "", source: "" });
    }
  };

  const steps = [
    {
      title: language === 'Español' ? "Elige tu idioma" : "Preferred Language",
      subtitle: language === 'Español' ? "Configura tu experiencia culinaria" : "Set up your culinary experience in your tongue.",
      content: (
        <div className="space-y-6">
          <div className="flex gap-4">
            {['English', 'Español'].map((l) => (
              <button
                key={l}
                onClick={() => setLanguage(l)}
                className={`flex-1 flex flex-col items-center gap-4 p-8 rounded-3xl border transition-all duration-500 ${
                  language === l 
                    ? 'bg-yellow-500 border-yellow-400 text-black shadow-[0_0_30px_rgba(255,215,0,0.2)] scale-105' 
                    : 'bg-[#121212] border-white/10 text-white/40 hover:bg-[#1A1A1A]'
                }`}
              >
                <Globe size={32} />
                <span className="font-black uppercase tracking-widest text-xs">{l === 'English' ? 'English (US)' : 'Español'}</span>
              </button>
            ))}
          </div>
        </div>
      )
    },
    {
      title: language === 'Español' ? "¿Cómo nos conociste?" : "How did you know about DishDash?",
      subtitle: language === 'Español' ? "Cuéntanos un poco sobre tu llegada" : "Tell us a bit about how you found your way here.",
      content: (
        <div className="grid grid-cols-1 gap-3">
          {sources.map((s) => (
            <button
              key={s.id}
              onClick={() => setSourceId(s.id)}
              className={`flex items-center gap-4 p-5 rounded-2xl border transition-all duration-300 ${
                sourceId === s.id 
                  ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500 shadow-[0_0_20px_rgba(255,215,0,0.1)]' 
                  : 'bg-[#121212] border-white/10 text-white/60 hover:bg-[#1A1A1A] hover:border-white/20'
              }`}
            >
              <span className="text-2xl">{s.icon}</span>
              <span className="font-bold">{s.label}</span>
            </button>
          ))}
        </div>
      )
    },
    {
      title: language === 'Español' ? "Configura tu IA" : "Your API Key",
      subtitle: language === 'Español' ? "Conecta el cerebro de tu cocina" : "Connect the brain of your kitchen to start cooking.",
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] text-white/40 font-black uppercase tracking-widest mb-2 px-1">Provider</label>
              <div className="grid grid-cols-3 gap-2">
                {['google', 'openai', 'openrouter'].map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setLocalProvider(p);
                      setLocalModelId(p === 'google' ? 'gemini-2.0-flash' : p === 'openai' ? 'gpt-4o' : '');
                    }}
                    className={`py-3 rounded-xl border text-[10px] font-black uppercase transition-all ${
                      provider === p 
                        ? 'bg-white/10 border-white/40 text-white' 
                        : 'bg-[#121212] border-white/5 text-white/20'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label htmlFor="api-key" className="block text-[10px] text-white/40 font-black uppercase tracking-widest mb-2 px-1">API Key</label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input
                  id="api-key"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setLocalApiKey(e.target.value)}
                  placeholder="Paste your key here..."
                  className="w-full h-14 pl-12 pr-4 rounded-2xl bg-[#121212] border border-white/10 text-white focus:outline-none focus:border-yellow-500 transition-all font-mono text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="model-id" className="block text-[10px] text-white/40 font-black uppercase tracking-widest mb-2 px-1">Model ID</label>
              <input
                id="model-id"
                type="text"
                value={modelId}
                onChange={(e) => setLocalModelId(e.target.value)}
                placeholder="e.g. gemini-2.0-flash"
                className="w-full h-14 px-4 rounded-2xl bg-[#121212] border border-white/10 text-white focus:outline-none focus:border-yellow-500 transition-all text-sm"
              />
            </div>
          </div>
        </div>
      )
    }
  ];

  const currentStep = steps[step];

  return (
    <div className="fixed inset-0 z-[500] bg-[#0A0A0A] overflow-y-auto scrollbar-hide py-32 px-6">
      <div className="fixed top-0 left-0 w-full p-8 flex justify-between items-center bg-[#0A0A0A] z-[510] border-b border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-lg shadow-lg" />
          <span className="text-white font-black italic uppercase tracking-tighter">DishDash</span>
        </div>
        <div className="flex gap-2">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`h-1 rounded-full transition-all duration-500 ${
                i === step ? 'w-8 bg-yellow-500 shadow-[0_0_10px_rgba(255,215,0,0.4)]' : i < step ? 'w-4 bg-yellow-500/60' : 'w-4 bg-white/30'
              }`} 
            />
          ))}
        </div>
      </div>

      <div className="w-full max-w-xl mx-auto min-h-[60vh] flex flex-col justify-center">
        <div className="mb-12 animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4 leading-tight">
            {currentStep.title}
          </h1>
          <p className="text-white/40 text-lg font-medium leading-relaxed">
            {currentStep.subtitle}
          </p>
        </div>

        <div className="mb-12 transition-all duration-500">
          {currentStep.content}
        </div>

        <div className="flex gap-4 pb-4">
          {step > 0 && (
            <button
              onClick={handleBack}
              className="h-16 px-8 rounded-2xl bg-[#121212] border border-white/10 text-white/60 hover:text-white hover:bg-[#1A1A1A] transition-all font-black uppercase tracking-widest text-xs flex items-center gap-3"
            >
              <ChevronLeft size={20} />
              {language === 'Español' ? 'Atrás' : 'Back'}
            </button>
          )}
          <button
            onClick={handleNext}
            className="flex-1 h-16 rounded-2xl bg-yellow-500 text-black font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(255,215,0,0.2)]"
          >
            {step === steps.length - 1 
              ? (language === 'Español' ? 'Entrar a la Cocina' : 'Enter Kitchen') 
              : (language === 'Español' ? 'Continuar' : 'Continue')}
            <ChevronRight size={20} />
          </button>
        </div>

        {step > 0 && (
          <button
            onClick={handleSkip}
            className="w-full mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/20 hover:text-white/60 transition-all py-2"
          >
            {language === 'Español' ? 'Pasar Paso' : 'Skip Step'}
          </button>
        )}
      </div>
    </div>
  );
}
