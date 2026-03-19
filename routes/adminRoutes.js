const express = require('express')
const router  = express.Router()
const { dashboardAdmin, supprimerUtilisateur, verifierConducteur, supprimerTrajetAdmin } = require('../controllers/adminController')

// Middleware admin
const estAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'admin') return next()
  req.flash('error_msg', 'Accès réservé aux administrateurs.')
  res.redirect('/')
}

router.get('/',                              estAdmin, dashboardAdmin)
router.post('/utilisateurs/:id/supprimer',   estAdmin, supprimerUtilisateur)
router.post('/utilisateurs/:id/verifier',    estAdmin, verifierConducteur)
router.post('/trajets/:id/supprimer',        estAdmin, supprimerTrajetAdmin)

module.exports = router