import { useState, useEffect } from 'react'
import Markdown from 'react-markdown'

const ingredientPools = { base: ["chicken", "eggs", "rice", "pasta", "potato", "beans"], 
  veg: ["tomato", "onion", "garlic", "pepper", "carrot", "spinach"], 
  extra: ["cheese", "milk", "butter", "olive oil", "lemon", "chili"] }

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)]

const uiTranslations = {
  English: { language: "Language", button: "Roll It", loading: "Whisking...", settings: "Settings", placeholder: "Pasta, Garlic, 1 Lime...", history: "Recent", selectFav: "Select a Favorite...", addFav: "Save to Favorites", remFav: "Remove Favorite", secret: "Chef's Secret", copy: "Copy Recipe", copied: "Copied!", clear: "Clear History", health: "Health Check", analyzing: "Analyzing...", modes: { quick: "Quick", detailed: "Detailed", healthy: "Healthy", budget: "Budget" }, theme: "Theme", light: "Light", dark: "Dark", listen: "Listen", stop: "Stop", daily: 'Daily recipe' },
  Español: { language: "Idioma", button: "Cocinar", loading: "Batiendo...", settings: "Ajustes", placeholder: "Pasta, Ajo, 1 Limón...", history: "Recientes", selectFav: "Seleccionar Favorito...", addFav: "Guardar Favorito", remFav: "Eliminar Favorito", secret: "Secreto del Chef", copy: "Copiar Receta", copied: "¡Copiado!", clear: "Borrar Todo", health: "Análisis Salud", analyzing: "Analizando...", modes: { quick: "Rápido", detailed: "Detallado", healthy: "Saludable", budget: "Económico" }, theme: "Tema", light: "Claro", dark: "Oscuro", listen: "Escuchar", stop: "Parar", daily: 'Receta diaria' }

}

