const mongoose = require('mongoose')

const NotificationSchema = new mongoose.Schema({
  utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message:     { type: String, required: true },
  type:        { type: String, enum: ['reservation', 'acceptation', 'refus', 'annulation', 'evaluation'], default: 'reservation' },
  lu:          { type: Boolean, default: false },
  lien:        { type: String, default: '' }
}, { timestamps: true })

module.exports = mongoose.model('Notification', NotificationSchema)