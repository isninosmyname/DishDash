import { useState, useEffect, useRef } from 'react';
import Markdown from 'react-markdown';
import Sidebar from './components/Sidebar';
import Hero from './components/Hero';
import FilterSection from './components/FilterSection';
import FeaturedCards from './components/FeaturedCards';
import RecipeList from './components/RecipeList';
import Onboarding from './components/Onboarding';
import Toast from './components/Toast';
import CookingMode from './components/CookingMode';
import PantryView from './components/PantryView';
import CalendarView from './components/CalendarView';
import { X, Copy, Heart, Activity, Volume2, Square, ShoppingCart, CheckCircle2, Circle, Share, Flame, ChefHat, Replace, Loader2 } from 'lucide-react';

const ingredientPools = { 
  base: ["chicken", "eggs", "rice", "pasta", "potato", "beans"], 
  veg: ["tomato", "onion", "garlic", "pepper", "carrot", "spinach"], 
  extra: ["cheese", "milk", "butter", "olive oil", "lemon", "chili"] 
};

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const cleanTextForSpeech = (text) => {
  if (!text) return '';
  return text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/~~(.*?)~~/g, '$1')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^\)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^\)]*\)/g, '$1')
    .replace(/\#{1,6}\s*/g, ' ')
    .replace(/^\s*[-*+]\s+/gm, ' ')
    .replace(/^\s*\d+[\.\)]\s+/gm, ' ')
    .replace(/\*/g, ' ')
    .replace(/\n+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
};

const isSpeechSynthesisAvailable = () => typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';

const isSpeechRecognitionAvailable = () => typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

const LANGUAGE_LOCALES = {
  English: 'en-US',
  Español: 'es-ES',
  Français: 'fr-FR',
  العربية: 'ar-SA',
  中文: 'zh-CN'
};

const HTML_LANGS = {
  English: 'en',
  Español: 'es',
  Français: 'fr',
  العربية: 'ar',
  中文: 'zh'
};

const DAYS_BY_LANGUAGE = {
  English: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  Español: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"],
  Français: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"],
  العربية: ["الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت", "الأحد"],
  中文: ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"]
};

