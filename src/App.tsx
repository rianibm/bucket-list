import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronUp,
  Heart,
  MessageSquare,
  Phone,
  RefreshCw,
  Send,
  Shield,
  Smile,
  Sparkles,
  Wind,
  X,
} from "lucide-react";
import {
  emotionalBaselines,
  fetchAiDares,
  fetchAiReflection,
  fetchMentalCoach,
  focusAreas,
  type Answers,
  type CourageLevel,
  type Dare,
  type EmotionalBaseline,
  type EnergyPreference,
  type FocusArea,
  type SettingPreference,
} from "./dare-generator";

const STORAGE_KEY = "little-yes-personalized-v2";
const stepCount = 5;

type ReflectionData = {
  feeling: string;
  reflectionText: string;
  aiFeedback?: {
    validation: string;
    therapeuticInsight: string;
    affirmation: string;
    nextGentleStep?: string;
  };
  createdAt: string;
};

type SavedState = {
  answers: Answers | null;
  dares: Dare[];
  completed: string[];
  reflections: Record<string, ReflectionData>;
};

const emptyAnswers: Answers = {
  focus: [],
  courage: "gentle",
  energy: "some",
  setting: "either",
  intention: "",
  emotionalState: "overwhelmed",
};

const defaultState: SavedState = {
  answers: null,
  dares: [],
  completed: [],
  reflections: {},
};

function isFocusArea(value: unknown): value is FocusArea {
  return typeof value === "string" && focusAreas.some((area) => area.id === value);
}

function readSavedState(): SavedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return defaultState;
    return {
      answers: parsed.answers ?? null,
      dares: Array.isArray(parsed.dares) ? parsed.dares : [],
      completed: Array.isArray(parsed.completed) ? parsed.completed : [],
      reflections: parsed.reflections ?? {},
    };
  } catch {
    return defaultState;
  }
}

