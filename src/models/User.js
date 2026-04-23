const { Schema, model } = require('mongoose');

const userSchema = new Schema(
  {
    // ─── Discord ────────────────────────────────────────────────
    discordId:  { type: String, required: true, unique: true },
    username:   { type: String, required: true },

    // ─── Kayıt Bilgileri ────────────────────────────────────────
    registeredName: { type: String, default: null },  // /kayıt ile girilen isim
    registeredAge:  { type: Number, default: null },  // /kayıt ile girilen yaş
    registeredAt:   { type: Date,   default: null },
    registeredBy:   { type: String, default: null },  // Kendi kayıt ettiyse 'self'

    // ─── Karakter Bilgileri ─────────────────────────────────────
    character: {
      name:       { type: String, default: null },
      house:      { type: String, default: null },  // Hane rol ID'si
      title:      { type: String, default: null },  // Meslek rol ID'si
      location:   { type: String, default: null },  // Konum rol ID'si
      nobility:   { type: String, default: null },  // Soyluluk rol ID'si
      religion:   { type: String, default: null },  // Din rol ID'si
      race:       { type: String, default: null },  // Irk rol ID'si
      gender:     { type: String, default: null },  // Cinsiyet rol ID'si
      items:      [{ type: String }],               // Epik item rol ID'leri
    },

    // ─── RP İstatistikleri ──────────────────────────────────────
    rpStats: {
      totalWords:   { type: Number, default: 0 },
      weeklyWords:  { type: Number, default: 0 },
      weeklyReset:  { type: Date,   default: null },
      lastActivity: { type: Date,   default: null },
    },

    // ─── Ekonomi ────────────────────────────────────────────────
    economy: {
      gold:   { type: Number, default: 0 },
      silver: { type: Number, default: 0 },
      copper: { type: Number, default: 0 },
    },

    // ─── Envanter ───────────────────────────────────────────────
    inventory: [
      {
        itemId:    String,
        itemName:  String,
        quantity:  { type: Number, default: 1 },
        obtainedAt: { type: Date, default: Date.now },
      },
    ],

    // ─── Davet İstatistikleri ────────────────────────────────────
    invites: {
      total:  { type: Number, default: 0 },
      left:   { type: Number, default: 0 },  // Davet ettikleri ayrılanlar
      bonus:  { type: Number, default: 0 },  // Elle eklenen
    },

    // ─── Meta ───────────────────────────────────────────────────
    isRegistered: { type: Boolean, default: false },
    isBanned:     { type: Boolean, default: false },
    notes:        [{ type: String }],       // Yetkili notları
  },
  {
    timestamps: true,
  }
);

// İndeksler
userSchema.index({ 'rpStats.weeklyWords': -1 });
userSchema.index({ 'rpStats.totalWords': -1 });

module.exports = model('User', userSchema);
