const mongoose = require('mongoose')

const EvaluationSchema = new mongoose.Schema({
  auteur:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cible:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trajet:      { type: mongoose.Schema.Types.ObjectId, ref: 'Trajet', required: true },
  note:        { type: Number, required: true, min: 1, max: 5 },
  commentaire: { type: String, default: '' }
}, { timestamps: true })

module.exports = mongoose.model('Evaluation', EvaluationSchema)