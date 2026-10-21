import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Heart,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import {
  createDareList,
  focusAreas,
  type Answers,
  type CourageLevel,
  type Dare,
  type EnergyPreference,
  type FocusArea,
  type SettingPreference,
} from "./dare-generator";

const STORAGE_KEY = "little-yes-personalized-v1";
const stepCount = 4;

type SavedState = {
  answers: Answers | null;
  dares: Dare[];
  completed: string[];
};

const emptyAnswers: Answers = {
  focus: [],
  courage: "stretch",
  energy: "some",
  setting: "either",
  intention: "",
};

const defaultState: SavedState = { answers: null, dares: [], completed: [] };

function isFocusArea(value: unknown): value is FocusArea {
  return typeof value === "string" && focusAreas.some((area) => area.id === value);
}

function isAnswers(value: unknown): value is Answers {
  if (typeof value !== "object" || value === null) return false;
  const answers = value as Partial<Answers>;
  return (
    Array.isArray(answers.focus) &&
    answers.focus.length >= 2 &&
    answers.focus.length <= 3 &&
    answers.focus.every(isFocusArea) &&
    (answers.courage === "gentle" || answers.courage === "stretch" || answers.courage === "bold") &&
    (answers.energy === "quiet" || answers.energy === "some" || answers.energy === "open") &&
    (answers.setting === "solo" || answers.setting === "together" || answers.setting === "either") &&
    typeof answers.intention === "string" &&
    answers.intention.length <= 120
  );
}

