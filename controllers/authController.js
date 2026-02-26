const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.getRegister = (req, res) => {
  res.render("register");
};

exports.postRegister = async (req, res) => {
  const { nom, prenom, email, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  await User.create({
    nom,
    prenom,
    email,
    password: hashed
  });

  res.redirect("/login");
};

exports.getLogin = (req, res) => {
  res.render("login");
};

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) return res.send("Utilisateur non trouvé");

  const match = await bcrypt.compare(password, user.password);

  if (!match) return res.send("Mot de passe incorrect");

  req.session.user = user;
  res.redirect("/dashboard");
};

exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect("/");
};