// content.js — the curated content set. Easy to edit by hand.
//
// VOWEL item:
//   jamo    the letter the learner must type (the answer)
//   sound   the syllable that voices the vowel (ㅇ + vowel = just the vowel sound)
//   word    a real example word that contains the vowel
//   emoji   a TEMPORARY placeholder picture (swap for a sourced image later)
//   meaning a small English gloss (a translation, not a romanization)
//
// SYLLABLE item:
//   sound   the syllable the learner hears AND must type (e.g. 가)
//   cho     the onset consonant being taught (for highlighting)
//   jung    the vowel in the syllable (for highlighting)
//   word/emoji/meaning as above
//
// To use native recordings instead of text-to-speech, add file paths:
//   soundSrc: 'audio/ga.mp3'     // plays for the target sound
//   wordSrc:  'audio/gabang.mp3' // plays for the example word
// When present, the recording is used; otherwise the app falls back to TTS.
window.CONTENT = {
  vowels: [
    { jamo: 'ㅏ', sound: '아', word: '사과',   emoji: '🍎',  meaning: 'apple' },
    { jamo: 'ㅑ', sound: '야', word: '야구',   emoji: '⚾',  meaning: 'baseball' },
    { jamo: 'ㅓ', sound: '어', word: '어머니', emoji: '👩',  meaning: 'mother' },
    { jamo: 'ㅕ', sound: '여', word: '여우',   emoji: '🦊',  meaning: 'fox' },
    { jamo: 'ㅗ', sound: '오', word: '오리',   emoji: '🦆',  meaning: 'duck' },
    { jamo: 'ㅛ', sound: '요', word: '요리',   emoji: '🍳',  meaning: 'cooking' },
    { jamo: 'ㅜ', sound: '우', word: '우유',   emoji: '🥛',  meaning: 'milk' },
    { jamo: 'ㅠ', sound: '유', word: '유리',   emoji: '🪟',  meaning: 'glass' },
    { jamo: 'ㅡ', sound: '으', word: '그림',   emoji: '🖼️', meaning: 'picture' },
    { jamo: 'ㅣ', sound: '이', word: '기차',   emoji: '🚂',  meaning: 'train' }
  ],

  // 14 basic consonants, each voiced with ㅏ. This is where consonants get a sound.
  syllables: [
    { sound: '가', cho: 'ㄱ', jung: 'ㅏ', word: '가방',   emoji: '🎒', meaning: 'bag' },
    { sound: '나', cho: 'ㄴ', jung: 'ㅏ', word: '나비',   emoji: '🦋', meaning: 'butterfly' },
    { sound: '다', cho: 'ㄷ', jung: 'ㅏ', word: '다리',   emoji: '🦵', meaning: 'leg' },
    { sound: '라', cho: 'ㄹ', jung: 'ㅏ', word: '라면',   emoji: '🍜', meaning: 'ramen' },
    { sound: '마', cho: 'ㅁ', jung: 'ㅏ', word: '마늘',   emoji: '🧄', meaning: 'garlic' },
    { sound: '바', cho: 'ㅂ', jung: 'ㅏ', word: '바나나', emoji: '🍌', meaning: 'banana' },
    { sound: '사', cho: 'ㅅ', jung: 'ㅏ', word: '사과',   emoji: '🍎', meaning: 'apple' },
    { sound: '아', cho: 'ㅇ', jung: 'ㅏ', word: '아기',   emoji: '👶', meaning: 'baby (ㅇ is silent at the start)' },
    { sound: '자', cho: 'ㅈ', jung: 'ㅏ', word: '자전거', emoji: '🚲', meaning: 'bicycle' },
    { sound: '차', cho: 'ㅊ', jung: 'ㅏ', word: '차',     emoji: '🚗', meaning: 'car' },
    { sound: '카', cho: 'ㅋ', jung: 'ㅏ', word: '카메라', emoji: '📷', meaning: 'camera' },
    { sound: '타', cho: 'ㅌ', jung: 'ㅏ', word: '기타',   emoji: '🎸', meaning: 'guitar' },
    { sound: '파', cho: 'ㅍ', jung: 'ㅏ', word: '파도',   emoji: '🌊', meaning: 'wave' },
    { sound: '하', cho: 'ㅎ', jung: 'ㅏ', word: '하마',   emoji: '🦛', meaning: 'hippo' }
  ]
};
