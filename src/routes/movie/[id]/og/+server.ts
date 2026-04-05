import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { TMDB } from '$lib/server/tmdb/controller';

const WIDTH = 1200;
const HEIGHT = 630;

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function truncate(value: string, length: number) {
  if (value.length <= length) {
    return value;
  }

  return `${value.slice(0, Math.max(0, length - 1)).trimEnd()}...`;
}

function wrapText(value: string, maxCharsPerLine: number, maxLines: number) {
  const words = value.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;

    if (nextLine.length <= maxCharsPerLine) {
      currentLine = nextLine;
      continue;
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    currentLine = word;

    if (lines.length === maxLines - 1) {
      break;
    }
  }

  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }

  if (lines.length === maxLines && words.join(' ') !== lines.join(' ')) {
    lines[maxLines - 1] = truncate(lines[maxLines - 1], Math.max(3, maxCharsPerLine - 3));
  }

  return lines.map((line) => escapeXml(line));
}

export const GET: RequestHandler = async ({ params }) => {
  const id = Number(params.id);

  if (!Number.isFinite(id) || id <= 0) {
    throw error(404, 'Movie not found');
  }

  const movie = await TMDB.getMovie(id);
  const title = escapeXml(movie.title || 'Movie Recommendation');
  const overviewLines = wrapText(
    movie.overview || 'Discover and share movies with your friends on Cinefilia.',
    42,
    4
  );
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : null;
  const metaLine = escapeXml(
    [year, movie.runtime ? `${movie.runtime} min` : null, movie.mpaaRating || null]
      .filter(Boolean)
      .join(' • ') || 'Watch, track, and share on Cinefilia'
  );
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null;

  const svg = `
    <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
          <stop stop-color="#020617"/>
          <stop offset="0.55" stop-color="#0f172a"/>
          <stop offset="1" stop-color="#111827"/>
        </linearGradient>
        <linearGradient id="glow" x1="180" y1="40" x2="1020" y2="590" gradientUnits="userSpaceOnUse">
          <stop stop-color="#f43f5e" stop-opacity="0.28"/>
          <stop offset="0.5" stop-color="#f59e0b" stop-opacity="0.18"/>
          <stop offset="1" stop-color="#22c55e" stop-opacity="0.14"/>
        </linearGradient>
        <linearGradient id="panel" x1="0" y1="0" x2="760" y2="0" gradientUnits="userSpaceOnUse">
          <stop stop-color="#020617" stop-opacity="0.9"/>
          <stop offset="1" stop-color="#020617" stop-opacity="0.65"/>
        </linearGradient>
        <clipPath id="poster-clip">
          <rect x="90" y="86" width="290" height="435" rx="22"/>
        </clipPath>
      </defs>

      <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
      <circle cx="1010" cy="90" r="220" fill="#f59e0b" fill-opacity="0.08"/>
      <circle cx="1120" cy="550" r="240" fill="#ef4444" fill-opacity="0.08"/>
      <rect x="0" y="0" width="${WIDTH}" height="${HEIGHT}" fill="url(#glow)"/>
      <rect x="44" y="44" width="1112" height="542" rx="32" fill="#020617" fill-opacity="0.32" stroke="#334155" stroke-opacity="0.7"/>
      <rect x="430" y="70" width="680" height="490" rx="28" fill="url(#panel)" stroke="#1e293b"/>

      ${posterUrl
        ? `<image href="${posterUrl}" x="90" y="86" width="290" height="435" preserveAspectRatio="xMidYMid slice" clip-path="url(#poster-clip)"/>`
        : `<rect x="90" y="86" width="290" height="435" rx="22" fill="#111827" stroke="#334155"/>
           <text x="235" y="306" text-anchor="middle" fill="#94a3b8" font-family="Arial, sans-serif" font-size="26">No poster</text>`}
      <rect x="90" y="86" width="290" height="435" rx="22" fill="none" stroke="#475569"/>

      <rect x="430" y="100" width="152" height="36" rx="18" fill="#e11d48"/>
      <text x="506" y="124" text-anchor="middle" fill="#fff" font-family="Arial, sans-serif" font-size="17" font-weight="700">CINEFILIA</text>

      <text x="430" y="205" fill="#fff" font-family="Arial, sans-serif" font-size="58" font-weight="700">${title}</text>
      <text x="430" y="252" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="24">${metaLine}</text>

      <text x="430" y="324" fill="#e2e8f0" font-family="Arial, sans-serif" font-size="31">
        ${overviewLines
          .map(
            (line, index) =>
              `<tspan x="430" dy="${index === 0 ? 0 : 42}">${line}</tspan>`
          )
          .join('')}
      </text>

      <text x="430" y="528" fill="#f8fafc" font-family="Arial, sans-serif" font-size="26" font-weight="600">Check out this movie on Cinefilia</text>
      <text x="430" y="560" fill="#94a3b8" font-family="Arial, sans-serif" font-size="20">Track what you watch. Build your next list. Share with friends.</text>
    </svg>
  `.trim();

  return new Response(svg, {
    headers: {
      'content-type': 'image/svg+xml; charset=utf-8',
      'cache-control': 'public, max-age=3600'
    }
  });
};
