import { ChevronDown, Globe, Zap, Camera, Utensils, Loader2 } from 'lucide-react';

export default function FilterSection({ 
  language, 
  setLanguage, 
  mode, 
  setMode, 
  mealType,
  setMealType,
  onImageUpload,
  ui,
  modelId,
  loading
}) {
  const supportsVision = /gemini|gpt-4o|vision|claude-3/i.test(modelId || '');
  const filters = [
    { 
      label: ui.language.toUpperCase(), 
      value: language, 
      icon: <Globe size={18} className="text-yellow-500" />, 
      options: [
        { label: 'English (US)', value: 'English' },
        { label: 'Español', value: 'Español' }
      ],
      onChange: (e) => setLanguage(e.target.value)
    },
    { 
      label: ui.mode.toUpperCase(), 
      value: mode, 
      icon: <Zap size={18} className="text-green-500 fill-green-500" />, 
      options: [
        { label: ui.modes.quick, value: 'Quick' },
        { label: ui.modes.detailed, value: 'Detailed' },
        { label: ui.modes.healthy, value: 'Healthy' },
        { label: ui.modes.budget, value: 'Budget' }
      ],
      onChange: (e) => setMode(e.target.value)
    },
    { 
      label: ui.mealType.toUpperCase(), 
      value: mealType, 
      icon: <Utensils size={18} className="text-orange-500" />, 
      options: [
        { label: ui.mealTypes.none, value: 'None' },
        { label: ui.mealTypes.breakfast, value: 'Breakfast' },
        { label: ui.mealTypes.lunch, value: 'Lunch' },
        { label: ui.mealTypes.dinner, value: 'Dinner' }
      ],
      onChange: (e) => setMealType(e.target.value)
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 px-6 mb-16">
      {filters.map((filter) => (
        <div key={filter.label} className="bg-white/5 border border-white/5 rounded-2xl p-4 md:p-6 transition-all duration-300 hover:bg-white/10">
          <label htmlFor={`filter-${filter.label}`} className="block text-[8px] md:text-[10px] text-white/40 font-black uppercase tracking-widest mb-1.5 md:mb-3">
            {filter.label}
          </label>
          <div className="relative flex items-center w-full">
            <div className="flex items-center gap-2 md:gap-3 w-full">
              <div className="shrink-0">{filter.icon}</div>
              <select 
                id={`filter-${filter.label}`}
                value={filter.value} 
                onChange={filter.onChange}
                className="bg-transparent text-white text-[12px] md:text-sm font-bold appearance-none focus:outline-none focus:ring-0 cursor-pointer w-full pr-6"
              >
                {filter.options.map(opt => (
                  <option key={opt.value} value={opt.value} className="bg-[#121212]">{opt.label}</option>
                ))}
              </select>
            </div>
            <ChevronDown size={14} className="text-[#FFD700] absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none shrink-0" />
          </div>
        </div>
      ))}

      {supportsVision && (
        <label htmlFor="image-upload-input" className={`bg-white/5 border-2 border-dashed border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 transition-all duration-300 group ${loading ? 'opacity-50 cursor-wait pointer-events-none' : 'cursor-pointer hover:bg-white/10 hover:border-yellow-500/50'}`}>
          <input id="image-upload-input" type="file" accept="image/*" className="hidden" onChange={onImageUpload} disabled={loading} />
          <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center transition-colors ${loading ? 'text-yellow-500' : 'text-white/40 group-hover:text-yellow-500'}`}>
            {loading ? <Loader2 size={24} className="animate-spin" /> : <Camera size={24} />}
          </div>
          <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${loading ? 'text-white' : 'text-white/40 group-hover:text-white'}`}>
            {loading ? (language === 'Español' ? 'Analizando...' : 'Analyzing...') : ui.filterImage}
          </span>
        </label>
      )}
    </div>
  );
}
