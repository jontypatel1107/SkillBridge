import { env } from "../config/env";

const GEMINI_MODEL = "gemini-2.5-flash";

export async function generateWithGemini(prompt: string): Promise<string> {
  if (!env.gemini.apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set. Add it to your .env to enable AI features."
    );
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${env.gemini.apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errText}`);
  }

  const data = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  return text;
}

// Asks Gemini to respond with ONLY JSON, then parses it — throws a clear
// error if the model didn't comply, so callers can decide how to handle it.
export async function generateJsonWithGemini<T>(prompt: string): Promise<T> {
  const strictPrompt = `${prompt}\n\nRespond with ONLY valid JSON. No markdown code fences, no preamble, no explanation — just the raw JSON object.`;
  const raw = await generateWithGemini(strictPrompt);
  const cleaned = raw.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new Error("Gemini did not return valid JSON");
  }
}
