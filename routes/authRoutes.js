const express = require('express')
const router  = express.Router()
const Reservation = require('../models/Reservation')
const Trajet      = require('../models/Trajet')

const {
  afficherInscription,
  inscrireUtilisateur,
  afficherConnexion,
  connecterUtilisateur,
  deconnecterUtilisateur
} = require('../controllers/authController')

// Middleware
const estConnecte   = (req, res, next) => { if (req.session.user) return next(); res.redirect('/login') }
const estDeconnecte = (req, res, next) => { if (!req.session.user) return next(); res.redirect('/dashboard') }

// Page d'accueil
router.get('/', async (req, res) => {
  try {
    const trajets = await Trajet.find({ statut: 'actif' })
      .populate('conducteur')
      .sort({ dateDepart: 1 })
      .limit(6)
    res.render('index', { title: 'Accueil', trajets })
  } catch (err) {
    console.log(err)
    res.render('index', { title: 'Accueil', trajets: [] })
  }
})

// Pages publiques
router.get('/about',   (req, res) => res.render('about',   { title: 'À propos' }))
router.get('/contact', (req, res) => res.render('contact', { title: 'Contact' }))

// Inscription
router.get('/register',  estDeconnecte, afficherInscription)
router.post('/register', estDeconnecte, inscrireUtilisateur)

// Connexion
router.get('/login',  estDeconnecte, afficherConnexion)
router.post('/login', estDeconnecte, connecterUtilisateur)

// Déconnexion
router.get('/logout', estConnecte, deconnecterUtilisateur)

// Dashboard
router.get('/dashboard', estConnecte, async (req, res) => {
  try {
    const userId = req.session.user._id

    // Trajets publiés par le conducteur
    const mesTrajets = await Trajet.find({ conducteur: userId })
      .populate('conducteur')
      .sort({ dateDepart: -1 })

    // Demandes reçues sur les trajets du conducteur (en_attente seulement)
    const demandesRecues = await Reservation.find({
      trajet: { $in: mesTrajets.map(t => t._id) },
      statut: 'en_attente'
    })
      .populate('passager')
      .populate('trajet')
      .sort({ createdAt: -1 })

    // Trajets rejoints par le passager
    const trajetsRejoints = await Trajet.find({ passagers: userId })
      .populate('conducteur')
      .sort({ dateDepart: -1 })

    res.render('dashboard', {
      title: 'Tableau de bord',
      mesTrajets,
      demandesRecues,
      trajetsRejoints
    })

  } catch (err) {
    console.log('Erreur dashboard :', err.message)
    res.redirect('/')
  }
})

module.exports = router