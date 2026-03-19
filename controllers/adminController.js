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

module.exports = { dashboardAdmin, supprimerUtilisateur, verifierConducteur, supprimerTrajetAdmin }