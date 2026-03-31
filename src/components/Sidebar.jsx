import { Home, Heart, Clock, Settings, HelpCircle, Globe, ChevronDown, Archive, Calendar } from 'lucide-react';

export default function Sidebar({ activeTab, onNavigate, language, setLanguage, setShowSettings, ui, user }) {
  const menuItems = [
    { id: 'Home', icon: Home, label: ui.sidebar.home, section: 'home' },
    { id: 'Favorites', icon: Heart, label: ui.sidebar.favs, section: 'favorites' },
    { id: 'Pantry', icon: Archive, label: ui.sidebar.pantry, section: 'pantry' },
    { id: 'Calendar', icon: Calendar, label: ui.sidebar.calendar, section: 'calendar' },
    { id: 'Recent', icon: Clock, label: ui.sidebar.recent, section: 'recent' },
    { id: 'Settings', icon: Settings, label: ui.sidebar.settings },
  ];

  return (
    <>
      <div className="hidden md:flex w-64 bg-[#121212] border-r border-white/5 flex-col h-screen sticky top-0 shrink-0">
        <div className="p-6">
        <div className="flex items-center gap-3 mb-10">
          <img src="/logo.png" alt="DishDash Logo" className="w-10 h-10 rounded-xl shadow-[0_0_15px_rgba(255,215,0,0.3)]" />
          <h1 className="text-[#FFD700] text-2xl font-black italic tracking-tighter uppercase whitespace-nowrap">
            DishDash
          </h1>
        </div>

          <div className="mb-10 flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-black font-bold uppercase text-xs">
              {user ? user.slice(0, 2) : "MK"}
            </div>
            <div>
              <h3 className="text-white text-sm font-bold truncate max-w-[120px]">{user || ui.sidebar.profile}</h3>
            </div>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'Settings') setShowSettings(true);
                  else if (item.section) onNavigate(item.section);
                }}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  activeTab === item.id 
                    ? 'bg-gradient-to-r from-yellow-500/20 to-transparent text-yellow-500 border-r-2 border-yellow-500' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon size={20} className={activeTab === item.id ? 'stroke-[2.5px]' : 'stroke-2'} />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="md:hidden fixed bottom-4 left-4 right-4 z-[100]">
        <nav className="bg-[#18181A] rounded-3xl p-2 flex items-center justify-between shadow-2xl border border-white/10 overflow-x-auto scrollbar-hide">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'Settings') setShowSettings(true);
                else if (item.section) onNavigate(item.section);
              }}
              className={`p-3 shrink-0 rounded-2xl transition-all ${
                activeTab === item.id 
                  ? 'bg-yellow-500 text-black shadow-md scale-105' 
                  : 'text-white/50 hover:text-white'
              }`}
            >
              <item.icon size={22} className={activeTab === item.id ? 'stroke-[2.5px]' : 'stroke-2'} />
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
