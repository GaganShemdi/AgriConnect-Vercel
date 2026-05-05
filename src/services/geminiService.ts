
// kisanmitra brain -- builds the system prompt + wraps gemini calls
// (chat stream, single ask, leaf photo diagnosis)

import { getGeminiModel } from '../config/gemini';
import type { ChatMessage, Language } from '../types';

interface FarmerContext {
  name?: string;
  state?: string;
  language?: Language;
  crops?: string[];
  season?: string;
  weather?: { temp: number; description: string };
}

const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  hi: 'Hindi',
  kn: 'Kannada',
  te: 'Telugu',
  ta: 'Tamil',
  mr: 'Marathi',
  bn: 'Bengali',
};

// system prompt = persona + guardrails handed to gemini
function buildSystemPrompt(ctx: FarmerContext): string {
  const languageName = LANGUAGE_NAMES[ctx.language ?? 'en'];
  const crops = ctx.crops?.length ? ctx.crops.join(', ') : 'mixed crops';
  const state = ctx.state ?? 'India';
  const season = ctx.season ?? currentSeason();
  const weather = ctx.weather
    ? `${ctx.weather.temp}°C, ${ctx.weather.description}`
    : 'typical for the season';

  return `You are KisanMitra — an expert agricultural advisor for Indian farmers.

ALWAYS respond in ${languageName}. Use simple words suitable for rural farmers.

Farmer Profile:
- Name: ${ctx.name ?? 'Farmer'}
- State: ${state}
- Crops: ${crops}
- Current Season: ${season}
- Current Weather: ${weather}

Guidelines:
- Be concise, practical, and step-by-step.
- For pest/disease questions, ask for a photo if one hasn't been provided.
- For pricing questions, reference current mandi trends.
- Avoid jargon; prefer everyday language.
- If uncertain, advise consulting the local Krishi Vigyan Kendra (KVK).`;
}

// rough season detection by month -- jun-oct kharif, nov-mar rabi, rest zaid
function currentSeason(): string {
  const m = new Date().getMonth() + 1;
  if (m >= 6 && m <= 10) return 'Kharif (monsoon)';
  if (m >= 11 || m <= 3) return 'Rabi (winter)';
  return 'Zaid (summer)';
}

// streaming chat -- pumps tokens via onChunk as they arrive
export async function streamChat(
  history: ChatMessage[],
  message: string,
  ctx: FarmerContext,
  onChunk: (text: string) => void
): Promise<string> {
  const model = getGeminiModel(buildSystemPrompt(ctx));
  const chat = model.startChat({
    history: history.map((h) => ({
      role: h.role,
      parts: [{ text: h.content }],
    })),
  });

  let full = '';
  try {
    const result = await chat.sendMessageStream(message);
    for await (const chunk of result.stream) {
      const text = chunk.text();
      full += text;
      onChunk(text);
    }
    return full;
  } catch (err) {
    console.error('Gemini streamChat error', err);
    const fallback =
      'I could not reach the advisory service just now. Please check your Gemini API key and network connection, then try again.';
    onChunk(fallback);
    return fallback;
  }
}

export async function askOnce(prompt: string, ctx: FarmerContext): Promise<string> {
  const model = getGeminiModel(buildSystemPrompt(ctx));
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.error('Gemini askOnce error', err);
    return 'Unable to fetch a response right now. Please try again.';
  }
}

// leaf photo -> diagnosis, multimodal call
export async function analyzeCropImage(
  imageBase64: string,
  mimeType: string,
  ctx: FarmerContext
): Promise<string> {
  const model = getGeminiModel(buildSystemPrompt(ctx));
  try {
    const result = await model.generateContent([
      {
        text: 'Identify the crop and any visible disease or pest in this leaf image. Suggest practical, low-cost treatment.',
      },
      { inlineData: { data: imageBase64, mimeType } },
    ]);
    return result.response.text();
  } catch (err) {
    console.error('Gemini image analysis error', err);
    return 'Image analysis failed. Please try again with a clearer photo.';
  }
}


// daily AI tip shown on home -- cached in-memory for 6h per (lang, state, crops, weather)
// so we dont blow through quota on every re-render
const tipCache = new Map<string, { tip: string; ts: number }>();
const TIP_TTL_MS = 6 * 60 * 60 * 1000;

export async function dailyTip(ctx: FarmerContext): Promise<string> {
  const key = `${ctx.language ?? 'en'}|${ctx.state ?? ''}|${(ctx.crops || []).join(',')}|${
    ctx.weather?.description ?? ''
  }`;
  const cached = tipCache.get(key);
  if (cached && Date.now() - cached.ts < TIP_TTL_MS) return cached.tip;

  const model = getGeminiModel(buildSystemPrompt(ctx));
  const prompt = `Give me ONE short, practical farming tip for today in 2 to 3 sentences. Make it specific to my crops, my state, the current season, and today's weather. Start the tip with a single relevant emoji. Do not greet me, do not list multiple tips, do not ask follow-up questions.`;
  try {
    const result = await model.generateContent(prompt);
    const t = (result.response.text() || '').trim();
    if (!t) {
      return 'Check your crops every morning, water early, and watch for pests on new leaves.';
    }
    tipCache.set(key, { tip: t, ts: Date.now() });
    return t;
  } catch (err) {
    console.error('Gemini dailyTip error', err);
    return 'Check your crops every morning, water early, and watch for pests on new leaves.';
  }
}
