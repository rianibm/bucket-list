import { daresSchema, feedbackSchema, coachSchema, type Source, type Feedback, type CoachResponse } from "../shared/contracts";
import { needsImmediateHelp, crisisMessage } from "../shared/safety";
export const focusAreas = [
  { id: "calm", label: "Ketenangan & Regulasi Cemas", note: "Mengurai overthinking, grounding, dan meredakan kepanikan" },
  { id: "compassion", label: "Self-Compassion & Kebaikan Diri", note: "Memaafkan ketidaksempurnaan dan menghentikan kritik batin" },
  { id: "boundaries", label: "Batasan Sehat & Memilih Diri", note: "Berani berkata tidak dan melindungi energi emosional tanpa rasa bersalah" },
  { id: "connection", label: "Hubungan & Kedekatan Hangat", note: "Menyampaikan rasa, keluar dari isolasi, dan membuka diri dengan aman" },
  { id: "confidence", label: "Percaya Diri & Menghargai Diri", note: "Lebih nyaman menjadi diri sendiri dan mengatasi rasa minder" },
  { id: "burnout", label: "Pemulihan Energi & Anti-Burnout", note: "Memberi izin istirahat, melambatkan ritme, dan jeda sadar" },
  { id: "creative", label: "Kreativitas & Ekspresi Bebas", note: "Mencoba dan berekspresi tanpa takut dihakimi atau harus sempurna" },
  { id: "career", label: "Karier & Aktualisasi Diri", note: "Menghargai kemampuan diri dan mengatasi imposter syndrome" },
] as const;

export type FocusArea = (typeof focusAreas)[number]["id"];
export type CourageLevel = "gentle" | "stretch" | "bold";
export type SettingPreference = "solo" | "together" | "either";
export type EnergyPreference = "quiet" | "some" | "open";

export type EmotionalBaseline =
  | "overwhelmed"
  | "exhausted"
  | "isolated"
  | "self_critical"
  | "ready_to_grow";

export const emotionalBaselines = [
  { id: "overwhelmed" as const, label: "Pikiran Penuh & Cemas", detail: "Kepala terasa bising, overthinking, butuh langkah yang sangat lembut." },
  { id: "exhausted" as const, label: "Lelah Emosional / Burnout", detail: "Energi menipis, butuh izin untuk istirahat dan menolak tuntutan." },
  { id: "isolated" as const, label: "Merasa Sendiri / Terputus", detail: "Rindu kedekatan hangat, butuh langkah mikro yang aman tanpa rasa takut." },
  { id: "self_critical" as const, label: "Sering Mengkritik Diri", detail: "Merasa serba kurang atau tidak cukup, butuh self-compassion." },
  { id: "ready_to_grow" as const, label: "Siap Bertumbuh Bertahap", detail: "Merasa relatif stabil dan ingin memperluas zona nyaman dengan sadar." },
];

export type Answers = {
  focus: FocusArea[];
  courage: CourageLevel;
  energy: EnergyPreference;
  setting: SettingPreference;
  intention: string;
  emotionalState?: EmotionalBaseline;
};

export type Dare = {
  id: string;
  title: string;
  focus: FocusArea;
  note: string;
  whyHelpMentalHealth?: string;
  microStep?: string;
  mindfulTip?: string;
  isAiGenerated?: boolean;
};

type DareIdea = Dare & {
  courage: 1 | 2 | 3;
  energy: 1 | 2 | 3;
  setting: SettingPreference;
};

const courageScore: Record<CourageLevel, number> = {
  gentle: 1,
  stretch: 2,
  bold: 3,
};

const energyScore: Record<EnergyPreference, number> = {
  quiet: 1,
  some: 2,
  open: 3,
};

