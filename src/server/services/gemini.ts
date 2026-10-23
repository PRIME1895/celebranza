import { GoogleGenAI } from '@google/genai';
import { MODELS } from '../config/models.ts';

const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';

export let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'celebranza-build',
      },
    },
  });
}

/**
 * Robust wrapper for Gemini model invocations with exponential backoff for transient 503 surges
 */
export async function generateContentWithRetry<T = any>(
  aiClient: GoogleGenAI,
  params: Parameters<GoogleGenAI['models']['generateContent']>[0],
  maxRetries = 2
): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await aiClient.models.generateContent(params);
      return response as unknown as T;
    } catch (err: unknown) {
      lastErr = err;
      const errorMsg = err instanceof Error ? err.message : String(err);
      const is503 =
        (typeof err === 'object' && err !== null && 'status' in err && (err as { status: number }).status === 503) ||
        errorMsg.includes('503') ||
        errorMsg.includes('high demand') ||
        errorMsg.includes('UNAVAILABLE');

      if (is503 && attempt < maxRetries) {
        console.warn(`[Gemini 503 retry] Model busy, retrying attempt ${attempt + 1}/${maxRetries} after backoff...`);
        await new Promise((res) => setTimeout(res, (attempt + 1) * 900));
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}

/**
 * Text-to-Speech synthesis with canonical TTS models and graceful fallback
 */
export async function synthesize(text: string): Promise<{ b64: string; model: string } | null> {
  if (!ai) return null;
  for (const model of [MODELS.tts, MODELS.ttsFallback]) {
    try {
      const r = await generateContentWithRetry(ai, {
        model,
        contents: [{ role: 'user', parts: [{ text }] }],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
        },
      });
      const b64 = r.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (b64) return { b64, model };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`TTS ${model} failed:`, msg);
    }
  }
  return null;
}
