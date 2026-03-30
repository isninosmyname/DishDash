import React, { useState } from 'react';
import { ChefHat, Globe, ChevronDown, Lock, User, CheckCircle2 } from 'lucide-react';

export default function WelcomeScreen({ 
  onLogin, 
  language, 
  setLanguage, 
  ui,
  showToast
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isExiting, setIsExiting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      showToast(ui.fillAll, 'error');
      return;
    }
    
    setShowSuccess(true);
    setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        onLogin(username);
      }, 800);
    }, 1000);
  };

  return (
    <div className={`fixed inset-0 z-[200] flex items-center justify-center bg-[#0A0A0A] overflow-hidden transition-all duration-1000 ${isExiting ? 'scale-110 blur-2xl opacity-0' : ''}`}>
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-yellow-500/10 blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-orange-500/10 blur-[120px] animate-pulse delay-700" />
      
      <div className={`relative w-full max-w-lg mx-4 transition-all duration-700 ${isExiting ? 'animate-scale-out' : 'animate-fade-in-up'}`}>
        <div className="glass rounded-[40px] p-8 md:p-12 border border-white/10 shadow-2xl space-y-8 relative overflow-hidden">
          {showSuccess && (
            <div className="absolute inset-0 z-10 bg-[#121212]/90 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in text-yellow-500">
              <div className="scale-150 mb-4 animate-bounce">
                <CheckCircle2 size={48} className="stroke-[2.5]" />
              </div>
              <p className="font-black uppercase tracking-widest text-sm animate-pulse">{ui.loading}</p>
            </div>
          )}

          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-[28px] bg-gradient-to-br from-yellow-400 to-orange-500 p-[1px] mb-2 shadow-[0_0_30px_rgba(255,215,0,0.2)]">
              <div className="w-full h-full rounded-[27px] bg-[#121212] flex items-center justify-center text-yellow-500">
                <ChefHat size={40} className="stroke-[1.5]" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase text-white">
              {ui.welcomeTitle}
            </h1>
            <p className="text-white/40 text-sm font-medium uppercase tracking-widest leading-none">
              {ui.welcomeSub}
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
             <div className="relative group">
              <label htmlFor="username" className="sr-only">{ui.username}</label>
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-yellow-500 transition-colors" />
              <input 
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder={ui.username}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-yellow-500/50 focus:bg-white/[0.08] transition-all"
              />
            </div>

            <div className="relative group">
              <label htmlFor="password" className="sr-only">{ui.password}</label>
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-yellow-500 transition-colors" />
              <input 
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder={ui.password}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-yellow-500/50 focus:bg-white/[0.08] transition-all"
              />
            </div>

            <div className="relative group">
              <label htmlFor="language-select" className="sr-only">{ui.language}</label>
              <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-yellow-500 transition-colors" />
              <select 
                id="language-select"
                name="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-10 text-white appearance-none focus:outline-none focus:border-yellow-500/50 focus:bg-white/[0.08] transition-all cursor-pointer"
              >
                <option value="English" className="bg-[#121212]">English (US)</option>
                <option value="Español" className="bg-[#121212]">Español</option>
              </select>
              <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
            </div>

            <button 
              type="submit"
              className="w-full h-16 bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase tracking-widest text-sm rounded-[24px] shadow-lg shadow-yellow-500/20 active:scale-[0.98] transition-all duration-300"
            >
              {ui.getStarted}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
