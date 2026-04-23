const { Schema, model } = require('mongoose');

const houseSchema = new Schema(
  {
    rolId:         { type: String, required: true, unique: true },
    isim:          { type: String, required: true },
    kasa:          { type: Number, default: 0 },
    haftalikGelir: { type: Number, default: 0 },
    duzenliAsker:  { type: Number, default: 0 },
    paraliAsker:   { type: Number, default: 0 },
    donanma:       { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = model('House', houseSchema);