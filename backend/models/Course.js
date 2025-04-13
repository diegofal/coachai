const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Esquema de curso
const courseSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  level: {
    type: Number,
    required: true,
    enum: [1, 2, 3]
  },
  price: {
    type: Number,
    required: true
  },
  modules: [{
    type: Schema.Types.ObjectId,
    ref: 'Module'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Course', courseSchema);
