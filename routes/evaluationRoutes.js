const express = require('express')
const router  = express.Router()
const { afficherEvaluation, soumettreEvaluation } = require('../controllers/evaluationController')

const estConnecte = (req, res, next) => {
  if (req.session.user) return next()
  req.flash('error_msg', 'Connectez-vous d\'abord.')
  res.redirect('/login')
}

router.get('/trajets/:id/evaluer',  estConnecte, afficherEvaluation)
router.post('/trajets/:id/evaluer', estConnecte, soumettreEvaluation)

module.exports = router