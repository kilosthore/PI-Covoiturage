const Reservation = require('../models/Reservation')
const Trajet      = require('../models/Trajet')
const { creerNotification } = require('./notificationController')

const demanderReservation = async (req, res) => {
  try {
    const trajet = await Trajet.findById(req.params.id).populate('conducteur')
    if (!trajet) { req.flash('error_msg', 'Trajet introuvable.'); return res.redirect('/trajets') }

    if (trajet.conducteur._id.toString() === req.session.user._id.toString()) {
      req.flash('error_msg', 'Vous ne pouvez pas réserver votre propre trajet.')
      return res.redirect(`/trajets/${trajet._id}`)
    }

    if (trajet.passagers.length >= trajet.placesDisponibles) {
      req.flash('error_msg', 'Ce trajet est complet.')
      return res.redirect(`/trajets/${trajet._id}`)
    }

    const dejaReserve = await Reservation.findOne({ trajet: trajet._id, passager: req.session.user._id })
    if (dejaReserve) {
      req.flash('error_msg', 'Vous avez déjà une demande pour ce trajet.')
      return res.redirect(`/trajets/${trajet._id}`)
    }

    const reservation = await Reservation.create({
      trajet:   trajet._id,
      passager: req.session.user._id,
      message:  req.body.message || ''
    })

    // Notification au conducteur
    await creerNotification(
      trajet.conducteur._id,
      `${req.session.user.prenom} demande une place sur votre trajet ${trajet.villeDepart} → ${trajet.villeArrivee}`,
      'reservation',
      `/dashboard`
    )

    req.flash('success_msg', 'Demande envoyée ! En attente de confirmation.')
    res.redirect(`/trajets/${trajet._id}`)
  } catch (err) {
    console.log(err)
    res.redirect('/trajets')
  }
}

const accepterReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id).populate('trajet').populate('passager')
    if (!reservation) { req.flash('error_msg', 'Réservation introuvable.'); return res.redirect('/dashboard') }

    reservation.statut = 'accepte'
    await reservation.save()

    await Trajet.findByIdAndUpdate(reservation.trajet._id, { $addToSet: { passagers: reservation.passager._id } })

    const trajet = reservation.trajet
    const nbPassagers = (await Trajet.findById(trajet._id)).passagers.length
    if (nbPassagers >= trajet.placesDisponibles) {
      await Trajet.findByIdAndUpdate(trajet._id, { statut: 'complet' })
    }

    // Notification au passager
    await creerNotification(
      reservation.passager._id,
      `✅ Votre réservation pour ${trajet.villeDepart} → ${trajet.villeArrivee} a été acceptée !`,
      'acceptation',
      `/trajets/${trajet._id}`
    )

    req.flash('success_msg', 'Réservation acceptée !')
    res.redirect('/dashboard')
  } catch (err) {
    console.log(err)
    res.redirect('/dashboard')
  }
}

const refuserReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id).populate('trajet').populate('passager')
    if (!reservation) { req.flash('error_msg', 'Réservation introuvable.'); return res.redirect('/dashboard') }

    reservation.statut = 'refuse'
    await reservation.save()

    // Notification au passager
    await creerNotification(
      reservation.passager._id,
      `❌ Votre réservation pour ${reservation.trajet.villeDepart} → ${reservation.trajet.villeArrivee} a été refusée.`,
      'refus',
      `/trajets/${reservation.trajet._id}`
    )

    req.flash('success_msg', 'Réservation refusée.')
    res.redirect('/dashboard')
  } catch (err) {
    console.log(err)
    res.redirect('/dashboard')
  }
}

const mesReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ passager: req.session.user._id })
      .populate('trajet')
      .sort({ createdAt: -1 })
    res.render('mesReservations', { title: 'Mes réservations', reservations })
  } catch (err) {
    console.log(err)
    res.redirect('/dashboard')
  }
}

module.exports = { demanderReservation, accepterReservation, refuserReservation, mesReservations }