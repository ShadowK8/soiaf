const { Schema, model } = require('mongoose');

const warningSchema = new Schema(
  {
    guildId:   { type: String, required: true },
    userId:    { type: String, required: true },
    moderatorId: { type: String, required: true },
    sebep:     { type: String, default: 'Sebep belirtilmedi' },
    aktif:     { type: Boolean, default: true },
    silinecekAt: { type: Date, required: true }, // 1 hafta sonra
  },
  { timestamps: true }
);

warningSchema.index({ guildId: 1, userId: 1 });
warningSchema.index({ silinecekAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

module.exports = model('Warning', warningSchema);