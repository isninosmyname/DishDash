import { Clock, Trash2, Heart } from 'lucide-react';

export default function RecipeList({ title, subtitle, items, onSelect, onDelete, emptyMessage, type = 'history' }) {
  const getTitle = (t) => {
    if (!t) return "RECIPE";
    const lines = t.split('\n').map(l => l.trim()).filter(Boolean);
    const titleLine = lines.find(l => l.startsWith('#')) || lines[0];
    return titleLine.replace(/[#*]/g, '').trim();
  };

  if (items.length === 0) {
    return (
      <div className="px-6 pb-20 animate-fade-in text-center pt-20">
        <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
          <Clock size={32} className="text-white/20" />
        </div>
        <h2 className="text-xl md:text-2xl font-black text-white/40 uppercase tracking-widest">{emptyMessage || "No Items"}</h2>
      </div>
    );
  }

  return (
    <div className="px-6 pb-20 animate-fade-in text-left">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-2xl md:text-4xl font-black tracking-tighter mb-2 italic">{title}</h2>
          <p className="text-white/40 text-[10px] md:text-sm font-medium uppercase tracking-widest">{subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pb-6">
        {items.map((item, i) => (
          <div 
            key={i} 
            className="group relative w-full"
          >
            <div 
              onClick={() => onSelect(item)}
              className="bg-white/5 border border-white/5 rounded-[32px] p-6 flex items-center gap-6 cursor-pointer hover:bg-white/10 transition-all duration-300"
            >
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${type === 'favorites' ? 'from-pink-500 to-purple-600' : 'from-orange-400 to-yellow-600'} flex items-center justify-center p-3`}>
                <img src="/placeholder-thumb.png" alt="recipe" className="w-full h-full object-cover rounded-lg group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex-1 overflow-hidden">
                <h3 className="text-white font-black text-lg mb-1 truncate">{getTitle(item)}</h3>
                <p className="text-white/40 text-xs font-medium uppercase tracking-widest flex items-center gap-2">
                  {type === 'favorites' ? <Heart size={12} className="fill-current" /> : <Clock size={12} />}
                  {type === 'favorites' ? 'Saved' : 'Recent'} • Quick
                </p>
              </div>
            </div>
            
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(i); }}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all duration-300"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
