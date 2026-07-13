// app.js — the drill loop, input layer, and reinforcement card.
(function () {
  'use strict';

  const H = window.Hangul;
  const LISTS = { vowels: window.CONTENT.vowels, syllables: window.CONTENT.syllables };

  // ---- elements ----
  const el = (id) => document.getElementById(id);
  const playBtn = el('play');
  const display = el('display');
  const keyboardEl = el('keyboard');
  const feedbackEl = el('feedback');
  const hintEl = el('hint');
  const scoreEl = el('score');
  const promptEl = el('prompt');
  const imeWarn = el('ime-warning');
  const modeBtns = Array.prototype.slice.call(document.querySelectorAll('.mode-btn'));

  // ---- audio (pluggable: native recording if provided, else TTS) ----
  let koVoice = null;
  function loadVoice() {
    const voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
    koVoice = voices.find((v) => /ko(-|_)?KR/i.test(v.lang)) ||
              voices.find((v) => /^ko\b/i.test(v.lang)) || null;
  }
  if (window.speechSynthesis) {
    loadVoice();
    window.speechSynthesis.onvoiceschanged = loadVoice;
  }
  function playAudio(text, src) {
    if (src) { const a = new Audio(src); a.play().catch(() => speak(text)); return; }
    speak(text);
  }
  function speak(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ko-KR';
    if (koVoice) u.voice = koVoice;
    u.rate = 0.85;
    window.speechSynthesis.speak(u);
  }

  // ---- drill state ----
  let mode = 'vowels';           // 'vowels' | 'syllables'
  let current = null;
  let currentAnswer = '';        // the string the typed input is compared against
  let answered = false;
  let lastIndex = -1;
  let buffer = { cho: '', jung: '', jong: '' }; // syllable-mode composition
  const STATS_KEY = 'hearing-hangul:stats';
  const stats = loadStats();
  let correct = 0, total = 0;

  function loadStats() {
    try { return JSON.parse(localStorage.getItem(STATS_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function saveStats() {
    try { localStorage.setItem(STATS_KEY, JSON.stringify(stats)); } catch (e) {}
  }

  function pickItem() {
    const items = LISTS[mode];
    let i;
    do { i = Math.floor(Math.random() * items.length); }
    while (items.length > 1 && i === lastIndex);
    lastIndex = i;
    return items[i];
  }

  function newRound() {
    current = pickItem();
    currentAnswer = mode === 'vowels' ? current.jamo : current.sound;
    answered = false;
    buffer = { cho: '', jung: '', jong: '' };
    display.textContent = '';
    display.className = 'display';
    feedbackEl.className = 'feedback hidden';
    feedbackEl.innerHTML = '';
    hintEl.textContent = '';
    setTimeout(() => playAudio(current.sound, current.soundSrc), 250);
  }

  function renderBuffer() {
    const s = (buffer.cho && buffer.jung)
      ? H.compose(buffer.cho, buffer.jung, buffer.jong)
      : (buffer.cho || '');
    display.textContent = s || '';
    return s;
  }

  // Route a jamo into the current mode's input model.
  function handleJamo(jamo) {
    if (answered) return;
    hintEl.textContent = '';

    if (mode === 'vowels') {
      if (!H.isVowel(jamo)) {
        hintEl.textContent = 'Listen for the vowel — type a vowel key.';
        flashKey(jamo, 'bad');
        return;
      }
      display.textContent = jamo;
      evaluate(jamo);
      return;
    }

    // syllable mode: build consonant + vowel, then auto-check
    if (H.isChoseong(jamo) && !H.isVowel(jamo)) {
      // a consonant: onset if empty, else replace the onset (correcting)
      buffer.cho = jamo;
      buffer.jung = '';
      renderBuffer();
    } else if (H.isVowel(jamo)) {
      if (!buffer.cho) {
        hintEl.textContent = 'Start with the consonant, then the vowel.';
        flashKey(jamo, 'bad');
        return;
      }
      buffer.jung = jamo;
      const composed = renderBuffer();
      evaluate(composed);
    }
  }

  function evaluate(typed) {
    answered = true;
    const isRight = typed === currentAnswer;
    total += 1;
    if (isRight) correct += 1;

    const key = mode + ':' + currentAnswer;
    const rec = stats[key] || { seen: 0, correct: 0 };
    rec.seen += 1;
    if (isRight) rec.correct += 1;
    stats[key] = rec;
    saveStats();

    display.className = 'display ' + (isRight ? 'right' : 'wrong');
    scoreEl.textContent = `${correct} / ${total}`;
    showFeedback(isRight, typed);
  }

  // Reinforcement card: example word with the target syllable highlighted, plus
  // that syllable broken into jamo with the target letter(s) colored.
  function showFeedback(isRight, typed) {
    const word = current.word;
    const targets = mode === 'vowels' ? [current.jamo] : [current.cho, current.jung];
    const matches = (d) => mode === 'vowels'
      ? d.jung === current.jamo
      : (d.cho === current.cho && d.jung === current.jung);

    let hit = -1;
    const wordSpans = [];
    for (let k = 0; k < word.length; k++) {
      const d = H.decompose(word[k]);
      const isHit = hit === -1 && d && matches(d);
      if (isHit) hit = k;
      wordSpans.push(`<span class="${isHit ? 'syl hit' : 'syl'}">${word[k]}</span>`);
    }

    let breakdown = '';
    if (hit >= 0) {
      const d = H.decompose(word[hit]);
      const parts = [d.cho, d.jung].concat(d.jong ? [d.jong] : []);
      breakdown = parts.map((p) =>
        `<span class="${targets.indexOf(p) !== -1 ? 'jamo target' : 'jamo'}">${p}</span>`
      ).join('<span class="plus">+</span>');
    }

    const verdict = isRight
      ? `<div class="verdict ok">✓ Correct</div>`
      : `<div class="verdict no">✗ You typed <b>${typed || '—'}</b> — it was <b>${currentAnswer}</b></div>`;

    feedbackEl.innerHTML = `
      ${verdict}
      <div class="card">
        <div class="emoji">${current.emoji}</div>
        <button class="word-audio" id="word-audio" title="Replay word">🔊</button>
        <div class="word">${wordSpans.join('')}</div>
        <div class="breakdown">${breakdown}</div>
        <div class="meaning">${current.meaning}</div>
      </div>
      <button class="next" id="next">Next &nbsp;›</button>
      <div class="kbd-hint">space / enter for next</div>
    `;
    feedbackEl.className = 'feedback';
    el('next').addEventListener('click', newRound);
    el('word-audio').addEventListener('click', () => playAudio(current.word, current.wordSrc));
    setTimeout(() => playAudio(current.word, current.wordSrc), 350);
  }

  // ---- on-screen keyboard ----
  const keyButtons = {};
  function buildKeyboard() {
    H.ROWS.forEach((row) => {
      const rowEl = document.createElement('div');
      rowEl.className = 'kbd-row';
      row.forEach((code) => {
        const jamo = H.DUBEOLSIK[code].base;
        const btn = document.createElement('button');
        btn.className = 'key' + (H.isVowel(jamo) ? ' vowel' : '');
        btn.dataset.code = code;
        btn.innerHTML = `<span class="j">${jamo}</span><span class="q">${code.replace('Key', '')}</span>`;
        btn.addEventListener('click', () => { handleJamo(jamo); flashKey(jamo, 'press'); });
        rowEl.appendChild(btn);
        if (!keyButtons[jamo]) keyButtons[jamo] = btn;
      });
      keyboardEl.appendChild(rowEl);
    });
  }
  function flashKey(jamo, kind) {
    const btn = keyButtons[jamo];
    if (!btn) return;
    btn.classList.add(kind === 'bad' ? 'flash-bad' : 'flash');
    setTimeout(() => btn.classList.remove('flash', 'flash-bad'), 180);
  }

  // ---- physical keyboard ----
  let imeWarned = false;
  document.addEventListener('keydown', (e) => {
    if (e.isComposing || e.keyCode === 229) {
      if (!imeWarned) { imeWarn.className = 'ime show'; imeWarned = true; }
      return;
    }
    if (answered && (e.code === 'Space' || e.code === 'Enter')) {
      e.preventDefault(); newRound(); return;
    }
    if (e.code === 'Backspace' && !answered) {
      e.preventDefault();
      buffer = { cho: '', jung: '', jong: '' };
      display.textContent = '';
      hintEl.textContent = '';
      return;
    }
    const map = H.DUBEOLSIK[e.code];
    if (!map) return;
    e.preventDefault();
    const jamo = (e.shiftKey && map.shift) ? map.shift : map.base;
    handleJamo(jamo);
    flashKey(jamo, 'press');
  });

  // ---- mode toggle ----
  function setMode(next) {
    if (next === mode) return;
    mode = next;
    lastIndex = -1;
    modeBtns.forEach((b) => b.classList.toggle('active', b.dataset.mode === mode));
    promptEl.textContent = mode === 'vowels'
      ? 'Listen, then type the vowel you hear'
      : 'Listen, then type the syllable (consonant, then vowel)';
    newRound();
  }
  modeBtns.forEach((b) => b.addEventListener('click', () => setMode(b.dataset.mode)));

  // ---- wire up ----
  playBtn.addEventListener('click', () => playAudio(current.sound, current.soundSrc));
  buildKeyboard();
  scoreEl.textContent = '0 / 0';
  newRound();
})();
