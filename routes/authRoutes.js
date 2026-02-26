const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const { isAuth } = require("../middleware/authMiddleware");

// Accueil
router.get("/", (req, res) => {
  res.render("index");
});

// Inscription
router.get("/register", authController.getRegister);
router.post("/register", authController.postRegister);

// Connexion
router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);

// Dashboard
router.get("/dashboard", isAuth, (req, res) => {
  res.render("dashboard", { user: req.session.user });
});

// Logout
router.get("/logout", authController.logout);

module.exports = router;