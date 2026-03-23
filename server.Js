require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const expressLayouts = require("express-ejs-layouts");

const app = express();


// ======================= 
// 🔹 Connexion MongoDB
// =======================
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB connecté"))
.catch(err => console.log(err));


// =======================
// 🔹 Middlewares
// =======================
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Fichiers statiques (CSS, images, etc.)
app.use(express.static("public"));

// Session
app.use(
  session({
    secret: "secretkey",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
    }),
  })
);


// =======================
// 🔹 Variables globales
// =======================
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});


// =======================
// 🔹 EJS Layout
// =======================
app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("layout", "layout");


// =======================
// 🔹 Routes
// =======================
const authRoutes = require("./routes/authRoutes");
app.use("/", authRoutes);


// =======================
// 🔹 Page 404
// =======================
app.use((req, res) => {
  res.status(404).send("Page non trouvée");
});


// =======================
// 🔹 Lancement serveur
// =======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});