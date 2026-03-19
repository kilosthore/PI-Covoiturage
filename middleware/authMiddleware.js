// Si l'utilisateur n'est pas connecté, renvoyer à /login
const estConnecte = (req, res, next) => {
  if (req.session.user) return next()
  req.flash('error_msg', 'Connectez-vous pour accéder à cette page.')
  res.redirect('/login')
}

// Si l'utilisateur est déjà connecté, renvoyer au dashboard
const estDeconnecte = (req, res, next) => {
  if (!req.session.user) return next()
  res.redirect('/dashboard')
}

module.exports = { estConnecte, estDeconnecte }