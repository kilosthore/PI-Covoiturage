const Evaluation = require('../models/Evaluation')
const User       = require('../models/User')
const Trajet     = require('../models/Trajet')
const { creerNotification } = require('./notificationController')

// Afficher formulaire évaluation
const afficherEvaluation = async (req, res) => {
  try {
    const trajet = await Trajet.findById(req.params.id).populate('conducteur').populate('passagers')
    if (!trajet) { req.flash('error_msg', 'Trajet introuvable.'); return res.redirect('/dashboard') }

    const userId = req.session.user._id
    const estConducteur = trajet.conducteur._id.toString() === userId.toString()
    const estPassager   = trajet.passagers.some(p => p._id.toString() === userId.toString())

    if (!estConducteur && !estPassager) {
      req.flash('error_msg', 'Vous ne participez pas à ce trajet.')
      return res.redirect('/dashboard')
    }

    // Qui évaluer ?
    let cibles = []
    if (estPassager) {
      cibles = [trajet.conducteur]
    } else {
      cibles = trajet.passagers
    }

    // Vérifier déjà évalué
    const dejaEvalue = await Evaluation.find({ auteur: userId, trajet: trajet._id })
    const dejaCibles = dejaEvalue.map(e => e.cible.toString())

    res.render('evaluer', { title: 'Évaluer', trajet, cibles, dejaCibles })
  } catch (err) {
    console.log(err)
    res.redirect('/dashboard')
  }
}

// Soumettre évaluation
const soumettreEvaluation = async (req, res) => {
  try {
    const { cibleId, note, commentaire } = req.body
    const trajetId = req.params.id
    const auteurId = req.session.user._id

    // Vérifier doublon
    const existant = await Evaluation.findOne({ auteur: auteurId, cible: cibleId, trajet: trajetId })
    if (existant) {
      req.flash('error_msg', 'Vous avez déjà évalué cette personne.')
      return res.redirect('/dashboard')
    }

    await Evaluation.create({ auteur: auteurId, cible: cibleId, trajet: trajetId, note: parseInt(note), commentaire })

    // Mettre à jour la note moyenne de la cible
    const evaluations = await Evaluation.find({ cible: cibleId })
    const moyenne = evaluations.reduce((acc, e) => acc + e.note, 0) / evaluations.length
    await User.findByIdAndUpdate(cibleId, { note: Math.round(moyenne * 10) / 10, nbEvaluations: evaluations.length })

    // Notification à la cible
    const auteur = await User.findById(auteurId)
    await creerNotification(cibleId, `${auteur.prenom} vous a laissé une évaluation de ${note}/5 ⭐`, 'evaluation', `/dashboard`)

    req.flash('success_msg', 'Évaluation envoyée !')
    res.redirect('/dashboard')
  } catch (err) {
    console.log(err)
    res.redirect('/dashboard')
  }
}

module.exports = { afficherEvaluation, soumettreEvaluation }