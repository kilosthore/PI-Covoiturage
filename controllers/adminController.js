const User    = require('../models/User')
const Trajet  = require('../models/Trajet')

// Dashboard admin
const dashboardAdmin = async (req, res) => {
  try {
    const utilisateurs = await User.find().sort({ createdAt: -1 })
    const trajets      = await Trajet.find().populate('conducteur').sort({ createdAt: -1 })
    const nbPassagers  = utilisateurs.filter(u => u.role === 'passager').length
    const nbConducteurs= utilisateurs.filter(u => u.role === 'conducteur').length

    res.render('admin/dashboard', {
      title: 'Administration',
      utilisateurs,
      trajets,
      nbPassagers,
      nbConducteurs
    })
  } catch (err) {
    console.log(err)
    res.redirect('/')
  }
}

// Supprimer un utilisateur
const supprimerUtilisateur = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id)
    req.flash('success_msg', 'Utilisateur supprimé.')
    res.redirect('/admin')
  } catch (err) {
    res.redirect('/admin')
  }
}

// Vérifier un conducteur
const verifierConducteur = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { verifie: true })
    req.flash('success_msg', 'Conducteur vérifié ✅')
    res.redirect('/admin')
  } catch (err) {
    res.redirect('/admin')
  }
}

// Supprimer un trajet
const supprimerTrajetAdmin = async (req, res) => {
  try {
    await Trajet.findByIdAndDelete(req.params.id)
    req.flash('success_msg', 'Trajet supprimé.')
    res.redirect('/admin')
  } catch (err) {
    res.redirect('/admin')
  }
}

module.exports = { dashboardAdmin, supprimerUtilisateur, verifierConducteur, supprimerTrajetAdmin, afficherRapports }

// Rapports covoiturage
const afficherRapports = async (req, res) => {
  try {
    const Reservation  = require('../models/Reservation')
    const Signalement  = require('../models/Signalement')

    const { periode } = req.query
    let dateDebut = new Date(0)
    const maintenant = new Date()

    if (periode === 'semaine') {
      dateDebut = new Date()
      dateDebut.setDate(maintenant.getDate() - 7)
    } else if (periode === 'mois') {
      dateDebut = new Date()
      dateDebut.setMonth(maintenant.getMonth() - 1)
    }

    const filtrePeriode = { createdAt: { $gte: dateDebut } }

    const totalUtilisateurs = await User.countDocuments(filtrePeriode)
    const totalConducteurs  = await User.countDocuments({ ...filtrePeriode, role: 'conducteur' })
    const totalPassagers    = await User.countDocuments({ ...filtrePeriode, role: 'passager' })

    const totalTrajets    = await Trajet.countDocuments(filtrePeriode)
    const trajetsActifs   = await Trajet.countDocuments({ ...filtrePeriode, statut: 'actif' })
    const trajetsComplets = await Trajet.countDocuments({ ...filtrePeriode, statut: 'complet' })
    const trajetsAnnules  = await Trajet.countDocuments({ ...filtrePeriode, statut: 'annule' })

    const totalReservations = await Reservation.countDocuments(filtrePeriode)
    const reservAcceptees   = await Reservation.countDocuments({ ...filtrePeriode, statut: 'accepte' })
    const reservRefusees    = await Reservation.countDocuments({ ...filtrePeriode, statut: 'refuse' })
    const reservEnAttente   = await Reservation.countDocuments({ ...filtrePeriode, statut: 'en_attente' })

    const totalSignalements = await Signalement.countDocuments(filtrePeriode)
    const signalTraites     = await Signalement.countDocuments({ ...filtrePeriode, statut: 'traite' })
    const signalEnAttente   = await Signalement.countDocuments({ ...filtrePeriode, statut: 'en_attente' })

    const derniersTrajets = await Trajet.find(filtrePeriode)
      .populate('conducteur', 'prenom nom')
      .sort({ createdAt: -1 })
      .limit(10)

    const tauxAcceptation = totalReservations > 0
      ? Math.round((reservAcceptees / totalReservations) * 100)
      : 0

    res.render('admin/rapports', {
      title: 'Rapports',
      periode: periode || 'total',
      totalUtilisateurs, totalConducteurs, totalPassagers,
      totalTrajets, trajetsActifs, trajetsComplets, trajetsAnnules,
      totalReservations, reservAcceptees, reservRefusees, reservEnAttente,
      totalSignalements, signalTraites, signalEnAttente,
      derniersTrajets, tauxAcceptation
    })
  } catch (err) {
    console.log(err)
    res.redirect('/admin')
  }
}

// Remplacer l'export existant