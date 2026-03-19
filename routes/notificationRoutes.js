const express = require('express')
const router  = express.Router()
const { marquerLues, mesNotifications } = require('../controllers/notificationController')

const estConnecte = (req, res, next) => {
  if (req.session.user) return next()
  res.status(401).json({ error: 'Non connecté' })
}

router.get('/notifications',          estConnecte, mesNotifications)
router.post('/notifications/lues',    estConnecte, marquerLues)

module.exports = router