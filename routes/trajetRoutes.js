const express = require('express')
const router  = express.Router()

const {
  listerTrajets,
  afficherFormulaire,
  creerTrajet,
  voirTrajet,
  rejoindreTrajet,
  supprimerTrajet,
  annulerTrajet,
  afficherModification,
  modifierTrajet
} = require('../controllers/trajetController')

const { estConnecte } = require('../middleware/authMiddleware')

const estConducteur = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'conducteur') return next()
  req.flash('error_msg', 'Seuls les conducteurs peuvent effectuer cette action.')
  res.redirect('/trajets')
}

const estPassager = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'passager') return next()
  req.flash('error_msg', 'Seuls les passagers peuvent réserver un trajet.')
  res.redirect('/trajets')
}

router.get('/',                    listerTrajets)
router.get('/nouveau',             estConnecte, estConducteur, afficherFormulaire)
router.post('/nouveau',            estConnecte, estConducteur, creerTrajet)
router.get('/:id',                 voirTrajet)
router.post('/:id/rejoindre',      estConnecte, estPassager,   rejoindreTrajet)
router.post('/:id/supprimer',      estConnecte, estConducteur, supprimerTrajet)
router.post('/:id/annuler',        estConnecte, estConducteur, annulerTrajet)
router.get('/:id/modifier',        estConnecte, estConducteur, afficherModification)
router.post('/:id/modifier',       estConnecte, estConducteur, modifierTrajet)

module.exports = router