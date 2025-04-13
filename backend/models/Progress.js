const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Esquema de progreso
const progressSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  moduleId: {
    type: Schema.Types.ObjectId,
    ref: 'Module',
    required: true
  },
  sectionId: {
    type: Schema.Types.ObjectId,
    ref: 'Section',
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completionDate: {
    type: Date,
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

// Índice compuesto para evitar duplicados
progressSchema.index({ userId: 1, moduleId: 1, sectionId: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
