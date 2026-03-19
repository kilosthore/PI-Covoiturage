const express = require('express')
const router  = express.Router()

const {
  demanderReservation,
  accepterReservation,
  refuserReservation,
  mesReservations
} = require('../controllers/reservationController')

const { estConnecte } = require('../middleware/authMiddleware')

// Seuls les passagers peuvent réserver
const estPassager = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'passager') return next()
  req.flash('error_msg', 'Seuls les passagers peuvent faire une réservation.')
  res.redirect('/trajets')
}

// Seuls les conducteurs peuvent gérer les réservations
const estConducteur = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'conducteur') return next()
  req.flash('error_msg', 'Seuls les conducteurs peuvent gérer les réservations.')
  res.redirect('/dashboard')
}

// Passager : demander une réservation
router.post('/trajets/:id/reserver',      estConnecte, estPassager,   demanderReservation)

// Conducteur : accepter ou refuser
router.post('/reservations/:id/accepter', estConnecte, estConducteur, accepterReservation)
router.post('/reservations/:id/refuser',  estConnecte, estConducteur, refuserReservation)

// Passager : voir ses réservations
router.get('/mes-reservations',           estConnecte, estPassager,   mesReservations)

module.exports = router