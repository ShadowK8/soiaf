/**
 * Discord Components V2 Builder Yardımcısı
 *
 * Component Type Referansı:
 *   1  → Action Row
 *   2  → Button
 *   9  → Section
 *   10 → Text Display
 *   11 → Thumbnail
 *   12 → Media Gallery
 *   14 → Separator
 *   17 → Container
 *
 * Mesaj flag'i: IS_COMPONENTS_V2 = 1 << 15 = 32768
 * Bu flag set edilince mesajda content/embeds kullanılamaz.
 */

const CV2_FLAG = 1 << 15; // IS_COMPONENTS_V2
const EPHEMERAL = 1 << 6;  // EPHEMERAL

// ─────────────────────────────────────────────────────────────────
// Temel Bileşenler
// ─────────────────────────────────────────────────────────────────

/**
 * Container — Tüm CV2 mesajlarının dış kabuğu.
 * accent_color verilmezse kenar çizgisi olmaz (istediğimiz bu).
 */
function container(components, accentColor = null) {
  const c = { type: 17, components };
  if (accentColor !== null) c.accent_color = accentColor;
  return c;
}

/**
 * Text Display — Markdown destekli metin bloğu.
 */
function text(content) {
  return { type: 10, content };
}

/**
 * Separator — Görsel ayraç çizgisi.
 * @param {boolean} divider  - Çizgi göster (default: true)
 * @param {1|2}     spacing  - 1: küçük, 2: büyük boşluk
 */
function separator(divider = true, spacing = 1) {
  return { type: 14, divider, spacing };
}

/**
 * Section — İçerik + accessory (thumbnail/buton) yan yana.
 */
function section(components, accessory = null) {
  const s = { type: 9, components };
  if (accessory) s.accessory = accessory;
  return s;
}

/**
 * Thumbnail — Section'ın accessory'si olarak kullanılır.
 */
function thumbnail(url, description = null) {
  const t = { type: 11, media: { url } };
  if (description) t.description = description;
  return t;
}

/**
 * Media Gallery — Birden fazla görsel.
 */
function mediaGallery(items) {
  return {
    type: 12,
    items: items.map((item) => ({
      media: { url: item.url },
      ...(item.description && { description: item.description }),
    })),
  };
}

// ─────────────────────────────────────────────────────────────────
// Hazır Şablonlar
// ─────────────────────────────────────────────────────────────────

/**
 * Tek Container'lı basit mesaj.
 * @param {Array}  components  - Container içi bileşenler
 * @param {number} accentColor - Opsiyonel renk (0xRRGGBB)
 * @param {boolean} ephemeral  - Sadece kullanıcıya görünür mü?
 */
function simpleMessage(components, accentColor = null, ephemeral = false) {
  let flags = CV2_FLAG;
  if (ephemeral) flags |= EPHEMERAL;

  return {
    flags,
    components: [container(components, accentColor)],
  };
}

/**
 * Standart Log Mesajı
 * Başlık + avatar thumbnail + içerik + opsiyonel footer.
 * Tasarım gereği hiçbir zaman accent rengi kullanılmaz.
 */
function logMessage({
  title,
  avatarUrl = null,
  fields = [],        // [{ label, value }]
  footer = null,
}) {
  const accentColor = null; // Kasıtlı — renk yok
  const innerComponents = [];

  // ── Başlık + Avatar ──
  if (avatarUrl) {
    innerComponents.push(
      section(
        [text(`## ${title}`)],
        thumbnail(avatarUrl)
      )
    );
  } else {
    innerComponents.push(text(`## ${title}`));
  }

  // ── Ayraç ──
  if (fields.length > 0) {
    innerComponents.push(separator(true, 1));

    // Alanları metin olarak birleştir
    const fieldText = fields
      .map(({ label, value }) => `**${label}** ${value}`)
      .join('\n');
    innerComponents.push(text(fieldText));
  }

  // ── Footer ──
  if (footer) {
    innerComponents.push(separator(false, 1));
    innerComponents.push(text(`-# ${footer}`));
  }

  return {
    flags: CV2_FLAG,
    allowedMentions: { parse: [] }, // Etiket görünsün ama ping gitmesin
    components: [container(innerComponents, accentColor)],
  };
}

/**
 * Hata mesajı (ephemeral).
 */
function errorMessage(message) {
  return simpleMessage(
    [text(`❌ **Hata:** ${message}`)],
    0xe74c3c,
    true
  );
}

/**
 * Başarı mesajı (ephemeral).
 */
function successMessage(message) {
  return simpleMessage(
    [text(`✅ ${message}`)],
    0x2ecc71,
    true
  );
}

// ─────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────
module.exports = {
  CV2_FLAG,
  EPHEMERAL,
  container,
  text,
  separator,
  section,
  thumbnail,
  mediaGallery,
  simpleMessage,
  logMessage,
  errorMessage,
  successMessage,
};