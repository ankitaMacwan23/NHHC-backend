// models/testimonial.js

const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true  // Rating between 1 and 5
  },
  image: {
    type: String, // URL or file path for an image associated with the testimonial
    required: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive'], // Represents whether the testimonial is visible or hidden
    default: 'active'
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Testimonial', testimonialSchema);
