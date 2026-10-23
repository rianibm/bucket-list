import { GoogleGenAI } from "@google/genai";
import type { Config, Context } from "@netlify/functions";

interface CoachBody {
  userMessage: string;
  topic?: "overthinking" | "boundary" | "burnout" | "imposter" | "social_anxiety" | "general";
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
    const body: CoachBody = await req.json().catch(() => ({ userMessage: "" }));
    const { userMessage, topic = "general" } = body;

    if (!userMessage || userMessage.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Pesan tidak boleh kosong" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const prompt = `
Anda adalah konselor kesehatan mental yang hangat, berlandaskan Cognitive Behavioral Therapy (CBT) dan Acceptance & Commitment Therapy (ACT).
Pengguna sedang berada di "Ruang Teduh Little Yes" dan membagikan kegelisahan mentalnya saat ini:

- Topik/Kategori: ${topic}
- Pesan/Curhat Pengguna: "${userMessage}"

Tugas:
1. Berikan validasi empati seketika agar sistem saraf pengguna merasa aman dan didengar (tanpa toxic positivity).
2. Tawarkan reframing kognitif yang lembut untuk meluruskan distorsi pikiran (seperti catastrophizing, mind reading, atau self-blame).
3. Berikan 1 panduan grounding fisik/pernapasan instan.
4. Hadirkan 1 "Little Yes" (tantangan keberanian mikro yang sangat mudah dan menenangkan) yang bisa langsung mereka lakukan sekarang untuk keluar dari jebakan pikiran.

Format Output WAJIB berupa JSON Object murni tanpa markdown (tanpa \`\`\`json):
{
  "empathy": "Kalimat penerimaan dan validasi emosi (2-3 kalimat hangat)",
  "reframe": "Sudut pandang baru yang lebih welas asih dan realistis (2 kalimat)",
  "breathingPrompt": "1 latihan regulasi napas/indra sederhana (misal: 'Tarik napas lembut selama 4 detik, tahan 4 detik, embuskan panjang 6 detik...')",
  "recommendedDare": {
    "title": "Aksi mikro 1 kalimat yang menenangkan",
    "note": "Pengingat lembut saat melakukannya",
    "focus": "calm",
    "whyHelpMentalHealth": "Mengapa tindakan kecil ini membantu meredakan badai pikiran",
    "microStep": "Langkah awal terkecil detik ini"
  }
}
`;

    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const rawText = response.text || "";
    const cleanedText = rawText.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();

    let result;
    try {
      result = JSON.parse(cleanedText);
    } catch {
      const match = cleanedText.match(/\{[\s\S]*\}/);
      if (match) {
        result = JSON.parse(match[0]);
      } else {
        throw new Error("Could not parse coach output as JSON");
      }
    }

    return new Response(JSON.stringify({ response: result, source: "gemini-2.5-flash" }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: any) {
    console.error("AI Coach error:", error);
    return new Response(
      JSON.stringify({
        error: "Gagal memproses bimbingan AI",
        details: error?.message || "Unknown error",
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
  path: "/api/mental-coach",
};
