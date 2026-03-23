const mongoose = require('mongoose')

const SignalementSchema = new mongoose.Schema({
  auteur:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cible:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trajet:   { type: mongoose.Schema.Types.ObjectId, ref: 'Trajet', required: true },
  raison:   { type: String, enum: ['comportement', 'retard', 'annulation_abusive', 'autre'], required: true },
  details:  { type: String, default: '' },
  statut:   { type: String, enum: ['en_attente', 'traite', 'rejete'], default: 'en_attente' },
  noteAdmin:{ type: String, default: '' }
}, { timestamps: true })

module.exports = mongoose.model('Signalement', SignalementSchema)
