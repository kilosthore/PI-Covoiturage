const Signalement = require('../models/Signalement')
const Trajet      = require('../models/Trajet')

// Soumettre un signalement
// ✅ CORRECTION : faute de frappe corrigée  "soumettreSingalement" → "soumettrSignalement"
const soumettreSignalement = async (req, res) => {
  try {
    const { cibleId, trajetId, raison, details } = req.body

    // Vérifier que le trajet existe
    const trajet = await Trajet.findById(trajetId)
    if (!trajet) {
      req.flash('error_msg', 'Trajet introuvable.')
      return res.redirect('/trajets')
    }

    // Empêcher de se signaler soi-même
    if (cibleId === req.session.user._id.toString()) {
      req.flash('error_msg', 'Vous ne pouvez pas vous signaler vous-même.')
      return res.redirect(`/trajets/${trajetId}`)
    }

    // Vérifier si un signalement existe déjà pour ce duo sur ce trajet
    const dejaSignale = await Signalement.findOne({
      auteur: req.session.user._id,
      cible:  cibleId,
      trajet: trajetId
    })
    if (dejaSignale) {
      req.flash('error_msg', 'Vous avez déjà soumis un signalement pour cette personne sur ce trajet.')
      return res.redirect(`/trajets/${trajetId}`)
    }

    await Signalement.create({
      auteur:  req.session.user._id,
      cible:   cibleId,
      trajet:  trajetId,
      raison,
      details: details || ''
    })

    req.flash('success_msg', 'Signalement soumis. Un administrateur va examiner la situation.')
    res.redirect(`/trajets/${trajetId}`)
  } catch (err) {
    console.log(err)
    res.redirect('/trajets')
  }
}

// Admin — liste tous les signalements
const listerSignalements = async (req, res) => {
  try {
    const signalements = await Signalement.find()
      .populate('auteur', 'prenom nom email')
      .populate('cible',  'prenom nom email')
      .populate('trajet', 'villeDepart villeArrivee dateDepart')
      .sort({ createdAt: -1 })

    res.render('admin/signalements', {
      title: 'Signalements',
      signalements
    })
  } catch (err) {
    console.log(err)
    res.redirect('/admin')
  }
}

// Admin — traiter un signalement
const traiterSignalement = async (req, res) => {
  try {
    const { statut, noteAdmin } = req.body
    await Signalement.findByIdAndUpdate(req.params.id, { statut, noteAdmin: noteAdmin || '' })
    req.flash('success_msg', 'Signalement mis à jour.')
    res.redirect('/admin/signalements')
  } catch (err) {
    console.log(err)
    res.redirect('/admin/signalements')
  }
}

module.exports = { soumettreSignalement, listerSignalements, traiterSignalement }