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
    save: "Save Recipe",
    copied: "Recipe copied to clipboard"
  },
  Español: {
    language: "Idioma",
    pantry: "¿Qué hay en la despensa?",
    button: "¡A Cocinar!",
    loading: "Mezclando...",
    settings: "Ajustes",
    placeholder: "Pasta, Ajo, 1 Limón...",
    secret: "Secreto del Chef",
    save: "Guardar Receta",
    copied: "Receta copiada al portapapeles"
  },
  Français: {
    language: "Langue",
    pantry: "Dans le garde-manger ?",
    button: "Cuisiner",
    loading: "En cuisine...",
    settings: "Paramètres",
    placeholder: "Pâtes, Ail, 1 Citron...",
    secret: "Secret du Chef",
    save: "Enregistrer la recette",
    copied: "Recette copiée dans le presse-papiers"
  }
};

export default function App() {
  const [apiKey, setApiKey] = useState(localStorage.getItem('dishdash_key') || "");
  const [showSettings, setShowSettings] = useState(false);
  const [ingredients, setIngredients] = useState("");
  const [recipe, setRecipe] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("English");

  const ui = uiTranslations[language] || uiTranslations.English;

  useEffect(() => {
    localStorage.setItem('dishdash_key', apiKey);
  }, [apiKey]);

  const dishDashMagic = async () => {
    if (!apiKey) {
      alert("Please add your API Key in Settings!");
      setShowSettings(true);
      return;
    }
    if (!ingredients) return;

    setLoading(true);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `
        You are DishDash, a master translator and minimalist chef.
        Generate a creative recipe for: ${ingredients}.
        
        STRICT RULE: The ENTIRE response must be in ${language}. 
        Do not keep any English nouns. Translate everything accurately.
        
        Format:
        # [Title in ${language}]
        *[One sentence vibe in ${language}]*
        
        ## Steps:
        1, 2, 3, 4, 5 (all in ${language})
        
        > **${ui.secret}:** [Tip in ${language}]
      `;

      const result = await model.generateContent(prompt);
      setRecipe(result.response.text());
    } catch (error) {
      console.error(error);
      setRecipe("## Error\nCheck your API key or connection status.");
    } finally {
      setLoading(false);
    }
  };

  const saveRecipe = async () => {
    if (!recipe) return;
    const shareData = {
      title: 'DishDash Recipe',
      text: recipe,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(recipe);
        alert(ui.copied);
      }
    } catch (err) {
      console.error("Save failed", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#A2B9CF] flex items-center justify-center p-4 font-mono text-black">
      <div className="w-full max-w-2xl bg-white border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
        
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="absolute top-4 right-4 bg-white border-2 border-black px-3 py-1 font-black text-[10px] hover:bg-yellow-400 z-30 transition-colors uppercase"
        >
          {showSettings ? "CLOSE" : ui.settings}
        </button>

        {showSettings && (
          <div className="absolute top-14 right-4 w-72 bg-white border-4 border-black p-4 z-40 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <input 
              type="password"
              placeholder="Gemini API Key..."
              className="w-full border-2 border-black p-2 text-xs outline-none focus:bg-yellow-50 font-bold"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
        )}

        <header className="bg-yellow-400 border-b-4 border-black p-10 text-center">
          <h1 className="text-6xl font-black italic tracking-tighter uppercase leading-none">
            DishDash
          </h1>
        </header>

        <div className="p-6 md:p-10 flex flex-col items-center">
          
          <div className="mb-8 text-center">
            <label className="block font-black uppercase text-xs mb-2 tracking-widest">{ui.language}</label>
            <select 
              className="border-4 border-black p-2 font-black text-xl bg-white cursor-pointer outline-none hover:bg-yellow-50 transition-colors appearance-none text-center px-8"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {Object.keys(uiTranslations).map(lang => <option key={lang} value={lang}>{lang}</option>)}
            </select>
          </div>

          <div className="w-full">
            <label className="block font-black uppercase text-xs mb-2 text-center tracking-widest">{ui.pantry}</label>
            <div className="flex flex-col md:flex-row gap-4">
              <input 
                className="flex-1 border-4 border-black p-4 font-black text-lg outline-none focus:bg-yellow-50 placeholder:text-gray-300"
                placeholder={ui.placeholder}
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && dishDashMagic()}
              />
              <button 
                onClick={dishDashMagic}
                disabled={loading}
                className="bg-black text-white px-8 py-4 font-black uppercase text-xl hover:bg-yellow-400 hover:text-black transition-all active:translate-x-1 active:translate-y-1 disabled:opacity-50"
              >
                {loading ? ui.loading : ui.button}
              </button>
            </div>
          </div>

          {recipe && (
            <div className="mt-12 border-t-4 border-black pt-10 w-full">
              <div className="prose prose-slate max-w-none 
                prose-headings:text-black prose-headings:font-black prose-headings:uppercase prose-headings:italic prose-headings:text-center
                prose-p:text-black prose-p:font-bold prose-p:text-center prose-p:text-lg
                prose-li:text-black prose-li:font-bold prose-li:text-lg
                prose-strong:bg-yellow-300 prose-strong:text-black
                prose-blockquote:border-l-8 prose-blockquote:border-black prose-blockquote:bg-gray-100 prose-blockquote:text-black prose-blockquote:p-6 prose-blockquote:font-black">
                <Markdown>{recipe}</Markdown>
              </div>

              <div className="mt-10 flex justify-center">
                <button 
                  onClick={saveRecipe}
                  className="bg-yellow-400 border-4 border-black px-8 py-4 font-black uppercase text-sm hover:bg-black hover:text-yellow-400 transition-all active:translate-x-1 active:translate-y-1 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                >
                  {ui.save}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}