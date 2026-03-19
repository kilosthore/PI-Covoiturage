const Trajet = require('../models/Trajet')
const { creerNotification } = require('./notificationController')

// Lister tous les trajets
const listerTrajets = async (req, res) => {
  const { depart, arrivee, date } = req.query
  const filtre = { statut: 'actif' }

  if (depart)  filtre.villeDepart  = { $regex: depart,  $options: 'i' }
  if (arrivee) filtre.villeArrivee = { $regex: arrivee, $options: 'i' }

  const trajets = await Trajet.find(filtre)
    .populate('conducteur', 'prenom nom note nbEvaluations verifie')
    .sort({ dateDepart: 1 })

  res.render('trajets', {
    title: 'Trajets disponibles',
    trajets,
    filtre: { depart: depart || '', arrivee: arrivee || '', date: date || '' }
  })
}

// Afficher formulaire nouveau trajet
const afficherFormulaire = (req, res) => {
  res.render('createTrajet', { title: 'Publier un trajet' })
}

// Créer un trajet
const creerTrajet = async (req, res) => {
  const {
    villeDepart, villeArrivee, adresseDepart, adresseArrivee,
    dateDepart, heureDepart, placesDisponibles, typePartage,
    vehiculeMarque, vehiculeModele,
    fumeur, animaux, musique, bagages, description
  } = req.body

  await Trajet.create({
    conducteur: req.session.user._id,
    villeDepart, villeArrivee,
    adresseDepart:  adresseDepart  || '',
    adresseArrivee: adresseArrivee || '',
    dateDepart:     new Date(dateDepart),
    heureDepart,
    placesDisponibles: parseInt(placesDisponibles) || 3,
    typePartage:    typePartage || 'partage_frais',
    vehiculeMarque: vehiculeMarque || '',
    vehiculeModele: vehiculeModele || '',
    fumeur:  fumeur  === 'on',
    animaux: animaux === 'on',
    musique: musique === 'on',
    bagages: bagages === 'on',
    description: description || ''
  })

  req.flash('success_msg', 'Trajet publié !')
  res.redirect('/trajets')
}

// Voir un trajet
const voirTrajet = async (req, res) => {
  const Reservation = require('../models/Reservation')

  const trajet = await Trajet.findById(req.params.id)
    .populate('conducteur', 'prenom nom note nbEvaluations verifie')
    .populate('passagers', 'prenom nom')

  if (!trajet) {
    req.flash('error_msg', 'Trajet introuvable.')
    return res.redirect('/trajets')
  }

  let dejaReserve = null
  if (req.session.user) {
    dejaReserve = await Reservation.findOne({
      trajet:   trajet._id,
      passager: req.session.user._id
    })
  }

  res.render('detailTrajet', {
    title: `${trajet.villeDepart} → ${trajet.villeArrivee}`,
    trajet,
    dejaReserve
  })
}

// Rejoindre un trajet
const rejoindreTrajet = async (req, res) => {
  const trajet = await Trajet.findById(req.params.id)
  const userId = req.session.user._id.toString()

  if (trajet.conducteur.toString() === userId) {
    req.flash('error_msg', 'Vous êtes le conducteur.')
    return res.redirect(`/trajets/${trajet._id}`)
  }

  if (trajet.passagers.map(p => p.toString()).includes(userId)) {
    req.flash('error_msg', 'Déjà inscrit.')
    return res.redirect(`/trajets/${trajet._id}`)
  }

  trajet.passagers.push(userId)
  if (trajet.passagers.length >= trajet.placesDisponibles) trajet.statut = 'complet'
  await trajet.save()

  req.flash('success_msg', 'Vous avez rejoint ce trajet !')
  res.redirect(`/trajets/${trajet._id}`)
}

// Supprimer un trajet
const supprimerTrajet = async (req, res) => {
  const trajet = await Trajet.findById(req.params.id)

  if (trajet.conducteur.toString() !== req.session.user._id.toString()) {
    req.flash('error_msg', 'Non autorisé.')
    return res.redirect('/dashboard')
  }

  await Trajet.findByIdAndDelete(req.params.id)
  req.flash('success_msg', 'Trajet supprimé.')
  res.redirect('/dashboard')
}

// Annuler un trajet (PI-11)
const annulerTrajet = async (req, res) => {
  try {
    const trajet = await Trajet.findById(req.params.id).populate('passagers')
    if (!trajet) { req.flash('error_msg', 'Trajet introuvable.'); return res.redirect('/dashboard') }

    if (trajet.conducteur.toString() !== req.session.user._id.toString()) {
      req.flash('error_msg', 'Non autorisé.')
      return res.redirect('/dashboard')
    }

    trajet.statut = 'annule'
    await trajet.save()

    for (const passager of trajet.passagers) {
      await creerNotification(
        passager._id,
        `⚠️ Le trajet ${trajet.villeDepart} → ${trajet.villeArrivee} du ${new Date(trajet.dateDepart).toLocaleDateString('fr-CA')} a été annulé.`,
        'annulation',
        '/mes-reservations'
      )
    }

    req.flash('success_msg', 'Trajet annulé. Les passagers ont été notifiés.')
    res.redirect('/dashboard')
  } catch (err) {
    console.log(err)
    res.redirect('/dashboard')
  }
}

// Afficher formulaire modification (PI-14)
const afficherModification = async (req, res) => {
  try {
    const trajet = await Trajet.findById(req.params.id)
    if (!trajet) { req.flash('error_msg', 'Trajet introuvable.'); return res.redirect('/dashboard') }

    if (trajet.conducteur.toString() !== req.session.user._id.toString()) {
      req.flash('error_msg', 'Non autorisé.')
      return res.redirect('/dashboard')
    }

    res.render('modifierTrajet', { title: 'Modifier le trajet', trajet })
  } catch (err) {
    console.log(err)
    res.redirect('/dashboard')
  }
}

// Traiter la modification (PI-14)
const modifierTrajet = async (req, res) => {
  try {
    const trajet = await Trajet.findById(req.params.id).populate('passagers')
    if (!trajet) { req.flash('error_msg', 'Trajet introuvable.'); return res.redirect('/dashboard') }

    if (trajet.conducteur.toString() !== req.session.user._id.toString()) {
      req.flash('error_msg', 'Non autorisé.')
      return res.redirect('/dashboard')
    }

    const { villeDepart, villeArrivee, dateDepart, heureDepart, placesDisponibles, typePartage, description } = req.body

    await Trajet.findByIdAndUpdate(req.params.id, {
      villeDepart, villeArrivee, dateDepart, heureDepart,
      placesDisponibles: parseInt(placesDisponibles),
      typePartage, description
    })

    for (const passager of trajet.passagers) {
      await creerNotification(
        passager._id,
        `📝 Le trajet ${villeDepart} → ${villeArrivee} a été modifié par le conducteur.`,
        'annulation',
        `/trajets/${trajet._id}`
      )
    }

    req.flash('success_msg', 'Trajet modifié avec succès !')
    res.redirect('/dashboard')
  } catch (err) {
    console.log(err)
    res.redirect('/dashboard')
  }
}

module.exports = {
  listerTrajets,
  afficherFormulaire,
  creerTrajet,
  voirTrajet,
  rejoindreTrajet,
  supprimerTrajet,
  annulerTrajet,
  afficherModification,
  modifierTrajet
}