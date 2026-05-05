// gemini setup -- key + model from env, default to 2.5-flash if not set

import { GoogleGenerativeAI, type GenerativeModel } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const modelName = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash';

export const genAI = new GoogleGenerativeAI(apiKey);

// helper so we dont repeat the same generationConfig everywhere
export function getGeminiModel(systemInstruction?: string): GenerativeModel {
  return genAI.getGenerativeModel({
    model: modelName,
    systemInstruction,
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      maxOutputTokens: 1024,
    },
  });
}
