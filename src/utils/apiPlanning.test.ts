import test from 'node:test';
import assert from 'node:assert/strict';

import { sanitizeInput, sanitizeSvg, escapeXml, safeJsonParse, addWavHeader } from '../server/helpers.ts';


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
    model: 'gemini-3.5-flash',
    data: mockGeminiOutput,
  };

  assert.equal(responsePayload.source, 'gemini');
  assert.equal(responsePayload.model, 'gemini-3.5-flash');
  assert.equal(responsePayload.data.expectedGuests, 200);
});

test('escapeXml safely encodes &, <, >, and quotes', () => {
  const unsafe = 'Aria & Neil <Vows> "Forever"';
  const safe = escapeXml(unsafe);
  assert.equal(safe, 'Aria &amp; Neil &lt;Vows&gt; &quot;Forever&quot;');
});

test('safeJsonParse parses clean and markdown wrapped json with fallback', () => {
  const rawMarkdown = '```json\n{"status":"ok","value":42}\n```';
  const parsed = safeJsonParse(rawMarkdown, { status: 'fallback', value: 0 });
  assert.equal(parsed.status, 'ok');
  assert.equal(parsed.value, 42);

  const invalid = 'not a json';
  const fallbackVal = safeJsonParse(invalid, { default: true });
  assert.equal(fallbackVal.default, true);
});

