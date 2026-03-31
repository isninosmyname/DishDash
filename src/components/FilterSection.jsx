import { ChevronDown, Globe, Zap, Camera } from 'lucide-react';

export default function FilterSection({ 
  language, 
  setLanguage, 
  mode, 
  setMode, 
  onImageUpload,
  ui,
  modelId
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
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 px-6 mb-16">
      {filters.map((filter) => (
        <div key={filter.label} className="bg-white/5 border border-white/5 rounded-2xl p-4 md:p-6 relative group transition-all duration-300 hover:bg-white/10">
          <label htmlFor={`filter-${filter.label}`} className="block text-[10px] text-white/40 font-black uppercase tracking-widest mb-2 md:mb-3">
            {filter.label}
          </label>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 md:gap-3 w-full">
              {filter.icon}
              <select 
                id={`filter-${filter.label}`}
                value={filter.value} 
                onChange={filter.onChange}
                className="bg-transparent text-white text-[12px] md:text-sm font-bold appearance-none focus:outline-none cursor-pointer w-full pr-6"
              >
                {filter.options.map(opt => (
                  <option key={opt.value} value={opt.value} className="bg-[#121212]">{opt.label}</option>
                ))}
              </select>
            </div>
            <ChevronDown size={14} className="text-[#FFD700] absolute right-4 md:right-6 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      ))}

      {supportsVision && (
        <label htmlFor="image-upload-input" className="bg-white/5 border-2 border-dashed border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/10 hover:border-yellow-500/50 transition-all duration-300 group">
          <input id="image-upload-input" type="file" accept="image/*" className="hidden" onChange={onImageUpload} />
          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/40 group-hover:text-yellow-500 transition-colors">
            <Camera size={24} />
          </div>
          <span className="text-[10px] text-white/40 font-black uppercase tracking-widest group-hover:text-white transition-colors">{ui.filterImage}</span>
        </label>
      )}
    </div>
  );
}
