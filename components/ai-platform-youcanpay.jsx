'use client';
import { useState, useEffect, useRef, useCallback } from "react";

// ─── Config from deploy guide ─────────────────────────────────────────────────
const APP_URL = "https://my-ai-platform.vercel.app";
const SUPABASE_URL = "https://uiehcsmidizvmebkypgg.supabase.co";

// ─── Plan config (matches types/index.ts in deploy guide) ────────────────────
const PLAN_CONFIG = {
  free:  { credits: 50,   price_mad: 0,   price_label: "0 درهم" },
  pro:   { credits: 500,  price_mad: 99,  price_label: "99 درهم" },
  ultra: { credits: 2000, price_mad: 299, price_label: "299 درهم" },
};

// ─── Translations ─────────────────────────────────────────────────────────────
const TRANSLATIONS = {
  ar: {
    dir: "rtl",
    name: "إبداع AI",
    tagline: "منصة الذكاء الاصطناعي لإبداع بلا حدود",
    nav: { chat: "المحادثة", images: "الصور", video: "الفيديو", gallery: "معرضي", pricing: "الأسعار" },
    hero: {
      title: "اصنع المستقبل",
      subtitle: "بالذكاء الاصطناعي",
      desc: "توليد صور، فيديوهات، ومحادثات ذكية — كل ما تحتاجه في مكان واحد",
      cta: "ابدأ مجاناً",
      demo: "شاهد العرض",
    },
    chat: {
      title: "المحادثة الذكية",
      placeholder: "اكتب رسالتك هنا...",
      send: "إرسال",
      clear: "مسح",
      thinking: "جاري التفكير...",
      welcome: "مرحباً! أنا مساعدك الذكي. كيف يمكنني مساعدتك اليوم؟",
    },
    image: {
      title: "توليد الصور",
      placeholder: "صِف الصورة التي تريدها... مثال: غروب شمس فوق المحيط بألوان ذهبية",
      generate: "توليد الصورة",
      generating: "جاري التوليد...",
      style: "النمط",
      styles: { realistic: "واقعي", artistic: "فني", anime: "أنمي", abstract: "تجريدي" },
      cost: "تكلفة: 10 رصيد",
    },
    video: {
      title: "توليد الفيديو",
      placeholder: "صِف الفيديو الذي تريده... مثال: طائر يحلق فوق مدينة مضيئة في الليل",
      generate: "توليد الفيديو",
      generating: "جاري المعالجة... قد يستغرق دقيقة",
      duration: "المدة",
      cost: "تكلفة: 50 رصيد",
    },
    gallery: { title: "معرض أعمالي", empty: "لا توجد أعمال بعد. ابدأ بتوليد صورة أو فيديو!", delete: "حذف" },
    pricing: {
      title: "اختر خطتك",
      subtitle: "ابدأ مجاناً، طور حسب احتياجك",
      plans: [
        { id: "free",  name: "المجاني",    price: "0",   currency: "درهم/شهر", credits: 50,   features: ["50 رصيد شهرياً", "توليد صور عادية", "محادثة مفتوحة", "معرض 10 أعمال"],                                                                   cta: "ابدأ مجاناً",   popular: false },
        { id: "pro",   name: "الاحترافي", price: "99",  currency: "درهم/شهر", credits: 500,  features: ["500 رصيد شهرياً", "توليد صور عالية الجودة", "توليد فيديو قصير", "محادثة غير محدودة", "معرض 100 عمل", "أولوية المعالجة"], cta: "اشترك الآن",   popular: true },
        { id: "ultra", name: "الأعمال",   price: "299", currency: "درهم/شهر", credits: 2000, features: ["2000 رصيد شهرياً", "جميع الميزات", "فيديو 4K", "API مخصص", "دعم أولوي 24/7", "معرض غير محدود"],                                cta: "تواصل معنا",  popular: false },
      ],
    },
    credits: "الرصيد",
    logout: "خروج",
    login: "دخول",
    loginTitle: "مرحباً بعودتك",
    loginSub: "سجل دخولك للمتابعة",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    loginBtn: "تسجيل الدخول",
    registerBtn: "إنشاء حساب",
    noAccount: "ليس لديك حساب؟",
    hasAccount: "لديك حساب؟",
    demoLogin: "دخول تجريبي",
    toast: { copied: "تم النسخ!", generated: "تم التوليد بنجاح!", error: "حدث خطأ، حاول مجدداً", noCredits: "رصيدك غير كافٍ! يرجى الترقية" },
    // ── Payment page strings ──
    pay: {
      title: "إتمام الدفع",
      subtitle: "أنت على بُعد خطوة واحدة من الإبداع اللامحدود",
      orderSummary: "ملخص الطلب",
      plan: "الخطة",
      credits: "الرصيد",
      total: "المجموع",
      currency: "درهم مغربي",
      secureBadge: "دفع آمن ومشفر بـ YouCan Pay",
      cardNumber: "رقم البطاقة",
      expiry: "تاريخ الانتهاء",
      cvv: "رمز CVV",
      cardHolder: "اسم حامل البطاقة",
      payNow: "ادفع الآن",
      processing: "جاري المعالجة...",
      back: "رجوع",
      orPay: "أو ادفع عبر",
      success: "تم الدفع بنجاح! تم إضافة رصيدك.",
      failed: "فشل الدفع. يرجى المحاولة مجدداً.",
      redirect: "سيتم تحويلك لبوابة YouCan Pay...",
      monthYear: "شهر / سنة",
      testCard: "بطاقة تجريبية: 4242 4242 4242 4242",
      youcanTitle: "الدفع عبر بوابة YouCan Pay",
      youcanDesc: "سيتم تحويلك إلى بوابة الدفع الآمنة لإتمام المعاملة",
      youcanBtn: "الانتقال إلى YouCan Pay",
      backToPricing: "العودة للأسعار",
      guarantee: "ضمان استرداد المال خلال 7 أيام",
      support: "دعم 24/7",
      ssl: "تشفير SSL",
    },
  },
  fr: {
    dir: "ltr",
    name: "Ibda3 AI",
    tagline: "La plateforme d'IA pour une créativité sans limites",
    nav: { chat: "Chat", images: "Images", video: "Vidéo", gallery: "Galerie", pricing: "Tarifs" },
    hero: {
      title: "Créez l'avenir",
      subtitle: "avec l'Intelligence Artificielle",
      desc: "Génération d'images, vidéos et conversations intelligentes — tout ce dont vous avez besoin en un seul endroit",
      cta: "Commencer gratuitement",
      demo: "Voir la démo",
    },
    chat: {
      title: "Chat Intelligent",
      placeholder: "Écrivez votre message ici...",
      send: "Envoyer",
      clear: "Effacer",
      thinking: "En train de réfléchir...",
      welcome: "Bonjour! Je suis votre assistant IA. Comment puis-je vous aider aujourd'hui?",
    },
    image: {
      title: "Génération d'Images",
      placeholder: "Décrivez l'image souhaitée... Ex: coucher de soleil sur l'océan aux couleurs dorées",
      generate: "Générer l'image",
      generating: "Génération en cours...",
      style: "Style",
      styles: { realistic: "Réaliste", artistic: "Artistique", anime: "Animé", abstract: "Abstrait" },
      cost: "Coût: 10 crédits",
    },
    video: {
      title: "Génération de Vidéo",
      placeholder: "Décrivez la vidéo... Ex: oiseau volant au-dessus d'une ville lumineuse la nuit",
      generate: "Générer la vidéo",
      generating: "Traitement en cours... peut prendre une minute",
      duration: "Durée",
      cost: "Coût: 50 crédits",
    },
    gallery: { title: "Ma Galerie", empty: "Aucune création pour l'instant. Commencez à générer!", delete: "Supprimer" },
    pricing: {
      title: "Choisissez votre plan",
      subtitle: "Commencez gratuitement, évoluez selon vos besoins",
      plans: [
        { id: "free",  name: "Gratuit",  price: "0",   currency: "MAD/mois", credits: 50,   features: ["50 crédits/mois", "Génération d'images standard", "Chat illimité", "Galerie 10 créations"],                                                    cta: "Commencer gratuitement", popular: false },
        { id: "pro",   name: "Pro",      price: "99",  currency: "MAD/mois", credits: 500,  features: ["500 crédits/mois", "Images haute qualité", "Génération vidéo courte", "Chat illimité", "Galerie 100 créations", "Traitement prioritaire"], cta: "S'abonner",              popular: true },
        { id: "ultra", name: "Business", price: "299", currency: "MAD/mois", credits: 2000, features: ["2000 crédits/mois", "Toutes les fonctionnalités", "Vidéo 4K", "API dédiée", "Support prioritaire 24/7", "Galerie illimitée"],            cta: "Nous contacter",         popular: false },
      ],
    },
    credits: "Crédits",
    logout: "Déconnexion",
    login: "Connexion",
    loginTitle: "Bon retour",
    loginSub: "Connectez-vous pour continuer",
    email: "Email",
    password: "Mot de passe",
    loginBtn: "Se connecter",
    registerBtn: "Créer un compte",
    noAccount: "Pas de compte?",
    hasAccount: "Déjà un compte?",
    demoLogin: "Connexion démo",
    toast: { copied: "Copié!", generated: "Généré avec succès!", error: "Erreur, réessayez", noCredits: "Crédits insuffisants! Passez à un plan supérieur" },
    pay: {
      title: "Finaliser le paiement",
      subtitle: "Vous êtes à un pas d'une créativité illimitée",
      orderSummary: "Récapitulatif",
      plan: "Plan",
      credits: "Crédits",
      total: "Total",
      currency: "MAD",
      secureBadge: "Paiement sécurisé via YouCan Pay",
      cardNumber: "Numéro de carte",
      expiry: "Date d'expiration",
      cvv: "Code CVV",
      cardHolder: "Nom du titulaire",
      payNow: "Payer maintenant",
      processing: "Traitement en cours...",
      back: "Retour",
      orPay: "Ou payer via",
      success: "Paiement réussi! Vos crédits ont été ajoutés.",
      failed: "Paiement échoué. Veuillez réessayer.",
      redirect: "Redirection vers YouCan Pay...",
      monthYear: "MM / AA",
      testCard: "Carte test: 4242 4242 4242 4242",
      youcanTitle: "Paiement via YouCan Pay",
      youcanDesc: "Vous serez redirigé vers la passerelle de paiement sécurisée",
      youcanBtn: "Aller vers YouCan Pay",
      backToPricing: "Retour aux tarifs",
      guarantee: "Remboursement garanti 7 jours",
      support: "Support 24/7",
      ssl: "Cryptage SSL",
    },
  },
  en: {
    dir: "ltr",
    name: "Ibda3 AI",
    tagline: "The AI platform for limitless creativity",
    nav: { chat: "Chat", images: "Images", video: "Video", gallery: "Gallery", pricing: "Pricing" },
    hero: {
      title: "Build the Future",
      subtitle: "with Artificial Intelligence",
      desc: "Generate images, videos, and intelligent conversations — everything you need in one place",
      cta: "Start for Free",
      demo: "Watch Demo",
    },
    chat: {
      title: "Smart Chat",
      placeholder: "Type your message here...",
      send: "Send",
      clear: "Clear",
      thinking: "Thinking...",
      welcome: "Hello! I'm your AI assistant. How can I help you today?",
    },
    image: {
      title: "Image Generation",
      placeholder: "Describe the image you want... e.g. sunset over the ocean in golden colors",
      generate: "Generate Image",
      generating: "Generating...",
      style: "Style",
      styles: { realistic: "Realistic", artistic: "Artistic", anime: "Anime", abstract: "Abstract" },
      cost: "Cost: 10 credits",
    },
    video: {
      title: "Video Generation",
      placeholder: "Describe your video... e.g. a bird flying over a glowing city at night",
      generate: "Generate Video",
      generating: "Processing... may take a minute",
      duration: "Duration",
      cost: "Cost: 50 credits",
    },
    gallery: { title: "My Gallery", empty: "No creations yet. Start generating images or videos!", delete: "Delete" },
    pricing: {
      title: "Choose Your Plan",
      subtitle: "Start free, scale as you grow",
      plans: [
        { id: "free",  name: "Free",     price: "0",   currency: "MAD/mo", credits: 50,   features: ["50 credits/month", "Standard image generation", "Unlimited chat", "Gallery 10 creations"],                                                     cta: "Get Started Free", popular: false },
        { id: "pro",   name: "Pro",      price: "99",  currency: "MAD/mo", credits: 500,  features: ["500 credits/month", "HD image generation", "Short video generation", "Unlimited chat", "Gallery 100 creations", "Priority processing"], cta: "Subscribe Now",    popular: true },
        { id: "ultra", name: "Business", price: "299", currency: "MAD/mo", credits: 2000, features: ["2000 credits/month", "All features", "4K video", "Dedicated API", "24/7 priority support", "Unlimited gallery"],                       cta: "Contact Us",       popular: false },
      ],
    },
    credits: "Credits",
    logout: "Logout",
    login: "Login",
    loginTitle: "Welcome Back",
    loginSub: "Sign in to continue",
    email: "Email",
    password: "Password",
    loginBtn: "Sign In",
    registerBtn: "Create Account",
    noAccount: "No account?",
    hasAccount: "Have an account?",
    demoLogin: "Demo Login",
    toast: { copied: "Copied!", generated: "Generated successfully!", error: "Error, please try again", noCredits: "Insufficient credits! Please upgrade" },
    pay: {
      title: "Complete Payment",
      subtitle: "You're one step away from unlimited creativity",
      orderSummary: "Order Summary",
      plan: "Plan",
      credits: "Credits",
      total: "Total",
      currency: "MAD",
      secureBadge: "Secure payment via YouCan Pay",
      cardNumber: "Card Number",
      expiry: "Expiry Date",
      cvv: "CVV Code",
      cardHolder: "Cardholder Name",
      payNow: "Pay Now",
      processing: "Processing...",
      back: "Back",
      orPay: "Or pay via",
      success: "Payment successful! Your credits have been added.",
      failed: "Payment failed. Please try again.",
      redirect: "Redirecting to YouCan Pay...",
      monthYear: "MM / YY",
      testCard: "Test card: 4242 4242 4242 4242",
      youcanTitle: "Pay via YouCan Pay",
      youcanDesc: "You will be redirected to the secure payment gateway to complete your transaction",
      youcanBtn: "Go to YouCan Pay",
      backToPricing: "Back to Pricing",
      guarantee: "7-day money-back guarantee",
      support: "24/7 Support",
      ssl: "SSL Encrypted",
    },
  },
};

