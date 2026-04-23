const roles = require('./roles');

// ── Cinsiyet ──────────────────────────────────────────────────
const CINSIYETLER = [
  { label: 'Erkek', value: roles.ERKEK,  emoji: '⚔️' },
  { label: 'Kadın', value: roles.KADIN,  emoji: '🌹' },
];

// ── Irklar ────────────────────────────────────────────────────
const IRKLAR = [
  { label: 'İlk İnsanlar',  value: roles.ILK_INSANLAR, emoji: '🌲' },
  { label: 'Andallar',      value: roles.ANDALLAR,      emoji: '⚔️' },
  { label: 'Rhoynarlar',    value: roles.RHOYNARLAR,    emoji: '🌊' },
  { label: 'Valyrialılar',  value: roles.VALYRALLILAR,  emoji: '🐉' },
];

// ── Soyluluk ──────────────────────────────────────────────────
const SOYLULUKLAR = [
  { label: 'Soylu',  value: roles.SOYLU, emoji: '👑' },
  { label: 'Piç',    value: roles.PIC,   emoji: '⚔️' },
  { label: 'Köylü',  value: roles.KOYLU, emoji: '🌾' },
];

// ── Dinler ────────────────────────────────────────────────────
const DINLER = [
  { label: 'Yedi İnancı',    value: roles.YEDI_INANCI,    emoji: '🕯️' },
  { label: "R'hllor",        value: roles.RHLLOR,         emoji: '🔥' },
  { label: 'Eski Tanrılar',  value: roles.ESKI_TANRILAR,  emoji: '🌳' },
  { label: 'Boğulmuş Tanrı', value: roles.BOGULMUS_TANRI, emoji: '🌊' },
];

// ── Konumlar ──────────────────────────────────────────────────
const KONUMLAR = [
  { label: 'Kuzey Toprakları',   value: roles.KUZEY_TOPRAKLARI,   emoji: '❄️' },
  { label: 'Nehir Toprakları',   value: roles.NEHIR_TOPRAKLARI,   emoji: '🐟' },
  { label: 'Taç Toprakları',     value: roles.TAC_TOPRAKLARI,     emoji: '👑' },
  { label: 'Batı Toprakları',    value: roles.BATI_TOPRAKLARI,    emoji: '🦁' },
  { label: 'Fırtına Toprakları', value: roles.FIRTINA_TOPRAKLARI, emoji: '🦌' },
  { label: 'Arryn Vadisi',       value: roles.ARRYN_VADISI,       emoji: '🦅' },
  { label: 'Dorne',              value: roles.DORNE_KONUMU,       emoji: '☀️' },
  { label: 'Menzil Toprakları',  value: roles.MENZIL,             emoji: '🌿' },
  { label: 'Demir Adalar',       value: roles.DEMIR_ADALAR,       emoji: '⚓' },
  { label: 'Essos',              value: roles.ESSOS,              emoji: '🌍' },
];

// ── Meslekler ─────────────────────────────────────────────────
const MESLEKLER_1 = [
  { label: 'Kral / Kraliçe',                     value: roles.KRAL_KRALICE },
  { label: 'Prens / Prenses',                    value: roles.PRENS_PRENSES },
  { label: 'Dorne Prensi / Prensesi',            value: roles.DORNE_PRENSI_PRENSESI },
  { label: 'Kral Eli',                           value: roles.KRAL_ELI },
  { label: 'Yüce Lord',                          value: roles.YUCE_LORD },
  { label: 'Kral Muhafızları Lord Kumandanı',    value: roles.KRAL_MUHAFIZLARI_LORD_KUMANDANI },
  { label: 'Şehir Muhafızları Lord Kumandanı',   value: roles.SEHIR_MUHAFIZLARI_LORD_KUMANDANI },
  { label: 'Gece Nöbetçileri Lord Kumandanı',    value: roles.GECE_NOBETCILERI_LORD_KUMANDANI },
  { label: 'Yüce Septon',                        value: roles.YUCE_SEPTON },
  { label: 'Küçük Konsey',                       value: roles.KUCUK_KONSEY },
  { label: 'Büyük Üstat',                        value: roles.BUYUK_USTAT },
  { label: 'Hazinedar',                          value: roles.HAZINEDAR },
  { label: 'Kanun Başı',                         value: roles.KANUN_BASI },
  { label: 'Donanma Başı',                       value: roles.DONANMA_BASI },
  { label: 'Fısıltıların Efendisi',              value: roles.FISILTILARIN_EFENDISI },
  { label: 'Kral Muhafızı',                      value: roles.KRAL_MUHAFIZI },
  { label: 'Lord / Leydi',                       value: roles.LORD_LEYDI },
  { label: 'Şövalye',                            value: roles.SOVALYE },
  { label: 'Gece Nöbetçisi',                     value: roles.GECE_NOBETCISI },
  { label: 'Kızıl Rahip / Rahibe',               value: roles.KIZIL_RAHIP_RAHIBE },
  { label: 'Paralı Asker',                       value: roles.PARALI_ASKER },
  { label: 'Tüccar',                             value: roles.TUCCAR },
  { label: 'Korsan',                             value: roles.KORSAN },
  { label: 'Haydut',                             value: roles.HAYDUT },
  { label: 'Nedime',                             value: roles.NEDIME },
];

