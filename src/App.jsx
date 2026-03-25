import { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import Markdown from 'react-markdown';

const uiTranslations = {
  English: {
    language: "Language",
    pantry: "What's in the pantry?",
    button: "Roll It",
    loading: "Whisking...",
    settings: "Settings",
    placeholder: "Pasta, Garlic, 1 Lime...",
    secret: "Chef's Secret",
    save: "Share Recipe",
    copied: "Recipe copied to clipboard",
    history: "Recent",
    favorites: "Favorites",
    healthCheck: "Health Score",
    analyzing: "Analyzing...",
    clear: "Clear All",
    confirmClear: "Are you sure?",
    addFav: "♥ Save to Favorites",
    remFav: "Remove Favorite",
    selectFav: "Select a Favorite...",
    runHealth: "Run Health Check",
    provider: "Provider",
    model: "Model ID"
  },
  Español: {
    language: "Idioma",
    pantry: "¿Qué hay en la despensa?",
    button: "Cocinar",
    loading: "Batiendo...",
    settings: "Ajustes",
    placeholder: "Pasta, Ajo, 1 Limón...",
    secret: "Secreto del Chef",
    save: "Compartir Receta",
    copied: "Receta copiada al portapapeles",
    history: "Recientes",
    favorites: "Favoritos",
    healthCheck: "Puntaje de Salud",
    analyzing: "Analizando...",
    clear: "Borrar Todo",
    confirmClear: "¿Estás seguro?",
    addFav: "♥ Guardar Favorito",
    remFav: "Quitar Favorito",
    selectFav: "Seleccionar Favorito...",
    runHealth: "Analizar Salud",
    provider: "Proveedor",
    model: "ID del Modelo"
  }
};

export default function App() {
  const [apiKey, setApiKey] = useState(localStorage.getItem('dishdash_key') || "");
  const [provider, setProvider] = useState(localStorage.getItem('dishdash_provider') || "google");
  const [modelId, setModelId] = useState(localStorage.getItem('dishdash_model') || "gpt-4o-mini");
  const [showSettings, setShowSettings] = useState(false);
  const [ingredients, setIngredients] = useState("");
  const [recipe, setRecipe] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("English");
  const [history, setHistory] = useState(JSON.parse(localStorage.getItem('dishdash_history')) || []);
  const [favorites, setFavorites] = useState(JSON.parse(localStorage.getItem('dishdash_favs')) || []);
  const [healthData, setHealthData] = useState({ score: 0, analysis: "" });
  const [analyzingHealth, setAnalyzingHealth] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const ui = uiTranslations[language] || uiTranslations.English;

  useEffect(() => {
    localStorage.setItem('dishdash_key', apiKey);
    localStorage.setItem('dishdash_provider', provider);
    localStorage.setItem('dishdash_model', modelId);
  }, [apiKey, provider, modelId]);

  useEffect(() => {
    localStorage.setItem('dishdash_history', JSON.stringify(history));
    localStorage.setItem('dishdash_favs', JSON.stringify(favorites));
  }, [history, favorites]);

  const getCleanTitle = (text) => {
    if (!text || typeof text !== 'string') return "Untitled Recipe";
    const lines = text.split('\n').filter(l => l.trim() !== '');
    if (lines.length === 0) return "Untitled Recipe";
    return lines[0].replace(/[#*]/g, '').trim().toUpperCase();
  };

  const callAI = async (prompt) => {
    if (provider === "google") {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } 

    const baseUrl = provider === "openai" 
      ? "https://api.openai.com/v1/chat/completions" 
      : "https://openrouter.ai/api/v1/chat/completions";

    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        ...(provider === "openrouter" && { "HTTP-Referer": window.location.origin })
      },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!response.ok) throw new Error("API Request Failed");
    const data = await response.json();
    return data.choices[0].message.content;
  };

  const toggleFavorite = (currentRecipe) => {
    if (favorites.includes(currentRecipe)) {
      setFavorites(favorites.filter(f => f !== currentRecipe));
    } else {
      setFavorites([currentRecipe, ...favorites]);
    }
  };

  const saveRecipe = async () => {
    if (!recipe) return;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'DishDash Recipe', text: recipe, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(recipe);
        alert(ui.copied);
      }
    } catch (err) { console.error(err); }
  };

  const dishDashMagic = async () => {
    if (!apiKey) { setShowSettings(true); return; }
    if (!ingredients) return;
    setLoading(true);
    setHealthData({ score: 0, analysis: "" });
    try {
      const prompt = `Chef. Ingredients: ${ingredients}. Language: ${language}. Format: # [Title] *[Vibe]* ## Steps: 1..5 > **${ui.secret}:** [Tip]`;
      const text = await callAI(prompt);
      if (text) {
        setRecipe(text);
        setHistory(prev => [text, ...prev].slice(0, 10));
      }
    } catch (error) {
      setRecipe("Error. Check API Key, Provider, and Model ID.");
    } finally {
      setLoading(false);
    }
  };

  const analyzeHealth = async (targetRecipe) => {
    if (!apiKey || !targetRecipe) return;
    setAnalyzingHealth(true);
    try {
      const prompt = `Analyze health: ${targetRecipe}. Return ONLY: SCORE: [1-100] and ANALYSIS: [3 bullets in ${language}]. No JSON.`;
      const res = await callAI(prompt);
      const score = parseInt(res.match(/SCORE:\s*(\d+)/i)?.[1] || 50);
      const analysis = res.split(/ANALYSIS:/i)[1]?.replace(/[{}\[\]"']/g, '').trim() || res;
      setHealthData({ score, analysis });
    } catch (error) {
      setHealthData({ score: 0, analysis: "Analysis failed." });
    } finally {
      setAnalyzingHealth(false);
    }
  };

  return (
    <div className="dark min-h-screen bg-[#0f172a] flex items-center justify-center p-4 font-mono text-white">
      <div className="w-full max-w-6xl bg-[#1a1a1a] border-4 border-white shadow-[10px_10px_0px_0px_rgba(255,255,255,1)] flex flex-col md:flex-row">
        
        <div className="w-full md:w-64 border-b-4 md:border-b-0 md:border-r-4 border-white p-6 bg-[#111] flex flex-col">
          <h2 className="font-black uppercase text-xs mb-4 bg-white text-black p-2 text-center tracking-widest">{ui.history}</h2>
          <div className="space-y-3 flex-1 overflow-y-auto max-h-96 pr-2">
            {history.map((item, i) => (
              <button key={i} 
                onClick={() => { 
                  setRecipe(item); 
                  setHealthData({ score: 0, analysis: "" }); 
                }}
                className="w-full text-left text-[10px] font-black border-2 border-white p-3 hover:bg-yellow-500 hover:text-black truncate bg-black uppercase transition-colors"
              >
                {getCleanTitle(item)}
              </button>
            ))}
          </div>
          {(history.length > 0 || favorites.length > 0) && (
            <button onClick={() => confirmClear ? (setHistory([]), setFavorites([]), setConfirmClear(false)) : setConfirmClear(true)}
              className={`mt-6 border-2 border-white p-2 font-black text-[10px] uppercase ${confirmClear ? 'bg-red-500' : 'bg-black hover:bg-white hover:text-black'}`}
            >
              {confirmClear ? ui.confirmClear : ui.clear}
            </button>
          )}
        </div>

        <div className="flex-1 relative">
          <button onClick={() => setShowSettings(!showSettings)}
            className="absolute top-4 right-4 bg-black border-2 border-white px-3 py-1 font-black text-[10px] hover:bg-yellow-500 hover:text-black uppercase z-50"
          >
            {showSettings ? "CLOSE" : ui.settings}
          </button>

          {showSettings && (
            <div className="absolute top-14 right-4 w-64 bg-[#222] border-4 border-white p-4 z-40 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
              <label className="block text-[10px] font-black uppercase mb-1">{ui.provider}</label>
              <select className="w-full border-2 border-white p-2 text-xs bg-black mb-3 outline-none cursor-pointer"
                value={provider} onChange={(e) => setProvider(e.target.value)}
              >
                <option value="google">Google Gemini</option>
                <option value="openai">OpenAI</option>
                <option value="openrouter">OpenRouter</option>
              </select>

              <label className="block text-[10px] font-black uppercase mb-1">API Key</label>
              <input type="password" placeholder="Key..." className="w-full border-2 border-white p-2 text-xs bg-transparent outline-none mb-3"
                value={apiKey} onChange={(e) => setApiKey(e.target.value)}
              />

              {provider !== "google" && (
                <>
                  <label className="block text-[10px] font-black uppercase mb-1">{ui.model}</label>
                  <input type="text" placeholder="e.g. gpt-4o" className="w-full border-2 border-white p-2 text-xs bg-transparent outline-none mb-2"
                    value={modelId} onChange={(e) => setModelId(e.target.value)}
                  />
                </>
              )}
            </div>
          )}

          <header className="bg-yellow-500 border-b-4 border-white p-8 text-center">
            <h1 className="text-5xl font-black italic uppercase text-black tracking-tighter">DishDash</h1>
          </header>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="md:col-span-2">
                <input className="w-full border-4 border-white p-4 font-black text-lg bg-transparent outline-none focus:bg-[#333]"
                  placeholder={ui.placeholder} value={ingredients} onChange={(e) => setIngredients(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && dishDashMagic()}
                />
              </div>
              <div className="md:col-span-1">
                <select 
                   value=""
                   onChange={(e) => { if(e.target.value) { setRecipe(e.target.value); setHealthData({score:0, analysis:""}); }}} 
                   className="w-full border-4 border-white p-4 font-black bg-black outline-none cursor-pointer text-sm"
                >
                  <option value="">{ui.selectFav}</option>
                  {favorites.map((fav, i) => (
                    <option key={i} value={fav}>{getCleanTitle(fav)}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-1">
                <select className="w-full border-4 border-white p-4 font-black bg-transparent outline-none cursor-pointer"
                  value={language} onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="English" className="text-black">English</option>
                  <option value="Español" className="text-black">Español</option>
                </select>
              </div>
            </div>

            <button onClick={dishDashMagic} disabled={loading}
              className="w-full bg-white text-black p-5 font-black uppercase text-2xl hover:bg-yellow-500 shadow-[6px_6px_0px_0px_rgba(255,255,255,0.3)] active:translate-y-1 disabled:opacity-50"
            >
              {loading ? ui.loading : ui.button}
            </button>

            {recipe && (
              <div className="mt-12 border-t-4 border-white pt-8">
                <div className="flex flex-col md:flex-row gap-4 mb-8 justify-center">
                  <button onClick={() => toggleFavorite(recipe)}
                    className={`border-4 border-white px-6 py-3 font-black uppercase text-xs transition-all ${favorites.includes(recipe) ? 'bg-red-500 text-white' : 'bg-transparent hover:bg-white hover:text-black'}`}
                  >
                    {favorites.includes(recipe) ? ui.remFav : ui.addFav}
                  </button>
                  <button onClick={saveRecipe} className="bg-yellow-500 border-4 border-white px-6 py-3 font-black uppercase text-xs text-black hover:bg-white">
                    {ui.save}
                  </button>
                </div>
                
                <div className="mb-8 border-4 border-white p-6 bg-black">
                  <div className="flex justify-between items-end mb-4">
                    <h3 className="font-black uppercase text-sm tracking-tighter">{ui.healthCheck}</h3>
                    <span className="text-4xl font-black italic">{healthData.score}%</span>
                  </div>
                  <div className="w-full bg-[#333] border-2 border-white h-8 mb-4">
                    <div className="bg-green-500 h-full border-r-2 border-white transition-all duration-1000" style={{ width: `${healthData.score}%` }}></div>
                  </div>
                  <button onClick={() => analyzeHealth(recipe)} disabled={analyzingHealth}
                    className="w-full bg-blue-600 border-2 border-white p-2 font-black text-[10px] uppercase hover:bg-white hover:text-black mb-4 disabled:opacity-50"
                  >
                    {analyzingHealth ? ui.analyzing : ui.runHealth}
                  </button>
                  {healthData.analysis && (
                    <div className="text-[12px] font-bold leading-relaxed border-t-2 border-white pt-4">
                      <Markdown>{healthData.analysis}</Markdown>
                    </div>
                  )}
                </div>

                <div 
                  key={recipe.substring(0, 30)} 
                  className="prose prose-invert max-w-none prose-headings:font-black prose-p:font-bold prose-blockquote:bg-[#333] prose-blockquote:p-6 prose-blockquote:border-white"
                >
                  <Markdown>{recipe}</Markdown>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}