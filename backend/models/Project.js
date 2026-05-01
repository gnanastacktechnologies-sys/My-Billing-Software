const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  projectName: { type: String, required: true },
  customerName: { type: String },
  customerPhone: { type: String },
  projectType: { type: String },
  description: { type: String },
  price: { type: Number, required: true },
  pricingItems: [{
    label: { type: String },
    startPrice: { type: Number },
    endPrice: { type: Number }
  }],
  hostingStart: { type: Number, default: 0 },
  hostingEnd: { type: Number, default: 0 },
  maintStart: { type: Number, default: 0 },
  maintEnd: { type: Number, default: 0 },
  status: { type: String, enum: ['Create Project', 'In Progress', 'Completed'], default: 'In Progress' },
  invoiceNo: { type: String },
  invoiceUrl: { type: String },
  category: { type: String, enum: ['billing', 'management'], default: 'billing' }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