const MESLEKLER_2 = [
  { label: 'Yaver', value: roles.YAVER },
];

// ── Haneler (ilk 25 — Discord limiti) ────────────────────────
const HANELER_1 = [
  { label: 'Hanesiz',          value: 'hanesiz' },
  { label: 'Kraliyet Hanesi',  value: roles.KRALIYET_HANESI },
  { label: 'Baratheon Hanesi', value: roles.BARATHEON_HANESI },
  { label: 'Lannister Hanesi', value: roles.LANNISTER_HANESI },
  { label: 'Stark Hanesi',     value: roles.STARK_HANESI },
  { label: 'Martell Hanesi',   value: roles.MARTELL_HANESI },
  { label: 'Tyrell Hanesi',    value: roles.TYRELL_HANESI },
  { label: 'Arryn Hanesi',     value: roles.ARRYN_HANESI },
  { label: 'Tully Hanesi',     value: roles.TULLY_HANESI },
  { label: 'Greyjoy Hanesi',   value: roles.GREYJOY_HANESI },
  { label: 'Karstark Hanesi',  value: roles.KARSTARK_HANESI },
  { label: 'Umber Hanesi',     value: roles.UMBER_HANESI },
  { label: 'Manderly Hanesi',  value: roles.MANDERLY_HANESI },
  { label: 'Bolton Hanesi',    value: roles.BOLTON_HANESI },
  { label: 'Cerwyn Hanesi',    value: roles.CERWYN_HANESI },
  { label: 'Reed Hanesi',      value: roles.REED_HANESI },
  { label: 'Mormont Hanesi',   value: roles.MORMONT_HANESI },
  { label: 'Glover Hanesi',    value: roles.GLOVER_HANESI },
  { label: 'Frey Hanesi',      value: roles.FREY_HANESI },
  { label: 'Mallister Hanesi', value: roles.MALLISTER_HANESI },
  { label: 'Blackwood Hanesi', value: roles.BLACKWOOD_HANESI },
  { label: 'Bracken Hanesi',   value: roles.BRACKEN_HANESI },
  { label: 'Vance Hanesi',     value: roles.VANCE_HANESI },
  { label: 'Piper Hanesi',     value: roles.PIPER_HANESI },
  { label: 'Darry Hanesi',     value: roles.DARRY_HANESI },
];

