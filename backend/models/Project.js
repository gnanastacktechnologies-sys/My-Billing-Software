const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  projectName: { type: String, required: true },
  customerName: { type: String },
  customerPhone: { type: String },
  customerEmail: { type: String },
  customerAddress: { type: String },
  customFields: [{
    label: { type: String },
    value: { type: String }
  }],
  requirements: {
    header: { type: Boolean, default: true },
    menu: { type: Boolean, default: true },
    sidebar: { type: Boolean, default: false },
    content: { type: Boolean, default: true },
    footer: { type: Boolean, default: true },
    container: { type: Boolean, default: true }
  },
  requirementNotes: {
    header: { type: String, default: '' },
    menu: { type: String, default: '' },
    sidebar: { type: String, default: '' },
    content: { type: String, default: '' },
    footer: { type: String, default: '' },
    container: { type: String, default: '' }
  },
  contentPages: [{
    name: { type: String },
    note: { type: String }
  }],
  deadline: { type: Date },
  projectType: { type: String },
  description: { type: String },
  otherNotes: { type: String },
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
  discountType: { type: String, enum: ['amount', 'percentage', 'none'], default: 'none' },
  discountValue: { type: Number, default: 0 },
  status: { type: String, enum: ['Create Project', 'In Progress', 'Completed'], default: 'In Progress' },
  invoiceNo: { type: String },
  invoiceUrl: { type: String },
  category: { type: String, enum: ['billing', 'management'], default: 'billing' }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
