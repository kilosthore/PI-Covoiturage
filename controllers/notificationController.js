const Notification = require('../models/Notification')

// Créer une notification
const creerNotification = async (utilisateurId, message, type, lien = '') => {
  try {
    await Notification.create({ utilisateur: utilisateurId, message, type, lien })
  } catch (err) {
    console.log('Erreur notification :', err.message)
  }
}

// Marquer toutes comme lues
const marquerLues = async (req, res) => {
  try {
    await Notification.updateMany({ utilisateur: req.session.user._id, lu: false }, { lu: true })
    res.json({ ok: true })
  } catch (err) {
    res.json({ ok: false })
  }
}

// Récupérer les notifications (API)
const mesNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ utilisateur: req.session.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
    const nonLues = await Notification.countDocuments({ utilisateur: req.session.user._id, lu: false })
    res.json({ notifications, nonLues })
  } catch (err) {
    res.json({ notifications: [], nonLues: 0 })
  }
}

module.exports = { creerNotification, marquerLues, mesNotifications }