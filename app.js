require('dotenv').config()

const express = require('express')
const session = require('express-session')
const flash = require('connect-flash')
const ejsMate = require('ejs-mate')
const path = require('path')
const connectDB = require('./config/db')

connectDB()

const app = express()

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}))

app.use(flash())

app.use((req, res, next) => {
  res.locals.user = req.session.user || null
  res.locals.success_msg = req.flash('success_msg')
  res.locals.error_msg = req.flash('error_msg')
  next()
})

// Les routes
app.use('/', require('./routes/authRoutes'))
app.use('/trajets', require('./routes/trajetRoutes'))
app.use('/', require('./routes/reservationRoutes'))
app.use('/', require('./routes/evaluationRoutes'))
app.use('/', require('./routes/notificationRoutes'))
app.use('/', require('./routes/profileRoutes'))
app.use('/admin', require('./routes/adminRoutes'))
app.use('/', require('./routes/assistantRoutes'))

// Créer un admin — protégé par code secret
app.get('/creer-admin/:code', async (req, res) => {
  const User = require('./models/User')
  try {
    if (req.params.code !== process.env.ADMIN_CODE) {
      return res.status(403).send('❌ Code invalide.')
    }
    const existant = await User.findOne({ email: 'admin@citecovoit.ca' })
    if (existant) return res.send('Admin existe déjà — <a href="/login">Se connecter</a>')

    await User.create({
      prenom:     'Admin',
      nom:        'CitéCovoit',
      email:      'admin@citecovoit.ca',
      motDePasse: 'Admin1234!',
      role:       'admin'
    })
    res.send('✅ Admin créé ! Email: admin@citecovoit.ca — Mot de passe: Admin1234! — <a href="/login">Se connecter</a>')
  } catch (err) {
    res.send('Erreur : ' + err.message)
  }
})

app.get('/debug-session', (req, res) => {
  res.json(req.session.user || { message: 'Pas connecté' })
})

// Page 404
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page introuvable' })
})

app.listen(3000, () => {
  console.log('Site lancé sur http://localhost:3000')
})