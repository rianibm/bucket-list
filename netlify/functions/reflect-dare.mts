import { GoogleGenAI } from "@google/genai";
import type { Config, Context } from "@netlify/functions";

interface ReflectBody {
  dareTitle: string;
  dareFocus?: string;
  reflectionText: string;
  emotionalFeeling?: string;
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
    const body: ReflectBody = await req.json().catch(() => ({}));
    const { dareTitle, dareFocus = "general", reflectionText, emotionalFeeling = "lega" } = body;

    const prompt = `
Anda adalah seorang konselor psikologi mental health dan pakar mindful self-compassion.
Pengguna baru saja mencoba atau merefleksikan sebuah tantangan keberanian mikro (dare) untuk kesehatan mentalnya:

- Tantangan yang dihadapi: "${dareTitle}"
- Area Fokus: "${dareFocus}"
- Perasaan yang dialami: "${emotionalFeeling}"
- Curahan hati / Refleksi pengguna: "${reflectionText}"

Tugas:
Berikan umpan balik terapeutik yang sangat hangat, memvalidasi emosi mereka, dan memperkuat keberanian mereka melalui kacamata neurobiologi/kesehatan mental.

Format Output WAJIB berupa JSON Object murni tanpa markdown (tanpa \`\`\`json):
{
  "validation": "Validasi penuh empati atas apa yang mereka rasakan (2-3 kalimat)",
  "therapeuticInsight": "Wawasan psikologis mengapa langkah kecil ini penting bagi otak dan pemulihan mental mereka (2 kalimat)",
  "affirmation": "Satu afirmasi batin yang kuat dan menenangkan (1 kalimat)",
  "nextGentleStep": "Saran langkah pemeliharaan diri (self-care) ringan untuk sisa hari ini"
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
        throw new Error("Could not parse reflection output as JSON");
      }
    }

    return new Response(JSON.stringify({ feedback: result, source: "gemini-2.5-flash" }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: any) {
    console.error("AI Reflection error:", error);
    return new Response(
      JSON.stringify({
        error: "Gagal memproses refleksi dengan AI",
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
  path: "/api/reflect-dare",
};
