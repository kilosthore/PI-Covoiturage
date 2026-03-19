const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')

const UserSchema = new mongoose.Schema({
  prenom:        { type: String, required: true },
  nom:           { type: String, required: true },
  email:         { type: String, required: true, unique: true },
  motDePasse:    { type: String, required: true },
  role:          { type: String, enum: ['passager', 'conducteur', 'admin'], required: true },
  photo:         { type: String, default: '' },
  permis:        { type: String, default: '' },
  assurance:     { type: String, default: '' },
  note:          { type: Number, default: 0 },
  nbEvaluations: { type: Number, default: 0 },
  verifie:       { type: Boolean, default: false }
}, { timestamps: true })

UserSchema.pre('save', async function(next) {
  if (!this.isModified('motDePasse')) return next()
  this.motDePasse = await bcrypt.hash(this.motDePasse, 10)
  next()
})

UserSchema.methods.comparerMotDePasse = async function(motDePasseSaisi) {
  return bcrypt.compare(motDePasseSaisi, this.motDePasse)
}

module.exports = mongoose.model('User', UserSchema)