const HANELER_2 = [
  { label: 'Royce Hanesi',      value: roles.ROYCE_HANESI },
  { label: 'Corbray Hanesi',    value: roles.CORBRAY_HANESI },
  { label: 'Waynwood Hanesi',   value: roles.WAYNWOOD_HANESI },
  { label: 'Grafton Hanesi',    value: roles.GRAFTON_HANESI },
  { label: 'Redfort Hanesi',    value: roles.REDFORT_HANESI },
  { label: 'Belmore Hanesi',    value: roles.BELMORE_HANESI },
  { label: 'Lefford Hanesi',    value: roles.LEFFORD_HANESI },
  { label: 'Crakehall Hanesi',  value: roles.CRAKEHALL_HANESI },
  { label: 'Marbrand Hanesi',   value: roles.MARBRAND_HANESI },
  { label: 'Westerling Hanesi', value: roles.WESTERLING_HANESI },
  { label: 'Brax Hanesi',       value: roles.BRAX_HANESI },
  { label: 'Farman Hanesi',     value: roles.FARMAN_HANESI },
  { label: 'Hightower Hanesi',  value: roles.HIGHTOWER_HANESI },
  { label: 'Redwyne Hanesi',    value: roles.REDWYNE_HANESI },
  { label: 'Florent Hanesi',    value: roles.FLORENT_HANESI },
  { label: 'Tarly Hanesi',      value: roles.TARLY_HANESI },
  { label: 'Rowan Hanesi',      value: roles.ROWAN_HANESI },
  { label: 'Oakheart Hanesi',   value: roles.OAKHEART_HANESI },
  { label: 'Fossoway Hanesi',   value: roles.FOSSOWAY_HANESI },
  { label: 'Harlaw Hanesi',     value: roles.HARLAW_HANESI },
  { label: 'Goodbrother Hanesi',value: roles.GOODBROTHER_HANESI },
  { label: 'Drumm Hanesi',      value: roles.DRUMM_HANESI },
  { label: 'Blacktyde Hanesi',  value: roles.BLACKTYDE_HANESI },
  { label: 'Botley Hanesi',     value: roles.BOTLEY_HANESI },
  { label: 'Velaryon Hanesi',   value: roles.VELARYON_HANESI },
];

const HANELER_3 = [
  { label: 'Targaryen Hanesi', value: '1495870555004469461' },
  { label: 'Celtigar Hanesi',   value: roles.CELTIGAR_HANESI },
  { label: 'Rosby Hanesi',      value: roles.ROSBY_HANESI },
  { label: 'Massey Hanesi',     value: roles.MASSEY_HANESI },
  { label: 'Rykker Hanesi',     value: roles.RYKKER_HANESI },
  { label: 'Yronwood Hanesi',   value: roles.YRONWOOD_HANESI },
  { label: 'Dayne Hanesi',      value: roles.DAYNE_HANESI },
  { label: 'Fowler Hanesi',     value: roles.FOWLER_HANESI },
  { label: 'Blackmont Hanesi',  value: roles.BLACKMONT_HANESI },
  { label: 'Uller Hanesi',      value: roles.ULLER_HANESI },
  { label: 'Tarth Hanesi',      value: roles.TARTH_HANESI },
  { label: 'Dondarrion Hanesi', value: roles.DONDARRION_HANESI },
  { label: 'Selmy Hanesi',      value: roles.SELMY_HANESI },
  { label: 'Swann Hanesi',      value: roles.SWANN_HANESI },
  { label: 'Estermont Hanesi',  value: roles.ESTERMONT_HANESI },
  { label: 'Caron Hanesi',      value: roles.CARON_HANESI },
  { label: 'Rogare Hanesi',     value: roles.ROGARE_HANESI },
  { label: 'Altın Kumpanya',    value: roles.ALTIN_KUMPANYA },
  { label: 'Whent Hanesi',      value: roles.WHENT_HANESI },
];

// Ayraç rolleri (karaktere verilecek)
const AYRAC_ROLLER = {
  meslek:   '1495773001868771503', // ────────《Meslekler》────────
  hane:     '1495773001650802740', // ────────《Haneler》────────
  konum:    '1495773001214328957', // ────────《Karakter Konumu》────────
  soyluluk: '1495773001193488387', // ────────《Karakter Soyluluk》────────
  din:      '1495773001118126229', // ────────《Dinler》────────
  irk:      '1495773001118126224', // ────────《Irklar》────────
  ozellik:  '1495773001105412175', // ────────《Karakter Özellikleri》────────
};

module.exports = {
  CINSIYETLER, IRKLAR, SOYLULUKLAR, DINLER, KONUMLAR,
  MESLEKLER_1, MESLEKLER_2, HANELER_1, HANELER_2, HANELER_3, AYRAC_ROLLER,
};