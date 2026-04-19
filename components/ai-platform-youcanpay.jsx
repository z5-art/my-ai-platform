'use client'
import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ── Supabase client (uses Vercel Storage env vars automatically) ──────────────
const SUPA_URL =
  process.env.NEXT_PUBLIC_STORAGE_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPA_ANON =
  process.env.NEXT_PUBLIC_STORAGE_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const sb = SUPA_URL && SUPA_ANON ? createClient(SUPA_URL, SUPA_ANON) : null;

// ── Plan config ───────────────────────────────────────────────────────────────
const PLANS = {
  free:  { credits: 50,   price: 0,   label: "0 MAD" },
  pro:   { credits: 500,  price: 99,  label: "99 MAD" },
  ultra: { credits: 2000, price: 299, label: "299 MAD" },
};

const VIDEO_COSTS = { text2video: 50, img2video: 60, effects: 40, lipsync: 70 };

// ── Translations ──────────────────────────────────────────────────────────────
const T = {
  ar: {
    dir: "rtl", name: "إبداع AI",
    nav: { chat: "المحادثة", images: "الصور", video: "الفيديو", gallery: "معرضي", pricing: "الأسعار", profile: "حسابي" },
    hero: { title: "اصنع المستقبل", sub: "بالذكاء الاصطناعي", desc: "توليد صور، فيديوهات، ومحادثات ذكية — كل ما تحتاجه في مكان واحد", cta: "ابدأ مجاناً", pricing: "الأسعار" },
    chat: { title: "المحادثة الذكية", ph: "اكتب رسالتك...", send: "إرسال", clear: "مسح", welcome: "مرحباً! أنا مساعدك الذكي." },
    image: { title: "توليد الصور", ph: "صِف الصورة...", gen: "توليد", loading: "جاري التوليد...", style: "النمط", cost: "10 رصيد", upload: "📎 أضف صورة مرجعية", styles: { realistic: "واقعي", artistic: "فني", anime: "أنمي", abstract: "تجريدي" } },
    video: { title: "توليد الفيديو", gen: "توليد", loading: "جاري المعالجة...", dur: "المدة", ratio: "النسبة", res: "الدقة", modes: { text2video: "نص→فيديو", img2video: "صورة→فيديو", effects: "مؤثرات", lipsync: "مزامنة" }, phs: { text2video: "صِف الفيديو...", img2video: "صِف التحويل...", effects: "صِف المؤثر...", lipsync: "أضف نصاً للمزامنة..." }, uploadImg: "📎 ارفع صورة", uploadVid: "🎬 ارفع فيديو" },
    gallery: { title: "معرض أعمالي", empty: "لا توجد أعمال بعد!", del: "حذف" },
    pricing: { title: "اختر خطتك", sub: "ابدأ مجاناً", plans: [
      { id: "free",  name: "المجاني",    price: "0",   cur: "درهم/شهر", credits: 50,   feats: ["50 رصيد", "صور عادية", "محادثة مفتوحة"], cta: "ابدأ مجاناً", hot: false },
      { id: "pro",   name: "الاحترافي", price: "99",  cur: "درهم/شهر", credits: 500,  feats: ["500 رصيد", "صور HD", "كل أوضاع الفيديو", "أولوية المعالجة"], cta: "اشترك الآن", hot: true },
      { id: "ultra", name: "الأعمال",   price: "299", cur: "درهم/شهر", credits: 2000, feats: ["2000 رصيد", "كل الميزات", "فيديو 4K", "دعم 24/7"], cta: "تواصل معنا", hot: false },
    ]},
    login: { title: "مرحباً بعودتك", sub: "سجل دخولك للمتابعة", email: "البريد الإلكتروني", pass: "كلمة المرور", fname: "الاسم الأول", lname: "اللقب", phone: "رقم الهاتف", btn: "تسجيل الدخول", reg: "إنشاء حساب", demo: "دخول تجريبي", noAcc: "ليس لديك حساب؟", hasAcc: "لديك حساب؟", checkEmail: "تحقق من بريدك الإلكتروني!" },
    profile: { title: "حسابي", plan: "خطتي", creds: "رصيدي", works: "أعمالي", history: "السجل", noHistory: "لا يوجد سجل بعد", edit: "تعديل", save: "حفظ" },
    pay: { title: "إتمام الدفع", summary: "ملخص الطلب", plan: "الخطة", creds: "الرصيد", total: "المجموع", cur: "درهم", btn: "الدفع عبر YouCan Pay", back: "رجوع", secure: "دفع آمن", guarantee: "ضمان 7 أيام", support: "دعم 24/7" },
    credits: "الرصيد", logout: "خروج", login: "دخول", fillAll: "يرجى ملء جميع الحقول",
    err: "حدث خطأ، حاول مجدداً", noCredits: "رصيدك غير كافٍ!", generated: "تم التوليد!", copied: "تم النسخ!",
  },
  fr: {
    dir: "ltr", name: "Ibda3 AI",
    nav: { chat: "Chat", images: "Images", video: "Vidéo", gallery: "Galerie", pricing: "Tarifs", profile: "Profil" },
    hero: { title: "Créez l'avenir", sub: "avec l'Intelligence Artificielle", desc: "Génération d'images, vidéos et conversations intelligentes", cta: "Commencer gratuitement", pricing: "Tarifs" },
    chat: { title: "Chat Intelligent", ph: "Écrivez votre message...", send: "Envoyer", clear: "Effacer", welcome: "Bonjour! Je suis votre assistant IA." },
    image: { title: "Génération d'Images", ph: "Décrivez l'image...", gen: "Générer", loading: "Génération...", style: "Style", cost: "10 crédits", upload: "📎 Ajouter image", styles: { realistic: "Réaliste", artistic: "Artistique", anime: "Animé", abstract: "Abstrait" } },
    video: { title: "Génération Vidéo", gen: "Générer", loading: "Traitement...", dur: "Durée", ratio: "Format", res: "Résolution", modes: { text2video: "Texte→Vidéo", img2video: "Image→Vidéo", effects: "Effets", lipsync: "Lip Sync" }, phs: { text2video: "Décrivez la vidéo...", img2video: "Décrivez la transformation...", effects: "Décrivez l'effet...", lipsync: "Texte à synchroniser..." }, uploadImg: "📎 Image", uploadVid: "🎬 Vidéo" },
    gallery: { title: "Ma Galerie", empty: "Aucune création!", del: "Supprimer" },
    pricing: { title: "Choisissez votre plan", sub: "Commencez gratuitement", plans: [
      { id: "free",  name: "Gratuit",  price: "0",   cur: "MAD/mois", credits: 50,   feats: ["50 crédits", "Images standard", "Chat illimité"], cta: "Commencer", hot: false },
      { id: "pro",   name: "Pro",      price: "99",  cur: "MAD/mois", credits: 500,  feats: ["500 crédits", "Images HD", "Tous modes vidéo", "Priorité"], cta: "S'abonner", hot: true },
      { id: "ultra", name: "Business", price: "299", cur: "MAD/mois", credits: 2000, feats: ["2000 crédits", "Tout inclus", "Vidéo 4K", "Support 24/7"], cta: "Contactez-nous", hot: false },
    ]},
    login: { title: "Bon retour", sub: "Connectez-vous pour continuer", email: "Email", pass: "Mot de passe", fname: "Prénom", lname: "Nom", phone: "Téléphone", btn: "Se connecter", reg: "Créer un compte", demo: "Démo", noAcc: "Pas de compte?", hasAcc: "Déjà un compte?", checkEmail: "Vérifiez votre email!" },
    profile: { title: "Mon Profil", plan: "Mon plan", creds: "Mes crédits", works: "Créations", history: "Historique", noHistory: "Aucun historique", edit: "Modifier", save: "Sauvegarder" },
    pay: { title: "Finaliser le paiement", summary: "Récapitulatif", plan: "Plan", creds: "Crédits", total: "Total", cur: "MAD", btn: "Payer via YouCan Pay", back: "Retour", secure: "Paiement sécurisé", guarantee: "Garantie 7 jours", support: "Support 24/7" },
    credits: "Crédits", logout: "Déconnexion", login: "Connexion", fillAll: "Remplissez tous les champs",
    err: "Erreur, réessayez", noCredits: "Crédits insuffisants!", generated: "Généré!", copied: "Copié!",
  },
  en: {
    dir: "ltr", name: "Ibda3 AI",
    nav: { chat: "Chat", images: "Images", video: "Video", gallery: "Gallery", pricing: "Pricing", profile: "Profile" },
    hero: { title: "Build the Future", sub: "with Artificial Intelligence", desc: "Generate images, videos, and intelligent conversations — all in one place", cta: "Start for Free", pricing: "Pricing" },
    chat: { title: "Smart Chat", ph: "Type your message...", send: "Send", clear: "Clear", welcome: "Hello! I'm your AI assistant." },
    image: { title: "Image Generation", ph: "Describe the image...", gen: "Generate", loading: "Generating...", style: "Style", cost: "10 credits", upload: "📎 Add reference image", styles: { realistic: "Realistic", artistic: "Artistic", anime: "Anime", abstract: "Abstract" } },
    video: { title: "Video Generation", gen: "Generate", loading: "Processing...", dur: "Duration", ratio: "Aspect Ratio", res: "Resolution", modes: { text2video: "Text→Video", img2video: "Image→Video", effects: "Effects", lipsync: "Lip Sync" }, phs: { text2video: "Describe the video...", img2video: "Describe the transformation...", effects: "Describe the effect...", lipsync: "Add text to sync..." }, uploadImg: "📎 Upload image", uploadVid: "🎬 Upload video" },
    gallery: { title: "My Gallery", empty: "No creations yet!", del: "Delete" },
    pricing: { title: "Choose Your Plan", sub: "Start free, scale as you grow", plans: [
      { id: "free",  name: "Free",     price: "0",   cur: "MAD/mo", credits: 50,   feats: ["50 credits", "Standard images", "Unlimited chat"], cta: "Get Started", hot: false },
      { id: "pro",   name: "Pro",      price: "99",  cur: "MAD/mo", credits: 500,  feats: ["500 credits", "HD images", "All video modes", "Priority"], cta: "Subscribe", hot: true },
      { id: "ultra", name: "Business", price: "299", cur: "MAD/mo", credits: 2000, feats: ["2000 credits", "Everything", "4K video", "24/7 support"], cta: "Contact Us", hot: false },
    ]},
    login: { title: "Welcome Back", sub: "Sign in to continue", email: "Email", pass: "Password", fname: "First Name", lname: "Last Name", phone: "Phone", btn: "Sign In", reg: "Create Account", demo: "Demo Login", noAcc: "No account?", hasAcc: "Have an account?", checkEmail: "Check your email!" },
    profile: { title: "My Profile", plan: "My Plan", creds: "My Credits", works: "Creations", history: "History", noHistory: "No history yet", edit: "Edit", save: "Save" },
    pay: { title: "Complete Payment", summary: "Order Summary", plan: "Plan", creds: "Credits", total: "Total", cur: "MAD", btn: "Pay via YouCan Pay", back: "Back", secure: "Secure payment", guarantee: "7-day guarantee", support: "24/7 Support" },
    credits: "Credits", logout: "Logout", login: "Login", fillAll: "Please fill all fields",
    err: "Error, please try again", noCredits: "Insufficient credits!", generated: "Generated!", copied: "Copied!",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [lang, setLang]               = useState("ar");
  const [page, setPage]               = useState("home");
  const [user, setUser]               = useState(null);
  const [credits, setCredits]         = useState(50);
  const [gallery, setGallery]         = useState([]);
  const [history, setHistory]         = useState([]);
  const [toast, setToast]             = useState(null);
  // chat
  const [msgs, setMsgs]               = useState([]);
  const [chatIn, setChatIn]           = useState("");
  const [chatLoad, setChatLoad]       = useState(false);
  // image
  const [imgPrompt, setImgPrompt]     = useState("");
  const [imgStyle, setImgStyle]       = useState("realistic");
  const [imgLoad, setImgLoad]         = useState(false);
  const [imgResult, setImgResult]     = useState(null);
  // video
  const [vidPrompt, setVidPrompt]     = useState("");
  const [vidMode, setVidMode]         = useState("text2video");
  const [vidDur, setVidDur]           = useState("5");
  const [vidAspect, setVidAspect]     = useState("16:9");
  const [vidRes, setVidRes]           = useState("720p");
  const [vidLoad, setVidLoad]         = useState(false);
  const [vidResult, setVidResult]     = useState(null);
  // login
  const [loginMode, setLoginMode]     = useState("login");
  const [lEmail, setLEmail]           = useState("");
  const [lPass, setLPass]             = useState("");
  const [lFirst, setLFirst]           = useState("");
  const [lLast, setLLast]             = useState("");
  const [lPhone, setLPhone]           = useState("");
  const [lLoad, setLLoad]             = useState(false);
  // payment
  const [selPlan, setSelPlan]         = useState(null);
  const [payLoad, setPayLoad]         = useState(false);
  // profile edit
  const [editName, setEditName]       = useState(false);
  const [newName, setNewName]         = useState("");
  const chatEnd = useRef(null);

  const t = T[lang];
  useEffect(() => { document.documentElement.dir = t.dir; document.documentElement.lang = lang; }, [lang, t.dir]);
  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const toast_ = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const addHistory = (type, prompt) => setHistory(h => [{ id: Date.now(), type, prompt: prompt.slice(0, 50), date: new Date().toLocaleDateString() }, ...h.slice(0, 19)]);

  // ── Auth ────────────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!lEmail || !lPass) { toast_(t.fillAll, "error"); return; }
    if (!sb) { toast_(t.err, "error"); return; }
    setLLoad(true);
    const { data, error } = await sb.auth.signInWithPassword({ email: lEmail, password: lPass });
    if (error) toast_(error.message, "error");
    else {
      const profile = await sb.from("profiles").select("*").eq("id", data.user.id).single();
      setUser({ id: data.user.id, name: profile.data?.full_name || lEmail.split("@")[0], email: lEmail, token: data.session?.access_token });
      setCredits(profile.data?.credits ?? 50);
      setMsgs([{ role: "assistant", content: t.chat.welcome }]);
      setPage("chat");
      toast_(lang === "ar" ? "أهلاً بك!" : lang === "fr" ? "Bienvenue!" : "Welcome!");
    }
    setLLoad(false);
  };

  const handleRegister = async () => {
    if (!lFirst || !lLast || !lPhone || !lEmail || !lPass) { toast_(t.fillAll, "error"); return; }
    if (lPass.length < 8) { toast_(lang === "ar" ? "كلمة المرور 8 أحرف على الأقل" : "Password must be 8+ chars", "error"); return; }
    if (!sb) { toast_(t.err, "error"); return; }
    setLLoad(true);
    const { error } = await sb.auth.signUp({ email: lEmail, password: lPass, options: { data: { full_name: `${lFirst} ${lLast}`, phone: lPhone } } });
    if (error) toast_(error.message, "error");
    else { toast_(t.login.checkEmail); setLoginMode("login"); }
    setLLoad(false);
  };

  const handleDemo = () => {
    setUser({ id: "demo", name: lang === "ar" ? "مستخدم تجريبي" : "Demo User", email: "demo@ibda3ai.com" });
    setCredits(150);
    setMsgs([{ role: "assistant", content: t.chat.welcome }]);
    setPage("chat");
  };

  const handleLogout = async () => {
    if (sb) await sb.auth.signOut();
    setUser(null); setPage("home"); setCredits(50);
  };

  // ── Chat ────────────────────────────────────────────────────────────────────
  const sendChat = async () => {
    if (!chatIn.trim() || chatLoad) return;
    const userMsg = { role: "user", content: chatIn };
    const newMsgs = [...msgs, userMsg];
    setMsgs(newMsgs); setChatIn(""); setChatLoad(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMsgs.map(m => ({ role: m.role, content: m.content })), userId: user?.id || "demo" }),
      });
      if (res.status === 402) { toast_(t.noCredits, "error"); setChatLoad(false); return; }
      const data = await res.json();
      setMsgs([...newMsgs, { role: "assistant", content: data.content || t.err }]);
      if (data.balance !== undefined) setCredits(data.balance);
      addHistory("chat", chatIn);
    } catch { toast_(t.err, "error"); }
    setChatLoad(false);
  };

  // ── Image ───────────────────────────────────────────────────────────────────
  const genImage = async () => {
    if (!imgPrompt.trim() || imgLoad) return;
    if (credits < 10) { toast_(t.noCredits, "error"); return; }
    setImgLoad(true); setImgResult(null);
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: imgPrompt, style: imgStyle, userId: user?.id || "demo" }),
      });
      const data = await res.json();
      const url = data.url || `https://picsum.photos/seed/${Date.now()}/800/600`;
      setImgResult(url);
      if (data.balance !== undefined) setCredits(data.balance);
      else setCredits(c => c - 10);
      setGallery(g => [{ id: Date.now(), type: "image", url, prompt: imgPrompt, date: new Date().toLocaleDateString() }, ...g]);
      toast_(t.generated); addHistory("image", imgPrompt);
    } catch { toast_(t.err, "error"); }
    setImgLoad(false);
  };

  // ── Video ───────────────────────────────────────────────────────────────────
  const genVideo = async () => {
    if (!vidPrompt.trim() || vidLoad) return;
    const cost = VIDEO_COSTS[vidMode] ?? 50;
    if (credits < cost) { toast_(t.noCredits, "error"); return; }
    setVidLoad(true); setVidResult(null);
    try {
      const res = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: vidPrompt, mode: vidMode, duration: vidDur, aspect: vidAspect, resolution: vidRes, userId: user?.id || "demo" }),
      });
      const data = await res.json();
      const thumb = data.thumbnail || `https://picsum.photos/seed/${Date.now()}/640/360`;
      setVidResult({ thumb, prompt: vidPrompt, mode: vidMode });
      if (data.balance !== undefined) setCredits(data.balance);
      else setCredits(c => c - cost);
      setGallery(g => [{ id: Date.now(), type: "video", url: thumb, prompt: vidPrompt, date: new Date().toLocaleDateString() }, ...g]);
      toast_(t.generated); addHistory("video", vidPrompt);
    } catch { toast_(t.err, "error"); }
    setVidLoad(false);
  };

  // ── Payment ─────────────────────────────────────────────────────────────────
  const openPayment = (plan) => {
    if (!user) { setPage("login"); return; }
    if (plan.id === "free") { toast_(lang === "ar" ? "أنت على الخطة المجانية" : "You're on the free plan"); return; }
    if (plan.id === "ultra") { toast_(lang === "ar" ? "تواصل معنا عبر البريد" : "Contact us via email"); return; }
    setSelPlan(plan); setPage("payment");
  };

  const handlePay = async () => {
    if (!selPlan || !user) return;
    setPayLoad(true);
    toast_(lang === "ar" ? "جاري التحويل..." : "Redirecting...");
    try {
      const res = await fetch("/api/youcanpay/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: selPlan.id, userId: user.id, email: user.email }),
      });
      const data = await res.json();
      if (data.checkout_url) window.location.href = data.checkout_url;
      else toast_(t.err, "error");
    } catch { toast_(t.err, "error"); }
    setPayLoad(false);
  };

  // ── CSS ─────────────────────────────────────────────────────────────────────
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=Noto+Kufi+Arabic:wght@300;400;600;700;800&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{
      --bg:#050508;--s1:#0d0d14;--s2:#13131e;
      --b1:rgba(255,255,255,0.07);--b2:rgba(255,255,255,0.12);
      --ac:#7c5cfc;--ac2:#c158f5;--gold:#f0c040;
      --txt:#e8e8f0;--mut:#7070a0;--ok:#4ade80;--er:#f87171;
      --font:${lang==="ar"?"'Noto Kufi Arabic'":"'Sora'"}, sans-serif;
      --r:16px;--glow:0 0 40px rgba(124,92,252,0.25);
    }
    html,body,#root{height:100%;background:var(--bg);color:var(--txt);font-family:var(--font)}
    .app{min-height:100vh;display:flex;flex-direction:column}

    /* ── NAVBAR ── */
    .nav{position:fixed;top:0;left:0;right:0;z-index:200;background:rgba(5,5,8,0.9);backdrop-filter:blur(20px);border-bottom:1px solid var(--b1);display:flex;align-items:center;justify-content:space-between;padding:0 20px;height:60px;gap:12px}
    .nav-logo{display:flex;align-items:center;gap:8px;cursor:pointer}
    .nav-logo-icon{width:32px;height:32px;border-radius:9px;background:linear-gradient(135deg,var(--ac),var(--ac2));display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:var(--glow)}
    .nav-logo-txt{font-size:17px;font-weight:700;background:linear-gradient(135deg,#a78bfa,#e879f9);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
    .nav-links{display:flex;gap:2px}
    .nav-link{padding:6px 12px;border-radius:8px;cursor:pointer;font-size:13px;color:var(--mut);transition:all .2s;border:none;background:none;font-family:var(--font)}
    .nav-link:hover,.nav-link.on{color:var(--txt);background:rgba(255,255,255,0.07)}
    .nav-r{display:flex;align-items:center;gap:8px}
    .creds-badge{display:flex;align-items:center;gap:5px;padding:4px 10px;background:rgba(240,192,64,0.1);border:1px solid rgba(240,192,64,0.25);border-radius:20px;font-size:12px;font-weight:600;color:var(--gold)}
    .lang-btn{padding:4px 8px;border-radius:7px;border:1px solid var(--b2);background:var(--s1);color:var(--mut);cursor:pointer;font-size:11px;font-family:var(--font);transition:all .2s}
    .lang-btn:hover{color:var(--txt);border-color:var(--ac)}
    .btn-g{padding:7px 14px;border-radius:9px;border:1px solid var(--b2);background:none;color:var(--txt);cursor:pointer;font-family:var(--font);font-size:13px;transition:all .2s}
    .btn-g:hover{background:rgba(255,255,255,0.07)}
    .btn-p{padding:8px 18px;border-radius:9px;border:none;cursor:pointer;background:linear-gradient(135deg,var(--ac),var(--ac2));color:#fff;font-family:var(--font);font-size:13px;font-weight:600;transition:all .2s;box-shadow:0 0 20px rgba(124,92,252,0.3)}
    .btn-p:hover{transform:translateY(-1px);box-shadow:0 0 30px rgba(124,92,252,0.5)}
    .btn-p:disabled{opacity:.5;cursor:not-allowed;transform:none}
    .main{flex:1;padding-top:60px}

    /* ── HERO DESERT ANIMATION ── */
    .hero{min-height:calc(100vh - 60px);position:relative;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:40px 20px}

    /* Sky */
    .sky{position:absolute;inset:0;background:linear-gradient(180deg,#0a0015 0%,#1a0030 30%,#2d0050 50%,#8b4513 65%,#cd853f 72%,#daa520 78%,#f4a460 85%,#e8c48a 100%);z-index:0}

    /* Stars */
    .stars{position:absolute;top:0;left:0;right:0;height:60%;z-index:1;overflow:hidden}
    .star{position:absolute;background:#fff;border-radius:50%;animation:twinkle 3s infinite}
    @keyframes twinkle{0%,100%{opacity:.3;transform:scale(1)}50%{opacity:1;transform:scale(1.3)}}

    /* Sun/Moon */
    .sun{position:absolute;width:80px;height:80px;border-radius:50%;background:radial-gradient(circle,#fff9c4,#ffd700,#ff8c00);box-shadow:0 0 60px 20px rgba(255,200,0,0.4);top:55%;left:50%;transform:translate(-50%,-50%);z-index:2;animation:sunPulse 4s ease-in-out infinite}
    @keyframes sunPulse{0%,100%{box-shadow:0 0 60px 20px rgba(255,200,0,0.4)}50%{box-shadow:0 0 80px 30px rgba(255,150,0,0.6)}}

    /* Desert ground */
    .ground{position:absolute;bottom:0;left:0;right:0;height:38%;z-index:3}
    .ground-main{position:absolute;inset:0;background:linear-gradient(180deg,#c4915a 0%,#a0703a 30%,#7a5228 60%,#5c3d1e 100%)}

    /* Desert dunes */
    .dune{position:absolute;bottom:0;border-radius:50% 50% 0 0;background:linear-gradient(180deg,#d4a574,#b8865c)}
    .dune1{width:400px;height:120px;left:-50px}
    .dune2{width:600px;height:160px;right:-100px;background:linear-gradient(180deg,#c49060,#a07040)}
    .dune3{width:300px;height:90px;left:30%;background:linear-gradient(180deg,#e0b88a,#c49a6a)}

    /* Road */
    .road{position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:200px;height:100%;z-index:4;background:linear-gradient(180deg,#2a2a2a 0%,#1a1a1a 100%);clip-path:polygon(30% 0%,70% 0%,100% 100%,0% 100%)}
    .road-line{position:absolute;left:50%;transform:translateX(-50%);width:6px;background:#ffd700;animation:roadMove 0.5s linear infinite}
    .road-line:nth-child(1){height:40px;bottom:10%;opacity:.9}
    .road-line:nth-child(2){height:40px;bottom:35%;opacity:.7}
    .road-line:nth-child(3){height:40px;bottom:60%;opacity:.5}
    .road-line:nth-child(4){height:40px;bottom:80%;opacity:.3}
    @keyframes roadMove{0%{transform:translateX(-50%) scaleY(1)}100%{transform:translateX(-50%) scaleY(1.05)}}

    /* Cacti */
    .cactus{position:absolute;bottom:38%;z-index:5}
    .cactus svg{animation:sway 3s ease-in-out infinite}
    @keyframes sway{0%,100%{transform:rotate(-1deg)}50%{transform:rotate(1deg)}}

    /* Car */
    .car-wrap{position:absolute;bottom:calc(38% - 2px);left:50%;transform:translateX(-50%);z-index:10;animation:carBounce 0.3s ease-in-out infinite}
    @keyframes carBounce{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(-2px)}}

    /* Dust particles */
    .dust{position:absolute;border-radius:50%;background:rgba(196,145,90,0.4);animation:dustFloat linear infinite}
    @keyframes dustFloat{0%{transform:translateX(0) translateY(0) scale(1);opacity:.6}100%{transform:translateX(-80px) translateY(-40px) scale(0);opacity:0}}

    /* Heat shimmer */
    .shimmer{position:absolute;bottom:36%;left:0;right:0;height:20px;z-index:6;background:linear-gradient(90deg,transparent,rgba(255,200,100,0.1),transparent,rgba(255,200,100,0.08),transparent);animation:shimmerMove 2s linear infinite}
    @keyframes shimmerMove{0%{transform:translateX(-100%)}100%{transform:translateX(100%)} }

    /* Hero content */
    .hero-content{position:relative;z-index:20;max-width:780px;padding:20px}
    .hero-badge{display:inline-flex;align-items:center;gap:8px;margin-bottom:24px;padding:7px 16px;border-radius:50px;border:1px solid rgba(124,92,252,0.4);background:rgba(124,92,252,0.12);font-size:12px;color:#c4b5fd;animation:fadeUp .6s ease both}
    .hero-title{font-size:clamp(40px,7vw,88px);font-weight:800;line-height:1;margin-bottom:8px;animation:fadeUp .6s .1s ease both;text-shadow:0 2px 20px rgba(0,0,0,0.8)}
    .hero-grad{background:linear-gradient(135deg,#fff9c4,#ffd700,#ff8c00,#e879f9);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
    .hero-sub{font-size:clamp(18px,3vw,28px);font-weight:300;color:rgba(255,255,255,0.7);margin-bottom:20px;animation:fadeUp .6s .2s ease both;text-shadow:0 1px 10px rgba(0,0,0,0.8)}
    .hero-desc{font-size:15px;color:rgba(255,255,255,0.6);max-width:500px;margin:0 auto 32px;line-height:1.7;animation:fadeUp .6s .3s ease both;text-shadow:0 1px 6px rgba(0,0,0,0.8)}
    .hero-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;animation:fadeUp .6s .4s ease both}
    .btn-lg{padding:13px 30px;font-size:15px;border-radius:13px}
    .hero-stats{display:flex;gap:32px;margin-top:48px;animation:fadeUp .6s .5s ease both}
    .stat{text-align:center}
    .stat-n{font-size:26px;font-weight:800;background:linear-gradient(135deg,#ffd700,#e879f9);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
    .stat-l{font-size:11px;color:rgba(255,255,255,0.5);margin-top:3px}

    /* Upload hints */
    .hero-hints{position:absolute;bottom:24px;left:50%;transform:translateX(-50%);display:flex;gap:10px;z-index:20;animation:fadeUp .6s .6s ease both}
    .hint-btn{display:flex;align-items:center;gap:7px;padding:9px 16px;border-radius:11px;border:1px dashed rgba(255,200,100,0.4);background:rgba(0,0,0,0.4);color:rgba(255,220,100,0.9);font-size:12px;cursor:pointer;transition:all .2s;font-family:var(--font);backdrop-filter:blur(8px)}
    .hint-btn:hover{background:rgba(0,0,0,0.6);border-color:rgba(255,200,100,0.7)}

    /* Features */
    .feats{display:flex;gap:14px;padding:20px 20px 40px;max-width:1100px;margin:0 auto;flex-wrap:wrap}
    .feat{flex:1;min-width:190px;padding:22px;border-radius:var(--r);background:var(--s1);border:1px solid var(--b1);transition:all .3s}
    .feat:hover{border-color:var(--ac);transform:translateY(-4px);box-shadow:var(--glow)}
    .feat-icon{font-size:28px;margin-bottom:10px}
    .feat-title{font-size:14px;font-weight:600;margin-bottom:6px}
    .feat-desc{font-size:12px;color:var(--mut);line-height:1.6}

    /* Page */
    .page{max-width:880px;margin:0 auto;padding:36px 20px}
    .page-title{font-size:26px;font-weight:700;margin-bottom:6px}
    .page-sub{font-size:13px;color:var(--mut);margin-bottom:28px}

    /* Chat */
    .chat-wrap{display:flex;flex-direction:column;height:calc(100vh - 180px)}
    .chat-msgs{flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:14px;padding:14px;background:var(--s1);border-radius:var(--r) var(--r) 0 0;border:1px solid var(--b1);border-bottom:none}
    .chat-msgs::-webkit-scrollbar{width:3px}
    .chat-msgs::-webkit-scrollbar-thumb{background:var(--b2);border-radius:3px}
    .msg{display:flex;gap:10px;max-width:80%}
    .msg.user{align-self:flex-end;flex-direction:row-reverse}
    .msg-av{width:32px;height:32px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:14px}
    .msg.assistant .msg-av{background:linear-gradient(135deg,var(--ac),var(--ac2))}
    .msg.user .msg-av{background:var(--s2);border:1px solid var(--b2)}
    .msg-bub{padding:10px 14px;border-radius:13px;font-size:13px;line-height:1.7}
    .msg.assistant .msg-bub{background:var(--s2);border:1px solid var(--b1);border-radius:4px 13px 13px 13px}
    .msg.user .msg-bub{background:linear-gradient(135deg,var(--ac),var(--ac2));color:#fff;border-radius:13px 4px 13px 13px}
    .dots{display:flex;gap:4px;align-items:center;padding:12px 14px}
    .dot{width:5px;height:5px;border-radius:50%;background:var(--ac);animation:bounce 1s infinite}
    .dot:nth-child(2){animation-delay:.15s}.dot:nth-child(3){animation-delay:.3s}
    .chat-in{display:flex;gap:8px;padding:12px;background:var(--s2);border:1px solid var(--b1);border-radius:0 0 var(--r) var(--r)}
    .chat-ta{flex:1;background:rgba(255,255,255,0.04);border:1px solid var(--b1);border-radius:9px;padding:9px 12px;color:var(--txt);font-family:var(--font);font-size:13px;resize:none;outline:none;transition:border-color .2s;min-height:40px;max-height:110px}
    .chat-ta:focus{border-color:var(--ac)}

    /* Gen box */
    .gen{background:var(--s1);border:1px solid var(--b1);border-radius:var(--r);padding:24px;margin-bottom:20px}
    .gen-lbl{font-size:11px;font-weight:600;color:var(--mut);margin-bottom:7px;text-transform:uppercase;letter-spacing:.05em}
    .gen-ta{width:100%;min-height:90px;background:rgba(255,255,255,0.04);border:1px solid var(--b1);border-radius:9px;padding:12px;color:var(--txt);font-family:var(--font);font-size:13px;resize:vertical;outline:none;transition:border-color .2s;line-height:1.6}
    .gen-ta:focus{border-color:var(--ac)}
    .pills{display:flex;gap:7px;flex-wrap:wrap;margin-top:7px}
    .pill{padding:5px 12px;border-radius:18px;border:1px solid var(--b2);background:none;color:var(--mut);cursor:pointer;font-size:12px;font-family:var(--font);transition:all .2s}
    .pill.on{background:rgba(124,92,252,0.2);border-color:var(--ac);color:#a78bfa}
    .gen-foot{display:flex;align-items:center;justify-content:space-between;margin-top:18px}
    .cost-lbl{font-size:12px;color:var(--mut)}
    .res-box{background:var(--s1);border:1px solid var(--b1);border-radius:var(--r);overflow:hidden}
    .res-img{width:100%;display:block;aspect-ratio:3/2;object-fit:cover}
    .res-foot{padding:12px 16px;display:flex;align-items:center;justify-content:space-between}
    .res-prompt{font-size:11px;color:var(--mut);flex:1}
    .vid-ph{aspect-ratio:16/9;background:linear-gradient(135deg,#0d0d20,#1a0d30);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;position:relative;overflow:hidden}
    .vid-glow{position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(124,92,252,0.1),transparent 70%);animation:pulse 2s infinite}

    /* Upload zone */
    .upload-z{border:2px dashed rgba(124,92,252,0.3);border-radius:11px;padding:18px;text-align:center;cursor:pointer;transition:all .2s;margin-bottom:14px}
    .upload-z:hover{border-color:var(--ac);background:rgba(124,92,252,0.05)}

    /* Video mode tabs */
    .vmodes{display:flex;gap:7px;margin-bottom:20px;flex-wrap:wrap}
    .vmode{display:flex;align-items:center;gap:7px;padding:9px 15px;border-radius:11px;border:1px solid var(--b2);background:var(--s1);color:var(--mut);cursor:pointer;font-size:12px;font-family:var(--font);transition:all .2s}
    .vmode:hover{border-color:var(--ac);color:var(--txt)}
    .vmode.on{background:rgba(124,92,252,0.15);border-color:var(--ac);color:#a78bfa}
    .vcost{font-size:10px;padding:2px 6px;border-radius:8px;background:rgba(124,92,252,0.2);color:#a78bfa}
    .vopts{display:flex;gap:14px;flex-wrap:wrap;margin-top:14px}
    .vopt{flex:1;min-width:110px}

    /* Gallery */
    .gal-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px}
    .gal-item{position:relative;border-radius:var(--r);overflow:hidden;border:1px solid var(--b1);cursor:pointer}
    .gal-item img{width:100%;aspect-ratio:4/3;object-fit:cover;display:block;transition:transform .3s}
    .gal-item:hover img{transform:scale(1.05)}
    .gal-over{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,0.8),transparent);opacity:0;transition:opacity .3s;display:flex;flex-direction:column;justify-content:flex-end;padding:12px}
    .gal-item:hover .gal-over{opacity:1}
    .gal-badge{position:absolute;top:8px;right:8px;padding:3px 7px;border-radius:5px;font-size:10px;font-weight:600}
    .b-img{background:rgba(124,92,252,0.8)}.b-vid{background:rgba(239,68,68,0.8)}
    .btn-del{padding:4px 10px;border-radius:5px;border:1px solid rgba(255,255,255,0.2);background:rgba(0,0,0,0.5);color:#fff;cursor:pointer;font-size:11px;font-family:var(--font);margin-top:6px}
    .empty{text-align:center;padding:60px 20px;color:var(--mut)}

    /* Pricing */
    .price-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:18px;margin-top:36px}
    .plan{background:var(--s1);border:1px solid var(--b1);border-radius:var(--r);padding:28px;position:relative;transition:all .3s}
    .plan:hover{transform:translateY(-5px);box-shadow:var(--glow)}
    .plan.hot{border-color:var(--ac);background:rgba(124,92,252,0.05)}
    .hot-badge{position:absolute;top:-11px;left:50%;transform:translateX(-50%);padding:4px 14px;border-radius:18px;font-size:10px;font-weight:700;background:linear-gradient(135deg,var(--ac),var(--ac2));color:#fff;white-space:nowrap}
    .plan-name{font-size:17px;font-weight:700;margin-bottom:7px}
    .plan-price{font-size:34px;font-weight:800;margin-bottom:4px}
    .plan-price span{font-size:13px;font-weight:400;color:var(--mut)}
    .plan-creds{font-size:12px;color:var(--ac);margin-bottom:20px;font-weight:600}
    .plan-feats{list-style:none;margin-bottom:24px;display:flex;flex-direction:column;gap:8px}
    .plan-feats li{font-size:12px;color:var(--mut);display:flex;align-items:center;gap:7px}
    .plan-feats li::before{content:'✓';color:var(--ok);font-weight:700;flex-shrink:0}
    .plan-cta{width:100%;padding:11px;border-radius:11px;font-family:var(--font);font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;border:none}
    .plan-cta.pr{background:linear-gradient(135deg,var(--ac),var(--ac2));color:#fff}
    .plan-cta.se{background:var(--s2);color:var(--txt);border:1px solid var(--b2)}
    .plan-cta:hover{transform:translateY(-2px)}

    /* Login */
    .login-pg{min-height:calc(100vh - 60px);display:flex;align-items:center;justify-content:center;padding:36px 20px}
    .login-card{width:100%;max-width:420px;background:var(--s1);border:1px solid var(--b1);border-radius:20px;padding:36px}
    .login-logo{text-align:center;margin-bottom:24px}
    .login-ico{width:52px;height:52px;border-radius:14px;background:linear-gradient(135deg,var(--ac),var(--ac2));display:flex;align-items:center;justify-content:center;font-size:26px;margin:0 auto 10px;box-shadow:var(--glow)}
    .login-title{font-size:20px;font-weight:700;text-align:center;margin-bottom:5px}
    .login-sub{font-size:12px;color:var(--mut);text-align:center;margin-bottom:24px}
    .in-row{display:flex;gap:10px}
    .in-g{margin-bottom:12px;flex:1}
    .in-lbl{font-size:11px;font-weight:600;color:var(--mut);margin-bottom:5px;display:block;text-transform:uppercase;letter-spacing:.04em}
    .in-f{width:100%;padding:10px 12px;background:rgba(255,255,255,0.04);border:1px solid var(--b1);border-radius:9px;color:var(--txt);font-family:var(--font);font-size:13px;outline:none;transition:border-color .2s}
    .in-f:focus{border-color:var(--ac)}
    .div-or{display:flex;align-items:center;gap:10px;margin:14px 0;color:var(--mut);font-size:11px}
    .div-or::before,.div-or::after{content:'';flex:1;height:1px;background:var(--b1)}
    .btn-demo{width:100%;padding:10px;border-radius:9px;border:1px solid var(--b2);background:rgba(255,255,255,0.04);color:var(--txt);font-family:var(--font);font-size:13px;cursor:pointer;transition:all .2s}
    .btn-demo:hover{background:rgba(255,255,255,0.08)}
    .login-sw{text-align:center;margin-top:14px;font-size:12px;color:var(--mut)}
    .login-sw a{color:#a78bfa;cursor:pointer}

    /* Profile */
    .prof-head{display:flex;align-items:center;gap:18px;padding:28px;background:var(--s1);border:1px solid var(--b1);border-radius:var(--r);margin-bottom:20px}
    .prof-av{width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,var(--ac),var(--ac2));display:flex;align-items:center;justify-content:center;font-size:28px;flex-shrink:0;box-shadow:var(--glow)}
    .prof-name{font-size:20px;font-weight:700;margin-bottom:3px}
    .prof-email{font-size:12px;color:var(--mut)}
    .prof-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:20px}
    .ps{background:var(--s1);border:1px solid var(--b1);border-radius:var(--r);padding:18px;text-align:center}
    .ps-n{font-size:22px;font-weight:800;background:linear-gradient(135deg,#a78bfa,#e879f9);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
    .ps-l{font-size:11px;color:var(--mut);margin-top:3px}
    .hist-item{display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--s1);border:1px solid var(--b1);border-radius:9px;margin-bottom:7px}
    .hist-ico{width:28px;height:28px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0}
    .h-chat{background:rgba(124,92,252,0.2)}.h-img{background:rgba(74,222,128,0.2)}.h-vid{background:rgba(248,113,113,0.2)}

    /* Payment */
    .pay-pg{min-height:calc(100vh - 60px);display:flex;align-items:flex-start;justify-content:center;padding:36px 20px}
    .pay-lay{display:grid;grid-template-columns:1fr 320px;gap:20px;max-width:860px;width:100%}
    .pay-card{background:var(--s1);border:1px solid var(--b1);border-radius:20px;padding:28px;animation:fadeUp .5s ease both}
    .pay-title{font-size:20px;font-weight:700;margin-bottom:5px}
    .pay-sub{font-size:12px;color:var(--mut);margin-bottom:24px}
    .btn-youcan{width:100%;padding:13px;border-radius:11px;border:none;cursor:pointer;background:linear-gradient(135deg,#ff6b35,#f7931e);color:#fff;font-family:var(--font);font-size:14px;font-weight:700;transition:all .2s;box-shadow:0 8px 24px rgba(255,107,53,0.3);display:flex;align-items:center;justify-content:center;gap:8px}
    .btn-youcan:hover{transform:translateY(-2px)}
    .btn-youcan:disabled{opacity:.6;cursor:not-allowed;transform:none}
    .pay-sum{background:var(--s1);border:1px solid var(--b1);border-radius:20px;padding:24px;position:sticky;top:76px}
    .sum-plan{font-size:22px;font-weight:800;margin-bottom:5px;background:linear-gradient(135deg,#a78bfa,#e879f9);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
    .sum-rows{display:flex;flex-direction:column;gap:10px;margin:16px 0}
    .sum-row{display:flex;justify-content:space-between;font-size:12px}
    .sum-row .lbl{color:var(--mut)}.sum-row .val{font-weight:600}
    .sum-total{display:flex;justify-content:space-between;align-items:center;margin-top:14px;padding-top:14px;border-top:1px solid var(--b1)}
    .trust{display:flex;flex-direction:column;gap:8px;margin-top:20px;padding-top:16px;border-top:1px solid var(--b1)}
    .trust-item{display:flex;align-items:center;gap:8px;font-size:11px;color:var(--mut)}

    /* Toast */
    .toast{position:fixed;bottom:20px;right:20px;z-index:9999;padding:11px 18px;border-radius:11px;font-size:13px;font-weight:500;animation:slideIn .3s ease;box-shadow:0 8px 32px rgba(0,0,0,0.5);max-width:280px}
    .toast.success{background:rgba(74,222,128,0.15);border:1px solid rgba(74,222,128,0.3);color:var(--ok)}
    .toast.error{background:rgba(248,113,113,0.15);border:1px solid rgba(248,113,113,0.3);color:var(--er)}

    /* Keyframes */
    @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
    @keyframes bounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}
    @keyframes pulse{0%,100%{opacity:.5}50%{opacity:1}}
    @keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}
    @keyframes spin{to{transform:rotate(360deg)}}
    .spin{width:16px;height:16px;border:2px solid rgba(255,255,255,0.2);border-top-color:#fff;border-radius:50%;animation:spin .6s linear infinite;display:inline-block;vertical-align:middle;margin-right:6px}

    @media(max-width:640px){
      .nav-links{display:none}
      .hero-stats{gap:18px}
      .price-grid,.pay-lay{grid-template-columns:1fr}
      .prof-stats{grid-template-columns:1fr 1fr}
      .in-row{flex-direction:column;gap:0}
      .vmodes{gap:5px}
      .vmode{padding:7px 10px;font-size:11px}
    }
  `;

  // ── Desert Hero ──────────────────────────────────────────────────────────────
  const renderHero = () => {
    const starList = Array.from({length:30},(_,i)=>({
      left:`${Math.random()*100}%`, top:`${Math.random()*100}%`,
      size:`${Math.random()*2+1}px`, delay:`${Math.random()*3}s`, dur:`${2+Math.random()*2}s`
    }));
    const dustList = Array.from({length:8},(_,i)=>({
      right:`${15+i*8}%`, bottom:`${39+Math.random()*3}%`,
      size:`${4+Math.random()*8}px`, delay:`${i*0.3}s`, dur:`${1.5+Math.random()}s`
    }));
    return (
      <div className="hero">
        {/* Sky */}
        <div className="sky" />
        {/* Stars */}
        <div className="stars">
          {starList.map((s,i)=>(
            <div key={i} className="star" style={{left:s.left,top:s.top,width:s.size,height:s.size,animationDelay:s.delay,animationDuration:s.dur}} />
          ))}
        </div>
        {/* Sun */}
        <div className="sun" />
        {/* Ground */}
        <div className="ground">
          <div className="ground-main" />
          <div className="dune dune1" />
          <div className="dune dune2" />
          <div className="dune dune3" />
        </div>
        {/* Road */}
        <div className="road">
          <div className="road-line" /><div className="road-line" /><div className="road-line" /><div className="road-line" />
        </div>
        {/* Cacti */}
        <div className="cactus" style={{left:'12%'}}>
          <svg width="40" height="70" viewBox="0 0 40 70" fill="none">
            <rect x="16" y="20" width="8" height="50" fill="#2d5a27" rx="4"/>
            <rect x="4" y="35" width="12" height="6" fill="#2d5a27" rx="3"/>
            <rect x="4" y="30" width="6" height="16" fill="#2d5a27" rx="3"/>
            <rect x="24" y="40" width="12" height="6" fill="#2d5a27" rx="3"/>
            <rect x="30" y="35" width="6" height="16" fill="#2d5a27" rx="3"/>
          </svg>
        </div>
        <div className="cactus" style={{right:'10%'}}>
          <svg width="30" height="55" viewBox="0 0 30 55" fill="none">
            <rect x="12" y="15" width="6" height="40" fill="#2d5a27" rx="3"/>
            <rect x="2" y="28" width="10" height="5" fill="#2d5a27" rx="2.5"/>
            <rect x="2" y="24" width="5" height="14" fill="#2d5a27" rx="2.5"/>
            <rect x="18" y="32" width="10" height="5" fill="#2d5a27" rx="2.5"/>
            <rect x="23" y="28" width="5" height="14" fill="#2d5a27" rx="2.5"/>
          </svg>
        </div>
        {/* Car — red convertible */}
        <div className="car-wrap">
          <svg width="120" height="52" viewBox="0 0 120 52" fill="none">
            {/* Body */}
            <path d="M8 38 Q8 28 18 28 L38 20 Q50 14 72 14 Q88 14 96 22 L108 28 Q116 30 116 38 Z" fill="#cc2200"/>
            <path d="M8 38 Q8 28 18 28 L38 20 Q50 14 72 14 Q88 14 96 22 L108 28 Q116 30 116 38 Z" fill="url(#carShine)"/>
            {/* Windshield area (open top) */}
            <path d="M42 20 L60 15 L88 16 L96 22 L72 14 Q58 13 42 20Z" fill="#1a1a2e" opacity="0.6"/>
            {/* Bottom */}
            <rect x="10" y="36" width="100" height="10" rx="4" fill="#aa1800"/>
            {/* Wheels */}
            <circle cx="32" cy="44" r="10" fill="#1a1a1a"/><circle cx="32" cy="44" r="6" fill="#333"/><circle cx="32" cy="44" r="3" fill="#555"/>
            <circle cx="88" cy="44" r="10" fill="#1a1a1a"/><circle cx="88" cy="44" r="6" fill="#333"/><circle cx="88" cy="44" r="3" fill="#555"/>
            {/* Headlights */}
            <ellipse cx="112" cy="33" rx="5" ry="3" fill="#fffde7" opacity="0.9"/>
            <ellipse cx="112" cy="33" rx="3" ry="2" fill="#fff"/>
            {/* Driver silhouette */}
            <ellipse cx="58" cy="20" rx="8" ry="9" fill="#2a1a0a"/>
            <ellipse cx="58" cy="14" rx="6" ry="6" fill="#3d2b1a"/>
            {/* Shine */}
            <defs>
              <linearGradient id="carShine" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,0.25)"/>
                <stop offset="100%" stopColor="rgba(0,0,0,0)"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        {/* Dust particles */}
        {dustList.map((d,i)=>(
          <div key={i} className="dust" style={{right:d.right,bottom:d.bottom,width:d.size,height:d.size,animationDelay:d.delay,animationDuration:d.dur}} />
        ))}
        {/* Heat shimmer */}
        <div className="shimmer" />
        {/* Content */}
        <div className="hero-content">
          <div className="hero-badge">✨ {lang==="ar"?"مدعوم بأحدث نماذج الذكاء الاصطناعي":lang==="fr"?"Propulsé par les derniers modèles IA":"Powered by the latest AI models"}</div>
          <h1 className="hero-title"><span className="hero-grad">{t.hero.title}</span></h1>
          <p className="hero-sub">{t.hero.sub}</p>
          <p className="hero-desc">{t.hero.desc}</p>
          <div className="hero-btns">
            <button className="btn-p btn-lg" onClick={()=>setPage(user?"chat":"login")}>{t.hero.cta}</button>
            <button className="btn-g btn-lg" onClick={()=>setPage("pricing")}>{t.hero.pricing}</button>
          </div>
          <div className="hero-stats">
            {[["10K+",lang==="ar"?"مستخدم":lang==="fr"?"Utilisateurs":"Users"],
              ["1M+",lang==="ar"?"صورة":lang==="fr"?"Images":"Images"],
              ["99%",lang==="ar"?"رضا":lang==="fr"?"Satisfaction":"Satisfaction"]
            ].map(([n,l])=><div className="stat" key={n}><div className="stat-n">{n}</div><div className="stat-l">{l}</div></div>)}
          </div>
        </div>
        {/* Upload hints */}
        <div className="hero-hints">
          <button className="hint-btn" onClick={()=>setPage(user?"images":"login")}>🖼️ {lang==="ar"?"أضف صورة":lang==="fr"?"Ajouter image":"Add Image"}</button>
          <button className="hint-btn" onClick={()=>setPage(user?"video":"login")}>🎬 {lang==="ar"?"أضف فيديو":lang==="fr"?"Ajouter vidéo":"Add Video"}</button>
        </div>
        {/* Features */}
        <div className="feats" style={{marginTop:100}}>
          {[["🗣️",t.nav.chat,lang==="ar"?"محادثات Claude AI الذكية":lang==="fr"?"Chat intelligent Claude AI":"Smart Claude AI conversations"],
            ["🎨",t.nav.images,lang==="ar"?"صور احترافية بالذكاء الاصطناعي":lang==="fr"?"Images IA professionnelles":"Professional AI images"],
            ["🎬",t.nav.video,lang==="ar"?"4 أوضاع لتوليد الفيديو":lang==="fr"?"4 modes de génération vidéo":"4 video generation modes"],
            ["💎",lang==="ar"?"رصيد مرن":lang==="fr"?"Crédits flexibles":"Flexible Credits",lang==="ar"?"ابدأ مجاناً بـ 50 رصيد":lang==="fr"?"Commencez avec 50 crédits":"Start free with 50 credits"],
          ].map(([icon,title,desc])=>(
            <div className="feat" key={title}><div className="feat-icon">{icon}</div><div className="feat-title">{title}</div><div className="feat-desc">{desc}</div></div>
          ))}
        </div>
      </div>
    );
  };

  // ── Chat ────────────────────────────────────────────────────────────────────
  const renderChat = () => (
    <div className="page">
      <h1 className="page-title">💬 {t.chat.title}</h1>
      <div className="chat-wrap">
        <div className="chat-msgs">
          {msgs.map((m,i)=>(
            <div key={i} className={`msg ${m.role}`}>
              <div className="msg-av">{m.role==="assistant"?"🤖":"👤"}</div>
              <div className="msg-bub" style={{whiteSpace:"pre-wrap"}}>{m.content}</div>
            </div>
          ))}
          {chatLoad&&<div className="msg assistant"><div className="msg-av">🤖</div><div className="msg-bub dots"><div className="dot"/><div className="dot"/><div className="dot"/></div></div>}
          <div ref={chatEnd}/>
        </div>
        <div className="chat-in">
          <textarea className="chat-ta" placeholder={t.chat.ph} value={chatIn} onChange={e=>setChatIn(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendChat()}}} rows={1}/>
          <button className="btn-p" onClick={sendChat} disabled={chatLoad||!chatIn.trim()}>{chatLoad?<span className="spin"/>:null}{t.chat.send}</button>
          <button className="btn-g" onClick={()=>setMsgs([{role:"assistant",content:t.chat.welcome}])}>{t.chat.clear}</button>
        </div>
      </div>
    </div>
  );

  // ── Images ──────────────────────────────────────────────────────────────────
  const renderImages = () => (
    <div className="page">
      <h1 className="page-title">🎨 {t.image.title}</h1>
      <p className="page-sub">💰 {t.image.cost} | {t.credits}: {credits}</p>
      <div className="gen">
        <div className="gen-lbl">{lang==="ar"?"وصف الصورة":lang==="fr"?"Description":"Prompt"}</div>
        <textarea className="gen-ta" placeholder={t.image.ph} value={imgPrompt} onChange={e=>setImgPrompt(e.target.value)}/>
        <div style={{marginTop:14}}>
          <div className="gen-lbl">{t.image.style}</div>
          <div className="pills">{Object.entries(t.image.styles).map(([k,v])=>(
            <button key={k} className={`pill ${imgStyle===k?"on":""}`} onClick={()=>setImgStyle(k)}>{v}</button>
          ))}</div>
        </div>
        <div className="upload-z" onClick={()=>{}}>
          <div style={{fontSize:22,marginBottom:5}}>🖼️</div>
          <div style={{fontSize:12,color:"var(--mut)"}}>{t.image.upload}</div>
        </div>
        <div className="gen-foot">
          <span className="cost-lbl">💰 {t.image.cost} | {t.credits}: {credits}</span>
          <button className="btn-p" onClick={genImage} disabled={imgLoad||!imgPrompt.trim()}>
            {imgLoad?<><span className="spin"/>{t.image.loading}</>:t.image.gen}
          </button>
        </div>
      </div>
      {imgResult&&<div className="res-box">
        <img src={imgResult} alt="result" className="res-img"/>
        <div className="res-foot">
          <span className="res-prompt">✨ {imgPrompt}</span>
          <button className="btn-g" style={{fontSize:11}} onClick={()=>{navigator.clipboard.writeText(imgPrompt);toast_(t.copied)}}>
            {lang==="ar"?"نسخ":lang==="fr"?"Copier":"Copy"}
          </button>
        </div>
      </div>}
    </div>
  );

  // ── Video ───────────────────────────────────────────────────────────────────
  const renderVideo = () => {
    const modeCosts = {text2video:50,img2video:60,effects:40,lipsync:70};
    return (
      <div className="page">
        <h1 className="page-title">🎬 {t.video.title}</h1>
        <div className="vmodes">
          {Object.entries(t.video.modes).map(([k,v])=>(
            <button key={k} className={`vmode ${vidMode===k?"on":""}`} onClick={()=>{setVidMode(k);setVidPrompt("")}}>
              <span>{v}</span><span className="vcost">{modeCosts[k]}</span>
            </button>
          ))}
        </div>
        <div className="gen">
          {(vidMode==="img2video")&&<div className="upload-z"><div style={{fontSize:22,marginBottom:5}}>🖼️</div><div style={{fontSize:12,color:"var(--mut)"}}>{t.video.uploadImg}</div></div>}
          {(vidMode==="effects")&&<div className="upload-z"><div style={{fontSize:22,marginBottom:5}}>🎬</div><div style={{fontSize:12,color:"var(--mut)"}}>{t.video.uploadVid}</div></div>}
          <div className="gen-lbl">{lang==="ar"?"وصف الفيديو":lang==="fr"?"Description":"Prompt"}</div>
          <textarea className="gen-ta" placeholder={t.video.phs[vidMode]} value={vidPrompt} onChange={e=>setVidPrompt(e.target.value)}/>
          <div className="vopts">
            <div className="vopt"><div className="gen-lbl">{t.video.dur}</div><div className="pills">{["5","10","15"].map(d=><button key={d} className={`pill ${vidDur===d?"on":""}`} onClick={()=>setVidDur(d)}>{d}s</button>)}</div></div>
            <div className="vopt"><div className="gen-lbl">{t.video.ratio}</div><div className="pills">{["16:9","9:16","1:1"].map(a=><button key={a} className={`pill ${vidAspect===a?"on":""}`} onClick={()=>setVidAspect(a)}>{a}</button>)}</div></div>
            <div className="vopt"><div className="gen-lbl">{t.video.res}</div><div className="pills">{["480p","720p","1080p"].map(r=><button key={r} className={`pill ${vidRes===r?"on":""}`} onClick={()=>setVidRes(r)}>{r}</button>)}</div></div>
          </div>
          <div className="gen-foot">
            <span className="cost-lbl">💰 {modeCosts[vidMode]} {lang==="ar"?"رصيد":"credits"} | {t.credits}: {credits}</span>
            <button className="btn-p" onClick={genVideo} disabled={vidLoad||!vidPrompt.trim()}>
              {vidLoad?<><span className="spin"/>{t.video.loading}</>:t.video.gen}
            </button>
          </div>
        </div>
        {vidResult&&<div className="res-box">
          <div className="vid-ph"><div className="vid-glow"/><div style={{fontSize:44,zIndex:1}}>▶️</div><div style={{fontSize:13,color:"var(--mut)",zIndex:1,textAlign:"center",padding:"0 16px"}}>{lang==="ar"?"تم التوليد!":lang==="fr"?"Vidéo générée!":"Generated!"}</div><div style={{fontSize:10,color:"rgba(255,255,255,0.3)",zIndex:1}}>{vidAspect} · {vidRes} · {vidDur}s</div></div>
          <div className="res-foot"><span className="res-prompt">🎬 {vidResult.prompt}</span><span style={{fontSize:10,color:"var(--mut)"}}>{t.video.modes[vidResult.mode]}</span></div>
        </div>}
      </div>
    );
  };

  // ── Gallery ─────────────────────────────────────────────────────────────────
  const renderGallery = () => (
    <div className="page">
      <h1 className="page-title">🖼️ {t.gallery.title}</h1>
      {gallery.length===0?<div className="empty"><div style={{fontSize:44,marginBottom:14}}>🎨</div><p>{t.gallery.empty}</p></div>:(
        <div className="gal-grid">
          {gallery.map(item=>(
            <div key={item.id} className="gal-item">
              <img src={item.url} alt={item.prompt}/>
              <div className={`gal-badge ${item.type==="image"?"b-img":"b-vid"}`}>{item.type==="image"?"🖼":"🎬"}</div>
              <div className="gal-over">
                <div style={{fontSize:11,color:"#fff",marginBottom:6}}>{item.prompt}</div>
                <button className="btn-del" onClick={()=>setGallery(g=>g.filter(x=>x.id!==item.id))}>{t.gallery.del}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ── Pricing ─────────────────────────────────────────────────────────────────
  const renderPricing = () => (
    <div className="page" style={{maxWidth:960}}>
      <h1 className="page-title" style={{textAlign:"center"}}>💎 {t.pricing.title}</h1>
      <p className="page-sub" style={{textAlign:"center"}}>{t.pricing.sub}</p>
      <div className="price-grid">
        {t.pricing.plans.map(plan=>(
          <div key={plan.id} className={`plan ${plan.hot?"hot":""}`}>
            {plan.hot&&<div className="hot-badge">⭐ {lang==="ar"?"الأكثر شعبية":lang==="fr"?"Populaire":"Most Popular"}</div>}
            <div className="plan-name">{plan.name}</div>
            <div className="plan-price">{plan.price}<span> {plan.cur}</span></div>
            <div className="plan-creds">💰 {plan.credits} {t.credits}</div>
            <ul className="plan-feats">{plan.feats.map(f=><li key={f}>{f}</li>)}</ul>
            <button className={`plan-cta ${plan.hot?"pr":"se"}`} onClick={()=>openPayment(plan)}>{plan.cta}</button>
          </div>
        ))}
      </div>
    </div>
  );

  // ── Login ───────────────────────────────────────────────────────────────────
  const renderLogin = () => (
    <div className="login-pg">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-ico">✨</div>
          <div className="login-title">{loginMode==="login"?t.login.title:t.login.reg}</div>
          <div className="login-sub">{t.login.sub}</div>
        </div>
        {loginMode==="register"&&<>
          <div className="in-row">
            <div className="in-g"><label className="in-lbl">{t.login.fname}</label><input className="in-f" placeholder={t.login.fname} value={lFirst} onChange={e=>setLFirst(e.target.value)}/></div>
            <div className="in-g"><label className="in-lbl">{t.login.lname}</label><input className="in-f" placeholder={t.login.lname} value={lLast} onChange={e=>setLLast(e.target.value)}/></div>
          </div>
          <div className="in-g"><label className="in-lbl">{t.login.phone}</label><input className="in-f" type="tel" placeholder="+212 6XX XXX XXX" value={lPhone} onChange={e=>setLPhone(e.target.value)}/></div>
        </>}
        <div className="in-g"><label className="in-lbl">{t.login.email}</label><input className="in-f" type="email" placeholder="example@email.com" value={lEmail} onChange={e=>setLEmail(e.target.value)}/></div>
        <div className="in-g"><label className="in-lbl">{t.login.pass}</label><input className="in-f" type="password" placeholder="••••••••" value={lPass} onChange={e=>setLPass(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")loginMode==="login"?handleLogin():handleRegister()}}/></div>
        <button className="btn-p" style={{width:"100%",padding:11,marginTop:4}} onClick={loginMode==="login"?handleLogin:handleRegister} disabled={lLoad}>
          {lLoad?<span className="spin"/>:null}{loginMode==="login"?t.login.btn:t.login.reg}
        </button>
        <div className="div-or">{lang==="ar"?"أو":"ou"}</div>
        <button className="btn-demo" onClick={handleDemo}>{t.login.demo}</button>
        <div className="login-sw">{loginMode==="login"?t.login.noAcc:t.login.hasAcc}{" "}<a onClick={()=>setLoginMode(loginMode==="login"?"register":"login")}>{loginMode==="login"?t.login.reg:t.login.btn}</a></div>
      </div>
    </div>
  );

  // ── Profile ─────────────────────────────────────────────────────────────────
  const renderProfile = () => (
    <div className="page">
      <h1 className="page-title">👤 {t.profile.title}</h1>
      <div className="prof-head">
        <div className="prof-av">👤</div>
        <div style={{flex:1}}>
          {editName?(
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <input className="in-f" style={{width:180}} value={newName} onChange={e=>setNewName(e.target.value)} placeholder={user?.name}/>
              <button className="btn-p" style={{padding:"7px 14px",fontSize:12}} onClick={()=>{setUser(u=>({...u,name:newName||u.name}));setEditName(false);toast_(lang==="ar"?"تم الحفظ":"Saved")}}>{t.profile.save}</button>
              <button className="btn-g" style={{padding:"7px 12px",fontSize:12}} onClick={()=>setEditName(false)}>✕</button>
            </div>
          ):(
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div className="prof-name">{user?.name}</div>
              <button className="btn-g" style={{padding:"3px 9px",fontSize:11}} onClick={()=>{setNewName(user?.name||"");setEditName(true)}}>✏️</button>
            </div>
          )}
          <div className="prof-email">{user?.email}</div>
          <div style={{fontSize:11,color:"var(--mut)",marginTop:3}}>{t.profile.plan}: {lang==="ar"?"المجاني":"Free"}</div>
        </div>
      </div>
      <div className="prof-stats">
        <div className="ps"><div className="ps-n">{credits}</div><div className="ps-l">{t.profile.creds}</div></div>
        <div className="ps"><div className="ps-n">{gallery.length}</div><div className="ps-l">{t.profile.works}</div></div>
        <div className="ps"><div className="ps-n">{history.length}</div><div className="ps-l">{lang==="ar"?"طلبات":"Requests"}</div></div>
      </div>
      <h2 style={{fontSize:15,fontWeight:700,marginBottom:14}}>📋 {t.profile.history}</h2>
      {history.length===0?<div style={{textAlign:"center",padding:32,color:"var(--mut)"}}>{t.profile.noHistory}</div>:(
        history.map(h=>(
          <div key={h.id} className="hist-item">
            <div className={`hist-ico ${h.type==="chat"?"h-chat":h.type==="image"?"h-img":"h-vid"}`}>{h.type==="chat"?"💬":h.type==="image"?"🎨":"🎬"}</div>
            <div style={{flex:1,fontSize:12}}>{h.prompt}</div>
            <div style={{fontSize:10,color:"var(--mut)"}}>{h.date}</div>
          </div>
        ))
      )}
    </div>
  );

  // ── Payment ─────────────────────────────────────────────────────────────────
  const renderPayment = () => (
    <div className="pay-pg">
      <div className="pay-lay">
        <div className="pay-card">
          <button className="btn-g" style={{marginBottom:18,fontSize:12}} onClick={()=>setPage("pricing")}>← {t.pay.back}</button>
          <div className="pay-title">{t.pay.title}</div>
          <div className="pay-sub">{lang==="ar"?"أنت على بُعد خطوة واحدة":lang==="fr"?"Un pas vers la créativité":"One step away from creativity"}</div>
          <div style={{padding:20,background:"rgba(255,107,53,0.05)",borderRadius:14,border:"1px solid rgba(255,107,53,0.2)",marginBottom:14}}>
            <div style={{fontSize:16,fontWeight:700,marginBottom:7}}>🔒 YouCan Pay</div>
            <div style={{fontSize:12,color:"var(--mut)",lineHeight:1.7,marginBottom:18}}>
              {lang==="ar"?"سيتم تحويلك إلى بوابة الدفع الآمنة":lang==="fr"?"Vous serez redirigé vers la passerelle sécurisée":"You will be redirected to the secure payment gateway"}
            </div>
            <button className="btn-youcan" onClick={handlePay} disabled={payLoad}>
              {payLoad?<span className="spin"/>:null}{t.pay.btn} 🚀
            </button>
          </div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:5,marginTop:12,fontSize:11,color:"var(--mut)"}}>🔒 {t.pay.secure}</div>
        </div>
        <div className="pay-sum">
          <div style={{fontSize:12,fontWeight:700,color:"var(--mut)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:14}}>{t.pay.summary}</div>
          {selPlan&&<>
            <div className="sum-plan">{selPlan.name}</div>
            <div className="sum-rows">
              <div className="sum-row"><span className="lbl">{t.pay.plan}</span><span className="val">{selPlan.name}</span></div>
              <div className="sum-row"><span className="lbl">{t.pay.creds}</span><span className="val">{selPlan.credits}</span></div>
            </div>
            <div className="sum-total"><span style={{fontSize:13,fontWeight:600}}>{t.pay.total}</span><span style={{fontSize:24,fontWeight:800,color:"var(--gold)"}}>{selPlan.price} <span style={{fontSize:12,fontWeight:400,color:"var(--mut)"}}>{t.pay.cur}</span></span></div>
          </>}
          <div className="trust">
            {[[t.pay.guarantee,"✅"],[t.pay.support,"🎧"],["SSL","🔐"]].map(([l,i])=>(
              <div key={l} className="trust-item"><span style={{fontSize:14}}>{i}</span>{l}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ── Main ─────────────────────────────────────────────────────────────────────
  const pages = { home:renderHero, chat:renderChat, images:renderImages, video:renderVideo, gallery:renderGallery, pricing:renderPricing, payment:renderPayment, login:renderLogin, profile:renderProfile };

  return (
    <div className="app" dir={t.dir}>
      <style>{css}</style>
      <nav className="nav">
        <div className="nav-logo" onClick={()=>setPage("home")}>
          <div className="nav-logo-icon">✨</div>
          <div className="nav-logo-txt">{t.name}</div>
        </div>
        <div className="nav-links">
          {(user?["chat","images","video","gallery","pricing","profile"]:["pricing"]).map(p=>(
            <button key={p} className={`nav-link ${page===p?"on":""}`} onClick={()=>setPage(p)}>{t.nav[p]}</button>
          ))}
        </div>
        <div className="nav-r">
          {user&&<div className="creds-badge">💰 {credits}</div>}
          {["ar","fr","en"].map(l=><button key={l} className="lang-btn" onClick={()=>setLang(l)}>{l.toUpperCase()}</button>)}
          {user?<button className="btn-g" onClick={handleLogout}>{t.logout}</button>:<button className="btn-p" onClick={()=>setPage("login")}>{t.login}</button>}
        </div>
      </nav>
      <main className="main">{(pages[page]||renderHero)()}</main>
      {toast&&<div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}