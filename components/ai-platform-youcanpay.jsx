'use client'
import { useState, useEffect, useRef, useCallback } from "react";

// ─── Security: All sensitive keys are server-side only ────────────────────────
// ANTHROPIC_API_KEY, YOUCAN_PAY_PRIVATE_KEY, SUPABASE_SERVICE_ROLE_KEY
// are NEVER exposed in client code — all API calls go through /api/* routes

// ─── متغيرات البيئة — تتوافق مع Vercel + Supabase Integration ───────────────
// في Vercel تُضاف تلقائياً: STORAGE_SUPABASE_URL و STORAGE_SUPABASE_ANON_KEY
// الكود يدعم المتغيرَين: القديم STORAGE_... والجديد NEXT_PUBLIC_...
const APP_URL      = process.env.NEXT_PUBLIC_APP_URL      || "";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.STORAGE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.STORAGE_SUPABASE_ANON_KEY || "";

// ─── Plan config ──────────────────────────────────────────────────────────────
const PLAN_CONFIG = {
  free:  { credits: 50,   price_mad: 0,   price_label: "0 درهم" },
  pro:   { credits: 500,  price_mad: 99,  price_label: "99 درهم" },
  ultra: { credits: 2000, price_mad: 299, price_label: "299 درهم" },
};

// ─── Video modes ──────────────────────────────────────────────────────────────
const VIDEO_MODES = {
  text2video: { icon: "✍️", costAr: "50 رصيد", costFr: "50 crédits", costEn: "50 credits" },
  img2video:  { icon: "🖼️", costAr: "60 رصيد", costFr: "60 crédits", costEn: "60 credits" },
  effects:    { icon: "✨", costAr: "40 رصيد", costFr: "40 crédits", costEn: "40 credits" },
  lipsync:    { icon: "🎤", costAr: "70 رصيد", costFr: "70 crédits", costEn: "70 credits" },
};

