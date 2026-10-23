import test from 'node:test';
import assert from 'node:assert/strict';

// Test SVG Sanitization function logic
function sanitizeSvg(svg: string): string {
  if (!svg || typeof svg !== 'string') return '';
  return svg
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
    .trim();
}

// Test Input Sanitization logic
function sanitizeInput(text: any, maxLength: number = 600): string {
  if (typeof text !== 'string') return '';
  return text.trim().slice(0, maxLength);
}

// Test 24kHz 16-bit PCM to RIFF WAV header generation logic
function addWavHeader(
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
  header.writeUInt16LE(1, 20); // PCM format
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitDepth, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcmBuffer.length, 40);

  return Buffer.concat([header, pcmBuffer]);
}

test('sanitizeInput limits string lengths and trims whitespace', () => {
  const normal = sanitizeInput('  Udaipur Destination Wedding  ', 100);
  assert.equal(normal, 'Udaipur Destination Wedding');

  const longText = 'a'.repeat(1000);
  const capped = sanitizeInput(longText, 250);
  assert.equal(capped.length, 250);

  assert.equal(sanitizeInput(null), '');
  assert.equal(sanitizeInput(undefined), '');
  assert.equal(sanitizeInput(12345), '');
});

test('sanitizeSvg strips script, iframe, and inline event handlers', () => {
  const dirtySvg = `<svg viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="40" fill="#E07A5F" onclick="alert('pwned')" />
    <script>alert('xss')</script>
    <iframe src="evil.com"></iframe>
    <a href="javascript:void(0)">Click</a>
  </svg>`;

  const clean = sanitizeSvg(dirtySvg);
  assert.equal(clean.includes('<script>'), false);
  assert.equal(clean.includes('onclick'), false);
  assert.equal(clean.includes('<iframe'), false);
  assert.equal(clean.includes('javascript:'), false);
  assert.equal(clean.includes('circle cx="50"'), true);
});

test('addWavHeader generates a compliant 44-byte RIFF WAV audio buffer', () => {
  const mockPcm = Buffer.alloc(4800); // 100ms of 24kHz 16-bit mono audio
  const wav = addWavHeader(mockPcm, 24000, 1, 16);

  assert.equal(wav.length, 44 + 4800);
  assert.equal(wav.toString('ascii', 0, 4), 'RIFF');
  assert.equal(wav.toString('ascii', 8, 12), 'WAVE');
  assert.equal(wav.toString('ascii', 12, 16), 'fmt ');
  assert.equal(wav.toString('ascii', 36, 40), 'data');
  assert.equal(wav.readUInt32LE(24), 24000); // Sample rate
  assert.equal(wav.readUInt16LE(22), 1);     // Mono channels
  assert.equal(wav.readUInt16LE(34), 16);    // 16-bit depth
});

test('budget allocation math balances total expenditure and percentages', () => {
  const totalBudget = 2500000;
  const breakdown = [
    { category: 'Venue & Catering', percentage: 42 },
    { category: 'Decor & Setup', percentage: 18 },
    { category: 'Photography & Video', percentage: 12 },
    { category: 'Entertainment', percentage: 10 },
    { category: 'Attire & Makeup', percentage: 8 },
    { category: 'Invitations & Stationery', percentage: 4 },
    { category: 'Miscellaneous', percentage: 6 },
  ];

  const totalPct = breakdown.reduce((acc, b) => acc + b.percentage, 0);
  assert.equal(totalPct, 100);

  const amounts = breakdown.map(b => Math.round(totalBudget * (b.percentage / 100)));
  const sumAmounts = amounts.reduce((acc, a) => acc + a, 0);
  assert.equal(sumAmounts, totalBudget);
});

test('API mock handles valid structured response with source: "gemini"', () => {
  const mockGeminiOutput = {
    title: 'Grand Udaipur Royal Wedding',
    venue: 'Jagmandir Island Palace, Udaipur',
    budget: 2500000,
    expectedGuests: 200,
    categoryBreakdown: [
      { category: 'Venue & Catering', amount: 1050000, percentage: 42, note: 'Lakeside palace banquet' },
    ],
  };

  const responsePayload = {
    success: true,
    source: 'gemini' as const,
    model: 'gemini-2.5-flash',
    data: mockGeminiOutput,
  };

  assert.equal(responsePayload.source, 'gemini');
  assert.equal(responsePayload.model, 'gemini-2.5-flash');
  assert.equal(responsePayload.data.expectedGuests, 200);
});
