import { useState, useEffect } from 'react'
import Markdown from 'react-markdown'

const uiTranslations = {
  English: {
    language: "Language", button: "Roll It", loading: "Whisking...",
    settings: "Settings", placeholder: "Pasta, Garlic, 1 Lime...",
    history: "Recent", selectFav: "Select a Favorite...",
    addFav: "Save to Favorites", remFav: "Remove Favorite", 
    secret: "Chef's Secret", copy: "Copy Recipe", copied: "Copied!",
    clear: "Clear History", health: "Health Check", analyzing: "Analyzing...",
    modes: {
      quick: "Quick",
      detailed: "Detailed",
      healthy: "Healthy",
      budget: "Budget"
    }
  },
  Español: {
    language: "Idioma", button: "Cocinar", loading: "Batiendo...",
    settings: "Ajustes", placeholder: "Pasta, Ajo, 1 Limón...",
    history: "Recientes", selectFav: "Seleccionar Favorito...",
    addFav: "Guardar Favorito", remFav: "Eliminar Favorito", 
    secret: "Secreto del Chef", copy: "Copiar Receta", copied: "¡Copiado!",
    clear: "Borrar Todo", health: "Análisis Salud", analyzing: "Analizando...",
    modes: {
      quick: "Rápido",
      detailed: "Detallado",
      healthy: "Saludable",
      budget: "Económico"
    }
  }
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

  const ui = uiTranslations[language] || uiTranslations.English

  useEffect(() => {
    localStorage.setItem('dishdash_key', apiKey)
    localStorage.setItem('dishdash_provider', provider)
    localStorage.setItem('dishdash_model', modelId)
    localStorage.setItem('dishdash_history', JSON.stringify(history))
    localStorage.setItem('dishdash_favs', JSON.stringify(favorites))
  }, [apiKey, provider, modelId, history, favorites])

  const callAI = async (payload, isVision = false) => {
    if (provider === "google") {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`
      const body = isVision
        ? { contents: [{ parts: payload }] }
        : { contents: [{ parts: [{ text: payload }] }] }
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error?.message || "Google Error")
      return data.candidates[0].content.parts[0].text
    }

    const url = provider === "openai"
      ? "https://api.openai.com/v1/chat/completions"
      : "https://openrouter.ai/api/v1/chat/completions"
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: modelId, messages: [{ role: "user", content: payload }] })
    })
    const data = await res.json()
    return data.choices[0].message.content
  }

  const handleHealthCheck = async () => {
    if (!recipe || !apiKey) return
    setAnalyzingHealth(true)
    try {
      const prompt = `Analyze this recipe: ${recipe}. Return ONLY a score 1-100 and 3 short bullets in ${language}. Format: SCORE: [num] \n [bullets]`
      const result = await callAI(prompt)
      const scoreMatch = result.match(/SCORE:\s*(\d+)/i)
      setHealthData({ score: scoreMatch ? parseInt(scoreMatch[1]) : 50, bullets: result.replace(/SCORE:\s*\d+/i, '').trim() })
    } catch {
      alert("Health analysis failed")
    } finally {
      setAnalyzingHealth(false)
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

  const generateRecipe = async (inputStr) => {
    const finalIngredients = inputStr || ingredients
    if (!finalIngredients) return
    setLoading(true)
    setHealthData(null)
    try {
      const prompt = `
You are a professional chef.

Ingredients: ${finalIngredients}
Language: ${language}
Mode: ${mode}

Rules based on mode:
- Quick: max 3 simple steps
- Detailed: clear, step-by-step with tips
- Healthy: lower fat, balanced ingredients
- Budget: cheap, simple ingredients

Also include:
 Time (minutes)
 Difficulty (Easy/Medium/Hard)

Format strictly:
# Recipe Title

 Time: X mins  
 Difficulty: X  

## Steps
1.
2.
3.

> **${ui.secret}:** helpful tip
`
      const text = await callAI(prompt)
      setRecipe(text)
      setHistory(prev => [text, ...prev].slice(0, 10))
    } catch (error) {
      setRecipe(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

const getTitle = (t) => {
  if (!t) return "RECIPE"
  const lines = t.split('\n').map(l => l.trim()).filter(Boolean)
  if (lines.length === 0) return "RECIPE"
  const titleLine = lines.find(l => l.startsWith('#')) || lines[0]
  return titleLine.replace(/[#*]/g, '').trim().toUpperCase()
}

  return (
    <div className="dark min-h-screen bg-[#0f172a] flex items-center justify-center p-4 font-mono text-white">
      <div className="w-full max-w-6xl bg-[#1a1a1a] border-4 border-white shadow-[10px_10px_0px_0px_white] flex flex-col md:flex-row overflow-hidden">

        <div className="w-full md:w-64 border-b-4 md:border-b-0 md:border-r-4 border-white p-6 bg-[#111] flex flex-col">
          <h2 className="font-black uppercase text-xs mb-4 bg-white text-black p-2 text-center tracking-widest">{ui.history}</h2>
          <div className="space-y-2 flex-1 overflow-y-auto max-h-96 pr-2">
            {history.map((item, i) => (
              <div key={i} className="group relative">
                <button onClick={() => { setRecipe(item); setHealthData(null) }} className="w-full text-left text-[10px] font-black border-2 border-white/20 p-3 pr-8 hover:bg-yellow-500 hover:text-black truncate bg-black uppercase">
                  {getTitle(item)}
                </button>
                <button onClick={(e) => { e.stopPropagation(); setHistory(history.filter((_, idx) => idx !== i)) }} className="absolute right-2 top-1/2 -translate-y-1/2 text-white group-hover:text-black font-bold px-1 text-xs">✕</button>
              </div>
            ))}
          </div>
          {history.length > 0 && (
            <button onClick={() => setHistory([])} className="mt-4 border-2 border-red-600 text-red-600 p-2 text-[10px] font-black uppercase hover:bg-red-600 hover:text-white">
              {ui.clear}
            </button>
          )}
        </div>

        <div className="flex-1 relative">
          <button onClick={() => setShowSettings(!showSettings)} className="absolute top-4 right-4 bg-black border-2 border-white px-3 py-1 font-black text-[10px] hover:bg-yellow-500 hover:text-black uppercase z-50">
            {showSettings ? "CLOSE" : ui.settings}
          </button>

          {showSettings && (
            <div className="absolute top-14 right-4 w-64 bg-[#222] border-4 border-white p-4 z-40 shadow-[4px_4px_0px_0px_white] space-y-3">
              <select className="w-full border-2 border-white p-2 bg-black text-xs" value={provider} onChange={(e) => setProvider(e.target.value)}>
                <option value="google">Google Gemini</option>
                <option value="openai">OpenAI</option>
                <option value="openrouter">OpenRouter</option>
              </select>
              <input type="password" placeholder="Key..." className="w-full border-2 border-white p-2 text-xs bg-black" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
              <input type="text" placeholder="Model ID" className="w-full border-2 border-white p-2 text-xs bg-black" value={modelId} onChange={(e) => setModelId(e.target.value)} />
            </div>
          )}

          <header className="bg-yellow-500 border-b-4 border-white p-10 text-center">
            <h1 className="text-6xl font-black italic uppercase text-white tracking-tighter drop-shadow-[4px_4px_0px_black]">DishDash</h1>
          </header>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="md:col-span-2 flex gap-2">
                <input className="flex-1 border-4 border-white p-4 font-black bg-transparent outline-none focus:bg-[#222]" placeholder={ui.placeholder} value={ingredients} onChange={(e) => setIngredients(e.target.value)} />
                <label className="border-4 border-white p-4 bg-white text-black cursor-pointer hover:bg-yellow-500 flex items-center justify-center">
                  📷
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>

              <select onChange={(e) => e.target.value && setRecipe(e.target.value)} className="md:col-span-1 border-4 border-white p-4 font-black bg-black text-xs h-full">
                <option value="">{ui.selectFav}</option>
                {favorites.map((fav, i) => <option key={i} value={fav}>{getTitle(fav)}</option>)}
              </select>

              <select className="md:col-span-1 border-4 border-white p-4 font-black bg-black text-xs h-full" value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="English">English</option>
                <option value="Español">Español</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <select
                className="md:col-span-1 border-4 border-white p-4 font-black bg-black text-xs h-full"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
              >
                <option value="Quick">{ui.modes.quick}</option>
                <option value="Detailed">{ui.modes.detailed}</option>
                <option value="Healthy">{ui.modes.healthy}</option>
                <option value="Budget">{ui.modes.budget}</option>
              </select>
            </div>

            <button onClick={() => generateRecipe()} disabled={loading} className="w-full bg-white text-black p-5 font-black uppercase text-3xl hover:bg-yellow-500 transition-all active:translate-y-1 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)]">
              {loading ? ui.loading : ui.button}
            </button>

            {recipe && (
              <div className="mt-12 border-t-4 border-white pt-8">
                <div className="flex gap-4 mb-6">
                  <button onClick={() => setFavorites(prev => prev.includes(recipe) ? prev.filter(f => f !== recipe) : [recipe, ...prev])}
                    className={`border-4 border-white px-6 py-2 font-black uppercase text-xs ${favorites.includes(recipe) ? 'bg-red-600 text-white' : 'bg-white text-black hover:bg-yellow-500'}`}>
                    {favorites.includes(recipe) ? ui.remFav : ui.addFav}
                  </button>
                  <button onClick={() => { navigator.clipboard.writeText(recipe); setCopyStatus(true); setTimeout(() => setCopyStatus(false), 2000); }}
                    className="bg-blue-600 border-4 border-white px-6 py-2 font-black uppercase text-xs hover:bg-white hover:text-black">
                    {copyStatus ? ui.copied : ui.copy}
                  </button>
                  <button onClick={handleHealthCheck} disabled={analyzingHealth} className="bg-green-600 border-4 border-white px-6 py-2 font-black uppercase text-xs hover:bg-white hover:text-black">
                    {analyzingHealth ? ui.analyzing : ui.health}
                  </button>
                </div>

                {healthData && (
                  <div className="mb-6 border-4 border-white p-4 bg-black/60 animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="font-black text-2xl uppercase">Health Score: {healthData.score}/100</span>
                      <div className="flex-1 h-4 border-2 border-white bg-black">
                        <div className="h-full transition-all duration-1000" style={{ width: `${healthData.score}%`, backgroundColor: healthData.score > 70 ? '#22c55e' : healthData.score > 40 ? '#eab308' : '#ef4444' }} />
                      </div>
                    </div>
                    <div className="text-[11px] leading-relaxed italic opacity-90"><Markdown>{healthData.bullets}</Markdown></div>
                  </div>
                )}

                <div className="prose prose-invert max-w-none prose-p:text-yellow-500 prose-headings:font-black border-4 border-white/10 p-6 bg-black/40">
                  <Markdown>{recipe}</Markdown>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}