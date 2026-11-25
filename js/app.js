import { getHand, saveHand, logSession, getLogs, deleteLog } from './storage.js';
import { weekStartOf, generateHand } from './hand.js';
import { ART, defaultDog } from './art.js';

// Card art: custom SVG (with the household dog) if the card has one, else its emoji.
function artEl(c, cls) {
  const el = document.createElement('span');
  el.className = cls;
  if (c && c.art && ART[c.art]) el.innerHTML = ART[c.art](defaultDog);
  else el.textContent = c ? c.front : '❓';
  return el;
}

const $ = sel => document.querySelector(sel);
const view = $('#view');
const sheet = $('#sheet');

// Tiny element builder: h('div', {class:'x', onclick:fn}, child, 'text')
function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'class') el.className = v;
    else el.setAttribute(k, v);
  }
  for (const kid of kids.flat()) if (kid != null) el.append(kid.nodeType ? kid : document.createTextNode(kid));
  return el;
}

// Lotería-style card colours and numbers, stable per card (order in cards.json).
const PALETTE = ['#f4d34a', '#62a9db', '#f2a3bb', '#86c28c', '#e9765b', '#f0a95c', '#a58ad1', '#5cc0b4'];
const colorOf = c => PALETTE[state.cards.indexOf(c) % PALETTE.length];
const numOf = c => state.cards.indexOf(c) + 1;
const beanEl = () => h('span', { class: 'bean', 'aria-label': 'Practiced' });

const state = { cards: [], byId: {}, hand: [], weekStart: weekStartOf(), logs: [], current: 0 };
const RATINGS = [['😕', 'Tough'], ['🙂', 'Good'], ['🤩', 'Great']];
const MINUTES = [5, 10, 30, 60];

async function init() {
  const res = await fetch('data/cards.json');
  const data = await res.json();
  state.cards = data.cards;
  state.objectives = Object.fromEntries((data.objectives || []).map(o => [o.id, o.name]));
  state.byId = Object.fromEntries(state.cards.map(c => [c.id, c]));

  let hand = await getHand(state.weekStart);
  // Regenerate if there is no hand yet, or it refers to cards that no longer exist.
  if (!hand || hand.cardIds.some(id => !state.byId[id])) {
    await saveHand(state.weekStart, generateHand(state.cards));
    hand = await getHand(state.weekStart);
  }
  state.hand = hand.cardIds.filter(id => state.byId[id]);
  state.logs = await getLogs();

  document.querySelectorAll('[data-nav]').forEach(b =>
    b.addEventListener('click', () => go(b.dataset.nav)));
  go('hand');
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
}

function go(name) {
  document.querySelectorAll('[data-nav]').forEach(b => b.classList.toggle('active', b.dataset.nav === name));
  closeSheet();
  if (name === 'hand') renderHand();
  else if (name === 'history') renderHistory();
  else if (name === 'card') renderCard();
}

const practicedThisWeek = id =>
  state.logs.some(l => l.cardId === id && weekStartOf(new Date(l.at)) === state.weekStart);

function setHeader(title, sub = '') { $('#title').textContent = title; $('#subtitle').textContent = sub; }

// ---------- Hand grid (the Lotería board) ----------
function renderHand() {
  const done = state.hand.filter(practicedThisWeek).length;
  setHeader('This week’s hand', `${done} of ${state.hand.length} marked`);
  const grid = h('div', { class: 'board' });
  state.hand.forEach((id, i) => {
    const c = state.byId[id];
    const marked = practicedThisWeek(id);
    grid.append(h('button', { class: 'tile' + (marked ? ' marked' : ''), style: `--bg:${colorOf(c)}`, onclick: () => { state.current = i; go('card'); } },
      h('span', { class: 'num' }, numOf(c)),
      artEl(c, 'art'),
      h('span', { class: 'name' }, c.title),
      marked ? beanEl() : null));
  });
  view.replaceChildren(grid);
}

