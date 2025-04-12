// models/blog.js

const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: String,  // You can change this to ObjectId if you link to an author collection
    required: true
  },
  image: {
    type: String,  // URL or file path for the image
    required: false
  },
  category: {
    type: String,
    enum: ['Health', 'Wellness', 'Care', 'Lifestyle', 'News'], // Example categories
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],  // Blog status
    default: 'draft'
  },
  published_at: {
    type: Date,
    default: null  // Can be set when the blog is published
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

module.exports = mongoose.model('Blog', blogSchema);
