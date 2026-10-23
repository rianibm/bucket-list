import { GoogleGenAI } from "@google/genai";
import type { Config, Context } from "@netlify/functions";

interface RequestBody {
  focus?: string[];
  courage?: "gentle" | "stretch" | "bold";
  energy?: "quiet" | "some" | "open";
  setting?: "solo" | "together" | "either";
  intention?: string;
  emotionalState?: "overwhelmed" | "exhausted" | "isolated" | "self_critical" | "ready_to_grow";
}

function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.NETLIFY_AI_GATEWAY_KEY;
  const baseUrl =
    process.env.GOOGLE_GEMINI_BASE_URL ||
    (process.env.NETLIFY_AI_GATEWAY_URL ? process.env.NETLIFY_AI_GATEWAY_URL.replace(/\/$/, "") : undefined);

  if (apiKey) {
    return new GoogleGenAI({
      apiKey,
      ...(baseUrl ? { httpOptions: { baseUrl } } : {}),
    });
  }
  return new GoogleGenAI({});
}

export default async (req: Request, _context: Context) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body: RequestBody = await req.json().catch(() => ({}));
    const {
      focus = ["anxiety", "confidence"],
      courage = "gentle",
      energy = "some",
      setting = "either",
      intention = "",
      emotionalState = "overwhelmed",
    } = body;

    const emotionalStateContextMap: Record<string, string> = {
      overwhelmed: "User sedang merasa cemas, pikiran penuh (overthinking), dan rentan merasa terbebani. Butuh langkah yang sangat lembut, menenangkan sistem saraf parasimpatis, dan tanpa tekanan performa.",
      exhausted: "User mengalami kelelahan emosional atau tanda burnout. Sangat membutuhkan izin untuk beristirahat, menetapkan batasan tanpa rasa bersalah, dan pemulihan energi batin.",
      isolated: "User merasa kesepian atau terputus dari orang lain, namun cemas untuk membuka diri. Butuh jembatan koneksi mikro yang aman tanpa risiko emosional yang tinggi.",
      self_critical: "User sering menghakimi diri sendiri, merasa serba kurang (imposter syndrome). Butuh latihan self-compassion, memaafkan ketidaksempurnaan, dan merayakan hal kecil.",
      ready_to_grow: "User merasa stabil dan siap memperluas zona nyaman secara sadar dan bertahap melalui tantangan keberanian yang bermakna.",
    };

    const emotionalContext = emotionalStateContextMap[emotionalState] || emotionalStateContextMap.overwhelmed;

    const prompt = `
Anda adalah psikolog klinis berempati dan pelatih aktivasi perilaku (Behavioral Activation Coach) untuk kesehatan mental dan kesejahteraan emosional ("Little Yes" / Keberanian Mikro).

Konteks Emosional Pengguna Saat Ini:
- Kondisi Batin: ${emotionalState} (${emotionalContext})
- Area Fokus: ${focus.join(", ")}
- Tingkat Tantangan: ${courage} (gentle = sangat lembut/tanpa cemas, stretch = sedikit menantang tapi aman, bold = keberanian keluar kebiasaan)
- Energi & Waktu: ${energy} (quiet = hemat energi/bisa di rumah, some = energi sedang, open = energi terbuka)
- Preferensi Ruang: ${setting} (solo, together, or either)
- Niat / Hal yang sedang dihadapi: "${intention || "Ingin merasa lebih tenang dan berani melangkah"}"

Tugas:
Buat daftar 6 tantangan keberanian mikro (dare) yang dirancang khusus untuk memulihkan dan menyehatkan mental pengguna.

Prinsip Klinis & Psikologis:
1. Berbasis Behavioral Activation (CBT), Mindful Self-Compassion, dan Regulasi Sistem Saraf (Somatic Safety).
2. Tantangan bukan aksi nekat/ekstrem, melainkan langkah mikro yang bermakna untuk mengurai overthinking, memulihkan koneksi sosial aman, atau melatih batasan diri.
3. Bahasa Indonesia: Hangat, empatik, menenangkan, tidak menghakimi, dan memvalidasi perasaan.

Format Output WAJIB berupa JSON Array murni tanpa markdown pembungkus (tanpa \`\`\`json):
[
  {
    "id": "ai-1",
    "title": "Tantangan singkat dan jelas (1 kalimat ramah)",
    "focus": "${focus[0] || "calm"}",
    "note": "Catatan pengingat hangat untuk batin pengguna",
    "whyHelpMentalHealth": "Penjelasan ilmiah/psikologis mengapa ini menyehatkan mental (1-2 kalimat, misal: 'Mengurangi beban amigdala dan melatih otak bahwa tidak ada bahaya saat mengambil jeda.')",
    "microStep": "Langkah pertama ultra-mudah (< 2 menit) untuk mengatasi rasa malas/cemas saat memulai",
    "mindfulTip": "Panduan napas atau grounding jika rasa cemas mendadak muncul saat melakukannya"
  }
]
`;

    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const rawText = response.text || "";
    // Clean code fences if present
    const cleanedText = rawText.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
    
    let dares = [];
    try {
      dares = JSON.parse(cleanedText);
    } catch {
      // If parsing fails, extract array using regex
      const match = cleanedText.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (match) {
        dares = JSON.parse(match[0]);
      } else {
        throw new Error("Could not parse AI response as JSON");
      }
    }

    // Ensure array format and enrich with ai flag
    const enrichedDares = Array.isArray(dares)
      ? dares.map((d, index) => ({
          ...d,
          id: d.id || `ai-${Date.now()}-${index}`,
          isAiGenerated: true,
        }))
      : [];

    return new Response(JSON.stringify({ dares: enrichedDares, source: "gemini-2.5-flash" }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: any) {
    console.error("AI Generation error:", error);
    return new Response(
      JSON.stringify({
        error: "Gagal memanggil model AI",
        details: error?.message || "Unknown error",
        fallbackAvailable: true,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
};

export const config: Config = {
  path: "/api/generate-dares",
};
