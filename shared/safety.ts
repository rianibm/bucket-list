// Conservative routing, not a clinical diagnosis. Safety help remains visible for every message.
export function needsImmediateHelp(message: string): boolean {
  return /suicid|self[ -]?harm|kill myself|hurt myself|end my life|want to die|wanna die|bunuh diri|menyakiti diri|melukai diri|mengakhiri hidup|ingin mati|mau mati|tidak ingin hidup|nggak mau hidup|overdose|overdosis|immediate danger|tidak aman|tak aman|in danger|hurt someone|kill someone|membunuh|melukai orang/i.test(message);
}
export const crisisMessage = "Jika kamu atau orang lain dalam bahaya, hubungi layanan darurat setempat sekarang (119 untuk darurat medis di Indonesia) atau pergi ke IGD terdekat. Minta orang tepercaya menemanimu dan menjauh dari benda yang dapat melukai jika aman dilakukan. Jangan menunggu balasan AI. Untuk dukungan psikologis di Indonesia, kunjungi healing119.id. Jika di luar Indonesia, gunakan nomor darurat setempat.";