function readSavedState(): SavedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return defaultState;
    const value = parsed as Partial<SavedState>;
    if (
      !Array.isArray(value.dares) ||
      !value.dares.every(
        (dare) =>
          typeof dare.id === "string" &&
          typeof dare.title === "string" &&
          isFocusArea(dare.focus) &&
          typeof dare.note === "string",
      ) ||
      !Array.isArray(value.completed) ||
      !value.completed.every((id) => typeof id === "string")
    ) {
      return defaultState;
    }
    return {
      answers: isAnswers(value.answers) ? value.answers : null,
      dares: value.dares,
      completed: value.completed,
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

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [saved]);

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

  function generateDares() {
    const dares = createDareList(answers);
    setSaved({ answers, dares, completed: [] });
    setShowQuestions(false);
    setStep(0);
    window.setTimeout(() => document.getElementById("my-dares")?.scrollIntoView({ behavior: "smooth" }), 0);
  }

  function toggleCompleted(id: string) {
    setSaved((current) => ({
      ...current,
      completed: current.completed.includes(id)
        ? current.completed.filter((completedId) => completedId !== id)
        : [...current.completed, id],
    }));
  }

  function startOver() {
    setAnswers(emptyAnswers);
    setStep(0);
    setShowQuestions(true);
    document.getElementById("build-your-list")?.scrollIntoView({ behavior: "smooth" });
  }

  const stepCanContinue = step !== 0 || answers.focus.length >= 2;
  const progress = saved.dares.length
    ? Math.round((saved.completed.length / saved.dares.length) * 100)
    : 0;
  const selectedFocusNames = saved.answers?.focus
    .map((id) => focusAreas.find((area) => area.id === id)?.label);

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="Little Yes home">
          <span className="brand-mark"><Heart size={16} fill="currentColor" /></span>
          <span>little yes <span className="brand-light">· dare list untukmu</span></span>
        </a>
        <nav className="main-nav" aria-label="Navigasi utama">
          <a href="#how-it-works">Cara kerjanya</a>
          {saved.dares.length > 0 && <a href="#my-dares">Dare-ku</a>}
          <a className="nav-cta" href="#build-your-list">
            Mulai ceritamu <ArrowUpRight size={15} />
          </a>
        </nav>
      </header>

      <main id="home">
        <section className="hero section-wrap">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> PERSONAL COURAGE, ONE LITTLE YES AT A TIME</div>
            <h1>Berani dengan<br />caramu <em>sendiri.</em></h1>
            <p className="hero-lede">
              Bukan daftar dare yang sama untuk semua orang. Ceritakan sedikit tentang dirimu, lalu temukan tantangan kecil yang terasa pas untuk hidupmu.
            </p>
            <div className="hero-actions">
              <a className="button button-dark" href="#build-your-list">Buat dare list-ku <ArrowRight size={16} /></a>
              <a className="text-link" href="#how-it-works">Lihat cara kerjanya <ArrowDown size={15} /></a>
            </div>
            <div className="hero-note">
              <span className="note-icon"><Heart size={14} /></span>
              <span>Pelan-pelan juga tetap berani.</span>
            </div>
          </div>

          <div className="hero-art" aria-label="Ilustrasi jalan setapak menuju matahari terbit">
            <div className="art-sun" />
            <div className="art-label art-label-top">LANGKAH KECIL<br />CERITA BESAR</div>
            <div className="art-hill art-hill-back" />
            <div className="art-hill art-hill-front" />
            <svg className="art-path" viewBox="0 0 600 420" fill="none" aria-hidden="true">
              <path d="M324 440C318 391 237 382 242 338C247 291 352 305 354 256C356 210 274 211 288 164C299 124 364 120 357 75C354 52 340 38 334 24" stroke="#F8F5EC" strokeWidth="35" strokeLinecap="round" />
              <path d="M324 440C318 391 237 382 242 338C247 291 352 305 354 256C356 210 274 211 288 164C299 124 364 120 357 75C354 52 340 38 334 24" stroke="#D2A78A" strokeWidth="1.5" strokeDasharray="4 9" strokeLinecap="round" />
            </svg>
            <div className="art-flower flower-one">✳</div>
            <div className="art-flower flower-two">✿</div>
            <div className="art-flower flower-three">✳</div>
            <div className="art-stamp"><span>YOUR</span><strong>OWN<br />LITTLE<br />JOURNEY</strong><span>MADE FOR YOU</span></div>
            <div className="art-label art-label-bottom">MULAI DARI<br />YANG TERASA MUNGKIN</div>
          </div>
          <div className="hero-bottom">
            <span>DIRANGKAI DARI CERITAMU</span>
            <span className="hero-bottom-center">Satu langkah kecil <span>✳</span></span>
            <span>BUKAN HARUS SEMPURNA</span>
          </div>
        </section>

        <section className="onboarding-section" id="build-your-list">
          <div className="onboarding-inner section-wrap">
            {showQuestions ? (
              <div className="quiz-card">
                <div className="quiz-topline">
                  <span className="section-kicker">SEBELUM KITA MULAI</span>
                  <span className="quiz-step-count">0{step + 1} <i>/</i> 04</span>
                </div>
                <div className="quiz-progress" aria-label={`Pertanyaan ${step + 1} dari ${stepCount}`}>
                  <span style={{ width: `${((step + 1) / stepCount) * 100}%` }} />
                </div>

                {step === 0 && (
                  <div className="question-panel">
                    <span className="question-kicker">01 · AREA FOKUS</span>
                    <h2>Bagian hidup mana yang ingin kamu <em>beri ruang?</em></h2>
                    <p className="question-description">Pilih 2–3 hal yang paling terasa dekat denganmu sekarang.</p>
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
                            <span className="focus-option-copy"><strong>{area.label}</strong><small>{area.note}</small></span>
                          </button>
                        );
                      })}
                    </div>
                    <span className="question-hint">{answers.focus.length}/3 dipilih · pilih minimal 2</span>
                  </div>
                )}

                {step === 1 && (
                  <div className="question-panel">
                    <span className="question-kicker">02 · BESAR LANGKAHNYA</span>
                    <h2>Seberapa menantang rasanya <em>buatmu?</em></h2>
                    <p className="question-description">Nggak ada jawaban benar. Kita bisa mulai dari yang terasa mungkin.</p>
                    <div className="choice-options">
                      <ChoiceButton<CourageLevel> value="gentle" selected={answers.courage} onSelect={(courage) => setAnswers((current) => ({ ...current, courage }))} title="Lembut dulu" detail="Aku ingin mulai dengan langkah yang ringan." icon="♡" />
                      <ChoiceButton<CourageLevel> value="stretch" selected={answers.courage} onSelect={(courage) => setAnswers((current) => ({ ...current, courage }))} title="Sedikit menantang" detail="Bikin deg-degan dikit, tapi masih terasa aman." icon="✳" />
                      <ChoiceButton<CourageLevel> value="bold" selected={answers.courage} onSelect={(courage) => setAnswers((current) => ({ ...current, courage }))} title="Ajak aku lebih berani" detail="Aku siap mencoba sesuatu di luar kebiasaan." icon="↗" />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="question-panel">
                    <span className="question-kicker">03 · RITME HIDUPMU</span>
                    <h2>Energi dan waktu seperti apa yang <em>pas?</em></h2>
                    <p className="question-description">Pilih ritme yang cocok untuk saat ini, bukan versi ideal di kepala.</p>
                    <div className="choice-options">
                      <ChoiceButton<EnergyPreference> value="quiet" selected={answers.energy} onSelect={(energy) => setAnswers((current) => ({ ...current, energy }))} title="Santai dan low-key" detail="Kebanyakan bisa dimulai dari rumah atau dekat rumah." icon="☁" />
                      <ChoiceButton<EnergyPreference> value="some" selected={answers.energy} onSelect={(energy) => setAnswers((current) => ({ ...current, energy }))} title="Ada sedikit ruang" detail="Aku bisa luangkan waktu untuk kegiatan ringan." icon="◷" />
                      <ChoiceButton<EnergyPreference> value="open" selected={answers.energy} onSelect={(energy) => setAnswers((current) => ({ ...current, energy }))} title="Siap menjelajah" detail="Aku terbuka untuk mencoba tempat atau kegiatan baru." icon="↗" />
                    </div>
                    <div className="setting-question">
                      <span className="question-kicker">LEBIH NYAMAN MULAI...</span>
                      <div className="setting-options">
                        <ChoicePill<SettingPreference> value="solo" selected={answers.setting} onSelect={(setting) => setAnswers((current) => ({ ...current, setting }))}>Sendiri</ChoicePill>
                        <ChoicePill<SettingPreference> value="together" selected={answers.setting} onSelect={(setting) => setAnswers((current) => ({ ...current, setting }))}>Bareng orang</ChoicePill>
                        <ChoicePill<SettingPreference> value="either" selected={answers.setting} onSelect={(setting) => setAnswers((current) => ({ ...current, setting }))}>Bebas</ChoicePill>
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="question-panel">
                    <span className="question-kicker">04 · SATU HAL LAGI</span>
                    <h2>Ada hal spesifik yang ingin kamu <em>coba?</em></h2>
                    <p className="question-description">Opsional. Tulis mimpi, target, atau sesuatu yang terus terlintas. Kami jadikan satu dare kecil untuk memulainya.</p>
                    <label className="intention-label" htmlFor="intention">YANG INGIN KUCoba ADALAH...</label>
                    <textarea
                      id="intention"
                      className="intention-input"
                      value={answers.intention}
                      maxLength={120}
                      placeholder="Contoh: mulai berani menunjukkan hasil karyaku"
                      onChange={(event) => setAnswers((current) => ({ ...current, intention: event.target.value }))}
                      rows={3}
                    />
                    <span className="question-hint">Boleh dikosongkan, dare-mu tetap bisa dibuat.</span>
                  </div>
                )}

                <div className="quiz-controls">
                  {step > 0 ? (
                    <button className="quiz-back" type="button" onClick={() => setStep((current) => current - 1)}>
                      <ArrowLeft size={15} /> Kembali
                    </button>
                  ) : <span />}
                  {step < stepCount - 1 ? (
                    <button className="button button-dark" type="button" disabled={!stepCanContinue} onClick={() => setStep((current) => current + 1)}>
                      Lanjut <ArrowRight size={15} />
                    </button>
                  ) : (
                    <button className="button button-dark" type="button" onClick={generateDares}>
                      Buat dare list-ku <Sparkles size={15} />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="ready-card">
                <span className="ready-icon"><Heart size={20} /></span>
                <div>
                  <span className="section-kicker">SIAP KAPAN KAMU SIAP</span>
                  <h2>Jawab beberapa pertanyaan, lalu dapatkan dare yang terasa <em>lebih kamu.</em></h2>
                  <p>Yang kamu bagikan di sini tetap di browser ini.</p>
                </div>
                <button className="button button-dark" type="button" onClick={() => setShowQuestions(true)}>Mulai lagi <ArrowRight size={15} /></button>
              </div>
            )}
          </div>
        </section>

        {saved.dares.length > 0 && !showQuestions && (
          <section className="results-section section-wrap" id="my-dares">
            <div className="results-heading">
              <div>
                <span className="section-kicker">DIRANGKAI DARI JAWABANMU</span>
                <h2>Dare list yang terasa<br /><em>lebih seperti kamu.</em></h2>
                <p>{selectedFocusNames?.join(" · ")}</p>
              </div>
              <button className="button button-outline" type="button" onClick={startOver}><RefreshCw size={14} /> Ubah jawaban</button>
            </div>
            <div className="local-demo-note">
              <Sparkles size={14} />
              <span><strong>Prototype personalisasi</strong> — dare disusun langsung dari pilihanmu di browser. Belum ada panggilan ke model AI.</span>
            </div>
            <div className="personal-progress">
              <div className="personal-progress-top"><span>LANGKAH KECIL YANG SUDAH KAMU AMBIL</span><strong>{saved.completed.length} / {saved.dares.length}</strong></div>
              <div className="progress-track" role="progressbar" aria-label="Dare selesai" aria-valuenow={saved.completed.length} aria-valuemin={0} aria-valuemax={saved.dares.length}>
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <div className="personal-dare-grid">
              {saved.dares.map((dare, index) => {
                const completed = saved.completed.includes(dare.id);
                return (
                  <button className={`personal-dare${completed ? " is-complete" : ""}`} type="button" key={dare.id} onClick={() => toggleCompleted(dare.id)}>
                    <span className="personal-dare-top"><span>LANGKAH {String(index + 1).padStart(2, "0")}</span><span className="personal-dare-check">{completed ? <Check size={14} /> : <ChevronRight size={14} />}</span></span>
                    <strong>{dare.title}</strong>
                    <span className="personal-dare-note">{dare.note}</span>
                    <span className="personal-dare-focus">{focusAreas.find((area) => area.id === dare.focus)?.label}</span>
                  </button>
                );
              })}
            </div>
            <p className="results-footer"><Heart size={14} /> Pilih satu yang terasa mungkin. Kamu nggak harus melakukan semuanya hari ini.</p>
          </section>
        )}

        <section className="how-section" id="how-it-works">
          <div className="how-inner section-wrap">
            <span className="section-kicker">NGGAK PERLU PUNYA SEMUA JAWABANNYA</span>
            <h2>Mulai dari ceritamu.<br /><em>Bergerak sesuai ritmemu.</em></h2>
            <div className="how-steps">
              <div><span>01</span><strong>Ceritakan yang penting buatmu</strong><p>Pilih area hidup, level keberanian, dan ritme yang nyaman untukmu.</p></div>
              <div><span>02</span><strong>Temukan langkah kecilmu</strong><p>Dapatkan pilihan dare yang disusun dari jawaban dan hal yang ingin kamu coba.</p></div>
              <div><span>03</span><strong>Rayakan setiap “iya”</strong><p>Tandai yang sudah dilakukan. Langkah kecil tetap layak dirayakan.</p></div>
            </div>
          </div>
        </section>

        <section className="promise-section">
          <div className="promise-inner section-wrap">
            <span className="promise-spark">✳</span>
            <span className="section-kicker">SESUAIKAN DENGAN KEHIDUPAN NYATA</span>
            <h2>Berani bukan berarti<br />harus memaksakan diri.</h2>
            <p>Pilih tantangan yang terasa aman dan masuk akal buatmu.<br />Kamu boleh melewati, mengubah, atau mencoba lagi kapan pun.</p>
            <a href="#build-your-list" className="button button-light">Ceritakan tentang dirimu <ArrowUpRight size={16} /></a>
          </div>
        </section>
      </main>

      <footer className="footer section-wrap">
        <a className="brand footer-brand" href="#home"><span className="brand-mark"><Heart size={15} fill="currentColor" /></span><span>little yes · dare list untukmu</span></a>
        <span>DIRANGKAI UNTUK LANGKAHMU SENDIRI</span>
        <a href="#home" className="back-top">KEMBALI KE ATAS ↑</a>
      </footer>
      <div className="care-note section-wrap">
        Prototipe ini menyusun dare secara lokal dari pilihanmu. Tantangan adalah inspirasi, bukan nasihat profesional—sesuaikan dengan kondisi dan batasanmu.
      </div>
      {storageError && <div className="storage-warning" role="status">Browser ini tidak dapat menyimpan dare list-mu.</div>}
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
    <button className={`choice-option${isSelected ? " is-selected" : ""}`} type="button" aria-pressed={isSelected} onClick={() => onSelect(value)}>
      <span className="choice-icon">{icon}</span>
      <span className="choice-copy"><strong>{title}</strong><small>{detail}</small></span>
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
  return <button className={`setting-pill${isSelected ? " is-selected" : ""}`} type="button" aria-pressed={isSelected} onClick={() => onSelect(value)}>{children}</button>;
}

export default App;
