const { Schema, model } = require('mongoose');

const statSchema = new Schema({
  guc:         { type: Number, default: 5 },
  diplomasi:   { type: Number, default: 5 },
  dayaniklilik:{ type: Number, default: 5 },
  ceviklik:    { type: Number, default: 5 },
  bilgelik:    { type: Number, default: 5 },
  idare:       { type: Number, default: 5 },
  entrika:     { type: Number, default: 5 },
  askeriye:    { type: Number, default: 5 },
}, { _id: false });

const characterSchema = new Schema(
  {
    discordId:   { type: String, required: true, unique: true },
    guildId:     { type: String, required: true },

    // Temel bilgiler
    karakterAdi: { type: String, default: null },
    yas:         { type: Number, default: null },

    // Rol ID'leri
    cinsiyet:    { type: String, default: null },
    irk:         { type: String, default: null },
    soyluluk:    { type: String, default: null },
    din:         { type: String, default: null },
    konum:       { type: String, default: null },
    meslek:      { type: String, default: null },
    hane:        { type: String, default: null },

    // Statlar
    statlar: { type: statSchema, default: () => ({}) },
    statGirildi: { type: Boolean, default: false },

    kayitTarihi: { type: Date, default: null },
    kaydedenYetkili: { type: String, default: null },
  },
  { timestamps: true }
);

characterSchema.index({ discordId: 1 });

module.exports = model('Character', characterSchema);