const dareIdeas: DareIdea[] = [
  // Calm & Anxiety Regulation
  {
    id: "calm-1",
    focus: "calm",
    title: "Tuliskan 3 pikiran yang membuatmu cemas di kertas, lalu lipat dan simpan di laci.",
    note: "Pikiranmu tidak harus diselesaikan semuanya saat ini.",
    whyHelpMentalHealth: "Teknik 'externalization' dalam CBT membantu memindahkan beban kognitif dari memori kerja ke luar kepala.",
    microStep: "Ambil secarik kertas kecil atau buka aplikasi catatan dan tulis satu kalimat saja dulu.",
    mindfulTip: "Tarik napas 4 detik, embuskan perlahan 6 detik saat melipat kertas.",
    courage: 1,
    energy: 1,
    setting: "solo",
  },
  {
    id: "calm-2",
    focus: "calm",
    title: "Ambil jeda 5 menit tanpa membuka layar, cukup rasakan telapak kakimu menapak lantai.",
    note: "Tubuhmu berhak mendapatkan jeda tanpa stimulasi.",
    whyHelpMentalHealth: "Latihan 'grounding somatic' menstimulasi saraf vagus dan menurunkan kadar hormon stres secara alami.",
    microStep: "Letakkan ponsel dengan layar menghadap ke bawah di meja.",
    mindfulTip: "Sebutkan dalam hati 3 warna benda di sekitarmu yang membuatmu nyaman.",
    courage: 1,
    energy: 1,
    setting: "solo",
  },
  {
    id: "calm-3",
    focus: "calm",
    title: "Tunda membalas pesan yang membuatmu tegang selama 20 menit untuk menenangkan napas.",
    note: "Urgensi orang lain bukan berarti bahaya darurat bagimu.",
    whyHelpMentalHealth: "Memutus siklus reaktivitas impulsif melatih amigdala untuk tidak menyamakan ketidakpastian dengan bahaya.",
    microStep: "Tutup aplikasi chat dan minum segelas air hangat.",
    mindfulTip: "Katakan pada dirimu: 'Aku aman merespons saat pikiranku sudah lebih tenang.'",
    courage: 2,
    energy: 1,
    setting: "solo",
  },

  // Self-Compassion
  {
    id: "comp-1",
    focus: "compassion",
    title: "Katakan pada dirimu: 'Aku sedang berusaha sebaik mungkin, dan itu sudah cukup.'",
    note: "Bicara pada diri sendiri seperti bicara pada sahabat tersayang.",
    whyHelpMentalHealth: "Mengaktifkan sirkuit kasih sayang (oxytocin & endorphin) untuk meredam pelepasan kortisol akibat kritik batin.",
    microStep: "Letakkan satu tangan di dada atau peluk kedua lenganmu dengan hangat.",
    mindfulTip: "Ucapkan kalimat ini dengan nada suara batin yang lembut.",
    courage: 1,
    energy: 1,
    setting: "solo",
  },
  {
    id: "comp-2",
    focus: "compassion",
    title: "Maafkan satu hal kecil yang menurutmu 'kurang sempurna' yang kamu lakukan hari ini.",
    note: "Menjadi manusia berarti memiliki keterbatasan yang wajar.",
    whyHelpMentalHealth: "Melepaskan perfeksionisme neurotik menurunkan risiko kecemasan dan sindrom burnout jangka panjang.",
    microStep: "Akui kesalahan itu tanpa melabeli dirimu buruk.",
    mindfulTip: "Tarik napas sambil menerima rasa kecewa, embuskan sambil melepaskan tuntutan sempurna.",
    courage: 2,
    energy: 1,
    setting: "solo",
  },
  {
    id: "comp-3",
    focus: "compassion",
    title: "Izinkan dirimu tidak produktif selama 30 menit tanpa merasa bersalah.",
    note: "Istirahat adalah kebutuhan biologis, bukan hadiah yang harus ditukar.",
    whyHelpMentalHealth: "Merestorasi sistem saraf parasimpatis dan mencegah kelelahan mental berkepanjangan.",
    microStep: "Rebahkan tubuhmu atau dengarkan alunan musik instrumental santai.",
    mindfulTip: "Saat rasa bersalah muncul, cukup perhatikan ia sebagai awan yang lewat di langit pikiran.",
    courage: 2,
    energy: 1,
    setting: "solo",
  },

  // Boundaries
  {
    id: "bnd-1",
    focus: "boundaries",
    title: "Tolak satu ajakan atau permintaan kecil yang sebenarnya menguras energimu dengan sopan.",
    note: "Setiap kali kamu berkata 'tidak' pada hal yang melelahkan, kamu berkata 'ya' pada kesehatan mentalmu.",
    whyHelpMentalHealth: "Memutus pola people-pleasing dan membangun integritas batas diri (healthy individuation).",
    microStep: "Ketik: 'Terima kasih sudah mengajak, tapi untuk kali ini aku belum bisa ya.'",
    mindfulTip: "Ingat bahwa rasa tidak enak di awal lebih sehat daripada kebencian batin di akhir.",
    courage: 2,
    energy: 1,
    setting: "either",
  },
  {
    id: "bnd-2",
    focus: "boundaries",
    title: "Matikan notifikasi pekerjaan atau media sosial setelah jam 8 malam ini.",
    note: "Malammu adalah ruang suci untuk ketenangan batinmu.",
    whyHelpMentalHealth: "Mencegah 'hypervigilance' (kewaspadaan berlebih) dan mempersiapkan otak untuk tidur restoratif yang nyenyak.",
    microStep: "Aktifkan mode Jangan Ganggu (Do Not Disturb) di ponselmu.",
    mindfulTip: "Nyalakan lampu remang-remang untuk memberi sinyal melatonin pada otak.",
    courage: 1,
    energy: 1,
    setting: "solo",
  },
  {
    id: "bnd-3",
    focus: "boundaries",
    title: "Katakan: 'Boleh aku pikirkan dulu dan kabari besok?' saat diajak sesuatu yang mendadak.",
    note: "Kamu berhak memiliki waktu jeda sebelum membuat komitmen.",
    whyHelpMentalHealth: "Mencegah keputusan reaktif yang memicu penyesalan dan kecemasan pasca-komitmen.",
    microStep: "Gunakan kalimat ini sebagai tanggapan standar otomatis.",
    mindfulTip: "Rasakan kelegaan bahwa kamu tidak harus menjawab detik itu juga.",
    courage: 2,
    energy: 1,
    setting: "either",
  },

  // Connection
  {
    id: "con-1",
    focus: "connection",
    title: "Kirim pesan singkat ke orang yang kamu rindukan tanpa harus merencanakan pertemuan panjang.",
    note: "Koneksi hangat dimulai dari sapaan sederhana.",
    whyHelpMentalHealth: "Meredam isolasi sosial dan menstimulasi hormon ikatan sosial (oxytocin) yang meredakan cemas.",
    microStep: "Kirim pesan: 'Lagi kepikiran kamu, semoga harimu menyenangkan ya!'",
    mindfulTip: "Kirimkan pesan dan lepaskan ekspektasi seberapa cepat mereka harus membalas.",
    courage: 1,
    energy: 1,
    setting: "solo",
  },
  {
    id: "con-2",
    focus: "connection",
    title: "Ceritakan pada satu orang terdekat bahwa kamu sedang merasa agak lelah atau kewalahan akhir-akhir ini.",
    note: "Kerentanan adalah jembatan menuju kedekatan yang nyata.",
    whyHelpMentalHealth: "Membagi beban emosional (co-regulation) terbukti secara klinis menurunkan beban stres subjektif.",
    microStep: "Mulai dengan kalimat pembuka: 'Boleh cerita sebentar? Lagi agak capek belakangan ini.'",
    mindfulTip: "Kamu tidak perlu terlihat selalu kuat di hadapan orang yang tulus menyayangimu.",
    courage: 3,
    energy: 2,
    setting: "together",
  },

  // Burnout & Energy Recovery
  {
    id: "brn-1",
    focus: "burnout",
    title: "Jalan kaki perlahan selama 10 menit di luar ruangan tanpa mendengarkan podcast atau musik.",
    note: "Biarkan matamu melihat daun hijau, langit, dan udara terbuka.",
    whyHelpMentalHealth: "Paparan alam dan 'optic flow' saat jalan kaki menurunkan aktivitas berlebih di default mode network otak.",
    microStep: "Pakai alas kaki dan keluar dari pintu depan rumah.",
    mindfulTip: "Fokuskan pandangan ke cakrawala yang luas untuk merilekskan otot mata.",
    courage: 1,
    energy: 1,
    setting: "solo",
  },
  {
    id: "brn-2",
    focus: "burnout",
    title: "Coret atau tunda satu hal dari daftar to-do list hari ini yang sebenarnya bukan prioritas kritis.",
    note: "Kesehatan mentalmu jauh lebih berharga daripada daftar tugas yang penuh.",
    whyHelpMentalHealth: "Mengurangi beban kognitif dan melatih penerimaan terhadap kapasitas energi manusiawi.",
    microStep: "Pilih satu tugas non-esensial dan pindahkan ke minggu depan.",
    mindfulTip: "Tarik napas lega menyadari bahwa dunia tidak runtuh karena satu tugas ditunda.",
    courage: 2,
    energy: 1,
    setting: "solo",
  },

  // Confidence & Imposter Relief
  {
    id: "conf-1",
    focus: "confidence",
    title: "Tuliskan 3 hal kecil yang berhasil kamu lalui minggu ini, sekecil apa pun itu.",
    note: "Kamu sudah melewati begitu banyak hari yang sulit.",
    whyHelpMentalHealth: "Memprogram ulang bias negatif otak (negativity bias) agar melihat ketangguhan diri sendiri.",
    microStep: "Ingat hal paling sederhana: bangun tidur, mandi, atau menyapa seseorang.",
    mindfulTip: "Hargai dirimu karena tetap bertahan dan terus mencoba.",
    courage: 1,
    energy: 1,
    setting: "solo",
  },
  {
    id: "conf-2",
    focus: "confidence",
    title: "Berdiri tegak, rentangkan tangan ke atas, dan tersenyumlah pada bayanganmu di cermin selama 10 detik.",
    note: "Tubuhmu bisa mengirimkan sinyal rasa aman dan keberanian kembali ke otakmu.",
    whyHelpMentalHealth: "Umpan balik postural (postural biofeedback) memicu pelepasan neurotransmitter kepuasan dan ketenangan.",
    microStep: "Cukup lihat matamu di cermin dan katakan: 'Halo, aku bersamamu.'",
    mindfulTip: "Bernapas dalam-dalam dari diafragma.",
    courage: 2,
    energy: 1,
    setting: "solo",
  },

  // Creative & Play
  {
    id: "crt-1",
    focus: "creative",
    title: "Coret-coret warna atau gambar bebas di kertas selama 5 menit tanpa memikirkan hasilnya harus bagus.",
    note: "Proses bermain adalah terapi alami bagi jiwa yang lelah.",
    whyHelpMentalHealth: "Meredam korteks prefrontal yang terlalu analitis dan memicu kondisi 'flow' yang menyembuhkan.",
    microStep: "Ambil satu pulpen atau spidol warna apa saja.",
    mindfulTip: "Nikmati sensasi goresan tinta di atas kertas.",
    courage: 1,
    energy: 1,
    setting: "solo",
  },

  // Career & Imposter Syndrome
  {
    id: "car-1",
    focus: "career",
    title: "Catat satu kelebihan unik yang kamu miliki dalam caramu bekerja atau berinteraksi dengan orang lain.",
    note: "Nilaimu tidak ditentukan semata-mata oleh metrik atau pujian atasan.",
    whyHelpMentalHealth: "Mengikis sindrom imposter melalui bukti otentik kekuatan diri (strengths-based approach).",
    microStep: "Tuliskan satu kata sifat positif tentang cara kerjamu.",
    mindfulTip: "Biarkan dirimu menerima bahwa kamu memang memiliki kebaikan tersebut.",
    courage: 1,
    energy: 1,
    setting: "solo",
  },
];

