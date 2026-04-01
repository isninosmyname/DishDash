import { Calendar, X, Sparkles, ChefHat, Heart } from 'lucide-react';

const DAYS = {
  English: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  Español: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
};

export default function CalendarView({ mealPlan, setMealPlan, favorites, setRecipe, language, ui, onGenerateWeek }) {
  const days = DAYS[language] || DAYS.English;

  const removeFromPlan = (day, index) => {
    const newPlan = { ...mealPlan };
    newPlan[day] = newPlan[day].filter((_, i) => i !== index);
    setMealPlan(newPlan);
  };

  const addToPlan = (day, recipe) => {
    const newPlan = { ...mealPlan };
    if (!newPlan[day]) newPlan[day] = [];
    if (newPlan[day].length < 3) {
      newPlan[day] = [...newPlan[day], recipe];
      setMealPlan(newPlan);
    }
  };

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto animate-fade-in pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500">
            <Calendar size={24} />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight uppercase italic">{ui.sidebar.calendar}</h1>
            <p className="text-white/40 text-sm font-medium uppercase tracking-widest">
              {language === 'Español' ? 'Planifica tu semana culinaria' : 'Plan your culinary week'}
            </p>
          </div>
        </div>

        <button 
          onClick={onGenerateWeek}
          className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-yellow-500/20"
        >
          <Sparkles size={18} />
          {language === 'Español' ? 'Generar Semana con IA' : 'Generate Week with AI'}
        </button>
      </div>

      <div className="flex md:grid md:grid-cols-3 xl:grid-cols-7 gap-4 mb-12 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-6 px-6 md:mx-0 md:px-0">
        {days.map(day => (
          <div key={day} className="flex flex-col gap-4 min-w-[280px] md:min-w-0 snap-center shrink-0">
            <h3 className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-white/30 py-2 border-b border-white/5">
              {day}
            </h3>
            <div className="min-h-[200px] p-2 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-2">
              {mealPlan[day]?.map((recipeText, idx) => {
                const title = recipeText.split('\n')[0].replace('#', '').trim();
                return (
                  <div 
                    key={idx}
                    className="group relative p-3 rounded-xl bg-white/5 border border-white/10 hover:border-yellow-500/50 transition-all cursor-pointer"
                    onClick={() => setRecipe(recipeText)}
                  >
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeFromPlan(day, idx); }}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                      <X size={12} />
                    </button>
                    <p className="text-[10px] font-bold leading-tight line-clamp-2 uppercase tracking-tight">{title}</p>
                  </div>
                );
              })}
              {(!mealPlan[day] || mealPlan[day].length < 3) && (
                <div className="flex-1 flex items-center justify-center border-2 border-dashed border-white/5 rounded-xl text-white/10 italic text-[10px]">
                  {language === 'Español' ? 'Vacío' : 'Empty'}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#121212] rounded-[40px] p-8 border border-white/5">
        <h3 className="text-lg font-black uppercase tracking-tight mb-6 flex items-center gap-3">
          <Heart size={20} className="text-red-500 fill-red-500" />
          {language === 'Español' ? 'Tus Favoritos' : 'Your Favorites'}
          <span className="text-white/20 text-xs font-normal lowercase tracking-normal ml-2">
            ({language === 'Español' ? 'Toca un día para añadir' : 'Tap a day to add'})
          </span>
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {favorites.length === 0 ? (
            <p className="text-white/20 text-sm italic col-span-full">{ui.noItems}</p>
          ) : (
            favorites.map((fav, i) => (
              <div key={i} className="group relative space-y-3">
                <div className="aspect-square rounded-2xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center p-4">
                  <ChefHat size={32} className="text-white/10 group-hover:text-yellow-500/20 transition-colors" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center gap-1 p-2">
                    {days.map(day => (
                      <button 
                        key={day}
                        onClick={() => addToPlan(day, fav)}
                        className="w-full py-1 rounded-md bg-yellow-500 text-black text-[8px] font-black uppercase tracking-widest hover:bg-yellow-400"
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-[10px] font-black uppercase tracking-tight leading-tight text-center line-clamp-2">{fav.split('\n')[0].replace('#', '').trim()}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
