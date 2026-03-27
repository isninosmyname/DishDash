import { useState, useEffect, useRef } from 'react';
import Markdown from 'react-markdown';
import Sidebar from './components/Sidebar';
import Hero from './components/Hero';
import FilterSection from './components/FilterSection';
import FeaturedCards from './components/FeaturedCards';
import RecipeList from './components/RecipeList';
import { X, Copy, Heart, Activity, Volume2, Square } from 'lucide-react';

const ingredientPools = { 
  base: ["chicken", "eggs", "rice", "pasta", "potato", "beans"], 
  veg: ["tomato", "onion", "garlic", "pepper", "carrot", "spinach"], 
  extra: ["cheese", "milk", "butter", "olive oil", "lemon", "chili"] 
};

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const uiTranslations = {
  English: { 
    language: "Language", 
    button: "Roll It", 
    loading: "Whisking...", 
    settings: "Settings", 
    placeholder: "Pasta, Garlic, 1 Lime...", 
    history: "Recent", 
    selectFav: "Select a Favorite...", 
    addFav: "Save to Favorites", 
    remFav: "Remove Favorite", 
    secret: "Chef's Secret", 
    copy: "Copy Recipe", 
    copied: "Copied!", 
    clear: "Clear History", 
    health: "Health Check", 
    analyzing: "Analyzing...", 
    modes: { quick: "Quick", detailed: "Detailed", healthy: "Healthy", budget: "Budget" }, 
    theme: "Theme", 
    light: "Light", 
    dark: "Dark", 
    listen: "Listen", 
    stop: "Stop", 
    daily: 'Daily recipe',
    heroTitle: "What's in your",
    heroKitchen: "Kitchen?",
    featuredRandom: { type: "DISCOVERY", title: "Random Recipe", desc: "Feeling adventurous? Let our algorithm pick a wild card ingredient fusion for you." },
    featuredDaily: { type: "DAILY FRESH", title: "Daily Recipe", desc: "Chef's curated pick of the day focusing on seasonal greens." },
    favTitle: "Your Favorites",
    favSub: "Recipes you've hand-picked for greatness",
    recentTitle: "Recent Inventions",
    recentSub: "Your past culinary creations and searches",
    recipeHeading: "Your Recipe",
    craftedBy: "Crafted by DishDash AI",
    healthHeading: "Health Analysis",
    scoreLabel: "SCORE",
    sidebar: { home: "Home", favs: "Favorites", recent: "Recent Searches", settings: "Settings", profile: "Chef's Table" },
    filterImage: "IMAGE UPLOAD"
  },
  Español: { 
    language: "Idioma", 
    button: "Cocinar", 
    loading: "Batiendo...", 
    settings: "Ajustes", 
    placeholder: "Pasta, Ajo, 1 Limón...", 
    history: "Recientes", 
    selectFav: "Seleccionar Favorito...", 
    addFav: "Guardar Favorito", 
    remFav: "Eliminar Favorito", 
    secret: "Secreto del Chef", 
    copy: "Copiar Receta", 
    copied: "¡Copiado!", 
    clear: "Borrar Todo", 
    health: "Análisis Salud", 
    analyzing: "Analizando...", 
    modes: { quick: "Rápido", detailed: "Detallado", healthy: "Saludable", budget: "Económico" }, 
    theme: "Tema", 
    light: "Claro", 
    dark: "Oscuro", 
    listen: "Escuchar", 
    stop: "Parar", 
    daily: 'Receta diaria',
    heroTitle: "¿Qué hay en tu",
    heroKitchen: "Cocina?",
    featuredRandom: { type: "DESCUBRIR", title: "Receta Aleatoria", desc: "¿Te atreves? Deja que nuestro algoritmo elija una fusión de ingredientes salvaje." },
    featuredDaily: { type: "FRESCO DIARIO", title: "Receta del Día", desc: "La selección del chef enfocada en ingredientes de temporada." },
    favTitle: "Tus Favoritos",
    favSub: "Recetas elegidas a mano por ti",
    recentTitle: "Inventos Recientes",
    recentSub: "Tus creaciones culinarias y búsquedas pasadas",
    recipeHeading: "Tu Receta",
    craftedBy: "Creado por DishDash AI",
    healthHeading: "Análisis de Salud",
    scoreLabel: "PUNTOS",
    sidebar: { home: "Inicio", favs: "Favoritos", recent: "Búsquedas", settings: "Ajustes", profile: "Mesa del Chef" },
    filterImage: "SUBIR IMAGEN"
  }
};

