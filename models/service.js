// models/service.js

const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  service_name: {
    type: String,
    required: true
  },
  service_image: {
    type: String, // URL or file path
    required: true
  },
  service_desc: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'], // Example statuses
    default: 'active'
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    enum: ['Physio', 'Nursing', 'Lab', 'Latest', 'General'], 
    default: 'General',
    required: true
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

module.exports = mongoose.model('Service', serviceSchema);
