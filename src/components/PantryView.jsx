import { useState } from 'react';
import { Plus, X, Check, Archive, Info } from 'lucide-react';

const COMMON_STAPLES = {
  English: [
    "Salt", "Black Pepper", "Olive Oil", "Vegetable Oil", "Garlic", "Onions", 
    "Flour", "Sugar", "Butter", "Eggs", "Milk", "Rice", "Pasta", "Soy Sauce"
  ],
  Español: [
    "Sal", "Pimienta Negra", "Aceite de Oliva", "Aceite Vegetal", "Ajo", "Cebollas", 
    "Harina", "Azúcar", "Mantequilla", "Huevos", "Leche", "Arroz", "Pasta", "Salsa de Soja"
  ]
};

export default function PantryView({ pantry, setPantry, language, ui }) {
  const [customItem, setCustomItem] = useState("");
  
  const staples = COMMON_STAPLES[language] || COMMON_STAPLES.English;
  const currentPantry = pantry ? pantry.split(',').map(i => i.trim()).filter(Boolean) : [];

  const toggleItem = (item) => {
    let newItems;
    if (currentPantry.includes(item)) {
      newItems = currentPantry.filter(i => i !== item);
    } else {
      newItems = [...currentPantry, item];
    }
    setPantry(newItems.join(', '));
  };

  const addCustom = (e) => {
    e.preventDefault();
    if (!customItem) return;
    if (!currentPantry.includes(customItem)) {
      setPantry(currentPantry.concat(customItem).join(', '));
    }
    setCustomItem("");
  };

  return (
    <div className="p-6 md:p-12 max-w-6xl mx-auto animate-fade-in">
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500">
            <Archive size={24} />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight uppercase italic">{ui.sidebar.pantry}</h1>
            <p className="text-white/40 text-sm font-medium uppercase tracking-widest">{language === 'Español' ? 'Ingredientes que siempre tienes' : 'Ingredients you always have in stock'}</p>
          </div>
        </div>
        
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 flex items-start gap-4 max-w-2xl">
          <Info className="text-yellow-500 shrink-0 mt-1" size={18} />
          <p className="text-xs text-yellow-500/80 leading-relaxed font-medium">
            {language === 'Español' 
              ? 'La IA asumirá que estos ingredientes están disponibles para todas tus recetas. ¡No necesitas escribirlos cada vez!' 
              : 'The AI will assume these ingredients are available for all your recipes. No need to type them every time!'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-10">
          <section>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/30 mb-6 flex items-center gap-2">
              <span className="w-8 h-px bg-white/10"></span>
              {language === 'Español' ? 'Básicos de Cocina' : 'Common Staples'}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {staples.map(item => (
                <button
                  key={item}
                  onClick={() => toggleItem(item)}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
                    currentPantry.includes(item)
                      ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500'
                      : 'bg-white/5 border-white/5 text-white/40 hover:border-white/10'
                  }`}
                >
                  <span className="text-sm font-bold">{item}</span>
                  {currentPantry.includes(item) && <Check size={16} />}
                </button>
              ))}
            </div>
          </section>

          <section className="p-8 rounded-[32px] bg-white/5 border border-white/5">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/30 mb-6">
              {language === 'Español' ? 'Tu Despensa Actual' : 'Your Current Pantry'}
            </h3>
            <div className="flex flex-wrap gap-2">
              {currentPantry.length === 0 ? (
                <p className="text-white/20 text-sm italic">{language === 'Español' ? 'Tu despensa está vacía...' : 'Your pantry is empty...'}</p>
              ) : (
                currentPantry.map(item => (
                  <div key={item} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-wider">
                    {item}
                    <button onClick={() => toggleItem(item)} className="text-white/40 hover:text-red-500 transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <div className="p-8 rounded-[32px] bg-gradient-to-br from-yellow-500 to-orange-600 text-black shadow-xl">
            <h3 className="text-lg font-black uppercase tracking-tight mb-2">
              {language === 'Español' ? 'Añadir Extra' : 'Add Custom'}
            </h3>
            <p className="text-black/60 text-xs font-bold uppercase tracking-widest mb-6">
              {language === 'Español' ? 'Ingredientes únicos' : 'Unique ingredients'}
            </p>
            <form onSubmit={addCustom} className="space-y-4">
              <input 
                type="text" 
                value={customItem}
                onChange={(e) => setCustomItem(e.target.value)}
                placeholder={language === 'Español' ? 'Ej: Curry, Miel...' : 'e.g. Curry, Honey...'}
                className="w-full h-14 px-4 rounded-xl bg-black/10 border border-black/10 placeholder:text-black/30 text-sm font-bold focus:outline-none focus:bg-black/20"
              />
              <button className="w-full h-14 rounded-xl bg-black text-white font-black uppercase tracking-[0.2em] text-[10px] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                <Plus size={16} />
                {language === 'Español' ? 'Añadir' : 'Add to Pantry'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
