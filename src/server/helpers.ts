/**
 * Celebranza Server-Side Helper Functions
 * Shared across Express API routes and Node.js test suites
 */

/**
 * Sanitizes and caps untrusted string input
 */
export function sanitizeInput(text: unknown, maxLength: number = 600): string {
  if (typeof text !== 'string') return '';
  return text.trim().slice(0, maxLength);
}

/**
 * Strips dangerous HTML/XML injection vectors from SVG markup
 */
export function sanitizeSvg(svg: string): string {
  if (!svg || typeof svg !== 'string') return '';
  return svg
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
    .trim();
}

/**
 * XML/SVG safe entity encoder for titles, taglines, and attributes
 */
export function escapeXml(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Safe JSON parser resilient to LLM markdown wrappers, bad control characters, and truncated tokens
 */
export function safeJsonParse<T>(rawText: string, fallback: T): T {
  if (!rawText || typeof rawText !== 'string') return fallback;
  try {
    return JSON.parse(rawText);
  } catch {
    try {
      let cleaned = rawText.replace(/```(?:json)?\s*([\s\S]*?)\s*```/i, '$1').trim();
      // Remove unescaped control characters (0x00 - 0x1F) except standard whitespace
      cleaned = cleaned.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
      return JSON.parse(cleaned);
    } catch {
      const match = rawText.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
      if (match) {
        try {
          const stripped = match[0].replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
          return JSON.parse(stripped);
        } catch {}
      }
      return fallback;
    }
  }
}

/**
 * Prepends a standard 44-byte RIFF WAV audio header to raw 16-bit linear PCM audio buffers
 */
export function addWavHeader(
  pcmBuffer: Buffer,
  sampleRate: number = 24000,
  numChannels: number = 1,
  bitDepth: number = 16
): Buffer {
  if (pcmBuffer.length >= 4 && pcmBuffer.toString('ascii', 0, 4) === 'RIFF') {
    return pcmBuffer;
  }
  const byteRate = sampleRate * numChannels * (bitDepth / 8);
  const blockAlign = numChannels * (bitDepth / 8);
  const header = Buffer.alloc(44);

  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcmBuffer.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // Linear PCM format
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitDepth, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcmBuffer.length, 40);

  return Buffer.concat([header, pcmBuffer]);
}