export default function App() {
  const [apiKey, setApiKey] = useState(localStorage.getItem('dishdash_key') || "")
  const [provider, setProvider] = useState(localStorage.getItem('dishdash_provider') || "google")
  const [modelId, setModelId] = useState(localStorage.getItem('dishdash_model') || "gemini-2.5-flash")
  const [showSettings, setShowSettings] = useState(false)
  const [ingredients, setIngredients] = useState("")
  const [recipe, setRecipe] = useState("")
  const [loading, setLoading] = useState(false)
  const [language, setLanguage] = useState("English")
  const [copyStatus, setCopyStatus] = useState(false)
  const [history, setHistory] = useState(JSON.parse(localStorage.getItem('dishdash_history')) || [])
  const [favorites, setFavorites] = useState(JSON.parse(localStorage.getItem('dishdash_favs')) || [])
  const [healthData, setHealthData] = useState(null)
  const [analyzingHealth, setAnalyzingHealth] = useState(false)
  const [mode, setMode] = useState("Quick")
  const [theme, setTheme] = useState(localStorage.getItem('dishdash_theme') || "dark")
  const [listening, setListening] = useState(false)
  const [utterance, setUtterance] = useState(null)
  const [dailyRecipe, setDailyRecipe] = useState(JSON.parse(localStorage.getItem('dishdash_daily')) || null)

  const ui = uiTranslations[language] || uiTranslations.English

  useEffect(() => {
    localStorage.setItem('dishdash_key', apiKey)
    localStorage.setItem('dishdash_provider', provider)
    localStorage.setItem('dishdash_model', modelId)
    localStorage.setItem('dishdash_history', JSON.stringify(history))
    localStorage.setItem('dishdash_favs', JSON.stringify(favorites))
    localStorage.setItem('dishdash_theme', theme)
  }, [apiKey, provider, modelId, history, favorites, theme])

  const getTodayKey = () => {
    const d = new Date()
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
  }

  const callAI = async (payload, isVision = false) => {
    if (provider === "google") {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`
      const body = isVision ? { contents: [{ parts: payload }] } : { contents: [{ parts: [{ text: payload }] }] }
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error?.message || "Google Error")
      return data.candidates[0].content.parts[0].text
    }
    const url = provider === "openai" ? "https://api.openai.com/v1/chat/completions" : "https://openrouter.ai/api/v1/chat/completions"
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
    })
    const data = await res.json()
    return data.choices[0].message.content
  }

  const generateRecipe = async (inputStr) => {
    const finalIngredients = inputStr || ingredients
    if (!finalIngredients) return
    setLoading(true)
    setHealthData(null)
    try {
      const prompt = `ROLE AND PURPOSE
You are a Michelin-star Executive Chef and Culinary Consultant. Your goal is to transform a specific list of ingredients into a high-quality recipe, strictly adhering to the requested dietary mode and output language.

INPUT VARIABLES
Ingredients: ${finalIngredients}

Output Language: ${language}

Cooking Mode: ${mode}

Context/Secret: ${ui.secret}

OPERATIONAL RULES (CRITICAL)
STRICT MODE ADHERENCE:

Quick: Maximum of 3 simple steps. Focus on speed and high heat.

Detailed: Granular step-by-step instructions including professional techniques (e.g., deglazing, emulsifying).

Healthy: Focus on steaming, grilling, or raw preparations. Minimize saturated fats and refined sugars.

Budget: Prioritize yield and the use of every part of the provided ingredients.

NO HALLUCINATIONS: Use only the ingredients provided in ${finalIngredients}. You may assume basic pantry staples (salt, pepper, water, oil) unless the mode is "Budget."

COMMUNICATION EFFICIENCY: Do not include greetings or conversational fillers. Start immediately with the recipe.

LANGUAGE: The entire output must be written in ${language}.

REASONING FRAMEWORK (MANDATORY)
Before generating the recipe, you must process the culinary logic inside a <thinking> block:

<thinking>

Analyze ${finalIngredients} and identify the lead protein/vegetable.

Evaluate how to apply ${mode} to these specific ingredients.

Determine the estimated cooking time and difficulty level.

Synthesize the ${ui.secret} into a coherent professional tip.
</thinking>

REQUIRED OUTPUT FORMAT
The response must follow this Markdown structure strictly:

[Recipe Title based on Mode and Ingredients]
Time: [X] mins
Difficulty: [Easy/Medium/Hard]

Steps
[Step 1]

[Step 2]

[Step 3/etc.]

Chef's Secret: ${ui.secret}`
      const text = await callAI(prompt)
      setRecipe(text)
      setHistory(prev => [text, ...prev].slice(0, 10))
    } catch (error) {
      setRecipe(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleHealthCheck = async () => {
    if (!recipe || !apiKey) return
    setAnalyzingHealth(true)
    try {
      const prompt = `Analyze this recipe: ${recipe}. Return ONLY a score 1-100 and 3 short bullets in ${language}. Format: SCORE: [num] \n [bullets]`
      const result = await callAI(prompt)
      const scoreMatch = result.match(/SCORE:\s*(\d+)/i)
      setHealthData({
        score: scoreMatch ? parseInt(scoreMatch[1]) : 50,
        bullets: result.replace(/SCORE:\s*\d+/i, '').trim()
      })
    } catch {
      alert("Health analysis failed")
    } finally {
      setAnalyzingHealth(false)
    }
  }

  const surpriseMe = async () => {
    if (loading) return
    if (!apiKey) {
      const picked = [
        getRandom(ingredientPools.base),
        getRandom(ingredientPools.veg),
        getRandom(ingredientPools.extra)
      ]
      const result = picked.join(", ")
      setIngredients(result)
      generateRecipe(result)
      return
    }
    setLoading(true)
    try {
      const ideaPrompt = `Give me a ${mode} recipe idea. Return ONLY ingredients as a comma-separated list. Language: ${language}`
      const idea = await callAI(ideaPrompt)
      setIngredients(idea)
      await generateRecipe(idea)
    } catch (err) {
      const picked = [
        getRandom(ingredientPools.base),
        getRandom(ingredientPools.veg),
        getRandom(ingredientPools.extra)
      ]
      const result = picked.join(", ")
      setIngredients(result)
      generateRecipe(result)
    } finally {
      setLoading(false)
    }
  }

  const generateDailyRecipe = async () => {
    if (loading) return
    const today = getTodayKey()
    const stored = JSON.parse(localStorage.getItem('dishdash_daily'))
    if (stored && stored.date === today) {
      setDailyRecipe(stored)
      setRecipe(stored.recipe)
      return
    }
    if (!apiKey) {
      alert("Add API key for daily recipes")
      return
    }
    setLoading(true)
    try {
      const prompt = `Give me a ${mode} recipe of the day. Make it popular and easy. Language: ${language} Format: # Title Time: X mins Difficulty: Easy/Medium/Hard ## Steps 1. 2. 3.`
      const text = await callAI(prompt)
      const data = { date: today, recipe: text }
      localStorage.setItem('dishdash_daily', JSON.stringify(data))
      setDailyRecipe(data)
      setRecipe(text)
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file || !apiKey) return
    setLoading(true)
    const reader = new FileReader()
    reader.onloadend = async () => {
      try {
        const base64Data = reader.result.split(',')[1]
        const visionPayload = [
          { text: "List ingredients in this image. Return ONLY comma-separated list." },
          { inline_data: { mime_type: file.type, data: base64Data } }
        ]
        const detected = await callAI(visionPayload, true)
        setIngredients(detected)
        generateRecipe(detected)
      } catch (err) {
        alert(err.message)
        setLoading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const toggleListen = () => {
    if (listening) {
      window.speechSynthesis.cancel()
      setListening(false)
    } else if (recipe) {
      const utter = new SpeechSynthesisUtterance(recipe)
      utter.lang = language === "English" ? "en-US" : "es-ES"
      utter.onend = () => setListening(false)
      setUtterance(utter)
      window.speechSynthesis.speak(utter)
      setListening(true)
    }
  }

  const getTitle = (t) => {
    if (!t) return "RECIPE"
    const lines = t.split('\n').map(l => l.trim()).filter(Boolean)
    const titleLine = lines.find(l => l.startsWith('#')) || lines[0]
    return titleLine.replace(/[#*]/g, '').trim().toUpperCase()
  }

  return (
    <div className={`${theme === 'dark' ? 'bg-[#0f172a] text-white' : 'bg-white text-black'} min-h-screen flex flex-col md:flex-row items-center justify-start p-2 md:p-4 font-mono`}>
      <div className={`w-full max-w-6xl ${theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-gray-100'} border-4 border-white shadow-[10px_10px_0px_0px_white] flex flex-col md:flex-row overflow-hidden`}>
        <div className={`${theme === 'dark' ? 'bg-[#111]' : 'bg-gray-200'} w-full md:w-64 border-b-4 md:border-b-0 md:border-r-4 border-white p-4 md:p-6 flex flex-col max-h-96 md:max-h-full overflow-y-auto`}>
          <h2 className={`${theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white'} font-black uppercase text-xs mb-4 p-2 text-center tracking-widest`}>{ui.history}</h2>
          <div className="space-y-2 flex-1 overflow-y-auto max-h-96 pr-2">
            {history.map((item, i) => (
              <div key={i} className="group relative">
                <button
                  onClick={() => { setRecipe(item); setHealthData(null) }}
                  className={`${theme === 'dark' ? 'bg-black text-white hover:bg-yellow-500 hover:text-black' : 'bg-white text-black hover:bg-yellow-500 hover:text-black'} w-full text-left text-[10px] font-black border-2 border-white/20 p-3 pr-8 truncate uppercase`}
                >
                  {getTitle(item)}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setHistory(history.filter((_, idx) => idx !== i)) }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white group-hover:text-black font-bold px-1 text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          {history.length > 0 && (
            <button
              onClick={() => setHistory([])}
              className="mt-4 border-2 border-red-600 text-red-600 p-2 text-[10px] font-black uppercase hover:bg-red-600 hover:text-white"
            >
              {ui.clear}
            </button>
          )}
        </div>

        <div className="flex-1 relative">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`absolute top-4 right-4 ${theme === 'dark' ? 'bg-black' : 'bg-gray-300'} border-2 border-white px-3 py-1 font-black text-[10px] hover:bg-yellow-500 hover:text-black uppercase z-50`}
          >
            {showSettings ? "CLOSE" : ui.settings}
          </button>

          {showSettings && (
            <div className={`absolute top-14 right-4 w-64 ${theme === 'dark' ? 'bg-[#222]' : 'bg-gray-200'} border-4 border-white p-4 z-40 shadow-[4px_4px_0px_0px_white] space-y-3`}>
              <select
                className="w-full border-2 border-white p-2 bg-black text-xs text-white"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
              >
                <option value="google">Google Gemini</option>
                <option value="openai">OpenAI</option>
                <option value="openrouter">OpenRouter</option>
              </select>
              <input
                type="password"
                placeholder="Key..."
                className="w-full border-2 border-white p-2 text-xs bg-black text-white"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <input
                type="text"
                placeholder="Model ID"
                className="w-full border-2 border-white p-2 text-xs bg-black text-white"
                value={modelId}
                onChange={(e) => setModelId(e.target.value)}
              />
              <select
                className="w-full border-2 border-white p-2 bg-black text-xs text-white"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
              >
                <option value="dark">{ui.dark}</option>
                <option value="light">{ui.light}</option>
              </select>
            </div>
          )}

          <header className={`${theme === 'dark' ? 'bg-yellow-500' : 'bg-yellow-400'} border-b-4 border-white p-10 text-center`}>
            <h1 className="text-6xl font-black italic uppercase text-white drop-shadow-[4px_4px_0px_black] tracking-tighter">DishDash</h1>
          </header>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="md:col-span-2 flex gap-2">
                <input
                  className={`flex-1 border-4 border-white p-4 font-black outline-none ${theme === 'dark' ? 'bg-transparent text-white focus:bg-[#222]' : 'bg-white text-black'}`}
                  placeholder={ui.placeholder}
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                />
                <label
                  htmlFor="ingredientImage"
                  className="border-4 border-white p-4 bg-white text-black cursor-pointer hover:bg-yellow-500 flex items-center justify-center"
                >
                  📷
                </label>
                <input type="file" accept="image/*" className="hidden" id="ingredientImage" onChange={handleImageUpload} />
              </div>

              <select
                onChange={(e) => e.target.value && setRecipe(e.target.value)}
                className={`md:col-span-1 border-4 border-white p-4 font-black text-xs h-full ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'}`}
              >
                <option value="">{ui.selectFav}</option>
                {favorites.map((fav, i) => <option key={i} value={fav}>{getTitle(fav)}</option>)}
              </select>

              <select
                className={`md:col-span-1 border-4 border-white p-4 font-black text-xs h-full ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'}`}
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="English">English</option>
                <option value="Español">Español</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <select
                className={`md:col-span-1 border-4 border-white p-4 font-black text-xs h-full ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'}`}
                value={mode}
                onChange={(e) => setMode(e.target.value)}
              >
                <option value="Quick">{ui.modes.quick}</option>
                <option value="Detailed">{ui.modes.detailed}</option>
                <option value="Healthy">{ui.modes.healthy}</option>
                <option value="Budget">{ui.modes.budget}</option>
              </select>
            </div>

            <button onClick={() => generateRecipe()} disabled={loading} className={`w-full md:w-auto ${theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white'} p-3 md:p-5 font-black uppercase text-xl md:text-3xl hover:bg-yellow-500 transition-all active:translate-y-1 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]`}>
              {loading ? ui.loading : ui.button}
            </button>

            <button
              onClick={surpriseMe}
              disabled={loading}
              className={`w-full mt-4 border-4 border-white p-5 font-black uppercase text-xl ${theme === 'dark' ? 'bg-purple-600 text-white hover:bg-yellow-500 hover:text-black' : 'bg-purple-500 text-white hover:bg-black hover:text-white'}`}
            >
              🎲
            </button>

            <button
              onClick={generateDailyRecipe}
              disabled={loading}
              className={`w-full mt-4 border-4 border-white p-5 font-black uppercase text-xl ${theme === 'dark' ? 'bg-green-600 text-white hover:bg-yellow-500 hover:text-black' : 'bg-green-500 text-white hover:bg-black hover:text-white'}`}
            >
              {dailyRecipe && (
                <div className="mb-4 text-xs font-black uppercase bg-yellow-500 text-black p-2 text-center">
                </div>
              )}
              📅 {ui.daily}
            </button>

            {recipe && (
              <div className="mt-12 border-t-4 border-white pt-8">
                <div className="flex gap-4 mb-6">
                  <button
                    onClick={() => setFavorites(prev => prev.includes(recipe) ? prev.filter(f => f !== recipe) : [recipe, ...prev])}
                    className={`border-4 border-white px-6 py-2 font-black uppercase text-xs ${favorites.includes(recipe) ? 'bg-red-600 text-white' : theme === 'dark' ? 'bg-white text-black hover:bg-yellow-500' : 'bg-black text-white hover:bg-yellow-500'}`}
                  >
                    {favorites.includes(recipe) ? ui.remFav : ui.addFav}
                  </button>
                  <button
                    onClick={() => { navigator.clipboard.writeText(recipe); setCopyStatus(true); setTimeout(() => setCopyStatus(false), 2000) }}
                    className={`border-4 px-6 py-2 font-black uppercase text-xs ${theme === 'dark' ? 'bg-blue-600 text-white hover:bg-white hover:text-black' : 'bg-blue-500 text-white hover:bg-black hover:text-white'}`}
                  >
                    {copyStatus ? ui.copied : ui.copy}
                  </button>
                  <button
                    onClick={handleHealthCheck}
                    disabled={analyzingHealth}
                    className={`border-4 px-6 py-2 font-black uppercase text-xs ${theme === 'dark' ? 'bg-green-600 text-white hover:bg-white hover:text-black' : 'bg-green-500 text-white hover:bg-black hover:text-white'}`}
                  >
                    {analyzingHealth ? ui.analyzing : ui.health}
                  </button>
                  <button
                    onClick={toggleListen}
                    className={`border-4 px-6 py-2 font-black uppercase text-xs ${theme === 'dark' ? 'bg-purple-600 text-white hover:bg-white hover:text-black' : 'bg-purple-500 text-white hover:bg-black hover:text-white'}`}
                  >
                    {listening ? ui.stop : ui.listen}
                  </button>
                </div>

                {healthData && (
                  <div className={`mb-4 border-4 p-2 md:p-4 ${theme === 'dark' ? 'border-white bg-black/60' : 'border-black bg-gray-100'}`}>
                    <div className="flex items-center gap-4 mb-2">
                      <span className="font-black text-2xl uppercase">Health Score: {healthData.score}/100</span>
                      <div className="flex-1 h-4 border-2 border-white bg-black">
                        <div
                          className="h-full transition-all duration-1000"
                          style={{ width: `${healthData.score}%`, backgroundColor: healthData.score > 70 ? '#22c55e' : healthData.score > 40 ? '#eab308' : '#ef4444' }}
                        />
                      </div>
                    </div>
                    <div className="text-[11px] leading-relaxed italic opacity-90">
                      <Markdown>{healthData.bullets}</Markdown>
                    </div>
                  </div>
                )}

                <div className="prose max-w-full text-[10px] md:text-sm md:prose-sm"><Markdown>{recipe}</Markdown></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}