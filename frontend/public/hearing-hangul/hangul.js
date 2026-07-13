// hangul.js — Hangul composition engine + 두벌식 (dubeolsik) layout.
// This is the reusable core. It knows nothing about the UI or the drill.
// Composition/decomposition is forward-compatible with syllable mode later.
(function (global) {
  'use strict';

  // Compatibility jamo (the characters you see when typing a lone letter),
  // ordered to match the Unicode Hangul composition indices.
  const CHO = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
  const JUNG = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
  const JONG = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];

  const SBASE = 0xAC00; // '가'
  const SEND = 0xD7A3;  // '힣'

  function isSyllable(ch) {
    const c = ch.charCodeAt(0);
    return c >= SBASE && c <= SEND;
  }

  function isVowel(jamo) { return JUNG.indexOf(jamo) !== -1; }
  function isChoseong(jamo) { return CHO.indexOf(jamo) !== -1; }

  // Compose by jamo characters → a precomposed syllable block, or null.
  // jong may be '' or omitted for no final consonant.
  function compose(cho, jung, jong) {
    const ci = CHO.indexOf(cho);
    const vi = JUNG.indexOf(jung);
    const ti = jong ? JONG.indexOf(jong) : 0;
    if (ci < 0 || vi < 0 || ti < 0) return null;
    return String.fromCharCode(SBASE + (ci * 21 + vi) * 28 + ti);
  }

  // Decompose a syllable block → { cho, jung, jong } as compatibility jamo.
  // This is what powers highlighting the target letter inside a word.
  function decompose(syllable) {
    if (!isSyllable(syllable)) return null;
    const s = syllable.charCodeAt(0) - SBASE;
    const ti = s % 28;
    const vi = ((s - ti) / 28) % 21;
    const ci = Math.floor(((s - ti) / 28) / 21);
    return { cho: CHO[ci], jung: JUNG[vi], jong: JONG[ti] };
  }

  // 두벌식 layout: physical key (event.code) → { base, shift? } jamo.
  // We map physical positions (event.code), NOT event.key, so the app's own
  // composition works regardless of the user's OS keyboard layout.
  const DUBEOLSIK = {
    KeyQ:{base:'ㅂ',shift:'ㅃ'}, KeyW:{base:'ㅈ',shift:'ㅉ'}, KeyE:{base:'ㄷ',shift:'ㄸ'},
    KeyR:{base:'ㄱ',shift:'ㄲ'}, KeyT:{base:'ㅅ',shift:'ㅆ'}, KeyY:{base:'ㅛ'}, KeyU:{base:'ㅕ'},
    KeyI:{base:'ㅑ'}, KeyO:{base:'ㅐ',shift:'ㅒ'}, KeyP:{base:'ㅔ',shift:'ㅖ'},
    KeyA:{base:'ㅁ'}, KeyS:{base:'ㄴ'}, KeyD:{base:'ㅇ'}, KeyF:{base:'ㄹ'}, KeyG:{base:'ㅎ'},
    KeyH:{base:'ㅗ'}, KeyJ:{base:'ㅓ'}, KeyK:{base:'ㅏ'}, KeyL:{base:'ㅣ'},
    KeyZ:{base:'ㅋ'}, KeyX:{base:'ㅌ'}, KeyC:{base:'ㅊ'}, KeyV:{base:'ㅍ'}, KeyB:{base:'ㅠ'},
    KeyN:{base:'ㅜ'}, KeyM:{base:'ㅡ'}
  };

  // Visual rows for the on-screen keyboard (physical key codes, QWERTY shape).
  const ROWS = [
    ['KeyQ','KeyW','KeyE','KeyR','KeyT','KeyY','KeyU','KeyI','KeyO','KeyP'],
    ['KeyA','KeyS','KeyD','KeyF','KeyG','KeyH','KeyJ','KeyK','KeyL'],
    ['KeyZ','KeyX','KeyC','KeyV','KeyB','KeyN','KeyM']
  ];

  global.Hangul = { CHO, JUNG, JONG, isSyllable, isVowel, isChoseong, compose, decompose, DUBEOLSIK, ROWS };
})(window);
