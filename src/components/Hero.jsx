import { UtensilsCrossed, Loader2 } from 'lucide-react';
import apkUrl from '../assets/DishDash-0-0-1.apk';

export default function Hero({ ingredients, setIngredients, onRoll, loading, ui }) {
  return (
    <div className="relative pt-6 md:pt-12 pb-16 px-6">

      <div className="space-y-4 mb-8 md:mb-16">
        <h1 className="text-5xl md:text-[72px] font-black leading-[1.1] md:leading-[0.9] text-white tracking-tighter">
          {ui.heroTitle}
          <span className="block text-[#FFD700]">{ui.heroKitchen}</span>
        </h1>
      </div>

      <div className="relative group w-full max-w-4xl">
        <div className="absolute inset-y-0 left-5 flex items-center text-yellow-500">
          <UtensilsCrossed size={18} className="md:w-6 md:h-6" />
        </div>
        <label htmlFor="ingredients-input" className="sr-only">
          {ui.placeholder}
        </label>
        <input
          id="ingredients-input"
          type="text"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          placeholder={ui.placeholder}
          className="w-full h-14 md:h-24 pl-10 md:pl-16 pr-24 md:pr-44 rounded-xl md:rounded-3xl bg-white/10 border border-white/5 text-xs md:text-xl placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:bg-white/15 transition-all duration-300 backdrop-blur-md"
        />
        <button
          onClick={onRoll}
          disabled={loading}
          className="absolute right-1.5 top-1.5 bottom-1.5 px-3 md:px-10 rounded-lg md:rounded-2xl bg-gradient-to-tr from-[#DEB3C4] via-[#DEB3C4] to-[#FCE38A] text-black font-black uppercase tracking-widest text-[8px] md:text-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group flex items-center gap-2 md:gap-3"
        >
          {loading ? <Loader2 size={14} className="md:w-6 md:h-6 animate-spin" /> : null}
          {loading ? ui.loading : ui.button}
          {!loading && (
            <div className="hidden md:flex w-5 h-5 bg-black/10 rounded items-center justify-center">
              <div className="w-1.5 h-1.5 flex flex-wrap gap-0.5">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="w-0.5 h-0.5 bg-black/40 rounded-full" />
                ))}
              </div>
            </div>
          )}
        </button>
      </div>

      <div className="mt-6 flex justify-center">
        <a
          href={apkUrl}
          download="DishDash-0.0.1.apk"
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all text-xs font-black uppercase tracking-widest"
        >
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          {ui.downloadAPK}
        </a>
      </div>
    </div>
  );
}
