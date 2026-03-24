const express = require('express')
const router  = express.Router()

// ✅ CORRECTION : nom corrigé pour correspondre au contrôleur corrigé
const { soumettreSignalement, listerSignalements, traiterSignalement } = require('../controllers/signalementController')
const { estConnecte } = require('../middleware/authMiddleware')

// Middleware admin
const estAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'admin') return next()
  req.flash('error_msg', 'Accès réservé aux administrateurs.')
  res.redirect('/')
}

// Soumettre un signalement (utilisateur connecté)
router.post('/signalement', estConnecte, soumettreSignalement)

// Admin — voir tous les signalements
router.get('/admin/signalements', estAdmin, listerSignalements)

// Admin — traiter un signalement
router.post('/admin/signalements/:id/traiter', estAdmin, traiterSignalement)

module.exports = router