export default function App() {
  const [apiKey, setApiKey] = useState(localStorage.getItem('dishdash_key') || "");
  const [provider, setProvider] = useState(localStorage.getItem('dishdash_provider') || "google");
  const [modelId, setModelId] = useState(localStorage.getItem('dishdash_model') || "gemini-2.0-flash");
  const [showSettings, setShowSettings] = useState(false);
  const [ingredients, setIngredients] = useState("");
  const [recipe, setRecipe] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("English");
  const [copyStatus, setCopyStatus] = useState(false);
  const [history, setHistory] = useState(JSON.parse(localStorage.getItem('dishdash_history')) || []);
  const [favorites, setFavorites] = useState(JSON.parse(localStorage.getItem('dishdash_favs')) || []);
  const [healthData, setHealthData] = useState(null);
  const [analyzingHealth, setAnalyzingHealth] = useState(false);
  const [mode, setMode] = useState("Quick");
  const [theme, setTheme] = useState(localStorage.getItem('dishdash_theme') || "dark");
  const [listening, setListening] = useState(false);
  const [utterance, setUtterance] = useState(null);
  const [dailyRecipe, setDailyRecipe] = useState(JSON.parse(localStorage.getItem('dishdash_daily')) || null);
  const [activeTab, setActiveTab] = useState('Home');

  const mainContentRef = useRef(null);

  const ui = uiTranslations[language] || uiTranslations.English;

  useEffect(() => {
    localStorage.setItem('dishdash_key', apiKey);
    localStorage.setItem('dishdash_provider', provider);
    localStorage.setItem('dishdash_model', modelId);
    localStorage.setItem('dishdash_history', JSON.stringify(history));
    localStorage.setItem('dishdash_favs', JSON.stringify(favorites));
    localStorage.setItem('dishdash_theme', theme);
  }, [apiKey, provider, modelId, history, favorites, theme]);

  const callAI = async (payload, isVision = false) => {
    if (provider === "google") {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;
      const body = isVision ? { contents: [{ parts: payload }] } : { contents: [{ parts: [{ text: payload }] }] };
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Google Error");
      return data.candidates[0].content.parts[0].text;
    }
    const url = provider === "openai" ? "https://api.openai.com/v1/chat/completions" : "https://openrouter.ai/api/v1/chat/completions";
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: "user", content: payload }]
      })
    });
    const data = await res.json();
    return data.choices[0].message.content;
  };

  const generateRecipe = async (inputStr) => {
    const finalIngredients = inputStr || ingredients;
    if (!finalIngredients) return;
    setLoading(true);
    setHealthData(null);
    try {
      const prompt = `ROLE: Michelin-star Chef. \nINGREDIENTS: ${finalIngredients} \nMODE: ${mode} \nLANGUAGE: ${language} \nCONTEXT: ${ui.secret} \nFormat: # [Title] \nTime: [X] mins \nDifficulty: [E/M/H] \n## Steps \n1...`;
      const text = await callAI(prompt);
      setRecipe(text);
      setHistory(prev => [text, ...prev].slice(0, 10));
    } catch (error) {
      setRecipe(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleHealthCheck = async () => {
    if (!recipe || !apiKey) return;
    setAnalyzingHealth(true);
    try {
      const prompt = `Analyze this recipe: ${recipe}. Return ONLY a score 1-100 and 3 short bullets in ${language}. Format: SCORE: [num] \n [bullets]`;
      const result = await callAI(prompt);
      const scoreMatch = result.match(/SCORE:\s*(\d+)/i);
      setHealthData({
        score: scoreMatch ? parseInt(scoreMatch[1]) : 50,
        bullets: result.replace(/SCORE:\s*\d+/i, '').trim()
      });
    } catch {
      alert("Health analysis failed");
    } finally {
      setAnalyzingHealth(false);
    }
  };

  const surpriseMe = async () => {
    const picked = [getRandom(ingredientPools.base), getRandom(ingredientPools.veg), getRandom(ingredientPools.extra)];
    const result = picked.join(", ");
    setIngredients(result);
    generateRecipe(result);
  };

  const generateDailyRecipe = async () => {
    const today = new Date().toDateString();
    if (dailyRecipe && dailyRecipe.date === today) {
      setRecipe(dailyRecipe.recipe);
      return;
    }
    setLoading(true);
    try {
      const prompt = `Daily special recipe idea (${mode}). Language: ${language}`;
      const text = await callAI(prompt);
      const data = { date: today, recipe: text };
      setDailyRecipe(data);
      localStorage.setItem('dishdash_daily', JSON.stringify(data));
      setRecipe(text);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !apiKey) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      setLoading(true);
      try {
        const base64Data = reader.result.split(',')[1];
        const visionPayload = [
          { text: "List ingredients in this image." },
          { inline_data: { mime_type: file.type, data: base64Data } }
        ];
        const detected = await callAI(visionPayload, true);
        setIngredients(detected);
        generateRecipe(detected);
      } catch (err) {
        alert(err.message);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleListen = () => {
    if (listening) {
      window.speechSynthesis.cancel();
      setListening(false);
    } else if (recipe) {
      const utter = new SpeechSynthesisUtterance(recipe);
      utter.lang = language === "English" ? "en-US" : "es-ES";
      utter.onend = () => setListening(false);
      setUtterance(utter);
      window.speechSynthesis.speak(utter);
      setListening(true);
    }
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveTab(id === 'home' ? 'Home' : id === 'favorites' ? 'Favorites' : 'Recent');
    }
  };

  return (
    <div className="flex bg-[#0A0A0A] min-h-screen text-white font-sans selection:bg-yellow-500/30">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        onNavigate={scrollToSection}
        language={language} 
        setLanguage={setLanguage}
        setShowSettings={setShowSettings}
        ui={ui}
      />

      <main className="flex-1 overflow-y-auto pb-32 md:pb-0" ref={mainContentRef}>
        <div id="home">
          <Hero 
            ingredients={ingredients} 
            setIngredients={setIngredients} 
            onRoll={() => generateRecipe()} 
            loading={loading}
            ui={ui}
          />

          <FilterSection 
            language={language}
            setLanguage={setLanguage}
            mode={mode}
            setMode={setMode}
            onImageUpload={handleImageUpload}
            ui={ui}
          />

          <FeaturedCards 
            onRandom={surpriseMe}
            onDaily={generateDailyRecipe}
            ui={ui}
          />
        </div>

        <div id="favorites">
          <RecipeList 
            title={ui.favTitle}
            subtitle={ui.favSub}
            items={favorites}
            onSelect={setRecipe}
            onDelete={(index) => setFavorites(prev => prev.filter((_, i) => i !== index))}
            type="favorites"
          />
        </div>

        <div id="recent">
          <RecipeList 
            title={ui.recentTitle}
            subtitle={ui.recentSub}
            items={history}
            onSelect={setRecipe}
            onDelete={(index) => setHistory(prev => prev.filter((_, i) => i !== index))}
            type="history"
          />
        </div>

        {recipe && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fade-in">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setRecipe("")} />
            <div className="relative w-full max-w-4xl max-h-[90vh] glass rounded-[32px] md:rounded-[40px] overflow-hidden flex flex-col shadow-2xl mx-4 md:mx-0">
              <div className="p-6 md:p-10 border-b border-white/10 flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <img src="/logo.png" alt="Logo" className="w-12 h-12 rounded-xl shadow-[0_0_15px_rgba(255,215,0,0.2)]" />
                  <div>
                    <h2 className="text-2xl md:text-4xl font-black tracking-tighter mb-1 italic text-yellow-500 uppercase">
                      {ui.recipeHeading}
                    </h2>
                    <p className="text-white/40 text-[10px] md:text-sm font-medium uppercase tracking-widest">
                      {ui.craftedBy} • {mode} Mode
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setRecipe("")}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all text-white/60 hover:text-white"
                >
                  <X size={20} className="md:w-6 md:h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 md:space-y-8 custom-scrollbar">
                <div className="flex gap-3 md:gap-4 flex-wrap">
                  <button
                    onClick={() => setFavorites(prev => prev.includes(recipe) ? prev.filter(f => f !== recipe) : [recipe, ...prev])}
                    className={`flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all ${
                      favorites.includes(recipe) ? 'bg-red-500 text-white' : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                    }`}
                  >
                    <Heart size={14} className="md:w-4 md:h-4" fill={favorites.includes(recipe) ? "currentColor" : "none"} />
                    <span className="hidden xs:inline">{favorites.includes(recipe) ? ui.remFav : ui.addFav}</span>
                  </button>
                  
                  <button
                    onClick={() => { navigator.clipboard.writeText(recipe); setCopyStatus(true); setTimeout(() => setCopyStatus(false), 2000) }}
                    className="flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 text-white font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-white/10"
                  >
                    <Copy size={14} className="md:w-4 md:h-4" />
                    <span className="hidden xs:inline">{copyStatus ? ui.copied : ui.copy}</span>
                  </button>

                  <button
                    onClick={handleHealthCheck}
                    disabled={analyzingHealth}
                    className="flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl bg-green-500/20 border border-green-500/20 text-green-500 font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-green-500/30"
                  >
                    <Activity size={14} className="md:w-4 md:h-4" />
                    <span className="hidden xs:inline">{analyzingHealth ? ui.analyzing : ui.health}</span>
                  </button>

                  <button
                    onClick={toggleListen}
                    className="flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl bg-purple-500/20 border border-purple-500/20 text-purple-400 font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-purple-500/30"
                  >
                    {listening ? <Square size={14} className="md:w-4 md:h-4" /> : <Volume2 size={14} className="md:w-4 md:h-4" />}
                    <span className="hidden xs:inline">{listening ? ui.stop : ui.listen}</span>
                  </button>
                </div>

                {healthData && (
                  <div className="p-6 md:p-8 rounded-[24px] md:rounded-[32px] bg-white/5 border border-white/10 animate-fade-in">
                    <div className="flex items-center gap-4 md:gap-6 mb-4 md:mb-6">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl bg-green-500/20 flex flex-col items-center justify-center border border-green-500/20 shadow-inner">
                        <span className="text-2xl md:text-3xl font-black text-green-500">{healthData.score}</span>
                        <span className="text-[7px] md:text-[8px] font-black text-green-500/60 tracking-widest uppercase">{ui.scoreLabel}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-black text-base md:text-lg mb-1 md:mb-2 uppercase tracking-tight">{ui.healthHeading}</h4>
                        <div className="w-full h-1.5 md:h-2 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500 transition-all duration-1000 shadow-[0_0_10px_rgba(34,197,94,0.5)]" 
                            style={{ width: `${healthData.score}%` }} 
                          />
                        </div>
                      </div>
                    </div>
                    <div className="prose prose-invert prose-xs md:prose-sm max-w-none text-white/60">
                      <Markdown>{healthData.bullets}</Markdown>
                    </div>
                  </div>
                )}

                <div className="prose prose-invert prose-lg max-w-none recipe-content select-text">
                  <Markdown>{recipe}</Markdown>
                </div>
              </div>
            </div>
          </div>
        )}

        {showSettings && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-fade-in">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowSettings(false)} />
            <div className="relative w-full max-w-md glass rounded-[32px] p-8 space-y-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-black tracking-tight uppercase">Settings</h3>
                <button onClick={() => setShowSettings(false)} className="text-white/40 hover:text-white"><X size={20} /></button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="settings-provider" className="block text-[10px] text-white/40 font-black uppercase tracking-widest mb-2">Provider</label>
                  <select
                    id="settings-provider"
                    className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-yellow-500"
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                  >
                    <option value="google">Google Gemini</option>
                    <option value="openai">OpenAI</option>
                    <option value="openrouter">OpenRouter</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="settings-apikey" className="block text-[10px] text-white/40 font-black uppercase tracking-widest mb-2">API Key</label>
                  <input
                    id="settings-apikey"
                    type="password"
                    placeholder="Enter API Key"
                    className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-yellow-500"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="settings-model" className="block text-[10px] text-white/40 font-black uppercase tracking-widest mb-2">Model ID</label>
                  <input
                    id="settings-model"
                    type="text"
                    placeholder="e.g. gemini-2.0-flash"
                    className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-yellow-500"
                    value={modelId}
                    onChange={(e) => setModelId(e.target.value)}
                  />
                </div>
              </div>

              <button 
                onClick={() => setShowSettings(false)}
                className="w-full h-14 rounded-2xl bg-yellow-500 text-black font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Save Settings
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}