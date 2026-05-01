const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  invoicePrefix: { type: String, default: 'SM' },
  invoiceStartNumber: { type: Number, default: 1 }
});

module.exports = mongoose.model('Settings', settingsSchema);