// ─── Translations ─────────────────────────────────────────────────────────────
const T = {
  ar: {
    dir: "rtl", name: "إبداع AI",
    tagline: "منصة الذكاء الاصطناعي لإبداع بلا حدود",
    nav: { chat: "المحادثة", images: "الصور", video: "الفيديو", gallery: "معرضي", pricing: "الأسعار", profile: "حسابي" },
    hero: { title: "اصنع المستقبل", subtitle: "بالذكاء الاصطناعي", desc: "توليد صور، فيديوهات، ومحادثات ذكية — كل ما تحتاجه في مكان واحد", cta: "ابدأ مجاناً", demo: "الأسعار" },
    chat: { title: "المحادثة الذكية", placeholder: "اكتب رسالتك هنا...", send: "إرسال", clear: "مسح", thinking: "جاري التفكير...", welcome: "مرحباً! أنا مساعدك الذكي. كيف يمكنني مساعدتك اليوم؟" },
    image: { title: "توليد الصور", placeholder: "صِف الصورة التي تريدها...", generate: "توليد الصورة", generating: "جاري التوليد...", style: "النمط", styles: { realistic: "واقعي", artistic: "فني", anime: "أنمي", abstract: "تجريدي" }, cost: "تكلفة: 10 رصيد", uploadLabel: "📎 أضف صورة مرجعية", uploadHint: "اسحب وأفلت أو انقر للرفع" },
    video: {
      title: "توليد الفيديو", generate: "توليد الفيديو", generating: "جاري المعالجة...", duration: "المدة",
      modes: { text2video: "نص إلى فيديو", img2video: "صورة إلى فيديو", effects: "مؤثرات بصرية", lipsync: "مزامنة الشفاه" },
      placeholders: { text2video: "صِف الفيديو... مثال: طائر يحلق فوق مدينة مضيئة", img2video: "صِف التحويل... مثال: اجعل الصورة تتحرك ببطء", effects: "صِف المؤثر... مثال: تأثير سينمائي مع ضباب", lipsync: "أضف نصاً للمزامنة مع الشخصية..." },
      uploadImg: "📎 ارفع صورة للتحويل", uploadVid: "🎬 ارفع فيديو للمؤثرات", resolution: "الدقة", aspectRatio: "نسبة العرض",
    },
    gallery: { title: "معرض أعمالي", empty: "لا توجد أعمال بعد. ابدأ بتوليد صورة أو فيديو!", delete: "حذف" },
    pricing: {
      title: "اختر خطتك", subtitle: "ابدأ مجاناً، طور حسب احتياجك",
      plans: [
        { id: "free",  name: "المجاني",    price: "0",   currency: "درهم/شهر", credits: 50,   features: ["50 رصيد شهرياً", "توليد صور عادية", "محادثة مفتوحة", "معرض 10 أعمال"], cta: "ابدأ مجاناً", popular: false },
        { id: "pro",   name: "الاحترافي", price: "99",  currency: "درهم/شهر", credits: 500,  features: ["500 رصيد شهرياً", "توليد صور HD", "فيديو بكل الأوضاع", "محادثة غير محدودة", "معرض 100 عمل", "أولوية المعالجة"], cta: "اشترك الآن", popular: true },
        { id: "ultra", name: "الأعمال",   price: "299", currency: "درهم/شهر", credits: 2000, features: ["2000 رصيد شهرياً", "جميع الميزات", "فيديو 4K", "API مخصص", "دعم 24/7", "معرض غير محدود"], cta: "تواصل معنا", popular: false },
      ],
    },
    credits: "الرصيد", logout: "خروج", login: "دخول",
    loginTitle: "مرحباً بعودتك", loginSub: "سجل دخولك للمتابعة",
    email: "البريد الإلكتروني", password: "كلمة المرور",
    firstName: "الاسم الأول", lastName: "اللقب", phone: "رقم الهاتف",
    loginBtn: "تسجيل الدخول", registerBtn: "إنشاء حساب",
    noAccount: "ليس لديك حساب؟", hasAccount: "لديك حساب؟",
    demoLogin: "دخول تجريبي",
    fillAll: "يرجى ملء جميع الحقول",
    toast: { copied: "تم النسخ!", generated: "تم التوليد بنجاح!", error: "حدث خطأ، حاول مجدداً", noCredits: "رصيدك غير كافٍ! يرجى الترقية" },
    pay: { title: "إتمام الدفع", subtitle: "أنت على بُعد خطوة واحدة", orderSummary: "ملخص الطلب", plan: "الخطة", credits: "الرصيد", total: "المجموع", currency: "درهم مغربي", secureBadge: "دفع آمن بـ YouCan Pay", payNow: "ادفع الآن", processing: "جاري المعالجة...", back: "رجوع", success: "تم الدفع! تم إضافة رصيدك.", failed: "فشل الدفع.", redirect: "جاري التحويل...", youcanBtn: "الدفع عبر YouCan Pay", backToPricing: "العودة للأسعار", guarantee: "ضمان 7 أيام", support: "دعم 24/7", ssl: "تشفير SSL" },
    profile: { title: "حسابي", plan: "خطتي", credits: "رصيدي", joined: "عضو منذ", editName: "تعديل الاسم", save: "حفظ", history: "سجل الاستخدام", noHistory: "لا يوجد سجل بعد" },
    uploadMedia: "📎 ارفع ملفاً",
  },
  fr: {
    dir: "ltr", name: "Ibda3 AI",
    tagline: "La plateforme IA pour une créativité sans limites",
    nav: { chat: "Chat", images: "Images", video: "Vidéo", gallery: "Galerie", pricing: "Tarifs", profile: "Profil" },
    hero: { title: "Créez l'avenir", subtitle: "avec l'Intelligence Artificielle", desc: "Génération d'images, vidéos et conversations — tout en un", cta: "Commencer gratuitement", demo: "Tarifs" },
    chat: { title: "Chat Intelligent", placeholder: "Écrivez votre message...", send: "Envoyer", clear: "Effacer", thinking: "Réflexion...", welcome: "Bonjour! Je suis votre assistant IA." },
    image: { title: "Génération d'Images", placeholder: "Décrivez l'image souhaitée...", generate: "Générer", generating: "Génération...", style: "Style", styles: { realistic: "Réaliste", artistic: "Artistique", anime: "Animé", abstract: "Abstrait" }, cost: "Coût: 10 crédits", uploadLabel: "📎 Ajouter une image", uploadHint: "Glissez ou cliquez pour uploader" },
    video: {
      title: "Génération de Vidéo", generate: "Générer", generating: "Traitement...", duration: "Durée",
      modes: { text2video: "Texte en Vidéo", img2video: "Image en Vidéo", effects: "Effets Visuels", lipsync: "Lip Sync" },
      placeholders: { text2video: "Décrivez la vidéo...", img2video: "Décrivez la transformation...", effects: "Décrivez l'effet...", lipsync: "Ajoutez le texte à synchroniser..." },
      uploadImg: "📎 Uploader une image", uploadVid: "🎬 Uploader une vidéo", resolution: "Résolution", aspectRatio: "Format",
    },
    gallery: { title: "Ma Galerie", empty: "Aucune création. Commencez!", delete: "Supprimer" },
    pricing: {
      title: "Choisissez votre plan", subtitle: "Commencez gratuitement",
      plans: [
        { id: "free",  name: "Gratuit",  price: "0",   currency: "MAD/mois", credits: 50,   features: ["50 crédits/mois", "Images standard", "Chat illimité", "Galerie 10"], cta: "Commencer", popular: false },
        { id: "pro",   name: "Pro",      price: "99",  currency: "MAD/mois", credits: 500,  features: ["500 crédits/mois", "Images HD", "Tous modes vidéo", "Chat illimité", "Galerie 100", "Prioritaire"], cta: "S'abonner", popular: true },
        { id: "ultra", name: "Business", price: "299", currency: "MAD/mois", credits: 2000, features: ["2000 crédits/mois", "Tout inclus", "Vidéo 4K", "API dédiée", "Support 24/7", "Galerie illimitée"], cta: "Contactez-nous", popular: false },
      ],
    },
    credits: "Crédits", logout: "Déconnexion", login: "Connexion",
    loginTitle: "Bon retour", loginSub: "Connectez-vous pour continuer",
    email: "Email", password: "Mot de passe",
    firstName: "Prénom", lastName: "Nom", phone: "Téléphone",
    loginBtn: "Se connecter", registerBtn: "Créer un compte",
    noAccount: "Pas de compte?", hasAccount: "Déjà un compte?",
    demoLogin: "Connexion démo", fillAll: "Veuillez remplir tous les champs",
    toast: { copied: "Copié!", generated: "Généré!", error: "Erreur", noCredits: "Crédits insuffisants!" },
    pay: { title: "Finaliser le paiement", subtitle: "Un pas vers la créativité", orderSummary: "Récapitulatif", plan: "Plan", credits: "Crédits", total: "Total", currency: "MAD", secureBadge: "Paiement sécurisé YouCan Pay", payNow: "Payer", processing: "Traitement...", back: "Retour", success: "Paiement réussi!", failed: "Échec.", redirect: "Redirection...", youcanBtn: "Payer via YouCan Pay", backToPricing: "Retour tarifs", guarantee: "Garantie 7 jours", support: "Support 24/7", ssl: "SSL" },
    profile: { title: "Mon Profil", plan: "Mon plan", credits: "Mes crédits", joined: "Membre depuis", editName: "Modifier le nom", save: "Sauvegarder", history: "Historique", noHistory: "Aucun historique" },
    uploadMedia: "📎 Uploader",
  },
  en: {
    dir: "ltr", name: "Ibda3 AI",
    tagline: "The AI platform for limitless creativity",
    nav: { chat: "Chat", images: "Images", video: "Video", gallery: "Gallery", pricing: "Pricing", profile: "Profile" },
    hero: { title: "Build the Future", subtitle: "with Artificial Intelligence", desc: "Generate images, videos, and intelligent conversations — all in one place", cta: "Start for Free", demo: "Pricing" },
    chat: { title: "Smart Chat", placeholder: "Type your message...", send: "Send", clear: "Clear", thinking: "Thinking...", welcome: "Hello! I'm your AI assistant. How can I help?" },
    image: { title: "Image Generation", placeholder: "Describe the image you want...", generate: "Generate Image", generating: "Generating...", style: "Style", styles: { realistic: "Realistic", artistic: "Artistic", anime: "Anime", abstract: "Abstract" }, cost: "Cost: 10 credits", uploadLabel: "📎 Add reference image", uploadHint: "Drag & drop or click to upload" },
    video: {
      title: "Video Generation", generate: "Generate Video", generating: "Processing...", duration: "Duration",
      modes: { text2video: "Text to Video", img2video: "Image to Video", effects: "Visual Effects", lipsync: "Lip Sync" },
      placeholders: { text2video: "Describe the video...", img2video: "Describe the transformation...", effects: "Describe the effect...", lipsync: "Add text to sync with character..." },
      uploadImg: "📎 Upload image", uploadVid: "🎬 Upload video", resolution: "Resolution", aspectRatio: "Aspect Ratio",
    },
    gallery: { title: "My Gallery", empty: "No creations yet. Start generating!", delete: "Delete" },
    pricing: {
      title: "Choose Your Plan", subtitle: "Start free, scale as you grow",
      plans: [
        { id: "free",  name: "Free",     price: "0",   currency: "MAD/mo", credits: 50,   features: ["50 credits/month", "Standard images", "Unlimited chat", "Gallery 10"], cta: "Get Started", popular: false },
        { id: "pro",   name: "Pro",      price: "99",  currency: "MAD/mo", credits: 500,  features: ["500 credits/month", "HD images", "All video modes", "Unlimited chat", "Gallery 100", "Priority"], cta: "Subscribe", popular: true },
        { id: "ultra", name: "Business", price: "299", currency: "MAD/mo", credits: 2000, features: ["2000 credits/month", "Everything", "4K video", "Dedicated API", "24/7 support", "Unlimited gallery"], cta: "Contact Us", popular: false },
      ],
    },
    credits: "Credits", logout: "Logout", login: "Login",
    loginTitle: "Welcome Back", loginSub: "Sign in to continue",
    email: "Email", password: "Password",
    firstName: "First Name", lastName: "Last Name", phone: "Phone",
    loginBtn: "Sign In", registerBtn: "Create Account",
    noAccount: "No account?", hasAccount: "Have an account?",
    demoLogin: "Demo Login", fillAll: "Please fill all fields",
    toast: { copied: "Copied!", generated: "Generated!", error: "Error", noCredits: "Insufficient credits!" },
    pay: { title: "Complete Payment", subtitle: "One step away", orderSummary: "Order Summary", plan: "Plan", credits: "Credits", total: "Total", currency: "MAD", secureBadge: "Secure payment via YouCan Pay", payNow: "Pay Now", processing: "Processing...", back: "Back", success: "Payment successful!", failed: "Payment failed.", redirect: "Redirecting...", youcanBtn: "Pay via YouCan Pay", backToPricing: "Back to Pricing", guarantee: "7-day guarantee", support: "24/7 Support", ssl: "SSL" },
    profile: { title: "My Profile", plan: "My Plan", credits: "My Credits", joined: "Member since", editName: "Edit Name", save: "Save", history: "Usage History", noHistory: "No history yet" },
    uploadMedia: "📎 Upload File",
  },
};

