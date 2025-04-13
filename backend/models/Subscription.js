const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Esquema de suscripción
const subscriptionSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseLevel: {
    type: Number,
    required: true,
    enum: [1, 2, 3]
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled'],
    default: 'active'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    default: null
  },
  paymentInfo: {
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    },
    paymentMethod: {
      type: String,
      default: 'credit_card'
    },
    transactionId: {
      type: String,
      default: null
    }
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

// Índice para evitar múltiples suscripciones activas al mismo curso
subscriptionSchema.index({ userId: 1, courseLevel: 1, status: 1 }, { 
  unique: true,
  partialFilterExpression: { status: 'active' }
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
