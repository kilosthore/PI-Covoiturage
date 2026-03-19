const mongoose = require('mongoose')

const ReservationSchema = new mongoose.Schema({
  trajet:    { type: mongoose.Schema.Types.ObjectId, ref: 'Trajet', required: true },
  passager:  { type: mongoose.Schema.Types.ObjectId, ref: 'User',   required: true },
  statut:    { type: String, enum: ['en_attente', 'accepte', 'refuse'], default: 'en_attente' },
  message:   { type: String, default: '' }
}, { timestamps: true })

module.exports = mongoose.model('Reservation', ReservationSchema)