const uiTranslations = {
  English: {
    language: "Language",
    button: "Roll It",
    loading: "Whisking...",
    settings: "Settings",
    placeholder: "Pasta, Garlic, 1 Lime...",
    mode: "Mode",
    selectFav: "Select a Favorite...",
    addFav: "Save to Favorites",
    remFav: "Remove Favorite",
    secret: "Chef's Secret",
    copy: "Copy Recipe",
    copied: "Copied to Clipboard",
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
    sidebar: { home: "Home", favs: "Favorites", recent: "Recent Searches", settings: "Settings", profile: "My Kitchen", pantry: "Pantry", calendar: "Planner" },
    filterImage: "SCAN INGREDIENTS",
    shoppingList: "Shopping List",
    generating: "Generating...",
    noItems: "No items found",
    exportNotes: "Export to Notes",
    shareError: "Sharing not supported",
    welcomeTitle: "Welcome to DishDash",
    welcomeSub: "Let's set up your kitchen",
    username: "Username",
    password: "Password",
    getStarted: "Enter Kitchen",
    fillAll: "Please fill out all fields",
    setupHint: "Please enter your API Key to start cooking!",
    startCooking: "Start Cooking",
    allergies: "Allergies",
    allergiesHint: "Peanuts, Gluten, Dairy...",
    mealType: "Meal Type",
    mealTypes: { none: "Any", breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner" },
    downloadAPK: "Download APK",
    cooking: {
      title: "Cooking Mode",
      step: "Step",
      of: "of",
      instruction: "Instruction",
      previous: "Previous",
      next: "Next Step",
      finish: "Finish",
      listening: "Listening...",
      voiceOff: "Voice Off",
      commands: ["Next", "Back", "Stop"],
      unsupported: "Voice commands are not supported in this browser."
    },
    substitute: "Substitutes",
    submitting: "Searching...",
    subTitle: "Ingredient Substitutions",
    edibleWarning: "Warning: Non-Edible Items Detected!",
    edibleDetecting: "Checking ingredients...",
    edibleDesc: "We detected items that might not be edible: ",
    edibleProceed: "Are you sure you want to proceed?",
    edibleConfirm: "Continue Anyway",
    edibleCancel: "Edit Ingredients",
    protein: "Protein",
    carbs: "Carbs",
    fats: "Fats",
    calories: "Calories",
    ttsUnsupported: "Text-to-speech is not supported in this browser.",
    noRecipeAvailable: "No recipe is available to read aloud.",
    speechPlaybackFailed: "Speech playback failed.",
    speechStartFailed: "Unable to start speech playback.",
    weeklyGenerating: "Generating your culinary week...",
    weeklyGenerated: "Weekly plan generated successfully!",
    noResponseFromAI: "No response from AI",
    weeklyParseError: "Failed to parse weekly plan",
    onboarding: {
      languageTitle: "Preferred Language",
      languageSubtitle: "Set up your culinary experience in your tongue.",
      sourceTitle: "How did you know about DishDash?",
      sourceSubtitle: "Tell us a bit about how you found your way here.",
      personalizeTitle: "Personalize Your Kitchen",
      personalizeSubtitle: "Any dietary restrictions we should know about.",
      allergiesLabel: "Allergies / Restrictions",
      allergiesPlaceholder: "Peanuts, Gluten...",
      aiTitle: "Your API Key",
      aiSubtitle: "Connect the brain of your kitchen to start cooking.",
      back: "Back",
      continue: "Continue",
      enterKitchen: "Enter Kitchen",
      skipStep: "Skip Step",
      selectSourceError: "Please select how you heard about us",
      enterApiKeyError: "Please enter your API Key",
      languageOptions: [
        { label: 'English (US)', value: 'English' },
        { label: 'Español', value: 'Español' },
        { label: 'Français', value: 'Français' },
        { label: 'العربية', value: 'العربية' },
        { label: '中文', value: '中文' }
      ],
      sources: [
        { id: 'social', label: 'Social Media', icon: '📱' },
        { id: 'friend', label: 'From a Friend', icon: '🤝' },
        { id: 'search', label: 'Search Engine', icon: '🔍' },
        { id: 'ads', label: 'Advertisement', icon: '📺' },
        { id: 'other', label: 'Other', icon: '✨' }
      ]
    },
    pantry: {
      description: "The AI will assume these ingredients are available for all your recipes. No need to type them every time!",
      commonStaples: "Common Staples",
      currentPantry: "Your Current Pantry",
      empty: "Your pantry is empty...",
      addCustom: "Add Custom",
      unique: "Unique ingredients",
      customHint: "e.g. Curry, Honey...",
      addToPantry: "Add to Pantry"
    },
    calendar: {
      subtitle: "Plan your culinary week",
      generate: "Generate Week with AI",
      empty: "Empty",
      favorites: "Your Favorites",
      tapToAdd: "Tap a day to add",
      addTo: "Add to...",
      cancel: "Cancel"
    }
  },
  Español: {
    language: "Idioma",
    button: "Cocinar",
    loading: "Batiendo...",
    settings: "Ajustes",
    placeholder: "Pasta, Ajo, 1 Limón...",
    mode: "Modo",
    selectFav: "Seleccionar Favorito...",
    addFav: "Guardar Favorito",
    remFav: "Eliminar Favorito",
    secret: "Secreto del Chef",
    copy: "Copiar Receta",
    copied: "Copiado al Portapapeles",
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
    sidebar: { home: "Inicio", favs: "Favoritos", recent: "Búsquedas", settings: "Ajustes", profile: "Mi Cocina", pantry: "Despensa", calendar: "Planificador" },
    filterImage: "ESCANEAR INGREDIENTES",
    shoppingList: "Lista de Compras",
    generating: "Generando...",
    noItems: "Sin artículos",
    exportNotes: "Exportar a Notas",
    shareError: "Compartir no disponible",
    welcomeTitle: "Bienvenido a DishDash",
    welcomeSub: "Prepara tu cocina",
    username: "Usuario",
    password: "Contraseña",
    getStarted: "Entrar a la Cocina",
    fillAll: "Por favor complete todos los campos",
    setupHint: "¡Por favor ingrese su clave API para comenzar a cocinar!",
    startCooking: "Empezar a Cocinar",
    allergies: "Alergias",
    allergiesHint: "Maníes, Gluten, Lácteos...",
    mealType: "Tipo de Comida",
    mealTypes: { none: "Cualquiera", breakfast: "Desayuno", lunch: "Almuerzo", dinner: "Cena" },
    downloadAPK: "Descargar APK",
    cooking: {
      title: "Modo Cocinar",
      step: "Paso",
      of: "de",
      instruction: "Instrucción",
      previous: "Anterior",
      next: "Siguiente",
      finish: "Finalizar",
      listening: "Escuchando...",
      voiceOff: "Voz Desactivada",
      commands: ["Siguiente", "Atrás", "Parar"],
      unsupported: "Los comandos de voz no son compatibles con este navegador."
    },
    substitute: "Sustitutos",
    submitting: "Buscando...",
    subTitle: "Sustitutos de Ingredientes",
    edibleWarning: "¡Atención: Elementos no comestibles!",
    edibleDetecting: "Verificando...",
    edibleDesc: "Detectamos elementos que podrían no ser comestibles: ",
    edibleProceed: "¿Seguro que quieres continuar?",
    edibleConfirm: "Continuar de todos modos",
    edibleCancel: "Editar Ingredientes",
    protein: "Proteína",
    carbs: "Carbs",
    fats: "Grasas",
    calories: "Calorías",
    ttsUnsupported: "La lectura en voz alta no es compatible en este navegador.",
    noRecipeAvailable: "No hay receta para leer.",
    speechPlaybackFailed: "Error al reproducir la voz.",
    speechStartFailed: "No se pudo iniciar la lectura en voz alta.",
    weeklyGenerating: "Generando tu semana culinary...",
    weeklyGenerated: "¡Semana generada con éxito!",
    noResponseFromAI: "No se recibió respuesta de la IA",
    weeklyParseError: "Error al procesar el plan de la semana",
    onboarding: {
      languageTitle: "Elige tu idioma",
      languageSubtitle: "Configura tu experiencia culinaria",
      sourceTitle: "¿Cómo nos conociste?",
      sourceSubtitle: "Cuéntanos un poco sobre tu llegada",
      personalizeTitle: "Personaliza tu Cocina",
      personalizeSubtitle: "¿Tienes alguna restricción alimentaria?",
      allergiesLabel: "Alergias / Restricciones",
      allergiesPlaceholder: "Maníes, Gluten...",
      aiTitle: "Configura tu IA",
      aiSubtitle: "Conecta el cerebro de tu cocina para comenzar a cocinar.",
      back: "Atrás",
      continue: "Continuar",
      enterKitchen: "Entrar a la Cocina",
      skipStep: "Saltar Paso",
      selectSourceError: "Por favor selecciona cómo nos conociste",
      enterApiKeyError: "Por favor ingresa tu clave API",
      languageOptions: [
        { label: 'English (US)', value: 'English' },
        { label: 'Español', value: 'Español' },
        { label: 'Français', value: 'Français' },
        { label: 'العربية', value: 'العربية' },
        { label: '中文', value: '中文' }
      ],
      sources: [
        { id: 'social', label: 'Redes Sociales', icon: '📱' },
        { id: 'friend', label: 'Por un Amigo', icon: '🤝' },
        { id: 'search', label: 'Buscador', icon: '🔍' },
        { id: 'ads', label: 'Publicidad', icon: '📺' },
        { id: 'other', label: 'Otro', icon: '✨' }
      ]
    },
    pantry: {
      description: "La IA asumirá que estos ingredientes están disponibles para todas tus recetas. ¡No necesitas escribirlos cada vez!",
      commonStaples: "Básicos de Cocina",
      currentPantry: "Tu Despensa Actual",
      empty: "Tu despensa está vacía...",
      addCustom: "Añadir Extra",
      unique: "Ingredientes únicos",
      customHint: "Ej: Curry, Miel...",
      addToPantry: "Añadir a la Despensa"
    },
    calendar: {
      subtitle: "Planifica tu semana culinaria",
      generate: "Generar Semana con IA",
      empty: "Vacío",
      favorites: "Tus Favoritos",
      tapToAdd: "Toca un día para añadir",
      addTo: "Añadir a...",
      cancel: "Cancelar"
    }
  },
  Français: {
    language: "Langue",
    button: "Cuisiner",
    loading: "Mélange...",
    settings: "Paramètres",
    placeholder: "Pâtes, Ail, 1 Citron...",
    mode: "Mode",
    selectFav: "Sélectionner un favori...",
    addFav: "Ajouter aux favoris",
    remFav: "Retirer le favori",
    secret: "Secret du Chef",
    copy: "Copier la recette",
    copied: "Copié dans le presse-papiers",
    clear: "Effacer l'historique",
    health: "Analyse Santé",
    analyzing: "Analyse...",
    modes: { quick: "Rapide", detailed: "Détaillé", healthy: "Sain", budget: "Économique" },
    theme: "Thème",
    light: "Clair",
    dark: "Sombre",
    listen: "Écouter",
    stop: "Arrêter",
    daily: 'Recette du jour',
    heroTitle: "Qu'y a-t-il dans votre",
    heroKitchen: "Cuisine ?",
    featuredRandom: { type: "DÉCOUVERTE", title: "Recette Aléatoire", desc: "Envie d'aventure? Laissez notre algorithme choisir une fusion d'ingrédients surprise." },
    featuredDaily: { type: "QUOTIDIEN", title: "Recette du Jour", desc: "Le choix du chef axé sur des ingrédients de saison." },
    favTitle: "Vos Favoris",
    favSub: "Des recettes sélectionnées avec soin pour vous",
    recentTitle: "Recettes Récentes",
    recentSub: "Vos créations culinaires et recherches passées",
    recipeHeading: "Votre Recette",
    craftedBy: "Créé par DishDash AI",
    healthHeading: "Analyse de Santé",
    scoreLabel: "SCORE",
    sidebar: { home: "Accueil", favs: "Favoris", recent: "Récentes", settings: "Paramètres", profile: "Ma Cuisine", pantry: "Garde-manger", calendar: "Planificateur" },
    filterImage: "SCANER LES INGRÉDIENTS",
    shoppingList: "Liste de Courses",
    generating: "Génération...",
    noItems: "Aucun article trouvé",
    exportNotes: "Exporter vers Notes",
    shareError: "Partage non supporté",
    welcomeTitle: "Bienvenue sur DishDash",
    welcomeSub: "Préparez votre cuisine",
    username: "Nom d'utilisateur",
    password: "Mot de passe",
    getStarted: "Entrer dans la cuisine",
    fillAll: "Veuillez remplir tous les champs",
    setupHint: "Veuillez entrer votre clé API pour commencer à cuisiner!",
    startCooking: "Commencer à cuisiner",
    allergies: "Allergies",
    allergiesHint: "Arachides, Gluten, Produits laitiers...",
    mealType: "Type de repas",
    mealTypes: { none: "N'importe", breakfast: "Petit-déjeuner", lunch: "Déjeuner", dinner: "Dîner" },
    downloadAPK: "Télécharger APK",
    cooking: {
      title: "Mode Cuisine",
      step: "Étape",
      of: "de",
      instruction: "Instruction",
      previous: "Précédent",
      next: "Étape suivante",
      finish: "Terminer",
      listening: "Écoute...",
      voiceOff: "Voix désactivée",
      commands: ["Suivant", "Retour", "Arrêter"],
      unsupported: "Les commandes vocales ne sont pas prises en charge dans ce navigateur."
    },
    substitute: "Substituts",
    submitting: "Recherche...",
    subTitle: "Substituts d'ingrédients",
    edibleWarning: "Attention: éléments non comestibles détectés!",
    edibleDetecting: "Vérification...",
    edibleDesc: "Nous avons détecté des éléments qui pourraient ne pas être comestibles: ",
    edibleProceed: "Êtes-vous sûr de vouloir continuer?",
    edibleConfirm: "Continuer quand même",
    edibleCancel: "Modifier les ingrédients",
    protein: "Protéines",
    carbs: "Glucides",
    fats: "Graisses",
    calories: "Calories",
    ttsUnsupported: "La synthèse vocale n'est pas prise en charge dans ce navigateur.",
    noRecipeAvailable: "Aucune recette disponible à lire.",
    speechPlaybackFailed: "Lecture vocale échouée.",
    speechStartFailed: "Impossible de démarrer la lecture vocale.",
    weeklyGenerating: "Génération de votre semaine culinaire...",
    weeklyGenerated: "Semaine générée avec succès!",
    noResponseFromAI: "Aucune réponse de l'IA",
    weeklyParseError: "Échec de l'analyse du plan hebdomadaire",
    onboarding: {
      languageTitle: "Choisissez votre langue",
      languageSubtitle: "Configurez votre expérience culinaire.",
      sourceTitle: "Comment avez-vous connu DishDash?",
      sourceSubtitle: "Dites-nous comment vous êtes arrivé ici.",
      personalizeTitle: "Personnalisez votre cuisine",
      personalizeSubtitle: "Des restrictions alimentaires à signaler?",
      allergiesLabel: "Allergies / Restrictions",
      allergiesPlaceholder: "Arachides, Gluten...",
      aiTitle: "Votre clé API",
      aiSubtitle: "Connectez le cerveau de votre cuisine pour commencer à cuisiner.",
      back: "Retour",
      continue: "Continuer",
      enterKitchen: "Entrer dans la cuisine",
      skipStep: "Passer l'étape",
      selectSourceError: "Veuillez sélectionner comment vous avez entendu parler de nous",
      enterApiKeyError: "Veuillez entrer votre clé API",
      languageOptions: [
        { label: 'English (US)', value: 'English' },
        { label: 'Español', value: 'Español' },
        { label: 'Français', value: 'Français' },
        { label: 'العربية', value: 'العربية' },
        { label: '中文', value: '中文' }
      ],
      sources: [
        { id: 'social', label: 'Réseaux sociaux', icon: '📱' },
        { id: 'friend', label: "D'un ami", icon: '🤝' },
        { id: 'search', label: 'Moteur de recherche', icon: '🔍' },
        { id: 'ads', label: 'Publicité', icon: '📺' },
        { id: 'other', label: 'Autre', icon: '✨' }
      ]
    },
    pantry: {
      description: "L'IA supposera que ces ingrédients sont disponibles pour toutes vos recettes. Pas besoin de les taper à chaque fois !",
      commonStaples: "Ingrédients de base",
      currentPantry: "Votre garde-manger actuel",
      empty: "Votre garde-manger est vide...",
      addCustom: "Ajouter personnalisé",
      unique: "Ingrédients uniques",
      customHint: "Ex: Curry, Miel...",
      addToPantry: "Ajouter au garde-manger"
    },
    calendar: {
      subtitle: "Planifiez votre semaine culinaire",
      generate: "Générer la semaine avec l'IA",
      empty: "Vide",
      favorites: "Vos Favoris",
      tapToAdd: "Appuyez sur un jour pour ajouter",
      addTo: "Ajouter à...",
      cancel: "Annuler"
    }
  },
  العربية: {
    language: "اللغة",
    button: "اطبخ",
    loading: "جارٍ الخلط...",
    settings: "الإعدادات",
    placeholder: "مكرونة، ثوم، 1 ليمونة...",
    mode: "الوضع",
    selectFav: "اختر مفضلة...",
    addFav: "حفظ في المفضلة",
    remFav: "إزالة المفضلة",
    secret: "سر الشيف",
    copy: "نسخ الوصفة",
    copied: "تم النسخ إلى الحافظة",
    clear: "مسح السجل",
    health: "تحليل الصحة",
    analyzing: "جارٍ التحليل...",
    modes: { quick: "سريع", detailed: "مفصل", healthy: "صحي", budget: "اقتصادي" },
    theme: "المظهر",
    light: "فاتح",
    dark: "داكن",
    listen: "استمع",
    stop: "إيقاف",
    daily: 'وصفة اليوم',
    heroTitle: "ما الموجود في",
    heroKitchen: "مطبخك؟",
    featuredRandom: { type: "اكتشاف", title: "وصفة عشوائية", desc: "هل تريد المغامرة؟ دع خوارزمية التطبيق تختار مزيجاً مفاجئاً من المكونات." },
    featuredDaily: { type: "اليومي", title: "وصفة اليوم", desc: "اختيار الشيف يركز على المكونات الموسمية." },
    favTitle: "المفضلات",
    favSub: "وصفاتك المختارة بعناية",
    recentTitle: "الوصفات الأخيرة",
    recentSub: "إبداعاتك ووصفاتك السابقة",
    recipeHeading: "وصفتك",
    craftedBy: "من DishDash AI",
    healthHeading: "تحليل الصحة",
    scoreLabel: "النقاط",
    sidebar: { home: "الرئيسية", favs: "المفضلة", recent: "المحفوظات", settings: "الإعدادات", profile: "مطبخي", pantry: "المخزن", calendar: "المخطط" },
    filterImage: "فحص المكونات",
    shoppingList: "قائمة التسوق",
    generating: "توليد...",
    noItems: "لا توجد عناصر",
    exportNotes: "تصدير إلى الملاحظات",
    shareError: "المشاركة غير مدعومة",
    welcomeTitle: "مرحباً بك في DishDash",
    welcomeSub: "جهز مطبخك",
    username: "اسم المستخدم",
    password: "كلمة المرور",
    getStarted: "ادخل المطبخ",
    fillAll: "يرجى ملء جميع الحقول",
    setupHint: "يرجى إدخال مفتاح API الخاص بك لبدء الطهي!",
    startCooking: "ابدأ الطهي",
    allergies: "الحساسية",
    allergiesHint: "فول سوداني، جلوتين، ألبان...",
    mealType: "نوع الوجبة",
    mealTypes: { none: "أي", breakfast: "فطور", lunch: "غداء", dinner: "عشاء" },
    downloadAPK: "تحميل APK",
    cooking: {
      title: "وضع الطهي",
      step: "الخطوة",
      of: "من",
      instruction: "تعليمات",
      previous: "السابق",
      next: "التالي",
      finish: "إنهاء",
      listening: "يستمع...",
      voiceOff: "الصوت متوقف",
      commands: ["التالي", "السابق", "توقف"],
      unsupported: "أوامر الصوت غير مدعومة في هذا المتصفح."
    },
    substitute: "بدائل",
    submitting: "جارٍ البحث...",
    subTitle: "بدائل المكونات",
    edibleWarning: "تحذير: تم اكتشاف عناصر غير صالحة للأكل!",
    edibleDetecting: "جارٍ التحقق...",
    edibleDesc: "اكتشفنا عناصر قد لا تكون صالحة للأكل: ",
    edibleProceed: "هل أنت متأكد أنك تريد المتابعة؟",
    edibleConfirm: "استمر على أي حال",
    edibleCancel: "تعديل المكونات",
    protein: "بروتين",
    carbs: "كربوهيدرات",
    fats: "دهون",
    calories: "سعرات حرارية",
    ttsUnsupported: "ميزة تحويل النص إلى كلام غير مدعومة في هذا المتصفح.",
    noRecipeAvailable: "لا توجد وصفة للقراءة.",
    speechPlaybackFailed: "فشل تشغيل الصوت.",
    speechStartFailed: "تعذر بدء تشغيل الصوت.",
    weeklyGenerating: "جارٍ توليد أسبوعك الطهي...",
    weeklyGenerated: "تم إنشاء الأسبوع بنجاح!",
    noResponseFromAI: "لا توجد استجابة من الذكاء الاصطناعي",
    weeklyParseError: "فشل في معالجة خطة الأسبوع",
    onboarding: {
      languageTitle: "اختر لغتك",
      languageSubtitle: "قم بإعداد تجربتك الطهوية.",
      sourceTitle: "كيف عرفت DishDash؟",
      sourceSubtitle: "أخبرنا كيف وصلت إلى هنا.",
      personalizeTitle: "خصّص مطبخك",
      personalizeSubtitle: "هل لديك قيود غذائية؟",
      allergiesLabel: "الحساسية / القيود",
      allergiesPlaceholder: "فول سوداني، جلوتين...",
      aiTitle: "مفتاح API الخاص بك",
      aiSubtitle: "قم بتوصيل عقل مطبخك للبدء في الطهي.",
      back: "عودة",
      continue: "متابعة",
      enterKitchen: "ادخل المطبخ",
      skipStep: "تخطي الخطوة",
      selectSourceError: "يرجى اختيار كيف سمعت عنا",
      enterApiKeyError: "يرجى إدخال مفتاح API الخاص بك",
      languageOptions: [
        { label: 'English (US)', value: 'English' },
        { label: 'Español', value: 'Español' },
        { label: 'Français', value: 'Français' },
        { label: 'العربية', value: 'العربية' },
        { label: '中文', value: '中文' }
      ],
      sources: [
        { id: 'social', label: 'وسائل التواصل', icon: '📱' },
        { id: 'friend', label: 'من صديق', icon: '🤝' },
        { id: 'search', label: 'محرك البحث', icon: '🔍' },
        { id: 'ads', label: 'إعلان', icon: '📺' },
        { id: 'other', label: 'آخر', icon: '✨' }
      ]
    },
    pantry: {
      description: "سيفترض الذكاء الاصطناعي أن هذه المكونات متاحة لكل وصفاتك. لا حاجة لكتابتها في كل مرة!",
      commonStaples: "المكونات الأساسية",
      currentPantry: "مخزنك الحالي",
      empty: "المخزن فارغ...",
      addCustom: "إضافة مخصص",
      unique: "مكونات فريدة",
      customHint: "مثال: كاري، عسل...",
      addToPantry: "أضف إلى المخزن"
    },
    calendar: {
      subtitle: "خطط أسبوعك الطهي",
      generate: "توليد الأسبوع بالذكاء الاصطناعي",
      empty: "فارغ",
      favorites: "المفضلات",
      tapToAdd: "اضغط على يوم للإضافة",
      addTo: "أضف إلى...",
      cancel: "إلغاء"
    }
  },
  中文: {
    language: "语言",
    button: "烹饪",
    loading: "搅拌中...",
    settings: "设置",
    placeholder: "意面、大蒜、1个柠檬...",
    mode: "模式",
    selectFav: "选择收藏...",
    addFav: "保存到收藏",
    remFav: "移除收藏",
    secret: "厨师的秘密",
    copy: "复制食谱",
    copied: "已复制到剪贴板",
    clear: "清除历史",
    health: "健康分析",
    analyzing: "分析中...",
    modes: { quick: "快速", detailed: "详细", healthy: "健康", budget: "经济" },
    theme: "主题",
    light: "浅色",
    dark: "深色",
    listen: "收听",
    stop: "停止",
    daily: '每日食谱',
    heroTitle: "你的厨房里有什么",
    heroKitchen: "？",
    featuredRandom: { type: "发现", title: "随机食谱", desc: "想冒险吗？让我们的算法选择一个惊喜食材组合。" },
    featuredDaily: { type: "每日精选", title: "每日食谱", desc: "主厨精选，专注当季食材。" },
    favTitle: "你的收藏",
    favSub: "你精心挑选的食谱",
    recentTitle: "最近记录",
    recentSub: "你过去的烹饪创意和搜索",
    recipeHeading: "你的食谱",
    craftedBy: "由 DishDash AI 制作",
    healthHeading: "健康分析",
    scoreLabel: "得分",
    sidebar: { home: "首页", favs: "收藏", recent: "最近", settings: "设置", profile: "我的厨房", pantry: "储藏室", calendar: "计划" },
    filterImage: "扫描食材",
    shoppingList: "购物清单",
    generating: "生成中...",
    noItems: "未找到项目",
    exportNotes: "导出到笔记",
    shareError: "不支持分享",
    welcomeTitle: "欢迎来到 DishDash",
    welcomeSub: "设置你的厨房",
    username: "用户名",
    password: "密码",
    getStarted: "进入厨房",
    fillAll: "请填写所有字段",
    setupHint: "请输入您的 API 密钥以开始烹饪！",
    startCooking: "开始烹饪",
    allergies: "过敏原",
    allergiesHint: "花生, 麸质, 乳制品...",
    mealType: "餐食类型",
    mealTypes: { none: "任意", breakfast: "早餐", lunch: "午餐", dinner: "晚餐" },
    downloadAPK: "下载 APK",
    cooking: {
      title: "烹饪模式",
      step: "步骤",
      of: "共",
      instruction: "说明",
      previous: "上一步",
      next: "下一步",
      finish: "完成",
      listening: "正在收听...",
      voiceOff: "语音关闭",
      commands: ["下一步", "返回", "停止"],
      unsupported: "此浏览器不支持语音命令。"
    },
    substitute: "替代品",
    submitting: "搜索中...",
    subTitle: "食材替代",
    edibleWarning: "警告：检测到非食用项目！",
    edibleDetecting: "检查中...",
    edibleDesc: "我们检测到可能无法食用的项目： ",
    edibleProceed: "您确定要继续吗？",
    edibleConfirm: "仍然继续",
    edibleCancel: "编辑食材",
    protein: "蛋白质",
    carbs: "碳水",
    fats: "脂肪",
    calories: "卡路里",
    ttsUnsupported: "此浏览器不支持文本转语音。",
    noRecipeAvailable: "没有可朗读的食谱。",
    speechPlaybackFailed: "语音播放失败。",
    speechStartFailed: "无法启动语音播放。",
    weeklyGenerating: "正在生成您的烹饪周计划...",
    weeklyGenerated: "周计划生成成功！",
    noResponseFromAI: "未收到 AI 响应",
    weeklyParseError: "无法解析每周计划",
    onboarding: {
      languageTitle: "选择您的语言",
      languageSubtitle: "设置您的烹饪体验。",
      sourceTitle: "您如何知道 DishDash 的？",
      sourceSubtitle: "告诉我们您是如何来到这里的。",
      personalizeTitle: "个性化您的厨房",
      personalizeSubtitle: "您有任何饮食限制吗？",
      allergiesLabel: "过敏原 / 限制",
      allergiesPlaceholder: "例如：咖喱、蜂蜜...",
      aiTitle: "您的 API 密钥",
      aiSubtitle: "连接您的厨房大脑开始烹饪。",
      back: "后退",
      continue: "继续",
      enterKitchen: "进入厨房",
      skipStep: "跳过步骤",
      selectSourceError: "请选择您如何听说我们的",
      enterApiKeyError: "请输入您的 API 密钥",
      languageOptions: [
        { label: 'English (US)', value: 'English' },
        { label: 'Español', value: 'Español' },
        { label: 'Français', value: 'Français' },
        { label: 'العربية', value: 'العربية' },
        { label: '中文', value: '中文' }
      ],
      sources: [
        { id: 'social', label: 'وسائل التواصل', icon: '📱' },
        { id: 'friend', label: 'من صديق', icon: '🤝' },
        { id: 'search', label: 'محرك البحث', icon: '🔍' },
        { id: 'ads', label: 'إعلان', icon: '📺' },
        { id: 'other', label: 'آخر', icon: '✨' }
      ]
    },
    pantry: {
      description: "AI 将假定这些食材可用于您的所有菜谱。无需每次重复输入！",
      commonStaples: "常见食材",
      currentPantry: "当前储藏室",
      empty: "您的储藏室为空...",
      addCustom: "添加自定义",
      unique: "独特食材",
      customHint: "例如：咖喱，蜂蜜...",
      addToPantry: "添加到储藏室"
    },
    calendar: {
      subtitle: "规划您的烹饪周",
      generate: "生成 AI 周计划",
      empty: "空",
      favorites: "收藏",
      tapToAdd: "点击某天添加",
      addTo: "添加到...",
      cancel: "取消"
    }
  }
};

const MacroDonut = ({ macros, ui }) => {
  const { protein, carbs, fats, calories } = macros;
  const total = protein + carbs + fats || 1;
  const pPerc = (protein / total) * 100;
  const cPerc = (carbs / total) * 100;
  const fPerc = (fats / total) * 100;

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const size = isMobile ? 120 : 160;
  const strokeWidth = isMobile ? 10 : 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const pOffset = circumference - (pPerc / 100) * circumference;
  const cOffset = circumference - ((pPerc + cPerc) / 100) * circumference;
  const fOffset = circumference - ((pPerc + cPerc + fPerc) / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-4 md:gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg WebkitTransform="rotate(-90deg)" transform="rotate(-90deg)" width={size} height={size}>
          <circle cx={size/2} cy={size/2} r={radius} stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} fill="none" />
          <circle cx={size/2} cy={size/2} r={radius} stroke="#EF4444" strokeWidth={strokeWidth} fill="none" strokeDasharray={circumference} strokeDashoffset={fOffset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
          <circle cx={size/2} cy={size/2} r={radius} stroke="#F59E0B" strokeWidth={strokeWidth} fill="none" strokeDasharray={circumference} strokeDashoffset={cOffset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
          <circle cx={size/2} cy={size/2} r={radius} stroke="#0EA5E9" strokeWidth={strokeWidth} fill="none" strokeDasharray={circumference} strokeDashoffset={pOffset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xl md:text-2xl font-black text-white leading-none">{calories}</span>
          <span className="text-[8px] md:text-[10px] font-black text-white/40 uppercase tracking-widest mt-1">{ui.calories}</span>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-3 md:gap-4 px-4">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#0EA5E9]" />
          <span className="text-[8px] md:text-[10px] font-black text-white/60 uppercase tracking-widest">{protein}g {ui.protein}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#F59E0B]" />
          <span className="text-[8px] md:text-[10px] font-black text-white/60 uppercase tracking-widest">{carbs}g {ui.carbs}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#EF4444]" />
          <span className="text-[8px] md:text-[10px] font-black text-white/60 uppercase tracking-widest">{fats}g {ui.fats}</span>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [apiKey, setApiKey] = useState(localStorage.getItem('dishdash_key') || "");
  const [provider, setProvider] = useState(localStorage.getItem('dishdash_provider') || "google");
  const [modelId, setModelId] = useState(localStorage.getItem('dishdash_model') || "gemini-2.0-flash");
  const [showSettings, setShowSettings] = useState(false);
  const [ingredients, setIngredients] = useState("");
  const [recipe, setRecipe] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState(localStorage.getItem('dishdash_language') || "English");
  const [copyStatus, setCopyStatus] = useState(false);
  const [history, setHistory] = useState(JSON.parse(localStorage.getItem('dishdash_history')) || []);
  const [favorites, setFavorites] = useState(JSON.parse(localStorage.getItem('dishdash_favs')) || []);
  const [healthData, setHealthData] = useState(null);
  const [analyzingHealth, setAnalyzingHealth] = useState(false);
  const [mode, setMode] = useState("Quick");
  const [mealType, setMealType] = useState("None");
  const [theme, setTheme] = useState(localStorage.getItem('dishdash_theme') || "dark");
  const [listening, setListening] = useState(false);
  const [utterance, setUtterance] = useState(null);
  const [dailyRecipe, setDailyRecipe] = useState(JSON.parse(localStorage.getItem('dishdash_daily')) || null);
  const [activeTab, setActiveTab] = useState('Home');
  const [shoppingList, setShoppingList] = useState(null);
  const [generatingList, setGeneratingList] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(localStorage.getItem('dishdash_onboarded') === 'true');
  const [user, setUser] = useState(localStorage.getItem('dishdash_user') || "");
  const [toasts, setToasts] = useState([]);
  const [availableModels, setAvailableModels] = useState([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [isCookingMode, setIsCookingMode] = useState(false);
  const [allergies, setAllergies] = useState(localStorage.getItem('dishdash_allergies') || "");
  const [pantry, setPantry] = useState(localStorage.getItem('dishdash_pantry') || "");
  const [mealPlan, setMealPlan] = useState(JSON.parse(localStorage.getItem('dishdash_mealplan')) || {});
  const [substitutions, setSubstitutions] = useState(null);
  const [generatingSubstitutions, setGeneratingSubstitutions] = useState(false);
  const [showEdibleWarning, setShowEdibleWarning] = useState(false);
  const [nonEdibleItems, setNonEdibleItems] = useState("");
  const [pendingIngredients, setPendingIngredients] = useState("");
  const [validatingEdibility, setValidatingEdibility] = useState(false);

  const extractSteps = (text) => {
    if (!text) return [];
    const sections = text.split(/\n(?=#{1,6}\s+)/);
    const stepsSection = sections.find(s => /steps|instruc|prepara/i.test(s)) || text;
    return stepsSection
      .split('\n')
      .map(line => line.trim())
      .filter(line => /^(\d+[\.\)]|[\-\*])\s+/.test(line))
      .map(line => line.replace(/^(\d+[\.\)]|[\-\*])\s+/, '').trim())
      .filter(Boolean);
  };

  const showToast = (message, type = 'error') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const mainContentRef = useRef(null);

  const handleSelectRecipe = (r) => {
    if (!r) {
      setRecipe("");
      return;
    }
    setRecipe(r);
    setHealthData(null);
    setShoppingList(null);
    setSubstitutions(null);
    setIsCookingMode(false);
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
  };

  const ui = uiTranslations[language] || uiTranslations.English;

  useEffect(() => {
    let isMounted = true;
    const fetchModels = async () => {
      setAvailableModels([]);
      if (!apiKey && provider !== 'openrouter') {
        return;
      }
      setLoadingModels(true);
      try {
        if (provider === 'google') {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
          const data = await res.json();
          if (data.models && isMounted) {
            setAvailableModels(data.models.map(m => ({ id: m.name.replace('models/', ''), name: m.displayName || m.name })));
          }
        } else if (provider === 'openrouter') {
          const res = await fetch('https://openrouter.ai/api/v1/models');
          const data = await res.json();
          if (data.data && isMounted) {
            const forbiddenKeywords = ['voice', 'speech', 'tts', 'whisper', 'audio', 'vixen', 'melotts', 'bark', 'elevenlabs'];
            const textModels = data.data.filter(m => 
              !forbiddenKeywords.some(keyword => m.id.toLowerCase().includes(keyword) || m.name.toLowerCase().includes(keyword))
            );
            setAvailableModels(textModels.map(m => ({ id: m.id, name: m.name })).slice(0, 100)); 
          }
        } else if (provider === 'openai') {
          const res = await fetch('https://api.openai.com/v1/models', {
            headers: { 'Authorization': `Bearer ${apiKey}` }
          });
          const data = await res.json();
          if (data.data && isMounted) {
            setAvailableModels(data.data.filter(m => m.id.includes('gpt')).map(m => ({ id: m.id, name: m.id })));
          }
        }
      } catch (err) {
      } finally {
        if (isMounted) setLoadingModels(false);
      }
    };
    
    if (showSettings) fetchModels();
    return () => { isMounted = false; };
  }, [provider, apiKey, showSettings]);

  useEffect(() => {
    localStorage.setItem('dishdash_key', apiKey);
    localStorage.setItem('dishdash_provider', provider);
    localStorage.setItem('dishdash_model', modelId);
    localStorage.setItem('dishdash_history', JSON.stringify(history));
    localStorage.setItem('dishdash_favs', JSON.stringify(favorites));
    localStorage.setItem('dishdash_theme', theme);
    localStorage.setItem('dishdash_auth', isAuthenticated);
    localStorage.setItem('dishdash_onboarded', isOnboarded);
    localStorage.setItem('dishdash_user', user);
    localStorage.setItem('dishdash_language', language);
    localStorage.setItem('dishdash_allergies', allergies);
    localStorage.setItem('dishdash_pantry', pantry);
    localStorage.setItem('dishdash_mealplan', JSON.stringify(mealPlan));
    document.documentElement.lang = HTML_LANGS[language] || 'en';
  }, [apiKey, provider, modelId, history, favorites, theme, isAuthenticated, isOnboarded, user, language, allergies, pantry, mealPlan]);

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

  const generateRecipe = async (inputStr, skipCheck = false) => {
    const finalIngredients = inputStr || ingredients;
    if (!finalIngredients) return;
    if (!apiKey) {
      showToast(ui.setupHint, 'error');
      return;
    }

    setLoading(true);
    setValidatingEdibility(true);
    setHealthData(null);

    try {
      const checkPrompt = `LIST: ${finalIngredients}. Identify any items that are NOT edible or typically found in food. Respond with ONLY the non-edible items separated by commas, or "OK" if everything is edible or could be food. Be very strict (e.g. Paper, Metal, Plastic are non-edible). Language: ${language}`;
      const recipePrompt = `ROLE: Michelin-star Chef. \nINGREDIENTS: ${finalIngredients} \nPANTRY (Always Available): ${pantry || 'None'} \nMEAL TYPE: ${mealType !== 'None' ? mealType : 'Any'} \nMODE: ${mode} \nLANGUAGE: ${language} \nCONTEXT: ${ui.secret} \nALLERGIES: ${allergies || 'None'} \nFormat: # [Title] \nTime: [X] mins \nDifficulty: [E/M/H] \n## Steps \n1...`;

      const checkPromise = skipCheck || inputStr ? Promise.resolve("OK") : callAI(checkPrompt);
      const recipePromise = callAI(recipePrompt);

      const checkResult = await checkPromise;

      if (checkResult && checkResult.trim().toUpperCase() !== "OK") {
        setNonEdibleItems(checkResult);
        setPendingIngredients(finalIngredients);
        setShowEdibleWarning(true);
        return;
      }

      const recipeText = await recipePromise;

      setRecipe(recipeText);
      setHistory(prev => [recipeText, ...prev].slice(0, 10));
      setShoppingList(null);
      setSubstitutions(null);
    } catch (error) {
      console.error("Recipe generation failed", error);
      setRecipe(`Error: ${error.message}`);
    } finally {
      setLoading(false);
      setValidatingEdibility(false);
    }
  };

  const handleHealthCheck = async () => {
    if (!recipe) return;
    if (!apiKey) {
      showToast(ui.setupHint, 'error');
      return;
    }
    setAnalyzingHealth(true);
    setHealthData(null);

    try {
      const prompt = `Analyze this recipe: ${recipe}. 
Provide:
1. Health Score (1-100)
2. Protein (g)
3. Carbs (g)
4. Fats (g)
5. Calories
6. 4 health bullets in ${language}
Format:
SCORE: [num]
PROTEIN: [num]
CARBS: [num]
FATS: [num]
CALORIES: [num]
BULLETS:
- [bullet]
Return ONLY this text.`;

      const result = await callAI(prompt);
      console.log("Health Analysis Result Layer:", result);

      if (!result) throw new Error("No response from AI");

      const extractNum = (regex, fallback = 0) => {
        const m = result.match(regex);
        return m ? parseInt(m[1].replace(/[^\d]/g, '')) : fallback;
      };

      const score = extractNum(/SCORE:\s*(\d+)/i, 50);
      const protein = extractNum(/PROTEIN:\s*(\d+)/i);
      const carbs = extractNum(/CARBS:\s*(\d+)/i);
      const fats = extractNum(/FATS:\s*(\d+)/i);
      const calories = extractNum(/CALORIES:\s*(\d+)/i);

      const bulletsPart = result.split(/BULLETS:/i)[1];
      const bullets = bulletsPart ? bulletsPart.trim() : result.match(/- .+/g)?.join('\n') || "";

      setHealthData({
        score,
        macros: { protein, carbs, fats, calories },
        bullets
      });
    } catch (err) {
      console.error("Health Analysis Failure Detail:", err);
      showToast(`Analysis: ${err.message || "Parsing Error"}`, 'error');
    } finally {
      setAnalyzingHealth(false);
    }
  };

  const handleGenerateShoppingList = async () => {
    if (!recipe) return;
    if (!apiKey) {
      showToast(ui.setupHint, 'error');
      return;
    }
    setGeneratingList(true);
    try {
      const prompt = `Convert this recipe into a categorized shopping list. 
      RECIPE: ${recipe}
      CATEGORIES: Produce, Meat/Protein, Dairy, Pantry, Other.
      OUTPUT: Return ONLY a JSON array of objects. 
      FORMAT: [{"category": "Category Name", "items": [{"name": "Item", "amount": "Quantity"}]}]
      LANGUAGE: ${language}`;
      
      const result = await callAI(prompt);
      const jsonMatch = result.match(/\[[\s\S]*\]/);
      
      if (!jsonMatch) {
        throw new Error("Invalid AI response format");
      }
      
      const parsed = JSON.parse(jsonMatch[0]).map((cat, cIdx) => ({
        category: cat.category || "General",
        items: (cat.items || []).map((item, iIdx) => ({
          name: item.name || "Unknown item",
          amount: item.amount || "",
          id: `${cIdx}-${iIdx}-${Date.now()}`,
          checked: false
        }))
      })).filter(cat => cat.items.length > 0);

      if (parsed.length === 0) throw new Error("No ingredients detected");
      
      setShoppingList(parsed);
    } catch (err) {
      console.error("Shopping List Error:", err);
      showToast(`Error: ${err.message}. Please try again.`);
    } finally {
      setGeneratingList(false);
    }
  };

  const handleGetSubstitutions = async () => {
    if (!recipe) return;
    if (!apiKey) {
      showToast(ui.setupHint, 'error');
      return;
    }
    setGeneratingSubstitutions(true);
    try {
      const prompt = `Based on this recipe, suggest common substitutions for the main ingredients in case the user is missing them. 
      RECIPE: ${recipe}
      OUTPUT: Provide a concise list of ingredient -> substitution(s). Use markdown formatting.
      LANGUAGE: ${language}`;
      
      const result = await callAI(prompt);
      setSubstitutions(result);
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setGeneratingSubstitutions(false);
    }
  };

  const handleExportToNotes = async () => {
    if (!shoppingList) return;
    const recipeTitle = recipe.split('\n')[0].replace('# ', '');
    const listText = shoppingList.map(cat => 
      `${cat.category.toUpperCase()}\n${cat.items.map(i => `- ${i.name} (${i.amount})`).join('\n')}`
    ).join('\n\n');
    
    const fullContent = `SHOPPING LIST: ${recipeTitle}\n\n${listText}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Shopping List - ${recipeTitle}`,
          text: fullContent,
        });
      } catch (err) {
        if (err.name !== 'AbortError') showToast(ui.shareError);
      }
    } else {
      await navigator.clipboard.writeText(fullContent);
      showToast(ui.copied + " (Clipboard fallback)", "info");
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
    if (dailyRecipe && dailyRecipe.date === today && dailyRecipe.language === language) {
      setRecipe(dailyRecipe.recipe);
      return;
    }
    if (!apiKey) {
      showToast(ui.setupHint, 'error');
      return;
    }
    setLoading(true);
    try {
      const prompt = `Daily special recipe idea (${mode} mode). Language: ${language}. PANTRY (Always Available): ${pantry || 'None'}. (ONLY RETURN 1 RECIPE AND THE STEPS NO SUGGESTIONS (unlesss its the chef's secret)). AVOID THESE ALLERGIES: ${allergies || 'None'}`;
      const text = await callAI(prompt);
      const data = { date: today, recipe: text, language: language };
      setDailyRecipe(data);
      localStorage.setItem('dishdash_daily', JSON.stringify(data));
      setRecipe(text);
    } catch (err) {
      showToast(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!apiKey) {
      showToast(ui.setupHint, 'error');
      return;
    }
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
        showToast(err.message);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleListen = () => {
    if (!isSpeechSynthesisAvailable()) {
      showToast(ui.ttsUnsupported, 'error');
      return;
    }

    if (listening) {
      try {
        window.speechSynthesis.cancel();
      } catch (err) {
        console.error('Failed to cancel speech synthesis:', err);
      }
      setListening(false);
      return;
    }

    if (!recipe) {
      showToast(ui.noRecipeAvailable, 'error');
      return;
    }

    const textForSpeech = cleanTextForSpeech(recipe);
    const utter = new SpeechSynthesisUtterance(textForSpeech);
    utter.lang = LANGUAGE_LOCALES[language] || 'en-US';
    utter.onend = () => setListening(false);
    utter.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setListening(false);
      showToast(ui.speechPlaybackFailed, 'error');
    };

    try {
      setUtterance(utter);
      window.speechSynthesis.speak(utter);
      setListening(true);
    } catch (error) {
      console.error('Speech synthesis start failed:', error);
      setListening(false);
      showToast(ui.speechStartFailed, 'error');
    }
  };

  const generateWeek = async () => {
    if (!apiKey && provider !== 'openrouter') {
      showToast(ui.setupHint, 'error');
      return;
    }
    setLoading(true);
    showToast(ui.weeklyGenerating, 'info');
    try {
      const prompt = `Michelin-star Chef. Generate a 7-day meal plan. Language: ${language}. Pantry (Always Available): ${pantry || 'None'}. Allergies (AVOID THESE): ${allergies || 'None'}.
      IMPORTANT: Generate exactly 7 different recipes, one for each day.
      Separate each recipe with the exact sequence: ---RECIPE---
      Each recipe structure:
      # [Title]
      [Steps...]`;
      
      const text = await callAI(prompt);
      if (!text) throw new Error(ui.noResponseFromAI);
      
      let recipes = text.split('---RECIPE---').map(r => r.trim()).filter(r => r.length > 20);
      
      if (recipes.length < 7) {
        recipes = text.split(/\n(?=#)/).map(r => r.trim()).filter(r => r.length > 20);
      }

      const days = DAYS_BY_LANGUAGE[language] || DAYS_BY_LANGUAGE.English;
      const newPlan = {};
      
      days.forEach((day, i) => {
        if (recipes[i]) {
          newPlan[day] = [recipes[i]];
        }
      });

      if (Object.keys(newPlan).length === 0) {
        throw new Error(ui.weeklyParseError);
      }

      setMealPlan(newPlan);
      showToast(ui.weeklyGenerated, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (id) => {
    setActiveTab(id === 'home' ? 'Home' : id === 'favorites' ? 'Favorites' : id === 'recent' ? 'Recent' : id === 'pantry' ? 'Pantry' : id === 'calendar' ? 'Calendar' : 'Home');
    if (mainContentRef.current) mainContentRef.current.scrollTop = 0;
  };

  const handleOnboardingComplete = (data) => {
    setApiKey(data.apiKey);
    setProvider(data.provider);
    setModelId(data.modelId);
    setUser(data.username || "");
    setAllergies(data.allergies || "");
    setIsOnboarded(true);
    localStorage.setItem('dishdash_onboarded', 'true');
  };

  if (!isOnboarded) {
    return (
      <Onboarding 
        language={language}
        setLanguage={setLanguage}
        ui={ui}
        showToast={showToast}
        onComplete={handleOnboardingComplete}
      />
    );
  }

  return (
    <div className="flex flex-col md:flex-row bg-[#0A0A0A] min-h-screen text-white font-sans selection:bg-yellow-500/30">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        onNavigate={handleNavigate}
        language={language} 
        setLanguage={setLanguage}
        setShowSettings={setShowSettings}
        ui={ui}
        user={user}
      />

      <main className="flex-1 overflow-y-auto pb-28 md:pb-0" ref={mainContentRef}>
        {activeTab === 'Home' && (
          <div id="home" className="animate-fade-in">
            <Hero 
              ingredients={ingredients} 
              setIngredients={setIngredients} 
              onRoll={() => generateRecipe()} 
              loading={loading || validatingEdibility}
              ui={ui}
            />

            <FilterSection 
              language={language}
              setLanguage={setLanguage}
              mode={mode}
              setMode={setMode}
              mealType={mealType}
              setMealType={setMealType}
              onImageUpload={handleImageUpload}
              ui={ui}
              modelId={modelId}
              loading={loading}
            />

            <FeaturedCards 
              onRandom={surpriseMe}
              onDaily={generateDailyRecipe}
              ui={ui}
              loading={loading}
            />
          </div>
        )}

        {activeTab === 'Favorites' && (
          <div id="favorites" className="animate-fade-in pt-10">
            <RecipeList 
              title={ui.favTitle}
              subtitle={ui.favSub}
              items={favorites}
              onSelect={handleSelectRecipe}
              onDelete={(index) => setFavorites(prev => prev.filter((_, i) => i !== index))}
              type="favorites"
              emptyMessage={ui.noItems}
            />
          </div>
        )}

        {activeTab === 'Recent' && (
          <div id="recent" className="animate-fade-in pt-10">
            <RecipeList 
              title={ui.recentTitle}
              subtitle={ui.recentSub}
              items={history}
              onSelect={handleSelectRecipe}
              onDelete={(index) => setHistory(prev => prev.filter((_, i) => i !== index))}
              type="history"
              emptyMessage={ui.noItems}
            />
          </div>
        )}

        {activeTab === 'Pantry' && (
          <PantryView 
            pantry={pantry} 
            setPantry={setPantry} 
            language={language} 
            ui={ui} 
          />
        )}

        {activeTab === 'Calendar' && (
          <CalendarView 
            mealPlan={mealPlan} 
            setMealPlan={setMealPlan} 
            favorites={favorites} 
            onSelect={handleSelectRecipe} 
            language={language} 
            ui={ui} 
            onGenerateWeek={generateWeek}
            loading={loading}
          />
        )}

        {recipe && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center p-0 md:p-6 animate-fade-in">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => handleSelectRecipe("")} />
            <div className="relative w-full h-full md:h-auto md:max-w-4xl md:max-h-[90vh] bg-[#121212] md:border border-white/10 md:rounded-[40px] overflow-hidden flex flex-col shadow-2xl">
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
                  onClick={() => handleSelectRecipe("")}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all text-white/60 hover:text-white"
                >
                  <X size={20} className="md:w-6 md:h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 md:space-y-8 custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 w-full">
                  <button
                    onClick={() => setFavorites(prev => prev.includes(recipe) ? prev.filter(f => f !== recipe) : [recipe, ...prev])}
                    className={`w-full flex items-center justify-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all ${
                      favorites.includes(recipe) ? 'bg-red-500 text-white' : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                    }`}
                  >
                    <Heart size={14} className="md:w-4 md:h-4" fill={favorites.includes(recipe) ? "currentColor" : "none"} />
                    <span className="inline">{favorites.includes(recipe) ? ui.remFav : ui.addFav}</span>
                  </button>
                  
                  <button
                    onClick={() => { navigator.clipboard.writeText(recipe); setCopyStatus(true); setTimeout(() => setCopyStatus(false), 2000) }}
                    className="w-full flex items-center justify-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 text-white font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-white/10"
                  >
                    <Copy size={14} className="md:w-4 md:h-4" />
                    <span className="inline">{copyStatus ? ui.copied : ui.copy}</span>
                  </button>

                  <button
                    onClick={handleHealthCheck}
                    disabled={analyzingHealth}
                    className="w-full flex justify-center items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl bg-green-500/20 border border-green-500/20 text-green-500 font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-green-500/30"
                  >
                    {analyzingHealth ? <Loader2 size={14} className="md:w-4 md:h-4 animate-spin" /> : <Activity size={14} className="md:w-4 md:h-4" />}
                    <span className="inline">{analyzingHealth ? ui.analyzing : ui.health}</span>
                  </button>

                  <button
                    onClick={toggleListen}
                    disabled={!isSpeechSynthesisAvailable() || !recipe}
                    className={`w-full flex justify-center items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl bg-purple-500/20 border border-purple-500/20 text-purple-400 font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-purple-500/30 ${(!isSpeechSynthesisAvailable() || !recipe) ? 'opacity-40 cursor-not-allowed hover:bg-purple-500/20' : ''}`}
                  >
                    {listening ? <Square size={14} className="md:w-4 md:h-4 text-red-500" /> : <Volume2 size={14} className="md:w-4 md:h-4" />}
                    <span className="inline">{listening ? ui.stop : ui.listen}</span>
                  </button>

                  <button
                    onClick={handleGenerateShoppingList}
                    disabled={generatingList}
                    className="w-full flex justify-center items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl bg-yellow-500/20 border border-yellow-500/20 text-yellow-500 font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-yellow-500/30"
                  >
                    {generatingList ? <Loader2 size={14} className="md:w-4 md:h-4 animate-spin" /> : <ShoppingCart size={14} className="md:w-4 md:h-4" />}
                    <span className="inline">{generatingList ? ui.generating : ui.shoppingList}</span>
                  </button>

                  <button
                    onClick={handleGetSubstitutions}
                    disabled={generatingSubstitutions}
                    className="w-full flex justify-center items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl bg-orange-500/20 border border-orange-500/20 text-orange-400 font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-orange-500/30"
                  >
                    {generatingSubstitutions ? <Loader2 size={14} className="md:w-4 md:h-4 animate-spin" /> : <Replace size={14} className="md:w-4 md:h-4" />}
                    <span className="inline">{generatingSubstitutions ? ui.submitting : ui.substitute}</span>
                  </button>

                  <button
                    onClick={() => setIsCookingMode(true)}
                    className="w-full flex items-center justify-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl bg-yellow-500 text-black font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-yellow-400"
                  >
                    <ChefHat size={14} className="md:w-4 md:h-4" />
                    <span className="inline">{ui.startCooking}</span>
                  </button>

                  {!isSpeechSynthesisAvailable() && (
                    <div className="sm:col-span-2 xl:col-span-4 text-[10px] text-red-300 uppercase tracking-widest mt-2">
                      {ui.ttsUnsupported}
                    </div>
                  )}
                </div>

                {analyzingHealth && !healthData && (
                  <div className="p-6 md:p-8 rounded-[24px] md:rounded-[32px] bg-white/5 border border-white/10 animate-pulse flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
                      <Activity size={32} className="text-green-500" />
                    </div>
                    <p className="text-white/40 text-[10px] md:text-xs font-black uppercase tracking-widest">{ui.analyzing}</p>
                  </div>
                )}

                {healthData && (
                  <div className="p-6 md:p-8 rounded-[24px] md:rounded-[32px] bg-white/5 border border-white/10 animate-fade-in space-y-8">
                    <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                      <MacroDonut macros={healthData.macros} ui={ui} />
                      
                      <div className="flex-1 space-y-6">
                        <div className="flex items-center gap-4">
                          <div className={`text-4xl font-black ${healthData.score > 70 ? 'text-green-500' : healthData.score > 40 ? 'text-yellow-500' : 'text-red-500'}`}>
                            {healthData.score}
                          </div>
                          <div>
                            <h4 className="text-white font-black text-sm uppercase tracking-widest">{ui.scoreLabel}</h4>
                            <div className="w-32 h-1.5 bg-white/5 rounded-full mt-1 overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-1000 ${healthData.score > 70 ? 'bg-green-500' : healthData.score > 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${healthData.score}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="prose prose-invert prose-xs md:prose-sm max-w-none text-white/50 space-y-2">
                          <Markdown>{healthData.bullets}</Markdown>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {generatingList && !shoppingList && (
                  <div className="p-6 md:p-8 rounded-[24px] md:rounded-[32px] bg-white/5 border border-white/10 animate-pulse flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                      <ShoppingCart size={32} className="text-yellow-500" />
                    </div>
                    <p className="text-white/40 text-[10px] md:text-xs font-black uppercase tracking-widest">{ui.generating}</p>
                  </div>
                )}

                {shoppingList && (
                  <div className="p-6 md:p-8 rounded-[24px] md:rounded-[32px] bg-white/5 border border-white/10 animate-fade-in space-y-6">
                    <div className="flex justify-between items-center">
                      <h4 className="text-white font-black text-base md:text-lg uppercase tracking-tight flex items-center gap-2">
                        <ShoppingCart size={20} className="text-yellow-500" />
                        {ui.shoppingList}
                      </h4>
                      <button 
                        onClick={handleExportToNotes}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-widest"
                      >
                        <Share size={14} />
                        {ui.exportNotes}
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {shoppingList.map((category, catIdx) => (
                        <div key={catIdx} className="space-y-3">
                          <h5 className="text-[10px] text-white/40 font-black uppercase tracking-widest border-b border-white/5 pb-2">
                            {category.category}
                          </h5>
                          <div className="space-y-2">
                            {category.items.map((item) => (
                              <button
                                key={item.id}
                                onClick={() => {
                                  setShoppingList(prev => prev.map(cat => ({
                                    ...cat,
                                    items: cat.items.map(i => i.id === item.id ? { ...i, checked: !i.checked } : i)
                                  })));
                                }}
                                className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left group"
                              >
                                {item.checked ? 
                                  <CheckCircle2 size={18} className="text-green-500 shrink-0" /> : 
                                  <Circle size={18} className="text-white/20 group-hover:text-white/40 shrink-0" />
                                }
                                <div className="flex-1">
                                  <span className={`text-sm font-bold ${item.checked ? 'text-white/20 line-through' : 'text-white'}`}>
                                    {item.name}
                                  </span>
                                  {item.amount && <span className="text-[10px] text-white/40 block leading-tight font-medium uppercase tracking-widest">{item.amount}</span>}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}


                {generatingSubstitutions && !substitutions && (
                  <div className="p-6 md:p-8 rounded-[24px] md:rounded-[32px] bg-white/5 border border-white/10 animate-pulse flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                      <Replace size={32} className="text-orange-500" />
                    </div>
                    <p className="text-white/40 text-[10px] md:text-xs font-black uppercase tracking-widest">{ui.submitting}</p>
                  </div>
                )}

                {substitutions && (
                  <div className="p-6 md:p-8 rounded-[24px] md:rounded-[32px] bg-white/5 border border-white/10 animate-fade-in space-y-6">
                    <div className="flex justify-between items-center">
                      <h4 className="text-white font-black text-base md:text-lg uppercase tracking-tight flex items-center gap-2">
                        <Replace size={20} className="text-orange-500" />
                        {ui.subTitle}
                      </h4>
                      <button 
                        onClick={() => setSubstitutions(null)}
                        className="text-white/40 hover:text-white"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className="prose prose-invert prose-sm max-w-none text-white/70">
                      <Markdown>{substitutions}</Markdown>
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
          <div className="fixed inset-0 z-[410] flex items-center justify-center p-6 animate-fade-in">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowSettings(false)} />
            <div className="relative w-full max-w-md bg-[#121212] border border-white/10 rounded-[32px] p-8 space-y-6">
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
                    onChange={(e) => {
                      const newProv = e.target.value;
                      setProvider(newProv);
                      setModelId(newProv === 'google' ? 'gemini-2.0-flash' : newProv === 'openai' ? 'gpt-4o' : '');
                      setAvailableModels([]);
                    }}
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
                  <label htmlFor="settings-model" className="block text-[10px] text-white/40 font-black uppercase tracking-widest mb-2">Model ID {loadingModels && "(Loading...)"}</label>
                  <select
                    id="settings-model"
                    className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-yellow-500"
                    value={modelId}
                    onChange={(e) => setModelId(e.target.value)}
                  >
                    {availableModels.length > 0 ? (
                      availableModels.map(m => (
                        <option key={m.id} value={m.id} className="bg-[#121212]">{m.name}</option>
                      ))
                    ) : (
                      <option value={modelId} className="bg-[#121212]">
                        {modelId} {provider !== 'openrouter' && "(Enter API Key for more)"}
                      </option>
                    )}
                  </select>
                </div>

                <div>
                  <label htmlFor="settings-allergies" className="block text-[10px] text-white/40 font-black uppercase tracking-widest mb-2">{ui.allergies}</label>
                  <textarea
                    id="settings-allergies"
                    placeholder={ui.allergiesHint}
                    className="w-full h-20 p-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-yellow-500 resize-none"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                  />
                </div>
              </div>

              <button 
                onClick={() => setShowSettings(false)}
                className="w-full h-14 rounded-2xl bg-yellow-500 text-black font-black uppercase tracking-widest text-xs hover:bg-yellow-400 mt-4 shadow-lg shadow-yellow-500/20"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}

        {showEdibleWarning && (
          <div className="fixed inset-0 z-[420] flex items-center justify-center p-6 animate-fade-in">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setShowEdibleWarning(false)} />
            <div className="relative w-full max-w-md bg-[#121212] border-2 border-orange-500 rounded-[32px] p-8 space-y-6 shadow-[0_0_50px_rgba(249,115,22,0.2)]">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 rounded-2xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
                  <Activity size={40} className="text-orange-500 animate-pulse" />
                </div>
                <h3 className="text-2xl font-black tracking-tight uppercase text-orange-500">{ui.edibleWarning}</h3>
                <p className="text-white/60 text-sm font-medium">
                  {ui.edibleDesc} <span className="text-white font-bold italic">"{nonEdibleItems}"</span>. {ui.edibleProceed}
                </p>
              </div>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    setShowEdibleWarning(false);
                    generateRecipe(pendingIngredients, true);
                  }}
                  className="w-full h-14 rounded-2xl bg-orange-500 text-black font-black uppercase tracking-widest text-xs hover:bg-orange-400 transition-all"
                >
                  {ui.edibleConfirm}
                </button>
                <button 
                  onClick={() => setShowEdibleWarning(false)}
                  className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 text-white/60 font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all"
                >
                  {ui.edibleCancel}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <div className="fixed top-6 right-6 z-[300] flex flex-col gap-3 pointer-events-none">
        {toasts.map(toast => (
          <Toast 
            key={toast.id} 
            {...toast} 
            onRemove={removeToast} 
          />
        ))}
      </div>
      {isCookingMode && (
        <CookingMode 
          steps={extractSteps(recipe)} 
          language={language} 
          ui={ui} 
          onExit={() => setIsCookingMode(false)} 
        />
      )}
    </div>
  );
}