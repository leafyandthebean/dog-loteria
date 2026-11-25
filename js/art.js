// Card illustrations. Each function returns an SVG string (own markup, not user input).
// Dogs are parameterized so a different dog (coat colour, later breed shape) can be swapped in.

export const DOGS = {
  poodle: { name: 'Toy poodle', coat: '#1f1f24', fluff: '#383843', muzzle: '#2c2c33' }
};

const INK = '#2b4a5a';
const WOOD = '#b5763f', WOOD_DARK = '#8f5a2c';
const BISCUIT = '#dca85f';

// ---------- dog parts ----------

// Front-facing head, centred on (100,72); topknot reaches y~36.
function headFront(d) {
  const f = d.fluff, c = d.coat;
  return `
  <g stroke="${INK}" stroke-width="2.5" stroke-linejoin="round">
    <ellipse cx="77" cy="80" rx="9" ry="19" fill="${c}" transform="rotate(8 77 80)"/>
    <ellipse cx="123" cy="80" rx="9" ry="19" fill="${c}" transform="rotate(-8 123 80)"/>
    <circle cx="100" cy="72" r="21" fill="${c}"/>
    <circle cx="100" cy="49" r="13" fill="${f}"/>
    <circle cx="88" cy="55" r="9" fill="${f}"/>
    <circle cx="112" cy="55" r="9" fill="${f}"/>
    <ellipse cx="100" cy="81" rx="11" ry="8" fill="${d.muzzle}"/>
    <ellipse cx="100" cy="77" rx="5" ry="3.5" fill="#0c0c0e" stroke="none"/>
    <path d="M94 85 Q100 91 106 85" fill="none" stroke="#f3f0e8" stroke-width="2" stroke-linecap="round"/>
    <path d="M97 87 Q100 95 103 87 Z" fill="#e8758a" stroke="none"/>
  </g>
  <circle cx="91" cy="69" r="3.2" fill="#f3f0e8"/>
  <circle cx="109" cy="69" r="3.2" fill="#f3f0e8"/>
  <circle cx="91.5" cy="69.3" r="1.7" fill="#0c0c0e"/>
  <circle cx="109.5" cy="69.3" r="1.7" fill="#0c0c0e"/>
  <circle cx="99" cy="75.8" r="1" fill="#f3f0e8"/>`;
}

// Seated body seen from the front (no head).
function bodySit(d) {
  const f = d.fluff, c = d.coat;
  return `
  <g stroke="${INK}" stroke-width="2.5" stroke-linejoin="round">
    <ellipse cx="100" cy="112" rx="27" ry="28" fill="${c}"/>
    <circle cx="82" cy="118" r="9" fill="${f}" stroke="none"/>
    <circle cx="118" cy="118" r="9" fill="${f}" stroke="none"/>
    <rect x="87" y="114" width="10" height="22" rx="5" fill="${c}"/>
    <rect x="103" y="114" width="10" height="22" rx="5" fill="${c}"/>
    <circle cx="92" cy="135" r="8" fill="${f}"/>
    <circle cx="108" cy="135" r="8" fill="${f}"/>
  </g>`;
}

// Standing body from the side, facing right (no head). Feet at y~170.
function bodySide(d) {
  const f = d.fluff, c = d.coat;
  return `
  <ellipse cx="92" cy="176" rx="58" ry="6" fill="rgba(0,0,0,.13)"/>
  <g stroke="${INK}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round">
    <path d="M52 116 Q44 104 46 96" fill="none" stroke="${c}" stroke-width="7"/>
    <circle cx="45" cy="92" r="9.5" fill="${f}"/>
    <rect x="60" y="138" width="9" height="30" rx="4.5" fill="${c}"/>
    <rect x="74" y="138" width="9" height="30" rx="4.5" fill="${c}"/>
    <circle cx="64.5" cy="168" r="7.5" fill="${f}"/>
    <circle cx="78.5" cy="168" r="7.5" fill="${f}"/>
    <ellipse cx="90" cy="126" rx="40" ry="22" fill="${c}"/>
    <circle cx="62" cy="128" r="14" fill="${f}" stroke="none"/>
    <ellipse cx="118" cy="108" rx="14" ry="17" fill="${c}" stroke="none" transform="rotate(-15 118 108)"/>
    <rect x="104" y="138" width="9" height="30" rx="4.5" fill="${c}"/>
    <rect x="118" y="138" width="9" height="30" rx="4.5" fill="${c}"/>
    <circle cx="108.5" cy="168" r="7.5" fill="${f}"/>
    <circle cx="122.5" cy="168" r="7.5" fill="${f}"/>
    <circle cx="116" cy="130" r="13" fill="${f}" stroke="none"/>
  </g>`;
}

function head(d, cx, cy, scale = 1, rot = 0) {
  return `<g transform="translate(${cx} ${cy}) rotate(${rot}) scale(${scale}) translate(-100 -72)">${headFront(d)}</g>`;
}

// ---------- props ----------

