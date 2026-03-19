const mongoose = require('mongoose')

const TrajetSchema = new mongoose.Schema({
  conducteur:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  villeDepart:       { type: String, required: true },
  villeArrivee:      { type: String, required: true },
  adresseDepart:     { type: String, default: '' },
  adresseArrivee:    { type: String, default: '' },
  dateDepart:        { type: Date, required: true },
  heureDepart:       { type: String, required: true },
  placesDisponibles: { type: Number, default: 3 },
  passagers:         [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  typePartage:       { type: String, enum: ['gratuit', 'partage_frais'], default: 'partage_frais' },
  vehiculeMarque:    { type: String, default: '' },
  vehiculeModele:    { type: String, default: '' },
  fumeur:            { type: Boolean, default: false },
  animaux:           { type: Boolean, default: false },
  musique:           { type: Boolean, default: false },
  bagages:           { type: Boolean, default: true },
  description:       { type: String, default: '' },
  statut:            { type: String, enum: ['actif', 'complet', 'annule'], default: 'actif' }
}, { timestamps: true })

module.exports = mongoose.model('Trajet', TrajetSchema)