const { Schema, model } = require('mongoose');

const rpChannelSchema = new Schema(
  {
    guildId:     { type: String, required: true },
    channelId:   { type: String, required: true, unique: true },
    channelName: { type: String, required: true },
    categoryId:  { type: String, default: null }, // Hangi kategoriden geldiği
    addedBy:     { type: String, default: null },  // Ekleyen yetkili ID'si
    addedAt:     { type: Date, default: Date.now },
  },
  { timestamps: true }
);

rpChannelSchema.index({ guildId: 1, channelId: 1 });
rpChannelSchema.index({ categoryId: 1 });

module.exports = model('RpChannel', rpChannelSchema);