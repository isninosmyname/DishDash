import { Sparkles, Soup, ArrowRight } from 'lucide-react';

export default function FeaturedCards({ onRandom, onDaily, ui, loading }) {
  const cards = [
    {
      type: ui.featuredRandom.type,
      title: ui.featuredRandom.title,
      description: ui.featuredRandom.desc,
      image: '/random-recipe.png',
      bgColor: 'bg-[#5B2A4B]',
      btnText: ui.button,
      btnColor: 'bg-[#DEB3C4] text-[#5B2A4B]',
      onClick: onRandom,
      icon: <Sparkles size={16} />
    },
    {
      type: ui.featuredDaily.type,
      title: ui.featuredDaily.title,
      description: ui.featuredDaily.desc,
      image: '/daily-recipe.png',
      bgColor: 'bg-[#4B5E4A]',
      btnText: ui.button,
      btnColor: 'bg-[#2E7D32] text-white',
      onClick: onDaily,
      icon: <Soup size={16} />
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-6 mb-20">
      {cards.map((card) => (
        <div key={card.title} className={`${card.bgColor} rounded-[32px] md:rounded-[40px] overflow-hidden relative group h-[320px] md:h-[480px] ${loading ? 'opacity-80 cursor-wait pointer-events-none' : 'cursor-pointer'}`} onClick={loading ? undefined : card.onClick}>
          <img src={card.image} alt={card.title} className="absolute inset-x-0 bottom-0 w-full h-[240px] md:h-[320px] object-cover mix-blend-overlay opacity-60 group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          <div className="relative p-8 md:p-10 h-full flex flex-col justify-start items-start">
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${card.btnColor} text-[10px] font-black uppercase tracking-widest mb-6`}>
              {card.icon}
              {card.type}
            </span>
            <h2 className="text-white text-3xl md:text-5xl font-black mb-4 tracking-tighter">
              {card.title}
            </h2>
            <p className="text-white/60 text-sm md:text-lg max-w-[320px] mb-auto font-medium leading-snug">
              {card.description}
            </p>
            <button disabled={loading} className={`${card.btnColor} px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-xs md:text-sm uppercase tracking-widest flex items-center gap-3 group-hover:gap-5 transition-all duration-300`}>
              {loading ? ui.loading : card.btnText}
              {!loading && <ArrowRight size={18} />}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
