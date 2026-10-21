export const focusAreas = [
  { id: "connection", label: "Hubungan & kedekatan", note: "Menyampaikan rasa dan membuka diri" },
  { id: "confidence", label: "Percaya diri", note: "Lebih nyaman jadi diri sendiri" },
  { id: "boundaries", label: "Memilih diri sendiri", note: "Berani berkata tidak dan minta yang dibutuhkan" },
  { id: "creative", label: "Kreativitas", note: "Mencoba, membuat, dan menunjukkan karya" },
  { id: "adventure", label: "Pengalaman baru", note: "Keluar dari rutinitas dengan cara yang terasa aman" },
  { id: "career", label: "Karier & uang", note: "Menghargai kemampuan dan mencoba peluang" },
] as const;

export type FocusArea = (typeof focusAreas)[number]["id"];
export type CourageLevel = "gentle" | "stretch" | "bold";
export type SettingPreference = "solo" | "together" | "either";
export type EnergyPreference = "quiet" | "some" | "open";

export type Answers = {
  focus: FocusArea[];
  courage: CourageLevel;
  energy: EnergyPreference;
  setting: SettingPreference;
  intention: string;
};

export type Dare = {
  id: string;
  title: string;
  focus: FocusArea;
  note: string;
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
  { id: "c-1", focus: "connection", title: "Kirim pesan tulus ke seseorang yang akhir-akhir ini kamu pikirkan.", note: "Dekat tanpa harus membuat momen besar.", courage: 1, energy: 1, setting: "solo" },
  { id: "c-2", focus: "connection", title: "Ajak seseorang ngobrol 15 menit, tanpa agenda selain ingin tahu kabarnya.", note: "Koneksi dimulai dari rasa ingin tahu.", courage: 2, energy: 1, setting: "together" },
  { id: "c-3", focus: "connection", title: "Katakan satu hal yang kamu hargai dari seseorang—secara spesifik.", note: "Biar mereka tahu kamu benar-benar memperhatikan.", courage: 2, energy: 1, setting: "together" },
  { id: "c-4", focus: "connection", title: "Ungkapkan perasaanmu dengan jujur, tanpa menyamarkannya jadi candaan.", note: "Kamu boleh jujur tanpa mengatur jawaban orang lain.", courage: 3, energy: 1, setting: "together" },
  { id: "c-5", focus: "connection", title: "Usulkan rencana sederhana dengan seseorang yang ingin lebih dekat denganmu.", note: "Satu ajakan kecil sudah termasuk berani.", courage: 2, energy: 2, setting: "together" },
  { id: "c-6", focus: "connection", title: "Minta ditemani karena kamu ingin ada teman, bukan karena harus ada alasan.", note: "Menerima kehadiran orang lain juga sebuah keberanian.", courage: 3, energy: 1, setting: "together" },
  { id: "c-7", focus: "connection", title: "Tanyakan pertanyaan yang selama ini kamu tahan karena takut jawabannya.", note: "Pilih waktu dan cara yang tetap terasa aman untukmu.", courage: 3, energy: 1, setting: "together" },
  { id: "c-8", focus: "connection", title: "Tulis surat pendek untuk seseorang yang berarti, lalu putuskan sendiri apakah mau mengirimnya.", note: "Kamu tidak harus mengirimnya agar perasaanmu valid.", courage: 2, energy: 1, setting: "solo" },

  { id: "p-1", focus: "confidence", title: "Pakai sesuatu yang kamu suka, tanpa menunggu ada acara khusus.", note: "Selera kamu tidak perlu persetujuan siapa pun.", courage: 1, energy: 1, setting: "solo" },
  { id: "p-2", focus: "confidence", title: "Pilih satu hal kecil hari ini tanpa meminta pendapat siapa pun dulu.", note: "Perhatikan rasanya mempercayai keputusanmu sendiri.", courage: 2, energy: 1, setting: "solo" },
  { id: "p-3", focus: "confidence", title: "Pergi sendiri ke tempat nyaman dan pesan hal yang benar-benar kamu inginkan.", note: "Temani dirimu sendiri dengan baik.", courage: 2, energy: 2, setting: "solo" },
  { id: "p-4", focus: "confidence", title: "Terima pujian dengan bilang “terima kasih”, tanpa mengecilkan diri.", note: "Kamu tidak perlu membantah hal baik tentang dirimu.", courage: 2, energy: 1, setting: "together" },
  { id: "p-5", focus: "confidence", title: "Bagikan opini atau karya yang kamu banggakan meski belum terasa sempurna.", note: "Versi yang nyata lebih berani dari versi sempurna di kepala.", courage: 3, energy: 1, setting: "either" },
  { id: "p-6", focus: "confidence", title: "Lakukan satu hal dengan caramu sendiri, tanpa menjelaskan pilihanmu.", note: "Pilihan sederhana tidak harus menjadi pembelaan.", courage: 3, energy: 1, setting: "solo" },
  { id: "p-7", focus: "confidence", title: "Coba kelas pemula yang menarik perhatianmu—datang sebagai pemula saja.", note: "Kamu tidak perlu sudah jago untuk mulai.", courage: 2, energy: 2, setting: "together" },
  { id: "p-8", focus: "confidence", title: "Catat satu hal yang kamu lakukan dengan baik minggu ini, sekecil apa pun.", note: "Beri dirimu kredit yang pantas.", courage: 1, energy: 1, setting: "solo" },

  { id: "b-1", focus: "boundaries", title: "Tolak satu permintaan kecil yang memang tidak ingin kamu ambil.", note: "Jawaban singkat tetap merupakan jawaban lengkap.", courage: 2, energy: 1, setting: "either" },
  { id: "b-2", focus: "boundaries", title: "Minta waktu sebelum menjawab permintaan yang belum kamu yakini.", note: "Kamu boleh berpikir dulu.", courage: 1, energy: 1, setting: "either" },
  { id: "b-3", focus: "boundaries", title: "Sampaikan satu kebutuhanmu dengan kalimat langsung dan sederhana.", note: "Beri orang lain kesempatan untuk memahami kamu.", courage: 2, energy: 1, setting: "together" },
  { id: "b-4", focus: "boundaries", title: "Biarkan orang lain kecewa sebentar tanpa buru-buru memperbaiki perasaannya.", note: "Kamu bisa peduli tanpa mengambil alih semuanya.", courage: 3, energy: 1, setting: "either" },
  { id: "b-5", focus: "boundaries", title: "Delegasikan satu hal yang biasanya otomatis kamu tangani sendiri.", note: "Tidak semua hal harus kamu pikul.", courage: 2, energy: 1, setting: "together" },
  { id: "b-6", focus: "boundaries", title: "Minta teman mendengarkan ceritamu dulu, tanpa langsung memberi solusi.", note: "Kebutuhanmu layak disebutkan.", courage: 2, energy: 1, setting: "together" },
  { id: "b-7", focus: "boundaries", title: "Berhenti sejenak sebelum bilang “iya”; cek dulu apa yang kamu rasakan.", note: "Jeda kecil bisa mengubah jawabanmu.", courage: 1, energy: 1, setting: "solo" },
  { id: "b-8", focus: "boundaries", title: "Pilih sesuatu yang kamu inginkan meski pilihan orang lain berbeda.", note: "Perbedaan bukan berarti kamu mengecewakan mereka.", courage: 3, energy: 1, setting: "either" },

  { id: "k-1", focus: "creative", title: "Buat sesuatu selama 20 menit dan berhenti sebelum mulai mengkritiknya.", note: "Prosesnya boleh lebih penting dari hasil.", courage: 1, energy: 1, setting: "solo" },
  { id: "k-2", focus: "creative", title: "Coba aktivitas kreatif yang belum pernah kamu lakukan, khusus untuk bersenang-senang.", note: "Tidak harus berubah jadi proyek serius.", courage: 1, energy: 1, setting: "solo" },
  { id: "k-3", focus: "creative", title: "Bagikan draf atau karya yang masih terasa sedikit berantakan.", note: "Biarkan orang melihat proses, bukan hanya hasil akhir.", courage: 3, energy: 1, setting: "either" },
  { id: "k-4", focus: "creative", title: "Ikuti lokakarya pemula di luar bidang yang biasanya kamu tekuni.", note: "Jadi orang baru di ruangan itu adalah bagian dari serunya.", courage: 2, energy: 2, setting: "together" },
  { id: "k-5", focus: "creative", title: "Buat proyek mini yang tidak perlu berguna untuk siapa pun.", note: "Kesenangan tidak harus menghasilkan sesuatu.", courage: 1, energy: 1, setting: "solo" },
  { id: "k-6", focus: "creative", title: "Ceritakan hal yang kamu sukai selama lima menit tanpa menyiapkan presentasi.", note: "Antusiasmemu adalah persiapan yang cukup.", courage: 2, energy: 1, setting: "together" },
  { id: "k-7", focus: "creative", title: "Minta satu masukan untuk karyamu dan dengarkan sebelum menjelaskan.", note: "Kamu boleh memikirkan masukan itu nanti.", courage: 3, energy: 1, setting: "either" },
  { id: "k-8", focus: "creative", title: "Tunjukkan karya yang kamu suka kepada satu orang yang kamu percaya.", note: "Mulai dari lingkaran yang terasa aman.", courage: 2, energy: 1, setting: "together" },

  { id: "a-1", focus: "adventure", title: "Pilih film secara spontan dan nikmati waktu sendiri di bioskop.", note: "Tidak perlu membuat itinerary untuk malam yang menyenangkan.", courage: 1, energy: 2, setting: "solo" },
  { id: "a-2", focus: "adventure", title: "Coba makanan dari tempat baru tanpa membaca semua ulasan dulu.", note: "Biar rasa penasaran memilih kali ini.", courage: 1, energy: 1, setting: "either" },
  { id: "a-3", focus: "adventure", title: "Kunjungi toko buku, galeri kecil, atau kafe baru yang dekat dari rumah.", note: "Petualangan tidak harus jauh atau melelahkan.", courage: 1, energy: 2, setting: "either" },
  { id: "a-4", focus: "adventure", title: "Hadiri acara kecil yang menarik, meski kamu belum kenal siapa-siapa.", note: "Kamu boleh pulang kapan pun jika sudah cukup.", courage: 3, energy: 2, setting: "together" },
  { id: "a-5", focus: "adventure", title: "Jelajahi satu tempat baru dengan rencana yang sengaja dibuat longgar.", note: "Sisakan ruang untuk kejutan yang menyenangkan.", courage: 2, energy: 3, setting: "either" },
  { id: "a-6", focus: "adventure", title: "Minta rekomendasi buku atau film ke orang yang seleranya berbeda darimu.", note: "Coba sesuatu dari sudut pandang orang lain.", courage: 2, energy: 1, setting: "together" },
  { id: "a-7", focus: "adventure", title: "Buat makan malam sederhana dari resep negara yang belum pernah kamu coba.", note: "Tidak harus sempurna untuk jadi pengalaman baru.", courage: 1, energy: 2, setting: "solo" },
  { id: "a-8", focus: "adventure", title: "Datang ke acara budaya atau komunitas yang biasanya kamu kira bukan untukmu.", note: "Rasa ingin tahu sudah cukup jadi alasan.", courage: 3, energy: 2, setting: "together" },

  { id: "w-1", focus: "career", title: "Catat tiga hal yang kamu kerjakan dengan baik dan siapa yang terbantu karenanya.", note: "Nilai kerja kamu layak terlihat olehmu sendiri.", courage: 1, energy: 1, setting: "solo" },
  { id: "w-2", focus: "career", title: "Kirim pesan ke seseorang yang pekerjaannya membuatmu penasaran.", note: "Satu percakapan bisa membuka kemungkinan baru.", courage: 2, energy: 1, setting: "together" },
  { id: "w-3", focus: "career", title: "Ajukan harga atau kompensasi yang menurutmu adil, tanpa langsung menurunkannya.", note: "Latih mengatakan angka itu dengan tenang.", courage: 3, energy: 1, setting: "either" },
  { id: "w-4", focus: "career", title: "Lamar satu peluang yang menarik meski kamu belum memenuhi semua poin.", note: "Kamu boleh membiarkan mereka menilai kecocokanmu.", courage: 3, energy: 1, setting: "solo" },
  { id: "w-5", focus: "career", title: "Bagikan satu hal yang kamu pelajari dari pekerjaan atau proyek terakhirmu.", note: "Pengalamanmu bisa berguna untuk orang lain.", courage: 2, energy: 1, setting: "either" },
  { id: "w-6", focus: "career", title: "Pilih satu ide proyek kecil dan tentukan langkah pertama yang bisa selesai 20 menit.", note: "Mulai lebih penting daripada rencana yang sempurna.", courage: 1, energy: 1, setting: "solo" },
  { id: "w-7", focus: "career", title: "Tanyakan tarif atau anggaran sebelum menawarkan diskon pada dirimu sendiri.", note: "Cari kejelasan sebelum berasumsi.", courage: 2, energy: 1, setting: "together" },
  { id: "w-8", focus: "career", title: "Rayakan satu pencapaian kerja dengan sesuatu kecil yang kamu nikmati.", note: "Kamu boleh menikmati hasil usahamu.", courage: 1, energy: 1, setting: "either" },
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
  const selectedFocus: FocusArea[] = answers.focus.length > 0 ? answers.focus : ["confidence"];
  const maxCourage = courageScore[answers.courage];
  const maxEnergy = energyScore[answers.energy];
  const candidates = shuffle(
    dareIdeas
      .filter((idea) => selectedFocus.includes(idea.focus) && idea.energy <= maxEnergy)
      .map((idea) => {
        const levelDistance = Math.abs(idea.courage - maxCourage);
        const aboveRequestedLevel = idea.courage > maxCourage ? 4 : 0;
        const settingMismatch =
          answers.setting !== "either" && idea.setting !== "either" && idea.setting !== answers.setting ? 2 : 0;
        return { idea, score: levelDistance + aboveRequestedLevel + settingMismatch };
      })
      .sort((first, second) => first.score - second.score)
      .map(({ idea }) => idea),
  );
  const chosen: Dare[] = candidates.slice(0, 8).map(({ courage, energy, setting, ...dare }) => dare);

  const intention = answers.intention.trim();
  if (intention) {
    const focus = selectedFocus[0];
    chosen.push({
      id: "your-idea",
      focus,
      title: `Luangkan 15 menit untuk mengambil satu langkah kecil menuju: ${intention}`,
      note: `Kamu memilih ${focusAreas.find((area) => area.id === focus)?.label.toLowerCase() ?? "hal ini"} sebagai area fokusmu.`,
    });
  }

  return chosen;
}
