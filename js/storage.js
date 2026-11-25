// Storage adapter. The UI only calls these async functions, so the
// localStorage backing can later be swapped for a server (sync) version.
// Records carry id / createdAt / updatedAt / deleted so they can sync cleanly.

const KEY = 'dogLoteria.v1';
const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random());

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || { hands: [], logs: [], profiles: [] }; }
  catch { return { hands: [], logs: [], profiles: [] }; }
}
function save(db) { localStorage.setItem(KEY, JSON.stringify(db)); }

export async function getHand(weekStart) {
  return load().hands.find(h => h.weekStart === weekStart && !h.deleted) || null;
}

export async function saveHand(weekStart, cardIds) {
  const db = load();
  const now = Date.now();
  const existing = db.hands.find(h => h.weekStart === weekStart);
  if (existing) { existing.cardIds = cardIds; existing.deleted = false; existing.updatedAt = now; }
  else db.hands.push({ id: uuid(), weekStart, cardIds, createdAt: now, updatedAt: now, deleted: false });
  save(db);
}

export async function logSession({ cardId, minutes, rating, profileId = 'default' }) {
  const db = load();
  const now = Date.now();
  const rec = { id: uuid(), cardId, minutes, rating, profileId, at: now, createdAt: now, updatedAt: now, deleted: false };
  db.logs.push(rec);
  save(db);
  return rec;
}

export async function getLogs() {
  return load().logs.filter(l => !l.deleted).sort((a, b) => b.at - a.at);
}

export async function deleteLog(id) {
  const db = load();
  const l = db.logs.find(x => x.id === id);
  if (l) { l.deleted = true; l.updatedAt = Date.now(); save(db); }
}

export async function exportAll() { return JSON.stringify(load(), null, 2); }
export async function importAll(text) { save(JSON.parse(text)); }
