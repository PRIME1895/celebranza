/**
 * Canonical Gemini Model & Server Configuration for Celebranza
 */

export const MODELS = {
  text: 'gemini-3.5-flash',
  tts: 'gemini-3.8-flash-tts',
  ttsFallback: 'gemini-3.8-flash-lite-tts',
} as const;

export const SERVER_CONFIG = {
  defaultPort: 3000,
  allowedOrigin: process.env.APP_URL || 'https://celebranza.vercel.app',
  apiRateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
  },
  aiRateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
  },
  bodyLimit: '50kb',
} as const;
