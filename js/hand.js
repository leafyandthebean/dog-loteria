// Weekly hand logic. Weeks start on Monday (local time).

export function weekStartOf(date = new Date()) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const offset = (d.getDay() + 6) % 7; // Mon=0 ... Sun=6
  d.setDate(d.getDate() - offset);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function shuffle(a) {
  const r = a.slice();
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

// Simple v1 rule: random pick that guarantees at least one out-and-about card.
// Smarter balancing by tags and history comes after the user weighs in.
export function generateHand(cards, size = 9) {
  const pool = shuffle(cards);
  const hand = pool.slice(0, Math.min(size, pool.length));
  if (!hand.some(c => c.place === 'out')) {
    const out = pool.find(c => c.place === 'out' && !hand.includes(c));
    if (out) hand[hand.length - 1] = out;
  }
  return hand.map(c => c.id);
}
