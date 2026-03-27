import { UtensilsCrossed } from 'lucide-react';

export default function Hero({ ingredients, setIngredients, onRoll, loading }) {
  return (
    <div className="relative pt-12 pb-16 px-6">

      <div className="space-y-4 mb-16">
        <h1 className="text-4xl md:text-[72px] font-black leading-[1] md:leading-[0.9] text-white tracking-tighter">
          What's in your
          <span className="block text-[#FFD700]">Kitchen?</span>
        </h1>
      </div>

      <div className="relative group w-full max-w-4xl">
        <div className="absolute inset-y-0 left-6 flex items-center text-yellow-500">
          <UtensilsCrossed size={20} className="md:w-6 md:h-6" />
        </div>
        <input
          type="text"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          placeholder="Pasta, Garlic, 1 Lime..."
          className="w-full h-16 md:h-24 pl-14 md:pl-16 pr-32 md:pr-44 rounded-2xl md:rounded-3xl bg-white/10 border border-white/5 text-base md:text-xl placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:bg-white/15 transition-all duration-300 backdrop-blur-md"
        />
        <button
          onClick={onRoll}
          disabled={loading}
          className="absolute right-2 top-2 bottom-2 px-6 md:px-10 rounded-xl md:rounded-2xl bg-gradient-to-tr from-[#DEB3C4] via-[#DEB3C4] to-[#FCE38A] text-black font-black uppercase tracking-widest text-[10px] md:text-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group flex items-center gap-2 md:gap-3"
        >
          {loading ? 'WAIT...' : 'ROLL IT'}
          <div className="hidden md:flex w-5 h-5 bg-black/10 rounded items-center justify-center">
            <div className="w-1.5 h-1.5 flex flex-wrap gap-0.5">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="w-0.5 h-0.5 bg-black/40 rounded-full" />
              ))}
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
