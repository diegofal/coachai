const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Esquema de sección
const sectionSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  moduleId: {
    type: Schema.Types.ObjectId,
    ref: 'Module',
    required: true
  },
  order: {
    type: Number,
    required: true
  },
  videoUrl: {
    type: String,
    default: null
  },
  resources: [{
    title: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['pdf', 'video', 'link', 'document'],
      default: 'link'
    }
  }],
  quizId: {
    type: Schema.Types.ObjectId,
    ref: 'Quiz',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Section', sectionSchema);
