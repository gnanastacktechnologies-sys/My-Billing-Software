const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  projectName: { type: String, required: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  status: { type: String, enum: ['Create Project', 'In Progress', 'Completed'], default: 'In Progress' },
  invoiceNo: { type: String },
  invoiceUrl: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