// ─── Demo image placeholders ──────────────────────────────────────────────────
const DEMO_IMAGES = [
  "https://picsum.photos/seed/ai1/400/300",
  "https://picsum.photos/seed/ai2/400/300",
  "https://picsum.photos/seed/ai3/400/300",
  "https://picsum.photos/seed/ai4/400/300",
];

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [lang, setLang] = useState("ar");
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(150);
  const [gallery, setGallery] = useState([]);
  const [toast, setToast] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageStyle, setImageStyle] = useState("realistic");
  const [imageLoading, setImageLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [videoPrompt, setVideoPrompt] = useState("");
  const [videoDuration, setVideoDuration] = useState("5");
  const [videoLoading, setVideoLoading] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [loginMode, setLoginMode] = useState("login");
  // ── Payment state ──
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [payTab, setPayTab] = useState("card"); // "card" | "youcan"
  const [payLoading, setPayLoading] = useState(false);
  const [cardNum, setCardNum] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const chatEndRef = useRef(null);

  const t = TRANSLATIONS[lang];
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

  const handleDemoLogin = () => {
    setUser({ name: lang === "ar" ? "مستخدم تجريبي" : lang === "fr" ? "Utilisateur Démo" : "Demo User", email: "demo@ibda3ai.com" });
    setChatMessages([{ role: "assistant", content: t.chat.welcome }]);
    setPage("chat");
  };

  const handleLogout = () => { setUser(null); setPage("home"); };

  // ── Open payment page ──────────────────────────────────────────────────────
  const openPayment = (plan) => {
    if (!user) { setPage("login"); return; }
    if (plan.id === "free") { showToast(lang === "ar" ? "أنت على الخطة المجانية" : lang === "fr" ? "Vous êtes sur le plan gratuit" : "You're on the free plan"); return; }
    if (plan.id === "ultra") { showToast(lang === "ar" ? "تواصل معنا عبر البريد" : lang === "fr" ? "Contactez-nous par email" : "Contact us via email"); return; }
    setSelectedPlan(plan);
    setPayTab("card");
    setCardNum(""); setCardExp(""); setCardCvv(""); setCardName("");
    setPage("payment");
  };

  // ── Simulate card payment → calls /api/youcanpay/checkout ─────────────────
  const handleCardPay = async () => {
    if (!cardNum || !cardExp || !cardCvv || !cardName) {
      showToast(lang === "ar" ? "يرجى ملء جميع الحقول" : lang === "fr" ? "Veuillez remplir tous les champs" : "Please fill all fields", "error");
      return;
    }
    setPayLoading(true);
    // In production this POSTs to /api/youcanpay/checkout → returns checkout URL
    // Here we simulate a 2s round-trip then success
    await new Promise(r => setTimeout(r, 2000));
    const cfg = PLAN_CONFIG[selectedPlan.id];
    setCredits(c => c + cfg.credits);
    showToast(t.pay.success);
    setPayLoading(false);
    setPage("pricing");
  };

  // ── Redirect to YouCan Pay hosted checkout ─────────────────────────────────
  const handleYouCanRedirect = async () => {
    setPayLoading(true);
    showToast(t.pay.redirect);
    // In production: POST /api/youcanpay/checkout → { checkout_url }
    // Then: window.location.href = checkout_url
    // Webhook at /api/youcanpay/webhook handles success and updates Supabase
    await new Promise(r => setTimeout(r, 1500));
    const checkoutUrl =
      `${APP_URL}/api/youcanpay/checkout?plan=${selectedPlan.id}&user=${encodeURIComponent(user.email)}`;
    // window.location.href = checkoutUrl; // Uncomment in production
    alert(`[DEV] Would redirect to:\n${checkoutUrl}\n\nWebhook at: ${APP_URL}/api/youcanpay/webhook`);
    setPayLoading(false);
  };

  // ── Format card number with spaces ────────────────────────────────────────
  const formatCard = (v) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const formatExp  = (v) => { const d = v.replace(/\D/g, "").slice(0, 4); return d.length > 2 ? d.slice(0,2) + " / " + d.slice(2) : d; };

  // ── Chat ──────────────────────────────────────────────────────────────────
  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = { role: "user", content: chatInput };
    const msgs = [...chatMessages, userMsg];
    setChatMessages(msgs);
    setChatInput("");
    setChatLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are a helpful AI assistant on a creative platform called Ibda3 AI. The platform supports Arabic, French, and English. Always respond in the same language the user writes in. Be concise, friendly, and helpful.`,
          messages: msgs.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "...";
      setChatMessages([...msgs, { role: "assistant", content: reply }]);
    } catch {
      showToast(t.toast.error, "error");
    }
    setChatLoading(false);
  };

  // ── Image Generation ──────────────────────────────────────────────────────
  const generateImage = async () => {
    if (!imagePrompt.trim() || imageLoading) return;
    if (credits < 10) { showToast(t.toast.noCredits, "error"); return; }
    setImageLoading(true);
    setGeneratedImage(null);
    await new Promise(r => setTimeout(r, 2000));
    const seed = encodeURIComponent(imagePrompt).slice(0, 10) + Date.now();
    const imgUrl = `https://picsum.photos/seed/${seed}/600/400`;
    setGeneratedImage(imgUrl);
    setCredits(c => c - 10);
    setGallery(g => [{ id: Date.now(), type: "image", url: imgUrl, prompt: imagePrompt, date: new Date().toLocaleDateString() }, ...g]);
    showToast(t.toast.generated);
    setImageLoading(false);
  };

  // ── Video Generation ──────────────────────────────────────────────────────
  const generateVideo = async () => {
    if (!videoPrompt.trim() || videoLoading) return;
    if (credits < 50) { showToast(t.toast.noCredits, "error"); return; }
    setVideoLoading(true);
    setGeneratedVideo(null);
    await new Promise(r => setTimeout(r, 3000));
    const seed = Date.now();
    const thumbUrl = `https://picsum.photos/seed/${seed}/600/338`;
    setGeneratedVideo({ thumb: thumbUrl, prompt: videoPrompt });
    setCredits(c => c - 50);
    setGallery(g => [{ id: Date.now(), type: "video", url: thumbUrl, prompt: videoPrompt, date: new Date().toLocaleDateString() }, ...g]);
    showToast(t.toast.generated);
    setVideoLoading(false);
  };

  // ─── Styles ────────────────────────────────────────────────────────────────
  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=Noto+Kufi+Arabic:wght@300;400;600;700;800&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #050508;
      --surface: #0d0d14;
      --surface2: #13131e;
      --border: rgba(255,255,255,0.07);
      --border2: rgba(255,255,255,0.12);
      --accent: #7c5cfc;
      --accent2: #c158f5;
      --gold: #f0c040;
      --text: #e8e8f0;
      --muted: #7070a0;
      --success: #4ade80;
      --error: #f87171;
      --font: ${lang === "ar" ? "'Noto Kufi Arabic'" : "'Sora'"}, sans-serif;
      --radius: 16px;
      --glow: 0 0 40px rgba(124,92,252,0.25);
    }
    html, body, #root { height: 100%; background: var(--bg); color: var(--text); font-family: var(--font); }
    
    .app { min-height: 100vh; display: flex; flex-direction: column; }
    
    /* Navbar */
    .navbar {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      background: rgba(5,5,8,0.85); backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--border);
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 24px; height: 64px; gap: 16px;
    }
    .nav-logo { display: flex; align-items: center; gap: 10px; cursor: pointer; }
    .nav-logo-icon {
      width: 36px; height: 36px; border-radius: 10px;
      background: linear-gradient(135deg, var(--accent), var(--accent2));
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; box-shadow: var(--glow);
    }
    .nav-logo-text { font-size: 18px; font-weight: 700; background: linear-gradient(135deg, #a78bfa, #e879f9); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .nav-links { display: flex; gap: 4px; }
    .nav-link {
      padding: 6px 14px; border-radius: 8px; cursor: pointer; font-size: 13px;
      color: var(--muted); transition: all 0.2s; border: none; background: none;
      font-family: var(--font);
    }
    .nav-link:hover, .nav-link.active { color: var(--text); background: rgba(255,255,255,0.07); }
    .nav-right { display: flex; align-items: center; gap: 12px; }
    .credits-badge {
      display: flex; align-items: center; gap: 6px; padding: 5px 12px;
      background: rgba(240,192,64,0.1); border: 1px solid rgba(240,192,64,0.25);
      border-radius: 20px; font-size: 13px; font-weight: 600; color: var(--gold);
    }
    .lang-btn {
      padding: 5px 10px; border-radius: 8px; border: 1px solid var(--border2);
      background: var(--surface); color: var(--muted); cursor: pointer;
      font-size: 12px; font-family: var(--font); transition: all 0.2s;
    }
    .lang-btn:hover { color: var(--text); border-color: var(--accent); }
    .btn-ghost { padding: 7px 16px; border-radius: 10px; border: 1px solid var(--border2); background: none; color: var(--text); cursor: pointer; font-family: var(--font); font-size: 13px; transition: all 0.2s; }
    .btn-ghost:hover { background: rgba(255,255,255,0.07); }
    .btn-primary {
      padding: 8px 20px; border-radius: 10px; border: none; cursor: pointer;
      background: linear-gradient(135deg, var(--accent), var(--accent2));
      color: white; font-family: var(--font); font-size: 14px; font-weight: 600;
      transition: all 0.2s; box-shadow: 0 0 20px rgba(124,92,252,0.3);
    }
    .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 0 30px rgba(124,92,252,0.5); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

    /* Main content */
    .main { flex: 1; padding-top: 64px; }

    /* Hero */
    .hero {
      min-height: calc(100vh - 64px); display: flex; flex-direction: column;
      align-items: center; justify-content: center; text-align: center;
      padding: 40px 24px; position: relative; overflow: hidden;
    }
    .hero-bg {
      position: absolute; inset: 0; z-index: 0;
      background: radial-gradient(ellipse 80% 60% at 50% 40%, rgba(124,92,252,0.12) 0%, transparent 60%),
                  radial-gradient(ellipse 60% 40% at 80% 70%, rgba(193,88,245,0.08) 0%, transparent 50%);
    }
    .hero-grid {
      position: absolute; inset: 0; z-index: 0; opacity: 0.03;
      background-image: linear-gradient(var(--border2) 1px, transparent 1px), linear-gradient(90deg, var(--border2) 1px, transparent 1px);
      background-size: 60px 60px;
    }
    .hero-content { position: relative; z-index: 1; max-width: 800px; }
    .hero-badge {
      display: inline-flex; align-items: center; gap: 8px; margin-bottom: 32px;
      padding: 8px 18px; border-radius: 50px; border: 1px solid rgba(124,92,252,0.3);
      background: rgba(124,92,252,0.1); font-size: 13px; color: #a78bfa;
      animation: fadeUp 0.6s ease both;
    }
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

    /* Features strip */
    .features { display: flex; gap: 16px; padding: 20px 24px 40px; max-width: 1100px; margin: 0 auto; flex-wrap: wrap; }
    .feature-card {
      flex: 1; min-width: 200px; padding: 24px; border-radius: var(--radius);
      background: var(--surface); border: 1px solid var(--border);
      transition: all 0.3s;
    }
    .feature-card:hover { border-color: var(--accent); transform: translateY(-4px); box-shadow: var(--glow); }
    .feature-icon { font-size: 32px; margin-bottom: 12px; }
    .feature-title { font-size: 15px; font-weight: 600; margin-bottom: 8px; }
    .feature-desc { font-size: 13px; color: var(--muted); line-height: 1.6; }

    /* Page container */
    .page { max-width: 900px; margin: 0 auto; padding: 40px 24px; }
    .page-title { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
    .page-sub { font-size: 14px; color: var(--muted); margin-bottom: 32px; }

    /* Chat */
    .chat-container { display: flex; flex-direction: column; height: calc(100vh - 180px); }
    .chat-messages { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; padding: 16px; background: var(--surface); border-radius: var(--radius) var(--radius) 0 0; border: 1px solid var(--border); border-bottom: none; }
    .chat-messages::-webkit-scrollbar { width: 4px; }
    .chat-messages::-webkit-scrollbar-track { background: transparent; }
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
    .chat-input-area {
      display: flex; gap: 10px; padding: 14px; background: var(--surface2);
      border: 1px solid var(--border); border-radius: 0 0 var(--radius) var(--radius);
    }
    .chat-textarea {
      flex: 1; background: rgba(255,255,255,0.04); border: 1px solid var(--border);
      border-radius: 10px; padding: 10px 14px; color: var(--text); font-family: var(--font);
      font-size: 14px; resize: none; outline: none; transition: border-color 0.2s; min-height: 44px; max-height: 120px;
    }
    .chat-textarea:focus { border-color: var(--accent); }

    /* Image/Video generator */
    .gen-box { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 28px; margin-bottom: 24px; }
    .gen-label { font-size: 13px; font-weight: 600; color: var(--muted); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em; }
    .gen-textarea {
      width: 100%; min-height: 100px; background: rgba(255,255,255,0.04);
      border: 1px solid var(--border); border-radius: 10px; padding: 14px;
      color: var(--text); font-family: var(--font); font-size: 14px; resize: vertical;
      outline: none; transition: border-color 0.2s; line-height: 1.6;
    }
    .gen-textarea:focus { border-color: var(--accent); }
    .style-pills { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
    .style-pill {
      padding: 6px 14px; border-radius: 20px; border: 1px solid var(--border2);
      background: none; color: var(--muted); cursor: pointer; font-size: 13px;
      font-family: var(--font); transition: all 0.2s;
    }
    .style-pill.active { background: rgba(124,92,252,0.2); border-color: var(--accent); color: #a78bfa; }
    .gen-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 20px; }
    .cost-label { font-size: 13px; color: var(--muted); }
    .result-box { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
    .result-img { width: 100%; display: block; aspect-ratio: 3/2; object-fit: cover; }
    .result-footer { padding: 14px 18px; display: flex; align-items: center; justify-content: space-between; }
    .result-prompt { font-size: 12px; color: var(--muted); flex: 1; }
    .video-placeholder { aspect-ratio: 16/9; background: linear-gradient(135deg, #0d0d20, #1a0d30); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; position: relative; overflow: hidden; }
    .video-glow { position: absolute; inset: 0; background: radial-gradient(ellipse at center, rgba(124,92,252,0.1) 0%, transparent 70%); animation: pulse 2s infinite; }
    .video-icon { font-size: 48px; z-index: 1; }
    .video-label { font-size: 14px; color: var(--muted); z-index: 1; text-align: center; padding: 0 20px; }

    /* Gallery */
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

    /* Pricing */
    .pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px,1fr)); gap: 20px; margin-top: 40px; }
    .plan-card {
      background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius);
      padding: 32px; position: relative; transition: all 0.3s;
    }
    .plan-card:hover { transform: translateY(-6px); box-shadow: var(--glow); }
    .plan-card.popular { border-color: var(--accent); background: rgba(124,92,252,0.05); }
    .popular-badge {
      position: absolute; top: -12px; left: 50%; transform: translateX(-50%);
      padding: 4px 16px; border-radius: 20px; font-size: 11px; font-weight: 700;
      background: linear-gradient(135deg, var(--accent), var(--accent2)); color: white; white-space: nowrap;
    }
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

    /* Login */
    .login-page { min-height: calc(100vh - 64px); display: flex; align-items: center; justify-content: center; padding: 40px 24px; }
    .login-card { width: 100%; max-width: 420px; background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 40px; }
    .login-logo { text-align: center; margin-bottom: 28px; }
    .login-logo-icon { width: 56px; height: 56px; border-radius: 16px; background: linear-gradient(135deg, var(--accent), var(--accent2)); display: flex; align-items: center; justify-content: center; font-size: 28px; margin: 0 auto 12px; box-shadow: var(--glow); }
    .login-title { font-size: 22px; font-weight: 700; text-align: center; margin-bottom: 6px; }
    .login-sub { font-size: 13px; color: var(--muted); text-align: center; margin-bottom: 28px; }
    .input-group { margin-bottom: 16px; }
    .input-label { font-size: 12px; font-weight: 600; color: var(--muted); margin-bottom: 6px; display: block; text-transform: uppercase; letter-spacing: 0.04em; }
    .input-field {
      width: 100%; padding: 11px 14px; background: rgba(255,255,255,0.04);
      border: 1px solid var(--border); border-radius: 10px; color: var(--text);
      font-family: var(--font); font-size: 14px; outline: none; transition: border-color 0.2s;
    }
    .input-field:focus { border-color: var(--accent); }
    .login-divider { display: flex; align-items: center; gap: 12px; margin: 20px 0; color: var(--muted); font-size: 12px; }
    .login-divider::before, .login-divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }
    .btn-demo { width: 100%; padding: 11px; border-radius: 10px; border: 1px solid var(--border2); background: rgba(255,255,255,0.04); color: var(--text); font-family: var(--font); font-size: 14px; cursor: pointer; transition: all 0.2s; }
    .btn-demo:hover { background: rgba(255,255,255,0.08); }
    .login-switch { text-align: center; margin-top: 20px; font-size: 13px; color: var(--muted); }
    .login-switch a { color: #a78bfa; cursor: pointer; text-decoration: none; }

    /* ── Payment Page ──────────────────────────────────────────────── */
    .pay-page {
      min-height: calc(100vh - 64px);
      display: flex; align-items: flex-start; justify-content: center;
      padding: 40px 24px; position: relative; overflow: hidden;
    }
    .pay-bg {
      position: fixed; inset: 0; z-index: 0; pointer-events: none;
      background: radial-gradient(ellipse 70% 50% at 30% 30%, rgba(124,92,252,0.08) 0%, transparent 60%),
                  radial-gradient(ellipse 50% 40% at 80% 80%, rgba(193,88,245,0.06) 0%, transparent 50%);
    }
    .pay-layout {
      position: relative; z-index: 1;
      display: grid; grid-template-columns: 1fr 380px; gap: 28px;
      width: 100%; max-width: 900px; align-items: start;
    }
    @media (max-width: 720px) { .pay-layout { grid-template-columns: 1fr; } .pay-summary { order: -1; } }

    /* Left: form card */
    .pay-card {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 20px; padding: 32px; animation: fadeUp 0.5s ease both;
    }
    .pay-header { margin-bottom: 28px; }
    .pay-back {
      display: inline-flex; align-items: center; gap: 6px;
      color: var(--muted); font-size: 13px; cursor: pointer;
      background: none; border: none; font-family: var(--font);
      margin-bottom: 20px; transition: color 0.2s; padding: 0;
    }
    .pay-back:hover { color: var(--text); }
    .pay-title { font-size: 22px; font-weight: 700; margin-bottom: 6px; }
    .pay-subtitle { font-size: 13px; color: var(--muted); }

    /* Tabs */
    .pay-tabs {
      display: flex; gap: 4px; margin-bottom: 28px;
      background: var(--surface2); border-radius: 12px; padding: 4px;
    }
    .pay-tab {
      flex: 1; padding: 10px; border-radius: 9px; border: none; cursor: pointer;
      font-family: var(--font); font-size: 13px; font-weight: 600; transition: all 0.2s;
      background: none; color: var(--muted);
    }
    .pay-tab.active { background: var(--surface); color: var(--text); box-shadow: 0 2px 8px rgba(0,0,0,0.3); }

    /* Card form */
    .pay-field { margin-bottom: 18px; }
    .pay-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .pay-label { font-size: 11px; font-weight: 600; color: var(--muted); margin-bottom: 7px; display: block; text-transform: uppercase; letter-spacing: 0.05em; }
    .pay-input {
      width: 100%; padding: 12px 14px;
      background: rgba(255,255,255,0.04); border: 1px solid var(--border);
      border-radius: 11px; color: var(--text); font-family: var(--font);
      font-size: 14px; outline: none; transition: border-color 0.2s;
      letter-spacing: 0.03em;
    }
    .pay-input:focus { border-color: var(--accent); background: rgba(124,92,252,0.04); }
    .pay-input::placeholder { color: var(--muted); letter-spacing: normal; }
    .pay-input.card-num { letter-spacing: 0.15em; font-size: 16px; font-weight: 600; }

    /* Card preview */
    .card-preview {
      width: 100%; aspect-ratio: 1.586; border-radius: 18px; margin-bottom: 24px;
      background: linear-gradient(135deg, #1a0a3a 0%, #0d0d1f 40%, #1a0a3a 100%);
      border: 1px solid rgba(124,92,252,0.25); position: relative; overflow: hidden;
      padding: 22px 24px; display: flex; flex-direction: column; justify-content: space-between;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08);
    }
    .card-preview::before {
      content: ''; position: absolute; top: -30%; right: -10%; width: 250px; height: 250px;
      border-radius: 50%; background: radial-gradient(circle, rgba(124,92,252,0.15), transparent 70%);
    }
    .card-chip { width: 40px; height: 30px; border-radius: 6px; background: linear-gradient(135deg, #d4a843, #f0c040); }
    .card-num-display { font-size: 18px; font-weight: 600; letter-spacing: 0.2em; color: rgba(255,255,255,0.9); font-family: 'Courier New', monospace; }
    .card-bottom { display: flex; justify-content: space-between; align-items: flex-end; }
    .card-label-sm { font-size: 9px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 3px; }
    .card-value-sm { font-size: 13px; color: rgba(255,255,255,0.85); font-weight: 600; }
    .card-brand { font-size: 22px; font-weight: 800; color: rgba(255,255,255,0.6); font-style: italic; }

    /* YouCan Pay tab */
    .youcan-panel {
      display: flex; flex-direction: column; align-items: center;
      text-align: center; padding: 20px 0;
    }
    .youcan-logo {
      width: 80px; height: 80px; border-radius: 20px; margin-bottom: 20px;
      background: linear-gradient(135deg, #ff6b35, #f7931e);
      display: flex; align-items: center; justify-content: center;
      font-size: 36px; box-shadow: 0 8px 30px rgba(255,107,53,0.3);
    }
    .youcan-title { font-size: 18px; font-weight: 700; margin-bottom: 10px; }
    .youcan-desc { font-size: 14px; color: var(--muted); line-height: 1.7; margin-bottom: 28px; max-width: 300px; }
    .youcan-features { display: flex; gap: 16px; margin-bottom: 28px; flex-wrap: wrap; justify-content: center; }
    .youcan-feat {
      display: flex; align-items: center; gap: 6px;
      font-size: 12px; color: var(--muted); padding: 6px 12px;
      background: rgba(255,255,255,0.04); border: 1px solid var(--border);
      border-radius: 20px;
    }
    .btn-youcan {
      width: 100%; padding: 14px; border-radius: 12px; border: none; cursor: pointer;
      background: linear-gradient(135deg, #ff6b35, #f7931e);
      color: white; font-family: var(--font); font-size: 15px; font-weight: 700;
      transition: all 0.2s; box-shadow: 0 8px 24px rgba(255,107,53,0.3);
      display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    .btn-youcan:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(255,107,53,0.4); }
    .btn-youcan:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

    /* Pay button */
    .btn-pay {
      width: 100%; padding: 14px; border-radius: 12px; border: none; cursor: pointer;
      background: linear-gradient(135deg, var(--accent), var(--accent2));
      color: white; font-family: var(--font); font-size: 15px; font-weight: 700;
      transition: all 0.2s; box-shadow: 0 8px 24px rgba(124,92,252,0.3); margin-top: 8px;
      display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    .btn-pay:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(124,92,252,0.5); }
    .btn-pay:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

    /* Security badge */
    .secure-badge {
      display: flex; align-items: center; justify-content: center; gap: 6px;
      margin-top: 16px; font-size: 12px; color: var(--muted);
    }
    .secure-badge .lock { color: var(--success); }

    /* Right: order summary */
    .pay-summary {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 20px; padding: 28px; animation: fadeUp 0.5s 0.1s ease both;
      position: sticky; top: 80px;
    }
    .summary-title { font-size: 14px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 20px; }
    .summary-plan-name {
      font-size: 24px; font-weight: 800; margin-bottom: 6px;
      background: linear-gradient(135deg, #a78bfa, #e879f9); -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    .summary-rows { display: flex; flex-direction: column; gap: 12px; margin: 20px 0; }
    .summary-row { display: flex; justify-content: space-between; align-items: center; font-size: 13px; }
    .summary-row .label { color: var(--muted); }
    .summary-row .value { font-weight: 600; }
    .summary-divider { height: 1px; background: var(--border); margin: 16px 0; }
    .summary-total { display: flex; justify-content: space-between; align-items: center; }
    .summary-total .label { font-size: 14px; font-weight: 600; }
    .summary-total .value { font-size: 26px; font-weight: 800; color: var(--gold); }
    .summary-total .currency { font-size: 13px; font-weight: 400; color: var(--muted); margin-right: 4px; }
    .trust-badges { display: flex; flex-direction: column; gap: 10px; margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border); }
    .trust-item { display: flex; align-items: center; gap: 10px; font-size: 12px; color: var(--muted); }
    .trust-icon { width: 28px; height: 28px; border-radius: 8px; background: rgba(74,222,128,0.1); border: 1px solid rgba(74,222,128,0.2); display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; }
    .test-hint {
      margin-top: 20px; padding: 12px; border-radius: 10px;
      background: rgba(240,192,64,0.08); border: 1px solid rgba(240,192,64,0.2);
      font-size: 11px; color: var(--gold); text-align: center; line-height: 1.6;
    }

    /* Toast */
    .toast {
      position: fixed; bottom: 24px; right: 24px; z-index: 9999;
      padding: 12px 20px; border-radius: 12px; font-size: 14px; font-weight: 500;
      animation: slideIn 0.3s ease; box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      max-width: 300px;
    }
    .toast.success { background: rgba(74,222,128,0.15); border: 1px solid rgba(74,222,128,0.3); color: var(--success); }
    .toast.error { background: rgba(248,113,113,0.15); border: 1px solid rgba(248,113,113,0.3); color: var(--error); }

    /* Keyframes */
    @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes bounce { 0%,80%,100% { transform: scale(0); } 40% { transform: scale(1); } }
    @keyframes pulse { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes spin { to { transform: rotate(360deg); } }
    .spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.2); border-top-color: white; border-radius: 50%; animation: spin 0.6s linear infinite; display: inline-block; vertical-align: middle; margin-right: 8px; }

    @media (max-width: 640px) {
      .nav-links { display: none; }
      .hero-stats { gap: 20px; }
      .pricing-grid { grid-template-columns: 1fr; }
      .pay-layout { grid-template-columns: 1fr; }
    }
  `;

  // ─── Render helpers ───────────────────────────────────────────────────────
  const renderHero = () => (
    <div className="hero">
      <div className="hero-bg" />
      <div className="hero-grid" />
      <div className="hero-content">
        <div className="hero-badge">✨ {lang === "ar" ? "مدعوم بأحدث نماذج الذكاء الاصطناعي" : lang === "fr" ? "Propulsé par les derniers modèles IA" : "Powered by the latest AI models"}</div>
        <h1 className="hero-title">
          <span className="hero-title-grad">{t.hero.title}</span>
        </h1>
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
          ].map(([n, l]) => (
            <div className="stat" key={n}>
              <div className="stat-num">{n}</div>
              <div className="stat-label">{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="features" style={{ marginTop: 80 }}>
        {[["🗣️", t.nav.chat, lang === "ar" ? "محادثات ذكية مدعومة بـ Claude AI" : lang === "fr" ? "Conversations intelligentes avec Claude AI" : "Smart conversations powered by Claude AI"],
          ["🎨", t.nav.images, lang === "ar" ? "صور احترافية بالذكاء الاصطناعي" : lang === "fr" ? "Images professionnelles par IA" : "Professional AI-generated images"],
          ["🎬", t.nav.video, lang === "ar" ? "فيديوهات إبداعية بضغطة زر" : lang === "fr" ? "Vidéos créatives en un clic" : "Creative videos at the click of a button"],
          ["💎", lang === "ar" ? "رصيد مرن" : lang === "fr" ? "Crédits flexibles" : "Flexible Credits", lang === "ar" ? "نظام رصيد يناسب كل الاحتياجات" : lang === "fr" ? "Système de crédits adapté à tous" : "Credit system for all needs"],
        ].map(([icon, title, desc]) => (
          <div className="feature-card" key={title}>
            <div className="feature-icon">{icon}</div>
            <div className="feature-title">{title}</div>
            <div className="feature-desc">{desc}</div>
          </div>
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
          {chatLoading && (
            <div className="msg assistant">
              <div className="msg-avatar">🤖</div>
              <div className="msg-bubble msg-thinking">
                <div className="dot" /><div className="dot" /><div className="dot" />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <div className="chat-input-area">
          <textarea
            className="chat-textarea"
            placeholder={t.chat.placeholder}
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
            rows={1}
          />
          <button className="btn-primary" onClick={sendChat} disabled={chatLoading || !chatInput.trim()}>
            {chatLoading ? <span className="spinner" /> : "↑"} {t.chat.send}
          </button>
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
        <div className="gen-footer" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20 }}>
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

  const renderVideo = () => (
    <div className="page">
      <h1 className="page-title">🎬 {t.video.title}</h1>
      <p className="page-sub">{t.video.cost}</p>
      <div className="gen-box">
        <div className="gen-label">{lang === "ar" ? "وصف الفيديو" : lang === "fr" ? "Description" : "Prompt"}</div>
        <textarea className="gen-textarea" placeholder={t.video.placeholder} value={videoPrompt} onChange={e => setVideoPrompt(e.target.value)} />
        <div style={{ marginTop: 16 }}>
          <div className="gen-label">{t.video.duration}</div>
          <div className="style-pills">
            {["5", "10", "15"].map(d => (
              <button key={d} className={`style-pill ${videoDuration === d ? "active" : ""}`} onClick={() => setVideoDuration(d)}>{d}s</button>
            ))}
          </div>
        </div>
        <div className="gen-footer" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20 }}>
          <span className="cost-label">💰 {t.video.cost} | {t.credits}: {credits}</span>
          <button className="btn-primary" onClick={generateVideo} disabled={videoLoading || !videoPrompt.trim()}>
            {videoLoading ? <><span className="spinner" />{t.video.generating}</> : t.video.generate}
          </button>
        </div>
      </div>
      {generatedVideo && (
        <div className="result-box">
          <div className="video-placeholder">
            <div className="video-glow" />
            <div className="video-icon">▶️</div>
            <div className="video-label">{lang === "ar" ? "تم توليد الفيديو بنجاح!" : lang === "fr" ? "Vidéo générée avec succès!" : "Video generated successfully!"}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{videoPrompt}</div>
          </div>
          <img src={generatedVideo.thumb} alt="thumb" style={{ width: "100%", display: "block", maxHeight: 200, objectFit: "cover" }} />
          <div className="result-footer">
            <span className="result-prompt">🎬 {videoPrompt} · {videoDuration}s</span>
          </div>
        </div>
      )}
    </div>
  );

  const renderGallery = () => (
    <div className="page">
      <h1 className="page-title">🖼️ {t.gallery.title}</h1>
      {gallery.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎨</div>
          <p>{t.gallery.empty}</p>
        </div>
      ) : (
        <div className="gallery-grid">
          {gallery.map(item => (
            <div key={item.id} className="gallery-item">
              <img src={item.url} alt={item.prompt} />
              <div className={`gallery-type-badge ${item.type === "image" ? "badge-image" : "badge-video"}`}>
                {item.type === "image" ? "🖼" : "🎬"}
              </div>
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
            {plan.popular && <div className="popular-badge">⭐ {lang === "ar" ? "الأكثر شعبية" : lang === "fr" ? "Le plus populaire" : "Most Popular"}</div>}
            <div className="plan-name">{plan.name}</div>
            <div className="plan-price">{plan.price}<span> {plan.currency}</span></div>
            <div className="plan-credits">💰 {plan.credits} {t.credits}</div>
            <ul className="plan-features">
              {plan.features.map(f => <li key={f}>{f}</li>)}
            </ul>
            <button
              className={`plan-cta ${plan.popular ? "primary" : "secondary"}`}
              onClick={() => openPayment(plan)}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  // ── Payment Page ────────────────────────────────────────────────────────────
  const renderPayment = () => {
    if (!selectedPlan) { setPage("pricing"); return null; }
    const cfg = PLAN_CONFIG[selectedPlan.id];
    const displayNum = cardNum || "•••• •••• •••• ••••";
    const displayExp = cardExp || "MM/YY";
    const displayName = cardName || (lang === "ar" ? "الاسم الكامل" : lang === "fr" ? "Nom du titulaire" : "FULL NAME");

    return (
      <div className="pay-page">
        <div className="pay-bg" />
        <div className="pay-layout">

          {/* ── Left: Payment Form ── */}
          <div className="pay-card">
            <div className="pay-header">
              <button className="pay-back" onClick={() => setPage("pricing")}>
                ← {t.pay.backToPricing}
              </button>
              <h1 className="pay-title">💳 {t.pay.title}</h1>
              <p className="pay-subtitle">{t.pay.subtitle}</p>
            </div>

            {/* Tabs */}
            <div className="pay-tabs">
              <button className={`pay-tab ${payTab === "card" ? "active" : ""}`} onClick={() => setPayTab("card")}>
                💳 {lang === "ar" ? "بطاقة بنكية" : lang === "fr" ? "Carte bancaire" : "Credit Card"}
              </button>
              <button className={`pay-tab ${payTab === "youcan" ? "active" : ""}`} onClick={() => setPayTab("youcan")}>
                🔶 YouCan Pay
              </button>
            </div>

            {payTab === "card" && (
              <>
                {/* Card preview */}
                <div className="card-preview">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div className="card-chip" />
                    <div className="card-brand">VISA</div>
                  </div>
                  <div className="card-num-display">{displayNum}</div>
                  <div className="card-bottom">
                    <div>
                      <div className="card-label-sm">{lang === "ar" ? "اسم الحامل" : lang === "fr" ? "Titulaire" : "CARD HOLDER"}</div>
                      <div className="card-value-sm" style={{ textTransform: "uppercase" }}>{displayName}</div>
                    </div>
                    <div style={{ textAlign: isRTL ? "left" : "right" }}>
                      <div className="card-label-sm">{lang === "ar" ? "تاريخ الانتهاء" : lang === "fr" ? "Expiration" : "EXPIRES"}</div>
                      <div className="card-value-sm">{displayExp}</div>
                    </div>
                  </div>
                </div>

                {/* Card number */}
                <div className="pay-field">
                  <label className="pay-label">{t.pay.cardNumber}</label>
                  <input
                    className="pay-input card-num"
                    placeholder="4242 4242 4242 4242"
                    value={cardNum}
                    onChange={e => setCardNum(formatCard(e.target.value))}
                    maxLength={19}
                  />
                </div>

                {/* Cardholder */}
                <div className="pay-field">
                  <label className="pay-label">{t.pay.cardHolder}</label>
                  <input
                    className="pay-input"
                    placeholder={lang === "ar" ? "محمد العربي" : lang === "fr" ? "Jean Dupont" : "John Doe"}
                    value={cardName}
                    onChange={e => setCardName(e.target.value)}
                  />
                </div>

                {/* Expiry + CVV */}
                <div className="pay-field-row">
                  <div className="pay-field">
                    <label className="pay-label">{t.pay.expiry}</label>
                    <input
                      className="pay-input"
                      placeholder={t.pay.monthYear}
                      value={cardExp}
                      onChange={e => setCardExp(formatExp(e.target.value))}
                      maxLength={7}
                    />
                  </div>
                  <div className="pay-field">
                    <label className="pay-label">{t.pay.cvv}</label>
                    <input
                      className="pay-input"
                      placeholder="•••"
                      type="password"
                      value={cardCvv}
                      onChange={e => setCardCvv(e.target.value.replace(/\D/g,"").slice(0,4))}
                      maxLength={4}
                    />
                  </div>
                </div>

                <button className="btn-pay" onClick={handleCardPay} disabled={payLoading}>
                  {payLoading
                    ? <><span className="spinner" />{t.pay.processing}</>
                    : <>🔒 {t.pay.payNow} — {cfg.price_mad} {t.pay.currency}</>
                  }
                </button>
                <div className="secure-badge">
                  <span className="lock">🔒</span>
                  {t.pay.secureBadge}
                </div>
              </>
            )}

            {payTab === "youcan" && (
              <div className="youcan-panel">
                <div className="youcan-logo">🔶</div>
                <div className="youcan-title">{t.pay.youcanTitle}</div>
                <div className="youcan-desc">{t.pay.youcanDesc}</div>
                <div className="youcan-features">
                  <div className="youcan-feat">🛡️ {lang === "ar" ? "دفع آمن" : lang === "fr" ? "Paiement sécurisé" : "Secure"}</div>
                  <div className="youcan-feat">⚡ {lang === "ar" ? "فوري" : lang === "fr" ? "Instantané" : "Instant"}</div>
                  <div className="youcan-feat">🇲🇦 {lang === "ar" ? "درهم مغربي" : "MAD"}</div>
                  <div className="youcan-feat">🔄 {lang === "ar" ? "استرداد سهل" : lang === "fr" ? "Remboursement" : "Refundable"}</div>
                </div>
                <button className="btn-youcan" onClick={handleYouCanRedirect} disabled={payLoading} style={{ maxWidth: 320 }}>
                  {payLoading
                    ? <><span className="spinner" />{t.pay.processing}</>
                    : <>{t.pay.youcanBtn} →</>
                  }
                </button>
                <div className="secure-badge" style={{ marginTop: 14 }}>
                  <span>🌐</span>
                  {lang === "ar"
                    ? `سيتم تحويلك إلى: ${APP_URL}/api/youcanpay/checkout`
                    : `Redirect to: ${APP_URL}/api/youcanpay/checkout`}
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Order Summary ── */}
          <div className="pay-summary">
            <div className="summary-title">
              {t.pay.orderSummary}
            </div>
            <div className="summary-plan-name">{selectedPlan.name}</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>
              {lang === "ar" ? "اشتراك شهري" : lang === "fr" ? "Abonnement mensuel" : "Monthly subscription"}
            </div>

            <div className="summary-rows">
              <div className="summary-row">
                <span className="label">{t.pay.plan}</span>
                <span className="value">{selectedPlan.name}</span>
              </div>
              <div className="summary-row">
                <span className="label">{t.pay.credits}</span>
                <span className="value" style={{ color: "var(--accent)" }}>💰 {cfg.credits}</span>
              </div>
              <div className="summary-row">
                <span className="label">{lang === "ar" ? "الفوترة" : lang === "fr" ? "Facturation" : "Billing"}</span>
                <span className="value">{lang === "ar" ? "شهري" : lang === "fr" ? "Mensuelle" : "Monthly"}</span>
              </div>
            </div>

            <div className="summary-divider" />

            <div className="summary-total">
              <span className="label">{t.pay.total}</span>
              <span className="value">
                <span className="currency">{t.pay.currency}</span>
                {cfg.price_mad}
              </span>
            </div>

            <div className="trust-badges">
              <div className="trust-item">
                <div className="trust-icon">✅</div>
                <span>{t.pay.guarantee}</span>
              </div>
              <div className="trust-item">
                <div className="trust-icon">💬</div>
                <span>{t.pay.support}</span>
              </div>
              <div className="trust-item">
                <div className="trust-icon">🔒</div>
                <span>{t.pay.ssl}</span>
              </div>
              <div className="trust-item">
                <div className="trust-icon">🔶</div>
                <span>{lang === "ar" ? "مدعوم بـ YouCan Pay" : lang === "fr" ? "Propulsé par YouCan Pay" : "Powered by YouCan Pay"}</span>
              </div>
            </div>

            <div className="test-hint">
              🧪 {t.pay.testCard}
              <br />
              {lang === "ar" ? "CVV: أي 3 أرقام | الانتهاء: أي تاريخ مستقبلي" : lang === "fr" ? "CVV: 3 chiffres quelconques | Exp: toute date future" : "CVV: any 3 digits | Exp: any future date"}
            </div>
          </div>

        </div>
      </div>
    );
  };

  const renderLogin = () => (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">✨</div>
        </div>
        <h2 className="login-title">{t.loginTitle}</h2>
        <p className="login-sub">{t.loginSub}</p>
        <div className="input-group">
          <label className="input-label">{t.email}</label>
          <input type="email" className="input-field" placeholder="you@example.com" />
        </div>
        <div className="input-group">
          <label className="input-label">{t.password}</label>
          <input type="password" className="input-field" placeholder="••••••••" />
        </div>
        <button className="btn-primary" style={{ width: "100%", padding: 12, marginTop: 8, fontSize: 15 }} onClick={handleDemoLogin}>
          {loginMode === "login" ? t.loginBtn : t.registerBtn}
        </button>
        <div className="login-divider">{lang === "ar" ? "أو" : lang === "fr" ? "ou" : "or"}</div>
        <button className="btn-demo" onClick={handleDemoLogin}>🚀 {t.demoLogin}</button>
        <div className="login-switch">
          {loginMode === "login" ? t.noAccount : t.hasAccount}{" "}
          <a onClick={() => setLoginMode(m => m === "login" ? "register" : "login")}>
            {loginMode === "login" ? t.registerBtn : t.loginBtn}
          </a>
        </div>
      </div>
    </div>
  );

  const pages = {
    home: renderHero,
    chat: renderChat,
    images: renderImages,
    video: renderVideo,
    gallery: renderGallery,
    pricing: renderPricing,
    payment: renderPayment,
    login: renderLogin,
  };

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        {/* Navbar */}
        <nav className="navbar">
          <div className="nav-logo" onClick={() => setPage("home")}>
            <div className="nav-logo-icon">✨</div>
            <span className="nav-logo-text">{t.name}</span>
          </div>
          <div className="nav-links">
            {Object.entries(t.nav).map(([key, label]) => (
              <button
                key={key}
                className={`nav-link ${page === key ? "active" : ""}`}
                onClick={() => user || key === "pricing" ? setPage(key) : setPage("login")}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="nav-right">
            {user && <div className="credits-badge">💰 {credits} {t.credits}</div>}
            {["ar", "fr", "en"].map(l => (
              <button key={l} className="lang-btn" onClick={() => setLang(l)} style={{ opacity: lang === l ? 1 : 0.5 }}>
                {l === "ar" ? "عر" : l === "fr" ? "FR" : "EN"}
              </button>
            ))}
            {user
              ? <button className="btn-ghost" onClick={handleLogout}>{t.logout}</button>
              : <button className="btn-primary" onClick={() => setPage("login")}>{t.login}</button>
            }
          </div>
        </nav>

        {/* Page */}
        <main className="main">
          {(pages[page] || pages.home)()}
        </main>

        {/* Toast */}
        {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
      </div>
    </>
  );
}
