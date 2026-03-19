const express = require('express')
const router  = express.Router()
const User    = require('../models/User')

const estConnecte = (req, res, next) => {
  if (req.session.user) return next()
  res.redirect('/login')
}

// Afficher profil
router.get('/profil', estConnecte, async (req, res) => {
  const user = await User.findById(req.session.user._id)
  res.render('profil', { title: 'Mon profil', userComplet: user })
})

// Sauvegarder photo (base64 depuis la caméra)
router.post('/profil/photo', estConnecte, async (req, res) => {
  try {
    const { photo } = req.body
    await User.findByIdAndUpdate(req.session.user._id, { photo })

    // Mettre à jour la session
    req.session.user.photo = photo
    res.json({ ok: true })
  } catch (err) {
    res.json({ ok: false })
  }
})

module.exports = router