function chair() {
  return `
  <g stroke="${INK}" stroke-width="3" stroke-linejoin="round">
    <rect x="52" y="74" width="10" height="98" rx="3" fill="${WOOD_DARK}"/>
    <rect x="138" y="74" width="10" height="98" rx="3" fill="${WOOD_DARK}"/>
    <rect x="52" y="100" width="96" height="14" rx="5" fill="${WOOD}"/>
    <rect x="46" y="136" width="108" height="14" rx="4" fill="${WOOD}"/>
    <rect x="54" y="150" width="9" height="40" rx="3" fill="${WOOD_DARK}"/>
    <rect x="137" y="150" width="9" height="40" rx="3" fill="${WOOD_DARK}"/>
  </g>`;
}

// Small treat biscuit (bone shape) centred at (x,y), rotated.
function bone(x, y, rot = 0, s = 1) {
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})" stroke="${INK}" stroke-width="2" fill="${BISCUIT}" stroke-linejoin="round">
    <rect x="-9" y="-4" width="18" height="8" rx="3"/>
    <circle cx="-10" cy="-4" r="4"/><circle cx="-10" cy="4" r="4"/>
    <circle cx="10" cy="-4" r="4"/><circle cx="10" cy="4" r="4"/>
    <rect x="-8" y="-3" width="16" height="6" stroke="none"/>
  </g>`;
}

function pea(x, y) {
  return `<circle cx="${x}" cy="${y}" r="5" fill="${BISCUIT}" stroke="${INK}" stroke-width="2"/>
          <circle cx="${x - 1.5}" cy="${y - 1.5}" r="1.4" fill="#f6dba5"/>`;
}

function stopSign(cx, cy, r = 34) {
  const pts = [22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5]
    .map(a => `${(cx + r * Math.cos(a * Math.PI / 180)).toFixed(1)},${(cy + r * Math.sin(a * Math.PI / 180)).toFixed(1)}`).join(' ');
  return `
  <rect x="${cx - 4}" y="${cy + r - 6}" width="8" height="${190 - cy - r + 6}" fill="#8b8f94" stroke="${INK}" stroke-width="2"/>
  <polygon points="${pts}" fill="#d63a2f" stroke="#fffaf0" stroke-width="3"/>
  <polygon points="${pts}" fill="none" stroke="${INK}" stroke-width="2"/>
  <text x="${cx}" y="${cy + 7}" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="19" text-anchor="middle" fill="#fffaf0">STOP</text>`;
}

function trafficLightGreen(x, y) {
  return `
  <g stroke="${INK}" stroke-width="3" stroke-linejoin="round">
    <rect x="${x + 18}" y="${y + 100}" width="8" height="60" fill="#8b8f94"/>
    <rect x="${x}" y="${y}" width="44" height="104" rx="9" fill="#33363b"/>
    <circle cx="${x + 22}" cy="${y + 20}" r="12" fill="#5a2a2a"/>
    <circle cx="${x + 22}" cy="${y + 52}" r="12" fill="#5a5130"/>
    <circle cx="${x + 22}" cy="${y + 84}" r="12" fill="#4fd16a"/>
  </g>
  <circle cx="${x + 22}" cy="${y + 84}" r="19" fill="none" stroke="#4fd16a" stroke-opacity=".45" stroke-width="3"/>`;
}

function ball(x, y, r = 11) {
  return `<g stroke="${INK}" stroke-width="2.5"><circle cx="${x}" cy="${y}" r="${r}" fill="#e9503f"/>
    <path d="M${x - r + 2} ${y - 3} Q${x} ${y + 3} ${x + r - 2} ${y - 3}" fill="none" stroke="#fffaf0" stroke-width="2.5"/></g>`;
}

const svg = inner => `<svg viewBox="0 0 200 200" role="img" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;

// card.art id -> (dog) => svg string
export const ART = {
  // Dog on a chair (kept as the style model)
  sit: dog => svg(chair() + bodySit(dog) + head(dog, 100, 72, 1)),

  // Body faces right toward a flying treat; head swivels back toward you.
  whiplash: dog => svg(`
    <path d="M150 38 Q172 10 190 52" fill="none" stroke="${INK}" stroke-width="2.5" stroke-dasharray="5 5" stroke-linecap="round"/>
    ${bone(166, 24, 25, .9)}
    ${bodySide(dog)}
    ${head(dog, 134, 96, .95, 10)}
    <g fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round">
      <path d="M98 84 Q92 98 98 112"/><path d="M89 80 Q80 98 89 116"/>
      <path d="M170 84 Q176 98 170 112"/>
    </g>`),

  // Sit under a stop sign, with a trail of treats leading backwards.
  stop_build: dog => svg(`
    ${stopSign(142, 62)}
    <g transform="translate(-6 40) scale(.8)">${bodySit(dog)}${head(dog, 100, 72, 1)}</g>
    ${[28, 52, 76, 100, 124, 148, 172].map((x, i) => pea(x, 178 + (i % 2) * 3)).join('')}`),

  // Green light: released back to play with the ball.
  stop_reward: dog => svg(`
    ${trafficLightGreen(140, 14)}
    <g transform="translate(-4 -14) scale(.82)">${bodySide(dog)}${head(dog, 134, 96, .95, -6)}</g>
    ${ball(122, 152)}
    <g fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round">
      <path d="M24 160 L12 164"/><path d="M26 148 L12 148"/>
    </g>`)
};

export const defaultDog = DOGS.poodle;
