import { escapeXml } from '../helpers.ts';

/**
 * Synthesizes dynamic, elegant vector SVG logo emblems with strict XML escaping
 */
export function generateSvgLogo(title: string, type: string, theme: string): string {
  const rawTitle = (title || 'Celebranza Event').trim();
  const safeTitle = escapeXml(rawTitle);
  const safeTheme = escapeXml(theme || '');
  const words = rawTitle.split(/\s+/).filter(Boolean);
  const initials =
    words.length >= 2
      ? `${escapeXml(words[0][0])}&amp;${escapeXml(words[1][0])}`.toUpperCase()
      : escapeXml(rawTitle.slice(0, 3)).toUpperCase();

  const isWedding = (type || '').toLowerCase().includes('wedding') || rawTitle.includes('&');
  const isBirthday = (type || '').toLowerCase().includes('birthday');

  if (isWedding) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
  <defs>
    <linearGradient id="wg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E07A5F"/>
      <stop offset="50%" stop-color="#F4A261"/>
      <stop offset="100%" stop-color="#C85A3D"/>
    </linearGradient>
    <linearGradient id="wbg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#18151D"/>
      <stop offset="100%" stop-color="#0E0D12"/>
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="40" fill="url(#wbg)"/>
  <circle cx="100" cy="100" r="76" fill="none" stroke="url(#wg)" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.6"/>
  <circle cx="100" cy="100" r="68" fill="none" stroke="url(#wg)" stroke-width="2.5"/>
  <path d="M60 100 C70 70, 130 70, 140 100 C130 130, 70 130, 60 100 Z" fill="none" stroke="url(#wg)" stroke-width="1.5" opacity="0.4"/>
  <text x="100" y="106" font-family="'DM Serif Display', Georgia, serif" font-size="28" font-weight="bold" fill="url(#wg)" text-anchor="middle" letter-spacing="1">${initials}</text>
  <text x="100" y="142" font-family="'Inter', sans-serif" font-size="8" font-weight="700" fill="#FFFFFF" text-anchor="middle" letter-spacing="2">${safeTitle.toUpperCase()}</text>
  <text x="100" y="156" font-family="'DM Serif Display', Georgia, serif" font-style="italic" font-size="8" fill="#F4A261" text-anchor="middle">${safeTheme ? safeTheme.slice(0, 30) : 'From vows to forever'}</text>
</svg>`;
  }

  if (isBirthday) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
  <defs>
    <linearGradient id="bg-g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F4A261"/>
      <stop offset="50%" stop-color="#E07A5F"/>
      <stop offset="100%" stop-color="#9D4EDD"/>
    </linearGradient>
    <linearGradient id="bbg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1B1724"/>
      <stop offset="100%" stop-color="#0E0C14"/>
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="40" fill="url(#bbg)"/>
  <polygon points="100,28 165,65 165,140 100,178 35,140 35,65" fill="none" stroke="url(#bg-g)" stroke-width="2.5"/>
  <circle cx="100" cy="100" r="50" fill="none" stroke="#F4A261" stroke-width="1.5" stroke-dasharray="3 3"/>
  <text x="100" y="108" font-family="'DM Serif Display', Georgia, serif" font-size="30" font-weight="bold" fill="url(#bg-g)" text-anchor="middle">${initials}</text>
  <text x="100" y="142" font-family="'Inter', sans-serif" font-size="8.5" font-weight="700" fill="#FFFFFF" text-anchor="middle" letter-spacing="1.5">${safeTitle.toUpperCase()}</text>
  <text x="100" y="156" font-family="'Inter', sans-serif" font-size="7.5" font-weight="500" fill="#E07A5F" text-anchor="middle">CELEBRATE IN STYLE</text>
</svg>`;
  }

  // Community / Gala / Launch
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
  <defs>
    <linearGradient id="cg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2DD4BF"/>
      <stop offset="50%" stop-color="#10B981"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>
    <linearGradient id="cbg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#111B18"/>
      <stop offset="100%" stop-color="#0A100E"/>
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="40" fill="url(#cbg)"/>
  <circle cx="100" cy="100" r="70" fill="none" stroke="url(#cg)" stroke-width="2.5"/>
  <polygon points="100,45 145,125 55,125" fill="none" stroke="url(#cg)" stroke-width="1.5" opacity="0.5"/>
  <circle cx="100" cy="85" r="7" fill="url(#cg)"/>
  <text x="100" y="116" font-family="'DM Serif Display', Georgia, serif" font-size="24" font-weight="bold" fill="#FFFFFF" text-anchor="middle">${initials}</text>
  <text x="100" y="148" font-family="'Inter', sans-serif" font-size="8" font-weight="700" fill="#2DD4BF" text-anchor="middle" letter-spacing="1.5">${safeTitle.toUpperCase()}</text>
  <text x="100" y="162" font-family="'Inter', sans-serif" font-size="7.5" font-weight="500" fill="#9CA3AF" text-anchor="middle">CONNECT &amp; CELEBRATE</text>
</svg>`;
}