// ---------- Card carousel with flip ----------
function renderCard() {
  const n = state.hand.length;
  const c = state.byId[state.hand[state.current]];
  setHeader(c.title, `Card ${state.current + 1} of ${n}`);

  const front = h('div', { class: 'face front', style: `--bg:${colorOf(c)}` },
    h('span', { class: 'num big' }, numOf(c)),
    artEl(c, 'art big'),
    h('div', { class: 'hint' }, 'tap to flip'),
    h('div', { class: 'name big' }, c.title),
    practicedThisWeek(c.id) ? beanEl() : null);
  const back = h('div', { class: 'face back', style: `--bg:${colorOf(c)}` },
    h('h2', {}, c.title),
    h('div', { class: 'tags' }, (c.objectives || []).map(id => h('span', { class: 'tag' }, state.objectives[id] || id))),
    c.needs && c.needs.length
      ? h('p', { class: 'needs' }, 'Do first: ', c.needs.map(id => (state.byId[id] ? state.byId[id].title : id)).join(', '))
      : null,
    c.gear && c.gear.length ? [h('h3', {}, 'You’ll need'), h('ul', {}, c.gear.map(s => h('li', {}, s)))] : null,
    h('h3', {}, 'How'),
    h('ol', {}, c.steps.map(s => h('li', {}, s))),
    h('h3', {}, 'Tips'),
    h('ul', {}, (c.tips || []).map(s => h('li', {}, s))),
    h('h3', {}, 'Move on when'),
    h('p', {}, c.levelUp),
    c.source ? h('p', { class: 'source' }, 'Source: ', c.source) : null);
  const flipper = h('div', { class: 'flipper' }, front, back);
  const card = h('div', { class: 'card', onclick: () => card.classList.toggle('flipped') }, flipper);

  // swipe left/right to change cards
  let x0 = null;
  card.addEventListener('pointerdown', e => { x0 = e.clientX; });
  card.addEventListener('pointerup', e => {
    if (x0 == null) return;
    const dx = e.clientX - x0; x0 = null;
    if (Math.abs(dx) > 60) { e.preventDefault(); step(dx < 0 ? 1 : -1); card.dataset.swiped = '1'; }
  });
  card.addEventListener('click', e => { if (card.dataset.swiped) { e.stopImmediatePropagation(); delete card.dataset.swiped; } }, true);

  const step = d => { state.current = (state.current + d + n) % n; renderCard(); };
  const controls = h('div', { class: 'controls' },
    h('button', { class: 'ghost', onclick: () => step(-1) }, '‹ Prev'),
    h('button', { class: 'primary', onclick: () => openLogSheet(c) }, 'Log practice'),
    h('button', { class: 'ghost', onclick: () => step(1) }, 'Next ›'));
  const back2 = h('button', { class: 'link', onclick: () => go('hand') }, '← Back to hand');
  view.replaceChildren(back2, card, controls);
}

// ---------- Log sheet ----------
function openLogSheet(card) {
  let minutes = 10, rating = 1;
  const minRow = h('div', { class: 'chips' });
  const rateRow = h('div', { class: 'chips' });
  const draw = () => {
    minRow.replaceChildren(...MINUTES.map(m =>
      h('button', { class: 'chip' + (m === minutes ? ' on' : ''), onclick: () => { minutes = m; draw(); } }, `${m} min`)));
    rateRow.replaceChildren(...RATINGS.map(([e, t], i) =>
      h('button', { class: 'chip' + (i === rating ? ' on' : ''), onclick: () => { rating = i; draw(); } }, `${e} ${t}`)));
  };
  draw();
  sheet.replaceChildren(h('div', { class: 'panel' },
    h('h2', {}, `Log: ${card.title}`),
    h('p', {}, 'How long did you practice?'), minRow,
    h('p', {}, 'How did it go?'), rateRow,
    h('div', { class: 'controls' },
      h('button', { class: 'ghost', onclick: closeSheet }, 'Cancel'),
      h('button', { class: 'primary', onclick: async () => {
        await logSession({ cardId: card.id, minutes, rating });
        state.logs = await getLogs();
        closeSheet();
        go('hand');
      } }, 'Save'))));
  sheet.hidden = false;
}
function closeSheet() { sheet.hidden = true; sheet.replaceChildren(); }

// ---------- History ----------
function renderHistory() {
  setHeader('Practice log', `${state.logs.length} sessions`);
  if (!state.logs.length) { view.replaceChildren(h('p', { class: 'empty' }, 'No practice logged yet. Flip a card and tap “Log practice.”')); return; }
  const list = h('ul', { class: 'log' });
  for (const l of state.logs) {
    const c = state.byId[l.cardId];
    list.append(h('li', {},
      artEl(c, 'art'),
      h('div', {}, h('b', {}, c ? c.title : l.cardId),
        h('div', { class: 'meta' }, `${new Date(l.at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} · ${l.minutes} min · ${RATINGS[l.rating][0]}`)),
      h('button', { class: 'link', 'aria-label': 'Delete', onclick: async () => { await deleteLog(l.id); state.logs = await getLogs(); renderHistory(); } }, '✕')));
  }
  view.replaceChildren(list);
}

init();