function shuffle<T>(items: T[]): T[] {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

export function createDareList(answers: Answers): Dare[] {
  const selectedFocus: FocusArea[] = answers.focus.length > 0 ? answers.focus : ["calm", "compassion"];
  const maxCourage = courageScore[answers.courage];
  const maxEnergy = energyScore[answers.energy];

  const candidates = shuffle(dareIdeas.filter(idea =>
    selectedFocus.includes(idea.focus) && idea.energy <= maxEnergy && idea.courage <= maxCourage &&
    (answers.setting === "either" || idea.setting === "either" || idea.setting === answers.setting)
  )).sort((a, b) => Math.abs(a.courage - maxCourage) - Math.abs(b.courage - maxCourage));

  const chosen: Dare[] = candidates.slice(0, 7).map(({ courage, energy, setting, ...dare }) => dare);

  const intention = answers.intention.trim();
  if (intention) {
    const focus = selectedFocus[0];
    chosen.push({
      id: "your-intention-dare",
      focus,
      title: `Luangkan 10 menit untuk mengambil satu langkah mikro yang paling menenangkan menuju: ${intention}`,
      note: `Dirangkai khusus untuk niat batinmu di area ${focusAreas.find((area) => area.id === focus)?.label ?? "ini"}.`,
      whyHelpMentalHealth: "Mengambil langkah mikro pertama mematahkan spiral penundaan akibat cemas (anxiety-driven avoidance).",
      microStep: "Duduk tenang, tuliskan satu tindakan paling kecil yang bisa selesai dalam 2 menit.",
      mindfulTip: "Tarik napas lembut dan yakini kamu tidak harus menyelesaikan semuanya hari ini.",
      isAiGenerated: false,
    });
  }

  return chosen;
}

export class CrisisError extends Error {
  constructor() { super(crisisMessage); }
}
async function post(path: string, body: unknown) {
  const response = await fetch(path, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body), signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error("AI unavailable");
  const data = await response.json();
  if (data?.source === "crisis") throw new CrisisError();
  return data;
}
export async function fetchAiDares(
  answers: Answers, emotionalState: EmotionalBaseline = "overwhelmed"
): Promise<{ dares: Dare[]; source: Source }> {
  if (needsImmediateHelp(answers.intention)) throw new CrisisError();
  try {
    const data = await post("/api/generate-dares", { ...answers, emotionalState });
    return { dares: daresSchema.parse(data?.dares), source: "ai" };
  } catch (error) {
    if (error instanceof CrisisError) throw error;
    return { dares: createDareList({ ...answers, emotionalState }), source: "fallback" };
  }
}
export async function fetchAiReflection(payload: {
  dareTitle: string; dareFocus?: string; reflectionText: string; emotionalFeeling?: string;
}): Promise<{ feedback: Feedback; source: Source }> {
  if (needsImmediateHelp(`${payload.reflectionText} ${payload.dareTitle} ${payload.emotionalFeeling || ""}`)) throw new CrisisError();
  try {
    const data = await post("/api/reflect-dare", payload);
    return { feedback: feedbackSchema.parse(data?.feedback), source: "ai" };
  } catch (error) {
    if (error instanceof CrisisError) throw error;
    return { source: "fallback", feedback: {
      validation: "AI sedang tidak tersedia. Ini pengingat umum, bukan tanggapan pribadi atas ceritamu. Perasaanmu layak didengarkan.",
      therapeuticInsight: "Kamu boleh mengambil jeda dan mencari dukungan dari orang yang kamu percaya.",
      affirmation: "Aku boleh mencari bantuan dan bergerak sesuai kemampuanku.",
      nextGentleStep: "Jika kamu tidak aman, jangan menunggu AI. Hubungi layanan darurat setempat atau orang tepercaya sekarang.",
    } };
  }
}
export async function fetchMentalCoach(userMessage: string, topic?: string): Promise<{ response: CoachResponse; source: Source }> {
  if (needsImmediateHelp(userMessage)) throw new CrisisError();
  try {
    const data = await post("/api/mental-coach", { userMessage, topic });
    return { response: coachSchema.parse(data?.response), source: "ai" };
  } catch (error) {
    if (error instanceof CrisisError) throw error;
    return { source: "fallback", response: {
      empathy: "AI sedang tidak tersedia. Ini dukungan umum, bukan tanggapan pribadi atas ceritamu. Jika memungkinkan, hubungi orang yang kamu percaya untuk mendengarkanmu.",
      breathingPrompt: "Jika nyaman dan aman, rasakan kaki menyentuh lantai dan bernapaslah secara alami. Kamu boleh berhenti kapan saja.",
    } };
  }
}