export default function App() {
  const [lang, setLang] = useState("ar");
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(50);
  const [gallery, setGallery] = useState([]);
  const [toast, setToast] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageStyle, setImageStyle] = useState("realistic");
  const [imageLoading, setImageLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [videoPrompt, setVideoPrompt] = useState("");
  const [videoMode, setVideoMode] = useState("text2video");
  const [videoDuration, setVideoDuration] = useState("5");
  const [videoAspect, setVideoAspect] = useState("16:9");
  const [videoResolution, setVideoResolution] = useState("720p");
  const [videoLoading, setVideoLoading] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [loginMode, setLoginMode] = useState("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginFirst, setLoginFirst] = useState("");
  const [loginLast, setLoginLast] = useState("");
  const [loginPhone, setLoginPhone] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [payLoading, setPayLoading] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [usageHistory, setUsageHistory] = useState([]);
  const chatEndRef = useRef(null);
  const imageFileRef = useRef(null);
  const videoFileRef = useRef(null);

  const t = T[lang];
  const isRTL = t.dir === "rtl";

  useEffect(() => {
    document.documentElement.dir = t.dir;
    document.documentElement.lang = lang;
  }, [lang, t.dir]);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ── Supabase Auth ────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!loginEmail || !loginPass) { showToast(t.fillAll, "error"); return; }
    setLoginLoading(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "apikey": SUPABASE_ANON_KEY },
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
      });
      const data = await res.json();
      if (data.error) { showToast(data.error_description || t.toast.error, "error"); }
      else {
        setUser({ name: data.user?.user_metadata?.full_name || loginEmail.split("@")[0], email: loginEmail, id: data.user?.id, token: data.access_token });
        setChatMessages([{ role: "assistant", content: t.chat.welcome }]);
        setPage("chat");
        showToast(lang === "ar" ? "أهلاً بك!" : lang === "fr" ? "Bienvenue!" : "Welcome!");
      }
    } catch { showToast(t.toast.error, "error"); }
    setLoginLoading(false);
  };

  const handleRegister = async () => {
    if (!loginFirst || !loginLast || !loginPhone || !loginEmail || !loginPass) { showToast(t.fillAll, "error"); return; }
    // Basic validation
    if (loginPass.length < 8) { showToast(lang === "ar" ? "كلمة المرور 8 أحرف على الأقل" : "Password must be 8+ chars", "error"); return; }
    if (!/\S+@\S+\.\S+/.test(loginEmail)) { showToast(lang === "ar" ? "بريد إلكتروني غير صالح" : "Invalid email", "error"); return; }
    setLoginLoading(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "apikey": SUPABASE_ANON_KEY },
        body: JSON.stringify({ email: loginEmail, password: loginPass, data: { full_name: `${loginFirst} ${loginLast}`, phone: loginPhone } }),
      });
      const data = await res.json();
      if (data.error) { showToast(data.error_description || t.toast.error, "error"); }
      else { showToast(lang === "ar" ? "تحقق من بريدك الإلكتروني!" : lang === "fr" ? "Vérifiez votre email!" : "Check your email!"); setLoginMode("login"); }
    } catch { showToast(t.toast.error, "error"); }
    setLoginLoading(false);
  };

  const handleDemoLogin = () => {
    setUser({ name: lang === "ar" ? "مستخدم تجريبي" : "Demo User", email: "demo@ibda3ai.com", id: "demo" });
    setCredits(150);
    setChatMessages([{ role: "assistant", content: t.chat.welcome }]);
    setPage("chat");
  };

  const handleLogout = () => { setUser(null); setPage("home"); setCredits(50); };

  // ── Chat (secure: goes through /api/chat) ────────────────────────────────────
  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = { role: "user", content: chatInput };
    const msgs = [...chatMessages, userMsg];
    setChatMessages(msgs);
    setChatInput("");
    setChatLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(user?.token ? { "Authorization": `Bearer ${user.token}` } : {}) },
        body: JSON.stringify({ messages: msgs.map(m => ({ role: m.role, content: m.content })), userId: user?.id || "demo" }),
      });
      const data = await res.json();
      if (res.status === 402) { showToast(t.toast.noCredits, "error"); setChatLoading(false); return; }
      const reply = data.content || t.toast.error;
      setChatMessages([...msgs, { role: "assistant", content: reply }]);
      addHistory("chat", chatInput);
    } catch { showToast(t.toast.error, "error"); }
    setChatLoading(false);
  };

  // ── Image Generation (secure: goes through /api/generate-image) ──────────────
  const generateImage = async () => {
    if (!imagePrompt.trim() || imageLoading) return;
    if (credits < 10) { showToast(t.toast.noCredits, "error"); return; }
    setImageLoading(true); setGeneratedImage(null);
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: imagePrompt, style: imageStyle, userId: user?.id || "demo" }),
      });
      const data = await res.json();
      const imgUrl = data.url || `https://picsum.photos/seed/${Date.now()}/600/400`;
      setGeneratedImage(imgUrl);
      setCredits(c => c - 10);
      setGallery(g => [{ id: Date.now(), type: "image", url: imgUrl, prompt: imagePrompt, date: new Date().toLocaleDateString() }, ...g]);
      showToast(t.toast.generated);
      addHistory("image", imagePrompt);
    } catch { showToast(t.toast.error, "error"); }
    setImageLoading(false);
  };

  // ── Video Generation (secure: goes through /api/generate-video) ──────────────
  const generateVideo = async () => {
    if (!videoPrompt.trim() || videoLoading) return;
    const cost = videoMode === "text2video" ? 50 : videoMode === "img2video" ? 60 : videoMode === "effects" ? 40 : 70;
    if (credits < cost) { showToast(t.toast.noCredits, "error"); return; }
    setVideoLoading(true); setGeneratedVideo(null);
    try {
      const res = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: videoPrompt, mode: videoMode, duration: videoDuration, aspect: videoAspect, resolution: videoResolution, userId: user?.id || "demo" }),
      });
      const data = await res.json();
      const thumbUrl = data.thumbnail || `https://picsum.photos/seed/${Date.now()}/600/338`;
      setGeneratedVideo({ thumb: thumbUrl, prompt: videoPrompt, mode: videoMode });
      setCredits(c => c - cost);
      setGallery(g => [{ id: Date.now(), type: "video", url: thumbUrl, prompt: videoPrompt, date: new Date().toLocaleDateString() }, ...g]);
      showToast(t.toast.generated);
      addHistory("video", videoPrompt);
    } catch { showToast(t.toast.error, "error"); }
    setVideoLoading(false);
  };

  // ── Payment (secure: goes through /api/youcanpay/checkout) ──────────────────
  const openPayment = (plan) => {
    if (!user) { setPage("login"); return; }
    if (plan.id === "free") { showToast(lang === "ar" ? "أنت على الخطة المجانية" : "You're on the free plan"); return; }
    if (plan.id === "ultra") { showToast(lang === "ar" ? "تواصل معنا عبر البريد" : "Contact us via email"); return; }
    setSelectedPlan(plan); setPage("payment");
  };

  const handleYouCanRedirect = async () => {
    if (!selectedPlan || !user) return;
    setPayLoading(true);
    showToast(t.pay.redirect);
    try {
      const res = await fetch("/api/youcanpay/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: selectedPlan.id, userId: user.id, email: user.email }),
      });
      const data = await res.json();
      if (data.checkout_url) { window.location.href = data.checkout_url; }
      else { showToast(t.pay.failed, "error"); }
    } catch { showToast(t.pay.failed, "error"); }
    setPayLoading(false);
  };

  const addHistory = (type, prompt) => {
    setUsageHistory(h => [{ id: Date.now(), type, prompt: prompt.slice(0, 50), date: new Date().toLocaleDateString() }, ...h.slice(0, 19)]);
  };

  // ─── CSS ──────────────────────────────────────────────────────────────────────
  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=Noto+Kufi+Arabic:wght@300;400;600;700;800&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #050508; --surface: #0d0d14; --surface2: #13131e;
      --border: rgba(255,255,255,0.07); --border2: rgba(255,255,255,0.12);
      --accent: #7c5cfc; --accent2: #c158f5; --gold: #f0c040;
      --text: #e8e8f0; --muted: #7070a0; --success: #4ade80; --error: #f87171;
      --font: ${lang === "ar" ? "'Noto Kufi Arabic'" : "'Sora'"}, sans-serif;
      --radius: 16px; --glow: 0 0 40px rgba(124,92,252,0.25);
    }
    html, body, #root { height: 100%; background: var(--bg); color: var(--text); font-family: var(--font); }
    .app { min-height: 100vh; display: flex; flex-direction: column; }

    /* ── Animated background orbs ── */
    .bg-orbs { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
    .orb {
      position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.15;
      animation: orbFloat 8s ease-in-out infinite;
    }
    .orb-1 { width: 600px; height: 600px; background: radial-gradient(circle, #7c5cfc, transparent); top: -200px; left: -200px; animation-delay: 0s; }
    .orb-2 { width: 400px; height: 400px; background: radial-gradient(circle, #c158f5, transparent); bottom: -100px; right: -100px; animation-delay: 3s; }
    .orb-3 { width: 300px; height: 300px; background: radial-gradient(circle, #f0c040, transparent); top: 40%; left: 60%; animation-delay: 5s; }
    @keyframes orbFloat {
      0%, 100% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(30px, -30px) scale(1.05); }
      66% { transform: translate(-20px, 20px) scale(0.95); }
    }

    /* ── Navbar ── */
    .navbar {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      background: rgba(5,5,8,0.85); backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--border);
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 24px; height: 64px; gap: 16px;
    }
    .nav-logo { display: flex; align-items: center; gap: 10px; cursor: pointer; }
    .nav-logo-icon { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, var(--accent), var(--accent2)); display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: var(--glow); }
    .nav-logo-text { font-size: 18px; font-weight: 700; background: linear-gradient(135deg, #a78bfa, #e879f9); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .nav-links { display: flex; gap: 4px; }
    .nav-link { padding: 6px 14px; border-radius: 8px; cursor: pointer; font-size: 13px; color: var(--muted); transition: all 0.2s; border: none; background: none; font-family: var(--font); }
    .nav-link:hover, .nav-link.active { color: var(--text); background: rgba(255,255,255,0.07); }
    .nav-right { display: flex; align-items: center; gap: 12px; }
    .credits-badge { display: flex; align-items: center; gap: 6px; padding: 5px 12px; background: rgba(240,192,64,0.1); border: 1px solid rgba(240,192,64,0.25); border-radius: 20px; font-size: 13px; font-weight: 600; color: var(--gold); }
    .lang-btn { padding: 5px 10px; border-radius: 8px; border: 1px solid var(--border2); background: var(--surface); color: var(--muted); cursor: pointer; font-size: 12px; font-family: var(--font); transition: all 0.2s; }
    .lang-btn:hover { color: var(--text); border-color: var(--accent); }
    .btn-ghost { padding: 7px 16px; border-radius: 10px; border: 1px solid var(--border2); background: none; color: var(--text); cursor: pointer; font-family: var(--font); font-size: 13px; transition: all 0.2s; }
    .btn-ghost:hover { background: rgba(255,255,255,0.07); }
    .btn-primary { padding: 8px 20px; border-radius: 10px; border: none; cursor: pointer; background: linear-gradient(135deg, var(--accent), var(--accent2)); color: white; font-family: var(--font); font-size: 14px; font-weight: 600; transition: all 0.2s; box-shadow: 0 0 20px rgba(124,92,252,0.3); }
    .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 0 30px rgba(124,92,252,0.5); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    .main { flex: 1; padding-top: 64px; position: relative; z-index: 1; }

    /* ── Hero ── */
    .hero { min-height: calc(100vh - 64px); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 40px 24px; position: relative; overflow: hidden; }
    .hero-grid { position: absolute; inset: 0; z-index: 0; opacity: 0.03; background-image: linear-gradient(var(--border2) 1px, transparent 1px), linear-gradient(90deg, var(--border2) 1px, transparent 1px); background-size: 60px 60px; }
    .hero-content { position: relative; z-index: 1; max-width: 800px; }
    .hero-badge { display: inline-flex; align-items: center; gap: 8px; margin-bottom: 32px; padding: 8px 18px; border-radius: 50px; border: 1px solid rgba(124,92,252,0.3); background: rgba(124,92,252,0.1); font-size: 13px; color: #a78bfa; animation: fadeUp 0.6s ease both; }
    .hero-title { font-size: clamp(48px,8vw,96px); font-weight: 800; line-height: 1; margin-bottom: 8px; animation: fadeUp 0.6s 0.1s ease both; }
    .hero-title-grad { background: linear-gradient(135deg, #a78bfa, #e879f9, #f0c040); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .hero-subtitle { font-size: clamp(20px,3vw,32px); font-weight: 300; color: var(--muted); margin-bottom: 24px; animation: fadeUp 0.6s 0.2s ease both; }
    .hero-desc { font-size: 16px; color: var(--muted); max-width: 500px; margin: 0 auto 40px; line-height: 1.7; animation: fadeUp 0.6s 0.3s ease both; }
    .hero-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; animation: fadeUp 0.6s 0.4s ease both; }
    .btn-large { padding: 14px 32px; font-size: 16px; border-radius: 14px; }
    .hero-stats { display: flex; gap: 40px; margin-top: 60px; animation: fadeUp 0.6s 0.5s ease both; }
    .stat { text-align: center; }
    .stat-num { font-size: 28px; font-weight: 800; background: linear-gradient(135deg, #a78bfa, #e879f9); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .stat-label { font-size: 12px; color: var(--muted); margin-top: 4px; }

    /* ── Upload badge on hero ── */
    .hero-upload-hint { position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%); display: flex; gap: 12px; animation: fadeUp 0.6s 0.7s ease both; }
    .upload-hint-btn { display: flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 12px; border: 1px dashed rgba(124,92,252,0.4); background: rgba(124,92,252,0.06); color: #a78bfa; font-size: 13px; cursor: pointer; transition: all 0.2s; font-family: var(--font); }
    .upload-hint-btn:hover { background: rgba(124,92,252,0.12); border-color: var(--accent); }

    /* ── Features ── */
    .features { display: flex; gap: 16px; padding: 20px 24px 40px; max-width: 1100px; margin: 0 auto; flex-wrap: wrap; }
    .feature-card { flex: 1; min-width: 200px; padding: 24px; border-radius: var(--radius); background: var(--surface); border: 1px solid var(--border); transition: all 0.3s; }
    .feature-card:hover { border-color: var(--accent); transform: translateY(-4px); box-shadow: var(--glow); }
    .feature-icon { font-size: 32px; margin-bottom: 12px; }
    .feature-title { font-size: 15px; font-weight: 600; margin-bottom: 8px; }
    .feature-desc { font-size: 13px; color: var(--muted); line-height: 1.6; }

    /* ── Page ── */
    .page { max-width: 900px; margin: 0 auto; padding: 40px 24px; }
    .page-title { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
    .page-sub { font-size: 14px; color: var(--muted); margin-bottom: 32px; }

    /* ── Chat ── */
    .chat-container { display: flex; flex-direction: column; height: calc(100vh - 180px); }
    .chat-messages { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; padding: 16px; background: var(--surface); border-radius: var(--radius) var(--radius) 0 0; border: 1px solid var(--border); border-bottom: none; }
    .chat-messages::-webkit-scrollbar { width: 4px; }
    .chat-messages::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 4px; }
    .msg { display: flex; gap: 12px; max-width: 80%; }
    .msg.user { align-self: flex-end; flex-direction: row-reverse; }
    .msg-avatar { width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 16px; }
    .msg.assistant .msg-avatar { background: linear-gradient(135deg, var(--accent), var(--accent2)); }
    .msg.user .msg-avatar { background: linear-gradient(135deg, #1a1a30, #2a2a50); border: 1px solid var(--border2); }
    .msg-bubble { padding: 12px 16px; border-radius: 14px; font-size: 14px; line-height: 1.7; }
    .msg.assistant .msg-bubble { background: var(--surface2); border: 1px solid var(--border); border-radius: 4px 14px 14px 14px; }
    .msg.user .msg-bubble { background: linear-gradient(135deg, var(--accent), var(--accent2)); color: white; border-radius: 14px 4px 14px 14px; }
    .msg-thinking { display: flex; gap: 4px; align-items: center; padding: 14px 16px; }
    .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); animation: bounce 1s infinite; }
    .dot:nth-child(2) { animation-delay: 0.15s; }
    .dot:nth-child(3) { animation-delay: 0.3s; }
    .chat-input-area { display: flex; gap: 10px; padding: 14px; background: var(--surface2); border: 1px solid var(--border); border-radius: 0 0 var(--radius) var(--radius); }
    .chat-textarea { flex: 1; background: rgba(255,255,255,0.04); border: 1px solid var(--border); border-radius: 10px; padding: 10px 14px; color: var(--text); font-family: var(--font); font-size: 14px; resize: none; outline: none; transition: border-color 0.2s; min-height: 44px; max-height: 120px; }
    .chat-textarea:focus { border-color: var(--accent); }

    /* ── Gen box ── */
    .gen-box { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 28px; margin-bottom: 24px; }
    .gen-label { font-size: 13px; font-weight: 600; color: var(--muted); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em; }
    .gen-textarea { width: 100%; min-height: 100px; background: rgba(255,255,255,0.04); border: 1px solid var(--border); border-radius: 10px; padding: 14px; color: var(--text); font-family: var(--font); font-size: 14px; resize: vertical; outline: none; transition: border-color 0.2s; line-height: 1.6; }
    .gen-textarea:focus { border-color: var(--accent); }
    .style-pills { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
    .style-pill { padding: 6px 14px; border-radius: 20px; border: 1px solid var(--border2); background: none; color: var(--muted); cursor: pointer; font-size: 13px; font-family: var(--font); transition: all 0.2s; }
    .style-pill.active { background: rgba(124,92,252,0.2); border-color: var(--accent); color: #a78bfa; }
    .gen-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 20px; }
    .cost-label { font-size: 13px; color: var(--muted); }
    .result-box { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
    .result-img { width: 100%; display: block; aspect-ratio: 3/2; object-fit: cover; }
    .result-footer { padding: 14px 18px; display: flex; align-items: center; justify-content: space-between; }
    .result-prompt { font-size: 12px; color: var(--muted); flex: 1; }

    /* ── Video mode tabs ── */
    .video-mode-tabs { display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; }
    .video-mode-tab { display: flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 12px; border: 1px solid var(--border2); background: var(--surface); color: var(--muted); cursor: pointer; font-size: 13px; font-family: var(--font); transition: all 0.2s; }
    .video-mode-tab:hover { border-color: var(--accent); color: var(--text); }
    .video-mode-tab.active { background: rgba(124,92,252,0.15); border-color: var(--accent); color: #a78bfa; }
    .video-mode-cost { font-size: 11px; padding: 2px 8px; border-radius: 10px; background: rgba(124,92,252,0.2); color: #a78bfa; margin-left: 4px; }
    .upload-zone { border: 2px dashed rgba(124,92,252,0.3); border-radius: 12px; padding: 20px; text-align: center; cursor: pointer; transition: all 0.2s; margin-bottom: 16px; }
    .upload-zone:hover { border-color: var(--accent); background: rgba(124,92,252,0.05); }
    .upload-zone-icon { font-size: 28px; margin-bottom: 8px; }
    .upload-zone-text { font-size: 13px; color: var(--muted); }
    .video-options-row { display: flex; gap: 16px; flex-wrap: wrap; margin-top: 16px; }
    .video-option-group { flex: 1; min-width: 120px; }
    .video-placeholder { aspect-ratio: 16/9; background: linear-gradient(135deg, #0d0d20, #1a0d30); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; position: relative; overflow: hidden; }
    .video-glow { position: absolute; inset: 0; background: radial-gradient(ellipse at center, rgba(124,92,252,0.1) 0%, transparent 70%); animation: pulse 2s infinite; }

    /* ── Gallery ── */
    .gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px,1fr)); gap: 16px; }
    .gallery-item { position: relative; border-radius: var(--radius); overflow: hidden; border: 1px solid var(--border); cursor: pointer; }
    .gallery-item img { width: 100%; aspect-ratio: 4/3; object-fit: cover; display: block; transition: transform 0.3s; }
    .gallery-item:hover img { transform: scale(1.05); }
    .gallery-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); opacity: 0; transition: opacity 0.3s; display: flex; flex-direction: column; justify-content: flex-end; padding: 14px; }
    .gallery-item:hover .gallery-overlay { opacity: 1; }
    .gallery-prompt { font-size: 12px; color: white; margin-bottom: 8px; }
    .gallery-type-badge { position: absolute; top: 10px; right: 10px; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; }
    .badge-image { background: rgba(124,92,252,0.8); }
    .badge-video { background: rgba(239,68,68,0.8); }
    .btn-delete { padding: 5px 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.5); color: white; cursor: pointer; font-size: 12px; font-family: var(--font); }
    .empty-state { text-align: center; padding: 80px 20px; color: var(--muted); }
    .empty-icon { font-size: 48px; margin-bottom: 16px; }

    /* ── Pricing ── */
    .pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px,1fr)); gap: 20px; margin-top: 40px; }
    .plan-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 32px; position: relative; transition: all 0.3s; }
    .plan-card:hover { transform: translateY(-6px); box-shadow: var(--glow); }
    .plan-card.popular { border-color: var(--accent); background: rgba(124,92,252,0.05); }
    .popular-badge { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); padding: 4px 16px; border-radius: 20px; font-size: 11px; font-weight: 700; background: linear-gradient(135deg, var(--accent), var(--accent2)); color: white; white-space: nowrap; }
    .plan-name { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
    .plan-price { font-size: 36px; font-weight: 800; margin-bottom: 4px; }
    .plan-price span { font-size: 14px; font-weight: 400; color: var(--muted); }
    .plan-credits { font-size: 13px; color: var(--accent); margin-bottom: 24px; font-weight: 600; }
    .plan-features { list-style: none; margin-bottom: 28px; display: flex; flex-direction: column; gap: 10px; }
    .plan-features li { font-size: 13px; color: var(--muted); display: flex; align-items: center; gap: 8px; }
    .plan-features li::before { content: '✓'; color: var(--success); font-weight: 700; flex-shrink: 0; }
    .plan-cta { width: 100%; padding: 12px; border-radius: 12px; font-family: var(--font); font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; border: none; }
    .plan-cta.primary { background: linear-gradient(135deg, var(--accent), var(--accent2)); color: white; }
    .plan-cta.secondary { background: var(--surface2); color: var(--text); border: 1px solid var(--border2); }
    .plan-cta:hover { transform: translateY(-2px); }

    /* ── Login ── */
    .login-page { min-height: calc(100vh - 64px); display: flex; align-items: center; justify-content: center; padding: 40px 24px; }
    .login-card { width: 100%; max-width: 440px; background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 40px; }
    .login-logo { text-align: center; margin-bottom: 28px; }
    .login-logo-icon { width: 56px; height: 56px; border-radius: 16px; background: linear-gradient(135deg, var(--accent), var(--accent2)); display: flex; align-items: center; justify-content: center; font-size: 28px; margin: 0 auto 12px; box-shadow: var(--glow); }
    .login-title { font-size: 22px; font-weight: 700; text-align: center; margin-bottom: 6px; }
    .login-sub { font-size: 13px; color: var(--muted); text-align: center; margin-bottom: 28px; }
    .input-row { display: flex; gap: 12px; }
    .input-group { margin-bottom: 14px; flex: 1; }
    .input-label { font-size: 12px; font-weight: 600; color: var(--muted); margin-bottom: 6px; display: block; text-transform: uppercase; letter-spacing: 0.04em; }
    .input-field { width: 100%; padding: 11px 14px; background: rgba(255,255,255,0.04); border: 1px solid var(--border); border-radius: 10px; color: var(--text); font-family: var(--font); font-size: 14px; outline: none; transition: border-color 0.2s; }
    .input-field:focus { border-color: var(--accent); }
    .login-divider { display: flex; align-items: center; gap: 12px; margin: 16px 0; color: var(--muted); font-size: 12px; }
    .login-divider::before, .login-divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }
    .btn-demo { width: 100%; padding: 11px; border-radius: 10px; border: 1px solid var(--border2); background: rgba(255,255,255,0.04); color: var(--text); font-family: var(--font); font-size: 14px; cursor: pointer; transition: all 0.2s; }
    .btn-demo:hover { background: rgba(255,255,255,0.08); }
    .login-switch { text-align: center; margin-top: 16px; font-size: 13px; color: var(--muted); }
    .login-switch a { color: #a78bfa; cursor: pointer; text-decoration: none; }

    /* ── Profile ── */
    .profile-header { display: flex; align-items: center; gap: 20px; padding: 32px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); margin-bottom: 24px; }
    .profile-avatar { width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, var(--accent), var(--accent2)); display: flex; align-items: center; justify-content: center; font-size: 32px; flex-shrink: 0; box-shadow: var(--glow); }
    .profile-name { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
    .profile-email { font-size: 13px; color: var(--muted); }
    .profile-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
    .profile-stat { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; text-align: center; }
    .profile-stat-num { font-size: 24px; font-weight: 800; background: linear-gradient(135deg, #a78bfa, #e879f9); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .profile-stat-label { font-size: 12px; color: var(--muted); margin-top: 4px; }
    .history-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 8px; }
    .history-type { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; }
    .history-type-chat { background: rgba(124,92,252,0.2); }
    .history-type-image { background: rgba(74,222,128,0.2); }
    .history-type-video { background: rgba(248,113,113,0.2); }
    .history-prompt { font-size: 13px; color: var(--text); flex: 1; }
    .history-date { font-size: 11px; color: var(--muted); }

    /* ── Payment ── */
    .pay-page { min-height: calc(100vh - 64px); display: flex; align-items: flex-start; justify-content: center; padding: 40px 24px; }
    .pay-layout { display: grid; grid-template-columns: 1fr 340px; gap: 24px; max-width: 900px; width: 100%; }
    .pay-card { background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 32px; animation: fadeUp 0.5s ease both; }
    .pay-title { font-size: 22px; font-weight: 700; margin-bottom: 6px; }
    .pay-subtitle { font-size: 13px; color: var(--muted); margin-bottom: 28px; }
    .btn-pay { width: 100%; padding: 14px; border-radius: 12px; border: none; cursor: pointer; background: linear-gradient(135deg, #ff6b35, #f7931e); color: white; font-family: var(--font); font-size: 15px; font-weight: 700; transition: all 0.2s; box-shadow: 0 8px 24px rgba(255,107,53,0.3); display: flex; align-items: center; justify-content: center; gap: 8px; }
    .btn-pay:hover { transform: translateY(-2px); }
    .btn-pay:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    .pay-summary { background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 28px; position: sticky; top: 80px; }
    .summary-plan-name { font-size: 24px; font-weight: 800; margin-bottom: 6px; background: linear-gradient(135deg, #a78bfa, #e879f9); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .summary-rows { display: flex; flex-direction: column; gap: 12px; margin: 20px 0; }
    .summary-row { display: flex; justify-content: space-between; align-items: center; font-size: 13px; }
    .summary-row .label { color: var(--muted); }
    .summary-row .value { font-weight: 600; }
    .summary-total { display: flex; justify-content: space-between; align-items: center; }
    .summary-total .label { font-size: 14px; font-weight: 600; }
    .summary-total .value { font-size: 26px; font-weight: 800; color: var(--gold); }
    .trust-badges { display: flex; flex-direction: column; gap: 10px; margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border); }
    .trust-item { display: flex; align-items: center; gap: 10px; font-size: 12px; color: var(--muted); }
    .secure-badge { display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 16px; font-size: 12px; color: var(--muted); }

    /* ── Toast ── */
    .toast { position: fixed; bottom: 24px; right: 24px; z-index: 9999; padding: 12px 20px; border-radius: 12px; font-size: 14px; font-weight: 500; animation: slideIn 0.3s ease; box-shadow: 0 8px 32px rgba(0,0,0,0.5); max-width: 300px; }
    .toast.success { background: rgba(74,222,128,0.15); border: 1px solid rgba(74,222,128,0.3); color: var(--success); }
    .toast.error { background: rgba(248,113,113,0.15); border: 1px solid rgba(248,113,113,0.3); color: var(--error); }

    /* ── Keyframes ── */
    @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes bounce { 0%,80%,100% { transform: scale(0); } 40% { transform: scale(1); } }
    @keyframes pulse { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes spin { to { transform: rotate(360deg); } }
    .spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.2); border-top-color: white; border-radius: 50%; animation: spin 0.6s linear infinite; display: inline-block; vertical-align: middle; margin-right: 8px; }

    select.input-field { appearance: none; cursor: pointer; }
    @media (max-width: 640px) {
      .nav-links { display: none; }
      .hero-stats { gap: 20px; }
      .pricing-grid { grid-template-columns: 1fr; }
      .pay-layout { grid-template-columns: 1fr; }
      .profile-stats { grid-template-columns: 1fr 1fr; }
      .input-row { flex-direction: column; gap: 0; }
    }
  `;

  // ─── Renders ──────────────────────────────────────────────────────────────────
  const renderHero = () => (
    <div className="hero">
      <div className="hero-grid" />
      <div className="hero-content">
        <div className="hero-badge">✨ {lang === "ar" ? "مدعوم بأحدث نماذج الذكاء الاصطناعي" : lang === "fr" ? "Propulsé par les derniers modèles IA" : "Powered by the latest AI models"}</div>
        <h1 className="hero-title"><span className="hero-title-grad">{t.hero.title}</span></h1>
        <p className="hero-subtitle">{t.hero.subtitle}</p>
        <p className="hero-desc">{t.hero.desc}</p>
        <div className="hero-btns">
          <button className="btn-primary btn-large" onClick={() => setPage(user ? "chat" : "login")}>{t.hero.cta}</button>
          <button className="btn-ghost btn-large" onClick={() => setPage("pricing")}>{t.hero.demo}</button>
        </div>
        <div className="hero-stats">
          {[["10K+", lang === "ar" ? "مستخدم" : lang === "fr" ? "Utilisateurs" : "Users"],
            ["1M+", lang === "ar" ? "صورة مولّدة" : lang === "fr" ? "Images générées" : "Images generated"],
            ["99%", lang === "ar" ? "رضا العملاء" : lang === "fr" ? "Satisfaction" : "Satisfaction"]
          ].map(([n, l]) => <div className="stat" key={n}><div className="stat-num">{n}</div><div className="stat-label">{l}</div></div>)}
        </div>
      </div>
      {/* Upload hint badges */}
      <div className="hero-upload-hint">
        <button className="upload-hint-btn" onClick={() => { setPage(user ? "images" : "login"); }}>
          🖼️ {lang === "ar" ? "أضف صورة" : lang === "fr" ? "Ajouter une image" : "Add Image"}
        </button>
        <button className="upload-hint-btn" onClick={() => { setPage(user ? "video" : "login"); }}>
          🎬 {lang === "ar" ? "أضف فيديو" : lang === "fr" ? "Ajouter une vidéo" : "Add Video"}
        </button>
      </div>
      <div className="features" style={{ marginTop: 100 }}>
        {[["🗣️", t.nav.chat, lang === "ar" ? "محادثات ذكية مدعومة بـ Claude AI" : lang === "fr" ? "Conversations intelligentes avec Claude AI" : "Smart conversations powered by Claude AI"],
          ["🎨", t.nav.images, lang === "ar" ? "صور احترافية بالذكاء الاصطناعي" : lang === "fr" ? "Images professionnelles par IA" : "Professional AI-generated images"],
          ["🎬", t.nav.video, lang === "ar" ? "4 أوضاع لتوليد الفيديو" : lang === "fr" ? "4 modes de génération vidéo" : "4 video generation modes"],
          ["💎", lang === "ar" ? "رصيد مرن" : lang === "fr" ? "Crédits flexibles" : "Flexible Credits", lang === "ar" ? "نظام رصيد يناسب كل الاحتياجات" : lang === "fr" ? "Système de crédits adapté à tous" : "Credit system for all needs"],
        ].map(([icon, title, desc]) => (
          <div className="feature-card" key={title}><div className="feature-icon">{icon}</div><div className="feature-title">{title}</div><div className="feature-desc">{desc}</div></div>
        ))}
      </div>
    </div>
  );

  const renderChat = () => (
    <div className="page">
      <h1 className="page-title">💬 {t.chat.title}</h1>
      <div className="chat-container">
        <div className="chat-messages">
          {chatMessages.map((m, i) => (
            <div key={i} className={`msg ${m.role}`}>
              <div className="msg-avatar">{m.role === "assistant" ? "🤖" : "👤"}</div>
              <div className="msg-bubble" style={{ whiteSpace: "pre-wrap" }}>{m.content}</div>
            </div>
          ))}
          {chatLoading && <div className="msg assistant"><div className="msg-avatar">🤖</div><div className="msg-bubble msg-thinking"><div className="dot" /><div className="dot" /><div className="dot" /></div></div>}
          <div ref={chatEndRef} />
        </div>
        <div className="chat-input-area">
          <textarea className="chat-textarea" placeholder={t.chat.placeholder} value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); } }} rows={1} />
          <button className="btn-primary" onClick={sendChat} disabled={chatLoading || !chatInput.trim()}>{chatLoading ? <span className="spinner" /> : "↑"} {t.chat.send}</button>
          <button className="btn-ghost" onClick={() => setChatMessages([{ role: "assistant", content: t.chat.welcome }])}>{t.chat.clear}</button>
        </div>
      </div>
    </div>
  );

  const renderImages = () => (
    <div className="page">
      <h1 className="page-title">🎨 {t.image.title}</h1>
      <p className="page-sub">{t.image.cost}</p>
      <div className="gen-box">
        <div className="gen-label">{lang === "ar" ? "وصف الصورة" : lang === "fr" ? "Description" : "Prompt"}</div>
        <textarea className="gen-textarea" placeholder={t.image.placeholder} value={imagePrompt} onChange={e => setImagePrompt(e.target.value)} />
        <div style={{ marginTop: 16 }}>
          <div className="gen-label">{t.image.style}</div>
          <div className="style-pills">
            {Object.entries(t.image.styles).map(([k, v]) => (
              <button key={k} className={`style-pill ${imageStyle === k ? "active" : ""}`} onClick={() => setImageStyle(k)}>{v}</button>
            ))}
          </div>
        </div>
        {/* Reference image upload */}
        <div style={{ marginTop: 16 }}>
          <div className="upload-zone" onClick={() => imageFileRef.current?.click()}>
            <div className="upload-zone-icon">🖼️</div>
            <div className="upload-zone-text">{imageFile ? `✅ ${imageFile.name}` : t.image.uploadLabel}</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>{t.image.uploadHint}</div>
          </div>
          <input ref={imageFileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => setImageFile(e.target.files[0])} />
        </div>
        <div className="gen-footer">
          <span className="cost-label">💰 {t.image.cost} | {t.credits}: {credits}</span>
          <button className="btn-primary" onClick={generateImage} disabled={imageLoading || !imagePrompt.trim()}>
            {imageLoading ? <><span className="spinner" />{t.image.generating}</> : t.image.generate}
          </button>
        </div>
      </div>
      {generatedImage && (
        <div className="result-box">
          <img src={generatedImage} alt="generated" className="result-img" />
          <div className="result-footer">
            <span className="result-prompt">✨ {imagePrompt}</span>
            <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => { navigator.clipboard.writeText(imagePrompt); showToast(t.toast.copied); }}>
              {lang === "ar" ? "نسخ" : lang === "fr" ? "Copier" : "Copy"}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderVideo = () => {
    const modeCosts = { text2video: 50, img2video: 60, effects: 40, lipsync: 70 };
    const cost = modeCosts[videoMode];
    return (
      <div className="page">
        <h1 className="page-title">🎬 {t.video.title}</h1>
        {/* Mode tabs */}
        <div className="video-mode-tabs">
          {Object.entries(t.video.modes).map(([key, label]) => (
            <button key={key} className={`video-mode-tab ${videoMode === key ? "active" : ""}`} onClick={() => { setVideoMode(key); setVideoPrompt(""); setVideoFile(null); }}>
              <span>{VIDEO_MODES[key].icon}</span>
              <span>{label}</span>
              <span className="video-mode-cost">{VIDEO_MODES[key][`cost${lang === "ar" ? "Ar" : lang === "fr" ? "Fr" : "En"}`]}</span>
            </button>
          ))}
        </div>
        <div className="gen-box">
          {/* Upload zones for modes that need files */}
          {(videoMode === "img2video") && (
            <div style={{ marginBottom: 16 }}>
              <div className="gen-label">{t.video.uploadImg}</div>
              <div className="upload-zone" onClick={() => videoFileRef.current?.click()}>
                <div className="upload-zone-icon">🖼️</div>
                <div className="upload-zone-text">{videoFile ? `✅ ${videoFile.name}` : t.video.uploadImg}</div>
              </div>
              <input ref={videoFileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => setVideoFile(e.target.files[0])} />
            </div>
          )}
          {(videoMode === "effects") && (
            <div style={{ marginBottom: 16 }}>
              <div className="gen-label">{t.video.uploadVid}</div>
              <div className="upload-zone" onClick={() => videoFileRef.current?.click()}>
                <div className="upload-zone-icon">🎬</div>
                <div className="upload-zone-text">{videoFile ? `✅ ${videoFile.name}` : t.video.uploadVid}</div>
              </div>
              <input ref={videoFileRef} type="file" accept="video/*" style={{ display: "none" }} onChange={e => setVideoFile(e.target.files[0])} />
            </div>
          )}
          <div className="gen-label">{lang === "ar" ? "وصف الفيديو" : lang === "fr" ? "Description" : "Prompt"}</div>
          <textarea className="gen-textarea" placeholder={t.video.placeholders[videoMode]} value={videoPrompt} onChange={e => setVideoPrompt(e.target.value)} />
          {/* Options row */}
          <div className="video-options-row">
            <div className="video-option-group">
              <div className="gen-label">{t.video.duration}</div>
              <div className="style-pills">
                {["5", "10", "15"].map(d => <button key={d} className={`style-pill ${videoDuration === d ? "active" : ""}`} onClick={() => setVideoDuration(d)}>{d}s</button>)}
              </div>
            </div>
            <div className="video-option-group">
              <div className="gen-label">{t.video.aspectRatio}</div>
              <div className="style-pills">
                {["16:9", "9:16", "1:1"].map(a => <button key={a} className={`style-pill ${videoAspect === a ? "active" : ""}`} onClick={() => setVideoAspect(a)}>{a}</button>)}
              </div>
            </div>
            <div className="video-option-group">
              <div className="gen-label">{t.video.resolution}</div>
              <div className="style-pills">
                {["480p", "720p", "1080p"].map(r => <button key={r} className={`style-pill ${videoResolution === r ? "active" : ""}`} onClick={() => setVideoResolution(r)}>{r}</button>)}
              </div>
            </div>
          </div>
          <div className="gen-footer">
            <span className="cost-label">💰 {cost} {lang === "ar" ? "رصيد" : "credits"} | {t.credits}: {credits}</span>
            <button className="btn-primary" onClick={generateVideo} disabled={videoLoading || !videoPrompt.trim()}>
              {videoLoading ? <><span className="spinner" />{t.video.generating}</> : t.video.generate}
            </button>
          </div>
        </div>
        {generatedVideo && (
          <div className="result-box">
            <div className="video-placeholder">
              <div className="video-glow" />
              <div style={{ fontSize: 48, zIndex: 1 }}>▶️</div>
              <div style={{ fontSize: 14, color: "var(--muted)", zIndex: 1, textAlign: "center", padding: "0 20px" }}>
                {lang === "ar" ? "تم توليد الفيديو بنجاح!" : lang === "fr" ? "Vidéo générée!" : "Video generated!"}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", zIndex: 1 }}>{videoAspect} · {videoResolution} · {videoDuration}s</div>
            </div>
            <div className="result-footer">
              <span className="result-prompt">🎬 {videoPrompt}</span>
              <span style={{ fontSize: 11, color: "var(--muted)" }}>{t.video.modes[generatedVideo.mode]}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderGallery = () => (
    <div className="page">
      <h1 className="page-title">🖼️ {t.gallery.title}</h1>
      {gallery.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">🎨</div><p>{t.gallery.empty}</p></div>
      ) : (
        <div className="gallery-grid">
          {gallery.map(item => (
            <div key={item.id} className="gallery-item">
              <img src={item.url} alt={item.prompt} />
              <div className={`gallery-type-badge ${item.type === "image" ? "badge-image" : "badge-video"}`}>{item.type === "image" ? "🖼" : "🎬"}</div>
              <div className="gallery-overlay">
                <div className="gallery-prompt">{item.prompt}</div>
                <button className="btn-delete" onClick={() => setGallery(g => g.filter(x => x.id !== item.id))}>{t.gallery.delete}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderPricing = () => (
    <div className="page" style={{ maxWidth: 1000 }}>
      <h1 className="page-title" style={{ textAlign: "center" }}>💎 {t.pricing.title}</h1>
      <p className="page-sub" style={{ textAlign: "center" }}>{t.pricing.subtitle}</p>
      <div className="pricing-grid">
        {t.pricing.plans.map(plan => (
          <div key={plan.id} className={`plan-card ${plan.popular ? "popular" : ""}`}>
            {plan.popular && <div className="popular-badge">⭐ {lang === "ar" ? "الأكثر شعبية" : lang === "fr" ? "Populaire" : "Most Popular"}</div>}
            <div className="plan-name">{plan.name}</div>
            <div className="plan-price">{plan.price}<span> {plan.currency}</span></div>
            <div className="plan-credits">💰 {plan.credits} {t.credits}</div>
            <ul className="plan-features">{plan.features.map(f => <li key={f}>{f}</li>)}</ul>
            <button className={`plan-cta ${plan.popular ? "primary" : "secondary"}`} onClick={() => openPayment(plan)}>{plan.cta}</button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="page">
      <h1 className="page-title">👤 {t.profile.title}</h1>
      <div className="profile-header">
        <div className="profile-avatar">👤</div>
        <div style={{ flex: 1 }}>
          {editingName ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input className="input-field" style={{ width: 200 }} value={newName} onChange={e => setNewName(e.target.value)} placeholder={user?.name} />
              <button className="btn-primary" style={{ padding: "8px 16px", fontSize: 13 }} onClick={() => { setUser(u => ({ ...u, name: newName || u.name })); setEditingName(false); showToast(lang === "ar" ? "تم الحفظ" : "Saved"); }}>{t.profile.save}</button>
              <button className="btn-ghost" style={{ padding: "8px 16px", fontSize: 13 }} onClick={() => setEditingName(false)}>✕</button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="profile-name">{user?.name}</div>
              <button className="btn-ghost" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => { setNewName(user?.name || ""); setEditingName(true); }}>✏️</button>
            </div>
          )}
          <div className="profile-email">{user?.email}</div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
            {t.profile.joined}: {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
      <div className="profile-stats">
        <div className="profile-stat"><div className="profile-stat-num">{credits}</div><div className="profile-stat-label">{t.profile.credits}</div></div>
        <div className="profile-stat"><div className="profile-stat-num">{gallery.length}</div><div className="profile-stat-label">{lang === "ar" ? "أعمالي" : lang === "fr" ? "Créations" : "Creations"}</div></div>
        <div className="profile-stat"><div className="profile-stat-num">{usageHistory.length}</div><div className="profile-stat-label">{lang === "ar" ? "طلبات" : lang === "fr" ? "Requêtes" : "Requests"}</div></div>
      </div>
      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>📋 {t.profile.history}</h2>
      {usageHistory.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>{t.profile.noHistory}</div>
      ) : (
        usageHistory.map(h => (
          <div key={h.id} className="history-item">
            <div className={`history-type history-type-${h.type}`}>{h.type === "chat" ? "💬" : h.type === "image" ? "🎨" : "🎬"}</div>
            <div className="history-prompt">{h.prompt}</div>
            <div className="history-date">{h.date}</div>
          </div>
        ))
      )}
    </div>
  );

  const renderPayment = () => (
    <div className="pay-page">
      <div className="pay-layout">
        <div className="pay-card">
          <button className="btn-ghost" style={{ marginBottom: 20, fontSize: 13 }} onClick={() => setPage("pricing")}>← {t.pay.backToPricing}</button>
          <div className="pay-title">{t.pay.title}</div>
          <div className="pay-subtitle">{t.pay.subtitle}</div>
          <div style={{ padding: "24px", background: "rgba(255,107,53,0.05)", borderRadius: 16, border: "1px solid rgba(255,107,53,0.2)", marginBottom: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>🔒 YouCan Pay</div>
            <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7, marginBottom: 20 }}>
              {lang === "ar" ? "سيتم تحويلك إلى بوابة الدفع الآمنة لإتمام المعاملة" : lang === "fr" ? "Vous serez redirigé vers la passerelle sécurisée" : "You will be redirected to the secure payment gateway"}
            </div>
            <button className="btn-pay" onClick={handleYouCanRedirect} disabled={payLoading}>
              {payLoading ? <><span className="spinner" />{t.pay.processing}</> : <>{t.pay.youcanBtn} 🚀</>}
            </button>
          </div>
          <div className="secure-badge">🔒 {t.pay.secureBadge}</div>
        </div>
        <div className="pay-summary">
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 16 }}>{t.pay.orderSummary}</div>
          {selectedPlan && <>
            <div className="summary-plan-name">{selectedPlan.name}</div>
            <div className="summary-rows">
              <div className="summary-row"><span className="label">{t.pay.plan}</span><span className="value">{selectedPlan.name}</span></div>
              <div className="summary-row"><span className="label">{t.pay.credits}</span><span className="value">{selectedPlan.credits}</span></div>
            </div>
            <div style={{ height: 1, background: "var(--border)", margin: "16px 0" }} />
            <div className="summary-total">
              <span className="label">{t.pay.total}</span>
              <span className="value">{selectedPlan.price} <span style={{ fontSize: 13, fontWeight: 400, color: "var(--muted)" }}>{t.pay.currency}</span></span>
            </div>
          </>}
          <div className="trust-badges">
            {[[t.pay.guarantee, "✅"], [t.pay.support, "🎧"], [t.pay.ssl, "🔐"]].map(([label, icon]) => (
              <div key={label} className="trust-item"><span style={{ fontSize: 16 }}>{icon}</span>{label}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderLogin = () => (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">✨</div>
          <div className="login-title">{loginMode === "login" ? t.loginTitle : t.registerBtn}</div>
          <div className="login-sub">{t.loginSub}</div>
        </div>
        {loginMode === "register" && (
          <div className="input-row">
            <div className="input-group">
              <label className="input-label">{t.firstName}</label>
              <input className="input-field" placeholder={t.firstName} value={loginFirst} onChange={e => setLoginFirst(e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label">{t.lastName}</label>
              <input className="input-field" placeholder={t.lastName} value={loginLast} onChange={e => setLoginLast(e.target.value)} />
            </div>
          </div>
        )}
        {loginMode === "register" && (
          <div className="input-group">
            <label className="input-label">{t.phone}</label>
            <input className="input-field" type="tel" placeholder="+212 6XX XXX XXX" value={loginPhone} onChange={e => setLoginPhone(e.target.value)} />
          </div>
        )}
        <div className="input-group">
          <label className="input-label">{t.email}</label>
          <input className="input-field" type="email" placeholder="example@email.com" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
        </div>
        <div className="input-group">
          <label className="input-label">{t.password}</label>
          <input className="input-field" type="password" placeholder="••••••••" value={loginPass} onChange={e => setLoginPass(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") loginMode === "login" ? handleLogin() : handleRegister(); }} />
        </div>
        <button className="btn-primary" style={{ width: "100%", padding: 12, marginTop: 4 }}
          onClick={loginMode === "login" ? handleLogin : handleRegister} disabled={loginLoading}>
          {loginLoading ? <span className="spinner" /> : null}
          {loginMode === "login" ? t.loginBtn : t.registerBtn}
        </button>
        <div className="login-divider">{lang === "ar" ? "أو" : "ou"}</div>
        <button className="btn-demo" onClick={handleDemoLogin}>{t.demoLogin}</button>
        <div className="login-switch">
          {loginMode === "login" ? t.noAccount : t.hasAccount}{" "}
          <a onClick={() => setLoginMode(loginMode === "login" ? "register" : "login")}>
            {loginMode === "login" ? t.registerBtn : t.loginBtn}
          </a>
        </div>
      </div>
    </div>
  );

  // ─── Main render ──────────────────────────────────────────────────────────────
  const pages = { home: renderHero, chat: renderChat, images: renderImages, video: renderVideo, gallery: renderGallery, pricing: renderPricing, payment: renderPayment, login: renderLogin, profile: renderProfile };

  return (
    <div className="app" dir={t.dir}>
      <style>{styles}</style>
      {/* Animated background orbs */}
      <div className="bg-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-logo" onClick={() => setPage("home")}>
          <div className="nav-logo-icon">✨</div>
          <div className="nav-logo-text">{t.name}</div>
        </div>
        <div className="nav-links">
          {(user ? ["chat","images","video","gallery","pricing","profile"] : ["pricing"]).map(p => (
            <button key={p} className={`nav-link ${page === p ? "active" : ""}`} onClick={() => setPage(p)}>{t.nav[p]}</button>
          ))}
        </div>
        <div className="nav-right">
          {user && <div className="credits-badge">💰 {credits}</div>}
          {["ar","fr","en"].map(l => <button key={l} className="lang-btn" onClick={() => setLang(l)}>{l.toUpperCase()}</button>)}
          {user ? (
            <button className="btn-ghost" onClick={handleLogout}>{t.logout}</button>
          ) : (
            <button className="btn-primary" onClick={() => setPage("login")}>{t.login}</button>
          )}
        </div>
      </nav>
      {/* Main content */}
      <main className="main">
        {(pages[page] || renderHero)()}
      </main>
      {/* Toast */}
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}