/**
 * ASOIAF™ Emoji Sistemi
 *
 * Kullanım:
 *   const E = require('../utils/emojis');
 *   `${E.CHECK} Kayıt başarılı!`
 *
 * Custom emoji eklemek için:
 *   1. Sunucuya animated emoji yükle (veya /emoji-yukle komutunu kullan)
 *   2. Emoji ID'sini aşağıdaki ilgili alana gir
 *   3. Animated emojiler için format: <a:isim:id>
 *   4. Statik emojiler için format: <:isim:id>
 *
 * Şu an unicode kullanılıyor, custom yüklenince güncelle.
 */

// ─── Durum ────────────────────────────────────────────────────────
const CHECK    = '✅';   // Başarı
const ERROR    = '❌';   // Hata
const WARN     = '⚠️';  // Uyarı
const LOADING  = '⏳';   // Yükleniyor
const LOCK     = '🔒';   // Kilitli
const UNLOCK   = '🔓';   // Açık

// ─── Kullanıcı & Kayıt ────────────────────────────────────────────
const USER     = '👤';
const CROWN    = '👑';
const SCROLL   = '📜';
const QUILL    = '🖊️';
const CAKE     = '🎂';
const STAR     = '⭐';
const WELCOME  = '🎉';
const WAVE     = '👋';
const LEAVE    = '🚪';

// ─── Log ──────────────────────────────────────────────────────────
const CLOCK    = '🕐';
const CALENDAR = '📅';
const TRASH    = '🗑️';
const PENCIL   = '✏️';
const LINK     = '🔗';
const SHIELD   = '🛡️';
const BELL     = '🔔';
const EYE      = '👁️';

// ─── Ses & Medya ──────────────────────────────────────────────────
const MIC      = '🎙️';
const HEADSET  = '🎧';
const SPEAKER  = '🔊';
const MUTE     = '🔇';

// ─── ASOIAF Temalı ────────────────────────────────────────────────
const CASTLE   = '🏰';
const SWORD    = '⚔️';
const WOLF     = '🐺';
const LION     = '🦁';
const DRAGON   = '🐉';
const CROW     = '🦅';
const FIRE     = '🔥';
const SNOW     = '❄️';
const SHIP     = '⚓';
const ROSE     = '🌹';
const DAGGER   = '🗡️';
const GOLD     = '💰';
const MAP      = '🗺️';

// ─── Separator Karakterleri ───────────────────────────────────────
const DOT      = '•';
const ARROW    = '›';

// ─── Helper: Timestamp ────────────────────────────────────────────
function timestamp(date = new Date(), style = 'f') {
  const unix = Math.floor(date.getTime() / 1000);
  return `<t:${unix}:${style}>`;
}

// Timestamp stilleri: t=kısa saat, T=uzun saat, d=kısa tarih,
// D=uzun tarih, f=tarih+saat, F=uzun tarih+saat, R=göreceli

module.exports = {
  CHECK, ERROR, WARN, LOADING, LOCK, UNLOCK,
  USER, CROWN, SCROLL, QUILL, CAKE, STAR, WELCOME, WAVE, LEAVE,
  CLOCK, CALENDAR, TRASH, PENCIL, LINK, SHIELD, BELL, EYE,
  MIC, HEADSET, SPEAKER, MUTE,
  CASTLE, GOLD, SWORD, WOLF, LION, DRAGON, CROW, FIRE, SNOW, SHIP,
  ROSE, DAGGER, GOLD, MAP,
  DOT, ARROW,
  timestamp,
};