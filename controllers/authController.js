const User = require('../models/User')

const afficherInscription = (req, res) => {
  res.render('register', { title: 'Inscription' })
}

const inscrireUtilisateur = async (req, res) => {
  const { prenom, nom, email, motDePasse, motDePasseConfirm, role, permis, assurance } = req.body

  if (!prenom || !nom || !email || !motDePasse || !motDePasseConfirm || !role) {
    req.flash('error_msg', 'Veuillez remplir tous les champs obligatoires.')
    return res.redirect('/register')
  }

  if (motDePasse !== motDePasseConfirm) {
    req.flash('error_msg', 'Les mots de passe ne correspondent pas.')
    return res.redirect('/register')
  }

  if (motDePasse.length < 6) {
    req.flash('error_msg', 'Le mot de passe doit avoir au moins 6 caractères.')
    return res.redirect('/register')
  }

  if (role === 'conducteur' && (!permis || !assurance)) {
    req.flash('error_msg', 'Le numéro de permis et l\'assurance sont obligatoires pour les conducteurs.')
    return res.redirect('/register')
  }

  try {
    const dejaExistant = await User.findOne({ email })
    if (dejaExistant) {
      req.flash('error_msg', 'Ce courriel est déjà utilisé.')
      return res.redirect('/register')
    }

    const donnees = { prenom, nom, email, motDePasse, role }
    if (role === 'conducteur') {
      donnees.permis    = permis
      donnees.assurance = assurance
    }

    await User.create(donnees)
    req.flash('success_msg', 'Compte créé ! Connectez-vous.')
    res.redirect('/login')

  } catch (err) {
    console.log('Erreur inscription :', err.message)
    req.flash('error_msg', 'Erreur, réessayez.')
    res.redirect('/register')
  }
}

const afficherConnexion = (req, res) => {
  res.render('login', { title: 'Connexion' })
}

const connecterUtilisateur = async (req, res) => {
  const { email, motDePasse } = req.body

  try {
    const utilisateur = await User.findOne({ email })
    if (!utilisateur) {
      req.flash('error_msg', 'Courriel ou mot de passe incorrect.')
      return res.redirect('/login')
    }

    const ok = await utilisateur.comparerMotDePasse(motDePasse)
    if (!ok) {
      req.flash('error_msg', 'Courriel ou mot de passe incorrect.')
      return res.redirect('/login')
    }

    req.session.user = {
      _id:    utilisateur._id,
      prenom: utilisateur.prenom,
      nom:    utilisateur.nom,
      email:  utilisateur.email,
      role:   utilisateur.role,
      photo:  utilisateur.photo || ''
    }

    // Redirection selon le rôle
    if (utilisateur.role === 'admin') {
      req.flash('success_msg', `Bienvenue ${utilisateur.prenom} !`)
      return res.redirect('/admin')
    }

    req.flash('success_msg', `Bienvenue ${utilisateur.prenom} !`)
    res.redirect('/dashboard')

  } catch (err) {
    console.log('Erreur connexion :', err.message)
    req.flash('error_msg', 'Erreur, réessayez.')
    res.redirect('/login')
  }
}

const deconnecterUtilisateur = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/')
  })
}

module.exports = {
  afficherInscription,
  inscrireUtilisateur,
  afficherConnexion,
  connecterUtilisateur,
  deconnecterUtilisateur
}