function App() {
  const [saved, setSaved] = useState(readSavedState);
  const [answers, setAnswers] = useState<Answers>(() => saved.answers ?? emptyAnswers);
  const [step, setStep] = useState(0);
  const [showQuestions, setShowQuestions] = useState(() => saved.dares.length === 0);
  const [storageError, setStorageError] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedDareId, setExpandedDareId] = useState<string | null>(null);

  // Modals state
  const [activeModal, setActiveModal] = useState<
    "none" | "ruang-teduh" | "breathing" | "crisis" | { type: "reflect"; dare: Dare }
  >("none");

  // Ruang Teduh AI Companion State
  const [coachInput, setCoachInput] = useState("");
  const [coachLoading, setCoachLoading] = useState(false);
  const [coachResponse, setCoachResponse] = useState<any | null>(null);

  // Reflection Modal State
  const [reflectFeeling, setReflectFeeling] = useState("Lega & Tenang");
  const [reflectInput, setReflectInput] = useState("");
  const [reflectLoading, setReflectLoading] = useState(false);

  // Breathing state
  const [breathPhase, setBreathPhase] = useState<"Tarik Napas" | "Tahan" | "Embuskan" | "Jeda">("Tarik Napas");
  const [breathTimer, setBreathTimer] = useState(4);
  const [breathActive, setBreathActive] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [saved]);

  // Breathing circle timer effect
  useEffect(() => {
    if (!breathActive || activeModal !== "breathing") return;
    const interval = setInterval(() => {
      setBreathTimer((prev) => {
        if (prev > 1) return prev - 1;
        setBreathPhase((currPhase) => {
          if (currPhase === "Tarik Napas") return "Tahan";
          if (currPhase === "Tahan") return "Embuskan";
          if (currPhase === "Embuskan") return "Jeda";
          return "Tarik Napas";
        });
        return 4;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [breathActive, activeModal]);

  function toggleFocus(focus: FocusArea) {
    setAnswers((current) => {
      const isSelected = current.focus.includes(focus);
      if (!isSelected && current.focus.length >= 3) return current;
      return {
        ...current,
        focus: isSelected ? current.focus.filter((item) => item !== focus) : [...current.focus, focus],
      };
    });
  }

  async function generateDares() {
    setIsGenerating(true);
    try {
      const { dares } = await fetchAiDares(answers, answers.emotionalState || "overwhelmed");
      setSaved({
        answers,
        dares,
        completed: [],
        reflections: {},
      });
      setShowQuestions(false);
      setStep(0);
      window.setTimeout(() => {
        document.getElementById("my-dares")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      console.error("Error generating dares:", err);
    } finally {
      setIsGenerating(false);
    }
  }

  function toggleCompleted(id: string) {
    setSaved((current) => {
      const isCompleted = current.completed.includes(id);
      return {
        ...current,
        completed: isCompleted
          ? current.completed.filter((completedId) => completedId !== id)
          : [...current.completed, id],
      };
    });
  }

  function startOver() {
    setAnswers(emptyAnswers);
    setStep(0);
    setShowQuestions(true);
    document.getElementById("build-your-list")?.scrollIntoView({ behavior: "smooth" });
  }

  // Handle Coach Chat
  async function handleAskCoach(textToSend?: string) {
    const message = textToSend || coachInput;
    if (!message.trim()) return;
    setCoachLoading(true);
    try {
      const res = await fetchMentalCoach(message);
      setCoachResponse(res);
      setCoachInput("");
    } catch (e) {
      console.error(e);
    } finally {
      setCoachLoading(false);
    }
  }

  function addCoachDareToList(dareIdea: any) {
    if (!dareIdea) return;
    const newDare: Dare = {
      id: `coach-${Date.now()}`,
      title: dareIdea.title,
      note: dareIdea.note || "Direkomendasikan dari Ruang Teduh AI untuk memulihkan pikiranmu.",
      focus: isFocusArea(dareIdea.focus) ? dareIdea.focus : "calm",
      whyHelpMentalHealth: dareIdea.whyHelpMentalHealth,
      microStep: dareIdea.microStep,
      isAiGenerated: true,
    };
    setSaved((prev) => ({
      ...prev,
      dares: [newDare, ...prev.dares],
    }));
    setActiveModal("none");
    document.getElementById("my-dares")?.scrollIntoView({ behavior: "smooth" });
  }

  // Handle Dare Reflection Submission
  async function submitReflection(dare: Dare) {
    if (!reflectInput.trim()) return;
    setReflectLoading(true);
    try {
      const feedback = await fetchAiReflection({
        dareTitle: dare.title,
        dareFocus: dare.focus,
        reflectionText: reflectInput,
        emotionalFeeling: reflectFeeling,
      });

      setSaved((prev) => ({
        ...prev,
        // Automatically mark dare as completed when reflected
        completed: prev.completed.includes(dare.id) ? prev.completed : [...prev.completed, dare.id],
        reflections: {
          ...prev.reflections,
          [dare.id]: {
            feeling: reflectFeeling,
            reflectionText: reflectInput,
            aiFeedback: feedback,
            createdAt: new Date().toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        },
      }));
      setActiveModal("none");
      setReflectInput("");
    } catch (e) {
      console.error(e);
    } finally {
      setReflectLoading(false);
    }
  }

  const stepCanContinue =
    (step === 0 && !!answers.emotionalState) ||
    (step === 1 && answers.focus.length >= 2) ||
    step > 1;

  const progress = saved.dares.length
    ? Math.round((saved.completed.length / saved.dares.length) * 100)
    : 0;

  const selectedFocusNames = saved.answers?.focus
    .map((id) => focusAreas.find((area) => area.id === id)?.label)
    .filter(Boolean);

  return (
    <div className="app-shell">
      {/* Top Bar Navigation */}
      <header className="topbar">
        <a className="brand" href="#home" aria-label="Little Yes home">
          <span className="brand-mark"><Heart size={16} fill="currentColor" /></span>
          <span>little yes <span className="brand-light">· ai mental wellness & courage</span></span>
        </a>
        <nav className="main-nav" aria-label="Navigasi utama">
          <button
            type="button"
            className="nav-btn-text"
            onClick={() => setActiveModal("ruang-teduh")}
          >
            <Sparkles size={14} className="text-amber" /> Ruang Teduh AI
          </button>
          <button
            type="button"
            className="nav-btn-text"
            onClick={() => {
              setActiveModal("breathing");
              setBreathActive(true);
            }}
          >
            <Wind size={14} /> Latihan Napas
          </button>
          <button
            type="button"
            className="nav-btn-text"
            onClick={() => setActiveModal("crisis")}
          >
            <Phone size={13} /> Bantuan Krisis
          </button>
          {saved.dares.length > 0 && <a href="#my-dares">Dare-ku</a>}
          <a className="nav-cta" href="#build-your-list">
            Mulai Sekarang <ArrowUpRight size={15} />
          </a>
        </nav>
      </header>

      <main id="home">
        {/* Hero Section */}
        <section className="hero section-wrap">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="eyebrow-dot" /> AI-POWERED BEHAVIORAL ACTIVATION & MENTAL WELLNESS
            </div>
            <h1>
              Keberanian kecil<br />
              untuk <em>kesehatan mentalmu.</em>
            </h1>
            <p className="hero-lede">
              Saat pikiran penuh cemas, lelah burnout, atau takut dihakimi, perubahan tidak harus berupa lompatan besar.
              Model AI kami meramu tantangan mikro yang aman bagi sistem sarafmu—satu “iya” lembut dalam satu waktu.
            </p>

            <div className="hero-actions">
              <a className="button button-dark" href="#build-your-list">
                Rangkai Dare Mental Health-ku <ArrowRight size={16} />
              </a>
              <button
                type="button"
                className="button button-outline"
                onClick={() => setActiveModal("ruang-teduh")}
              >
                <Sparkles size={15} /> Curhat ke Ruang Teduh AI
              </button>
            </div>

            <div className="hero-note">
              <span className="note-icon"><Heart size={14} /></span>
              <span>Berlandaskan Behavioral Activation (CBT) & Mindful Self-Compassion.</span>
            </div>
          </div>

          <div className="hero-art" aria-label="Ilustrasi jalan setapak menuju matahari terbit">
            <div className="art-sun" />
            <div className="art-label art-label-top">REGULASI SISTEM SARAF<br />LANGKAH LEMBUT AMAN</div>
            <div className="art-hill art-hill-back" />
            <div className="art-hill art-hill-front" />
            <svg className="art-path" viewBox="0 0 600 420" fill="none" aria-hidden="true">
              <path d="M324 440C318 391 237 382 242 338C247 291 352 305 354 256C356 210 274 211 288 164C299 124 364 120 357 75C354 52 340 38 334 24" stroke="#F8F5EC" strokeWidth="35" strokeLinecap="round" />
              <path d="M324 440C318 391 237 382 242 338C247 291 352 305 354 256C356 210 274 211 288 164C299 124 364 120 357 75C354 52 340 38 334 24" stroke="#D2A78A" strokeWidth="1.5" strokeDasharray="4 9" strokeLinecap="round" />
            </svg>
            <div className="art-flower flower-one">✳</div>
            <div className="art-flower flower-two">✿</div>
            <div className="art-flower flower-three">✳</div>
            <div className="art-stamp">
              <span>POWERED BY</span>
              <strong>GEMINI AI<br />WELLNESS<br />GATEWAY</strong>
              <span>CLINICAL CBT</span>
            </div>
            <div className="art-label art-label-bottom">TIDAK HARUS SEMPURNA<br />UNTUK MULAI MERAWAT DIRI</div>
          </div>

          <div className="hero-bottom">
            <span>DIPERSONALISASI OLEH MODEL AI</span>
            <span className="hero-bottom-center">Satu langkah kecil yang aman <span>✳</span></span>
            <span>PEMULIHAN KESEHATAN EMOSIONAL</span>
          </div>
        </section>

        {/* Quick Mental Health Sanctuary Bar */}
        <section className="sanctuary-strip section-wrap">
          <div className="sanctuary-card">
            <div className="sanctuary-text">
              <span className="badge-ai"><Sparkles size={13} /> RUANG TEDUH AI</span>
              <h3>Sedang cemas, overthinking, atau butuh teman bicara detik ini?</h3>
              <p>Bagikan apa yang sedang berkecamuk di kepalamu. AI akan memberikan validasi, sudut pandang CBT, dan 1 aksi mikro penenang.</p>
            </div>
            <button
              type="button"
              className="button button-dark"
              onClick={() => setActiveModal("ruang-teduh")}
            >
              Masuk ke Ruang Teduh <ArrowRight size={15} />
            </button>
          </div>
        </section>

        {/* Onboarding Questionnaire */}
        <section className="onboarding-section" id="build-your-list">
          <div className="onboarding-inner section-wrap">
            {showQuestions ? (
              <div className="quiz-card">
                <div className="quiz-topline">
                  <span className="section-kicker">PERSONALISASI AI MENTAL HEALTH</span>
                  <span className="quiz-step-count">0{step + 1} <i>/</i> 0{stepCount}</span>
                </div>
                <div className="quiz-progress" aria-label={`Pertanyaan ${step + 1} dari ${stepCount}`}>
                  <span style={{ width: `${((step + 1) / stepCount) * 100}%` }} />
                </div>

                {/* Step 0: Emotional Baseline */}
                {step === 0 && (
                  <div className="question-panel">
                    <span className="question-kicker">01 · KONDISI BATINMU SAAT INI</span>
                    <h2>Bagaimana kondisi emosional &amp; energimu <em>saat ini?</em></h2>
                    <p className="question-description">
                      Model AI menyesuaikan ambang batas keberanian agar tidak membebani sistem sarafmu. Pilih yang paling mewakili dirimu.
                    </p>
                    <div className="choice-options">
                      {emotionalBaselines.map((baseline) => (
                        <ChoiceButton<EmotionalBaseline>
                          key={baseline.id}
                          value={baseline.id}
                          selected={answers.emotionalState ?? "overwhelmed"}
                          onSelect={(val) => setAnswers((curr) => ({ ...curr, emotionalState: val }))}
                          title={baseline.label}
                          detail={baseline.detail}
                          icon={
                            baseline.id === "overwhelmed" ? "🌿" :
                            baseline.id === "exhausted" ? "🕯️" :
                            baseline.id === "isolated" ? "🫂" :
                            baseline.id === "self_critical" ? "🌱" : "☀️"
                          }
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 1: Focus Areas */}
                {step === 1 && (
                  <div className="question-panel">
                    <span className="question-kicker">02 · AREA PEMULIHAN &amp; FOKUS</span>
                    <h2>Aspek mana yang ingin kamu <em>beri ruang?</em></h2>
                    <p className="question-description">Pilih 2–3 dimensi kesehatan mental yang paling kamu butuhkan.</p>
                    <div className="focus-options">
                      {focusAreas.map((area) => {
                        const selected = answers.focus.includes(area.id);
                        return (
                          <button
                            className={`focus-option${selected ? " is-selected" : ""}`}
                            type="button"
                            key={area.id}
                            aria-pressed={selected}
                            onClick={() => toggleFocus(area.id)}
                          >
                            <span className="option-check">{selected && <Check size={13} />}</span>
                            <span className="focus-option-copy">
                              <strong>{area.label}</strong>
                              <small>{area.note}</small>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <span className="question-hint">{answers.focus.length}/3 dipilih · pilih minimal 2</span>
                  </div>
                )}

                {/* Step 2: Courage Level */}
                {step === 2 && (
                  <div className="question-panel">
                    <span className="question-kicker">03 · BESAR TANTANGANNYA</span>
                    <h2>Seberapa menantang yang terasa <em>aman buatmu?</em></h2>
                    <p className="question-description">Dalam kesehatan mental, langkah yang terlalu besar memicu panik. Mulailah dari yang terasa realistis.</p>
                    <div className="choice-options">
                      <ChoiceButton<CourageLevel>
                        value="gentle"
                        selected={answers.courage}
                        onSelect={(courage) => setAnswers((current) => ({ ...current, courage }))}
                        title="Sangat Lembut & Menenangkan"
                        detail="Langkah mikro yang sangat ringan, tanpa memicu overthinking."
                        icon="♡"
                      />
                      <ChoiceButton<CourageLevel>
                        value="stretch"
                        selected={answers.courage}
                        onSelect={(courage) => setAnswers((current) => ({ ...current, courage }))}
                        title="Sedikit Menantang (Stretch Zone)"
                        detail="Memicu sedikit deg-degan, namun tetap terasa aman dan memberdayakan."
                        icon="✳"
                      />
                      <ChoiceButton<CourageLevel>
                        value="bold"
                        selected={answers.courage}
                        onSelect={(courage) => setAnswers((current) => ({ ...current, courage }))}
                        title="Keberanian Nyata (Keluar dari Kebiasaan)"
                        detail="Aku merasa stabil dan siap melangkah keluar dari siklus penghindaran."
                        icon="↗"
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Energy & Setting */}
                {step === 3 && (
                  <div className="question-panel">
                    <span className="question-kicker">04 · RITME HIDUP &amp; RUANG</span>
                    <h2>Energi dan ruang seperti apa yang <em>pas?</em></h2>
                    <p className="question-description">Sesuaikan dengan kapasitas tubuh dan pikiranmu hari ini.</p>
                    <div className="choice-options">
                      <ChoiceButton<EnergyPreference>
                        value="quiet"
                        selected={answers.energy}
                        onSelect={(energy) => setAnswers((current) => ({ ...current, energy }))}
                        title="Low Energy / Dari Rumah"
                        detail="Bisa dilakukan di tempat tidur, meja kerja, atau ruang privatmu."
                        icon="☁"
                      />
                      <ChoiceButton<EnergyPreference>
                        value="some"
                        selected={answers.energy}
                        onSelect={(energy) => setAnswers((current) => ({ ...current, energy }))}
                        title="Energi Sedang"
                        detail="Bisa meluangkan 10-15 menit untuk aktivitas ringan di luar rutinitas."
                        icon="◷"
                      />
                      <ChoiceButton<EnergyPreference>
                        value="open"
                        selected={answers.energy}
                        onSelect={(energy) => setAnswers((current) => ({ ...current, energy }))}
                        title="Terbuka Menjelajah"
                        detail="Siap berinteraksi atau mencoba suasana baru."
                        icon="↗"
                      />
                    </div>
                    <div className="setting-question">
                      <span className="question-kicker">LEBIH NYAMAN DILAKUKAN...</span>
                      <div className="setting-options">
                        <ChoicePill<SettingPreference>
                          value="solo"
                          selected={answers.setting}
                          onSelect={(setting) => setAnswers((current) => ({ ...current, setting }))}
                        >
                          Sendiri (Ruang Aman)
                        </ChoicePill>
                        <ChoicePill<SettingPreference>
                          value="together"
                          selected={answers.setting}
                          onSelect={(setting) => setAnswers((current) => ({ ...current, setting }))}
                        >
                          Bersama Orang Lain
                        </ChoicePill>
                        <ChoicePill<SettingPreference>
                          value="either"
                          selected={answers.setting}
                          onSelect={(setting) => setAnswers((current) => ({ ...current, setting }))}
                        >
                          Fleksibel / Keduanya
                        </ChoicePill>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Personal Intention / Struggle */}
                {step === 4 && (
                  <div className="question-panel">
                    <span className="question-kicker">05 · CURAHAN HATI &amp; NIAT KHUSUS</span>
                    <h2>Ada kecemasan atau hal spesifik yang ingin kamu <em>pulihkan?</em></h2>
                    <p className="question-description">
                      Opsional. Ceritakan apa yang sedang kamu hadapi—misal: rasa bersalah menolak rekan kerja, takut mengirim pesan, atau imposter syndrome. Model AI akan merangkai dare spesifik untuk itu.
                    </p>
                    <label className="intention-label" htmlFor="intention">
                      YANG SEDANG KUHADAPI ATAU INGIN KULATIH ADALAH...
                    </label>
                    <textarea
                      id="intention"
                      className="intention-input"
                      value={answers.intention}
                      maxLength={180}
                      placeholder="Contoh: Aku sering merasa bersalah kalau menolak ajakan kumpul karena takut dinilai sombong..."
                      onChange={(event) => setAnswers((current) => ({ ...current, intention: event.target.value }))}
                      rows={3}
                    />
                    <span className="question-hint">Privasi terjaga: cerita ini diolah langsung oleh AI Gateway untuk memformulasikan tantanganmu.</span>
                  </div>
                )}

                {/* Quiz Controls */}
                <div className="quiz-controls">
                  {step > 0 ? (
                    <button className="quiz-back" type="button" onClick={() => setStep((current) => current - 1)}>
                      <ArrowLeft size={15} /> Kembali
                    </button>
                  ) : <span />}

                  {step < stepCount - 1 ? (
                    <button
                      className="button button-dark"
                      type="button"
                      disabled={!stepCanContinue}
                      onClick={() => setStep((current) => current + 1)}
                    >
                      Lanjut <ArrowRight size={15} />
                    </button>
                  ) : (
                    <button
                      className="button button-dark btn-generate-ai"
                      type="button"
                      disabled={isGenerating}
                      onClick={generateDares}
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw size={15} className="spin-icon" /> Meramu dengan Model AI...
                        </>
                      ) : (
                        <>
                          Rangkai Dare Mental Health-ku <Sparkles size={15} />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="ready-card">
                <span className="ready-icon"><Heart size={20} /></span>
                <div>
                  <span className="section-kicker">KESEHATAN MENTAL SESUAI RITMEMU</span>
                  <h2>Daftar dare berbasis AI telah aktif untuk <em>perjalananmu.</em></h2>
                  <p>Kamu bisa memperbarui jawaban atau berkonsultasi ke Ruang Teduh AI kapan saja.</p>
                </div>
                <button className="button button-dark" type="button" onClick={() => setShowQuestions(true)}>
                  Sesuaikan Ulang Jawaban <ArrowRight size={15} />
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Results: Dare List */}
        {saved.dares.length > 0 && !showQuestions && (
          <section className="results-section section-wrap" id="my-dares">
            <div className="results-heading">
              <div>
                <span className="section-kicker">DIPERSONALISASI DENGAN AI MENTAL WELLNESS</span>
                <h2>Langkah kecil yang ramah<br /><em>untuk kesehatan mentalmu.</em></h2>
                <p>{selectedFocusNames?.join(" · ")}</p>
              </div>
              <div className="results-actions">
                <button
                  className="button button-outline"
                  type="button"
                  onClick={() => {
                    setActiveModal("breathing");
                    setBreathActive(true);
                  }}
                >
                  <Wind size={14} /> Jeda Napas
                </button>
                <button className="button button-outline" type="button" onClick={startOver}>
                  <RefreshCw size={14} /> Ubah Jawaban
                </button>
              </div>
            </div>

            {/* AI Gateway Notification Banner */}
            <div className="ai-status-card">
              <div className="ai-status-header">
                <span className="ai-badge-live">
                  <Sparkles size={14} /> Model AI Aktif: Gemini 2.5 Flash
                </span>
                <span className="ai-subtext">Netlify AI Gateway · Clinical Behavioral Activation</span>
              </div>
              <p>
                Setiap tantangan di bawah dilengkapi <strong>alasan terapeutik</strong>, <strong>langkah mikro &lt; 2 menit</strong>, dan <strong>panduan saat cemas</strong>. Klik kartu untuk melihat detail panduan kesehatan mentalnya.
              </p>
            </div>

            {/* Progress Track */}
            <div className="personal-progress">
              <div className="personal-progress-top">
                <span>KEBERANIAN MIKRO YANG SUDAH KAMU AMBIL</span>
                <strong>{saved.completed.length} / {saved.dares.length} Selesai ({progress}%)</strong>
              </div>
              <div
                className="progress-track"
                role="progressbar"
                aria-label="Dare selesai"
                aria-valuenow={saved.completed.length}
                aria-valuemin={0}
                aria-valuemax={saved.dares.length}
              >
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {/* Dare Grid */}
            <div className="personal-dare-grid">
              {saved.dares.map((dare, index) => {
                const completed = saved.completed.includes(dare.id);
                const isExpanded = expandedDareId === dare.id;
                const reflection = saved.reflections[dare.id];

                return (
                  <div
                    className={`personal-dare-card${completed ? " is-complete" : ""}`}
                    key={dare.id}
                  >
                    <div className="personal-dare-top">
                      <span className="dare-step-badge">
                        LANGKAH {String(index + 1).padStart(2, "0")} · {dare.isAiGenerated ? "✨ AI CURATED" : "🌱 PERSONAL"}
                      </span>
                      <button
                        type="button"
                        className="dare-complete-toggle"
                        onClick={() => toggleCompleted(dare.id)}
                        aria-label={completed ? "Tandai belum selesai" : "Tandai selesai"}
                      >
                        {completed ? <Check size={14} /> : <span className="circle-empty" />}
                      </button>
                    </div>

                    <strong className="dare-card-title">{dare.title}</strong>
                    <p className="personal-dare-note">{dare.note}</p>

                    {/* Psychological Clinical Guide Collapsible */}
                    {(dare.whyHelpMentalHealth || dare.microStep || dare.mindfulTip) && (
                      <div className="dare-mental-details">
                        <button
                          type="button"
                          className="toggle-details-btn"
                          onClick={() => setExpandedDareId(isExpanded ? null : dare.id)}
                        >
                          <span>{isExpanded ? "Sembunyikan Panduan Mental Health" : "Lihat Panduan & Alasan Psikologis"}</span>
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>

                        {isExpanded && (
                          <div className="mental-details-body">
                            {dare.whyHelpMentalHealth && (
                              <div className="detail-item">
                                <span className="detail-label">🧠 MENGAPA INI BAIK UNTUK MENTALMU</span>
                                <p>{dare.whyHelpMentalHealth}</p>
                              </div>
                            )}
                            {dare.microStep && (
                              <div className="detail-item">
                                <span className="detail-label">👣 LANGKAH AWAL TERMURAH (&lt; 2 MENIT)</span>
                                <p>{dare.microStep}</p>
                              </div>
                            )}
                            {dare.mindfulTip && (
                              <div className="detail-item">
                                <span className="detail-label">🧘 JIKA RASA CEMAS MUNCUL</span>
                                <p>{dare.mindfulTip}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Reflection display if completed */}
                    {reflection && (
                      <div className="saved-reflection-box">
                        <div className="reflection-header">
                          <span className="reflection-badge">Refleksi: {reflection.feeling}</span>
                          <small>{reflection.createdAt}</small>
                        </div>
                        <p className="user-reflection-quote">"{reflection.reflectionText}"</p>
                        {reflection.aiFeedback && (
                          <div className="ai-feedback-compact">
                            <span className="ai-coach-tag"><Sparkles size={11} /> Umpan Balik AI:</span>
                            <p>{reflection.aiFeedback.validation}</p>
                            <span className="affirmation-pill">Afirmasi: {reflection.aiFeedback.affirmation}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Card Actions Footer */}
                    <div className="card-actions-footer">
                      <span className="personal-dare-focus">
                        {focusAreas.find((area) => area.id === dare.focus)?.label || dare.focus}
                      </span>
                      <button
                        type="button"
                        className="btn-reflect"
                        onClick={() => {
                          setActiveModal({ type: "reflect", dare });
                          setReflectInput(reflection ? reflection.reflectionText : "");
                        }}
                      >
                        <MessageSquare size={13} /> {reflection ? "Lihat/Ubah Refleksi" : "Refleksi dengan AI"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="results-footer-bar">
              <p className="results-footer">
                <Heart size={14} /> Ingat: Keberanian sejati bukan berarti ketiadaan rasa takut, melainkan kesediaan melangkah dengan kelembutan hati.
              </p>
              <button
                type="button"
                className="text-link"
                onClick={() => setActiveModal("crisis")}
              >
                <Phone size={13} /> Butuh bantuan profesional saat ini?
              </button>
            </div>
          </section>
        )}

        {/* How It Works with Mental Health Grounding */}
        <section className="how-section" id="how-it-works">
          <div className="how-inner section-wrap">
            <span className="section-kicker">METODOLOGI KESEHATAN MENTAL</span>
            <h2>Mengapa langkah kecil<br /><em>menyembuhkan pikiran kita?</em></h2>
            <div className="how-steps">
              <div>
                <span>01</span>
                <strong>Meredam Amigdala &amp; Overthinking</strong>
                <p>Ketika dihadapkan pada tujuan raksasa, amigdala mendeteksi ancaman dan memicu kepanikan/penundaan. Langkah mikro menjaga sistem saraf tetap di zona regulasi (Window of Tolerance).</p>
              </div>
              <div>
                <span>02</span>
                <strong>Behavioral Activation (CBT)</strong>
                <p>Model AI meramu tindakan nyata yang mudah diraih untuk memicu dopamin alami dan mematahkan lingkaran setan kelelahan emosional atau isolasi diri.</p>
              </div>
              <div>
                <span>03</span>
                <strong>Neuroplastisitas &amp; Self-Compassion</strong>
                <p>Melalui refleksi terpandu AI, setiap langkah kecil dikonsolidasikan oleh otak menjadi bukti nyata bahwa dirimu berharga dan aman untuk bertumbuh.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Psychological Safety Promise */}
        <section className="promise-section">
          <div className="promise-inner section-wrap">
            <span className="promise-spark">✳</span>
            <span className="section-kicker">KEAMANAN PSIKOLOGIS DI ATAS SEGALANYA</span>
            <h2>Ruang aman untuk memulihkan diri.<br />Bukan arena untuk membuktikan apa pun.</h2>
            <p>
              Setiap dare adalah undangan ramah, bukan kewajiban yang harus kamu paksakan.<br />
              Dengarkan tubuhmu, hormati batasanmu, dan rayakan setiap napas lega yang kamu rasakan hari ini.
            </p>
            <div className="promise-buttons">
              <a href="#build-your-list" className="button button-light">
                Mulai Perjalanan Lembutmu <ArrowUpRight size={16} />
              </a>
              <button
                type="button"
                className="button button-outline-light"
                onClick={() => setActiveModal("ruang-teduh")}
              >
                <Sparkles size={15} /> Buka Ruang Teduh AI
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer section-wrap">
        <a className="brand footer-brand" href="#home">
          <span className="brand-mark"><Heart size={15} fill="currentColor" /></span>
          <span>little yes · ai mental wellness & courage</span>
        </a>
        <div className="footer-links">
          <button type="button" onClick={() => setActiveModal("ruang-teduh")}>Ruang Teduh AI</button>
          <button type="button" onClick={() => setActiveModal("breathing")}>Latihan Napas</button>
          <button type="button" onClick={() => setActiveModal("crisis")}>Bantuan Krisis</button>
        </div>
        <a href="#home" className="back-top">KEMBALI KE ATAS ↑</a>
      </footer>

      <div className="care-note section-wrap">
        <strong>Pemberitahuan Klinis &amp; Etika:</strong> Little Yes menggunakan model kecerdasan buatan (Gemini melalui Netlify AI Gateway) sebagai sarana pembentukan kebiasaan mikro dan aktivasi perilaku mandiri. Aplikasi ini <em>bukan</em> pengganti diagnosis medis psikiatri, psikoterapi klinis, atau intervensi kegawatdaruratan krisis mental. Jika Anda berada dalam bahaya, segera hubungi saluran darurat terdekat.
      </div>

      {storageError && (
        <div className="storage-warning" role="status">
          Browser ini tidak dapat menyimpan dare list-mu secara lokal.
        </div>
      )}

      {/* MODAL 1: RUANG TEDUH AI (Live Mental Health Companion) */}
      {activeModal === "ruang-teduh" && (
        <div className="modal-overlay" onClick={() => setActiveModal("none")}>
          <div className="modal-card modal-ruang-teduh" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <span className="badge-ai"><Sparkles size={13} /> RUANG TEDUH AI</span>
                <h2>Teman Bimbingan Mental Health</h2>
                <p>Bagikan apa pun yang sedang membuat hatimu berat. Kami berikan respon penenang dan 1 langkah mikro.</p>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setActiveModal("none")}
                aria-label="Tutup"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="quick-topics-tray">
                <span className="quick-topics-label">Pilih topik cepat jika bingung merangkai kata:</span>
                <div className="chips-container">
                  <button
                    type="button"
                    className="topic-chip"
                    onClick={() => handleAskCoach("Pikiranku lagi overthinking hal-hal buruk yang belum tentu terjadi, dadaku terasa sesak...")}
                  >
                    🌀 Cemas &amp; Overthinking
                  </button>
                  <button
                    type="button"
                    className="topic-chip"
                    onClick={() => handleAskCoach("Aku merasa sangat bersalah karena ingin menolak permintaan orang lain, takut mereka kecewa...")}
                  >
                    ✋ Menolak &amp; Batasan Diri
                  </button>
                  <button
                    type="button"
                    className="topic-chip"
                    onClick={() => handleAskCoach("Aku merasa sangat lelah secara emosional, serba salah, dan tidak bersemangat...")}
                  >
                    🕯️ Burnout &amp; Kelelahan
                  </button>
                  <button
                    type="button"
                    className="topic-chip"
                    onClick={() => handleAskCoach("Aku merasa serba kurang dan takut dihakimi kalau menunjukkan karyaku...")}
                  >
                    🌱 Minder / Imposter Syndrome
                  </button>
                </div>
              </div>

              {coachLoading && (
                <div className="ai-loading-box">
                  <RefreshCw size={24} className="spin-icon text-amber" />
                  <p>Menghubungkan ke Gemini AI... Meresapi ceritamu dengan penuh empati...</p>
                </div>
              )}

              {coachResponse && !coachLoading && (
                <div className="coach-response-box">
                  <div className="coach-section">
                    <span className="coach-badge"><Heart size={12} /> Validasi Emosi:</span>
                    <p className="coach-empathy">{coachResponse.empathy}</p>
                  </div>

                  {coachResponse.reframe && (
                    <div className="coach-section">
                      <span className="coach-badge"><Smile size={12} /> Sudut Pandang Baru (CBT Reframe):</span>
                      <p className="coach-reframe">{coachResponse.reframe}</p>
                    </div>
                  )}

                  {coachResponse.breathingPrompt && (
                    <div className="coach-section somatic-box">
                      <span className="coach-badge"><Wind size={12} /> Panduan Grounding Tubuh:</span>
                      <p>{coachResponse.breathingPrompt}</p>
                    </div>
                  )}

                  {coachResponse.recommendedDare && (
                    <div className="coach-dare-recommendation">
                      <div className="coach-dare-top">
                        <span className="coach-badge-dare">LITTLE YES UNTUK SEKARANG</span>
                        <button
                          type="button"
                          className="btn-add-dare"
                          onClick={() => addCoachDareToList(coachResponse.recommendedDare)}
                        >
                          + Tambahkan ke Dare List-ku
                        </button>
                      </div>
                      <strong>{coachResponse.recommendedDare.title}</strong>
                      <p className="coach-dare-why">{coachResponse.recommendedDare.whyHelpMentalHealth}</p>
                      {coachResponse.recommendedDare.microStep && (
                        <small className="coach-dare-step">
                          Langkah mikro: {coachResponse.recommendedDare.microStep}
                        </small>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="coach-input-container">
                <textarea
                  className="coach-textarea"
                  value={coachInput}
                  onChange={(e) => setCoachInput(e.target.value)}
                  placeholder="Ceritakan apa yang sedang kamu rasakan atau cemaskan saat ini..."
                  rows={3}
                />
                <button
                  type="button"
                  className="button button-dark btn-send-coach"
                  disabled={!coachInput.trim() || coachLoading}
                  onClick={() => handleAskCoach()}
                >
                  <Send size={15} /> Kirim ke AI
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: REFLEKSI DENGAN AI (Neuroplastic Courage Debrief) */}
      {typeof activeModal === "object" && activeModal.type === "reflect" && (
        <div className="modal-overlay" onClick={() => setActiveModal("none")}>
          <div className="modal-card modal-reflect" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <span className="badge-ai"><Sparkles size={13} /> REFLEKSI TERPANDU AI</span>
                <h2>Bagaimana rasanya mengambil langkah ini?</h2>
                <p>Tantangan: <strong>"{activeModal.dare.title}"</strong></p>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setActiveModal("none")}
                aria-label="Tutup"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="feeling-selection">
                <label className="modal-label">PERASAAN YANG PALING MUNCUL:</label>
                <div className="feeling-chips">
                  {["Lega & Tenang", "Bangga pada Diri", "Masih Deg-degan", "Ternyata Tidak Seseram Itu", "Agak Lelah tapi Bersyukur"].map((feel) => (
                    <button
                      key={feel}
                      type="button"
                      className={`feeling-chip${reflectFeeling === feel ? " is-active" : ""}`}
                      onClick={() => setReflectFeeling(feel)}
                    >
                      {feel}
                    </button>
                  ))}
                </div>
              </div>

              <div className="reflection-input-group">
                <label className="modal-label" htmlFor="reflect-text">
                  APA YANG KAMU PELAJARI ATAU RASAKAN SAAT MELAKUKANNYA?
                </label>
                <textarea
                  id="reflect-text"
                  className="intention-input"
                  rows={4}
                  value={reflectInput}
                  onChange={(e) => setReflectInput(e.target.value)}
                  placeholder="Misal: Awalnya rasanya deg-degan banget mau menolak, tapi setelah kuucapkan ternyata responnya santai saja..."
                />
              </div>

              <div className="modal-footer-actions">
                <button
                  type="button"
                  className="button button-outline"
                  onClick={() => setActiveModal("none")}
                >
                  Batal
                </button>
                <button
                  type="button"
                  className="button button-dark"
                  disabled={!reflectInput.trim() || reflectLoading}
                  onClick={() => submitReflection(activeModal.dare)}
                >
                  {reflectLoading ? (
                    <>
                      <RefreshCw size={14} className="spin-icon" /> Menghubungi AI...
                    </>
                  ) : (
                    <>
                      Kirim &amp; Dapatkan Validasi AI <Sparkles size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: SOMATIC BREATHING & GROUNDING */}
      {activeModal === "breathing" && (
        <div className="modal-overlay" onClick={() => setActiveModal("none")}>
          <div className="modal-card modal-breathing" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <span className="badge-ai"><Wind size={13} /> GROUNDING &amp; REGULASI SARAF</span>
                <h2>Latihan Napas Menenangkan</h2>
                <p>Ambil jeda sebentar untuk memberi sinyal rasa aman pada tubuhmu.</p>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => {
                  setBreathActive(false);
                  setActiveModal("none");
                }}
                aria-label="Tutup"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body breathing-body">
              <div className={`breathing-circle-wrap ${breathPhase.toLowerCase().replace(" ", "-")}`}>
                <div className="breathing-circle-outer" />
                <div className="breathing-circle-inner">
                  <span className="phase-text">{breathPhase}</span>
                  <span className="phase-timer">{breathTimer}s</span>
                </div>
              </div>

              <p className="breathing-caption">
                {breathPhase === "Tarik Napas" && "Tarik udara sejuk perlahan melalui hidung, biarkan perutmu mengembang."}
                {breathPhase === "Tahan" && "Tahan dengan santai, rasakan ketenangan memenuhi dadamu."}
                {breathPhase === "Embuskan" && "Embuskan lembut melalui mulut, lepaskan semua ketegangan di bahu."}
                {breathPhase === "Jeda" && "Istirahat sejenak di ruang tenang ini sebelum napas berikutnya."}
              </p>

              <div className="breathing-grounding-tips">
                <span className="tip-title">🌿 Panduan 5-4-3-2-1 Sensory Grounding:</span>
                <ul>
                  <li>Lihat <strong>5 benda</strong> di sekitarmu yang membuatmu nyaman.</li>
                  <li>Sentuh <strong>4 tekstur</strong> fisik di dekatmu.</li>
                  <li>Dengarkan <strong>3 suara</strong> lembut di ruangan.</li>
                  <li>Amati <strong>2 aroma</strong> yang tercium.</li>
                  <li>Rasakan <strong>1 kebaikan</strong> yang ada pada dirimu saat ini.</li>
                </ul>
              </div>

              <div className="breathing-actions">
                <button
                  type="button"
                  className="button button-dark"
                  onClick={() => {
                    setBreathActive(false);
                    setActiveModal("none");
                  }}
                >
                  Selesai &amp; Kembali Lebih Tenang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: CRISIS & PROFESSIONAL RESOURCES */}
      {activeModal === "crisis" && (
        <div className="modal-overlay" onClick={() => setActiveModal("none")}>
          <div className="modal-card modal-crisis" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <span className="badge-crisis"><Shield size={13} /> BANTUAN PROFESIONAL &amp; KRISIS</span>
                <h2>Anda Berharga &amp; Tidak Sendirian</h2>
                <p>Jika Anda atau orang terdekat berada dalam krisis emosional atau membutuhkan pertolongan mendesak:</p>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setActiveModal("none")}
                aria-label="Tutup"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="crisis-list">
                <div className="crisis-item">
                  <div className="crisis-item-left">
                    <strong>Hotline Kesehatan Jiwa Sejiwa (Kemenkes)</strong>
                    <p>Layanan konseling krisis psikologis resmi Kementerian Kesehatan RI.</p>
                  </div>
                  <a href="tel:119" className="crisis-call-btn">
                    <Phone size={14} /> Hubungi 119 (ext. 8)
                  </a>
                </div>

                <div className="crisis-item">
                  <div className="crisis-item-left">
                    <strong>Yayasan Pulih (Trauma &amp; Konseling)</strong>
                    <p>Layanan psikososial dan pemulihan trauma terpercaya.</p>
                  </div>
                  <a href="https://yayasanpulih.org" target="_blank" rel="noopener noreferrer" className="crisis-call-btn">
                    yayasanpulih.org
                  </a>
                </div>

                <div className="crisis-item">
                  <div className="crisis-item-left">
                    <strong>LISA Suicide Prevention &amp; Mental Health Helpline</strong>
                    <p>Dukungan krisis pencegahan bunuh diri dan kesehatan mental 24 jam.</p>
                  </div>
                  <a href="tel:081111945422" className="crisis-call-btn">
                    <Phone size={14} /> 08111-1945-422
                  </a>
                </div>

                <div className="crisis-item">
                  <div className="crisis-item-left">
                    <strong>Into The Light Indonesia</strong>
                    <p>Edukasi pencegahan bunuh diri dan panduan mencari bantuan profesional.</p>
                  </div>
                  <a href="https://www.intothelightid.org" target="_blank" rel="noopener noreferrer" className="crisis-call-btn">
                    intothelightid.org
                  </a>
                </div>
              </div>

              <div className="crisis-disclaimer">
                <AlertCircle size={16} />
                <span>
                  Little Yes adalah platform self-care &amp; micro-courage, bukan layanan penanganan gawat darurat klinis. Mohon segera hubungi nomor di atas jika Anda merasa tidak aman.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ChoiceButton<T extends string>({
  value,
  selected,
  onSelect,
  title,
  detail,
  icon,
}: {
  value: T;
  selected: T;
  onSelect: (value: T) => void;
  title: string;
  detail: string;
  icon: string;
}) {
  const isSelected = selected === value;
  return (
    <button
      className={`choice-option${isSelected ? " is-selected" : ""}`}
      type="button"
      aria-pressed={isSelected}
      onClick={() => onSelect(value)}
    >
      <span className="choice-icon">{icon}</span>
      <span className="choice-copy">
        <strong>{title}</strong>
        <small>{detail}</small>
      </span>
      <span className="option-check">{isSelected && <Check size={13} />}</span>
    </button>
  );
}

function ChoicePill<T extends string>({
  value,
  selected,
  onSelect,
  children,
}: {
  value: T;
  selected: T;
  onSelect: (value: T) => void;
  children: ReactNode;
}) {
  const isSelected = selected === value;
  return (
    <button
      className={`setting-pill${isSelected ? " is-selected" : ""}`}
      type="button"
      aria-pressed={isSelected}
      onClick={() => onSelect(value)}
    >
      {children}
    </button>
  );
}

export default App;
