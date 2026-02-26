require("dotenv").config();

const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const expressLayouts = require("express-ejs-layouts");

const connectDB = require("./config/db");

const app = express();

connectDB();

app.set("view engine", "ejs");
app.use(expressLayouts);

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

/* ✅ 1️⃣ SESSION D'ABORD */
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
    }),
  })
);

/* ✅ 2️⃣ ENSUITE res.locals */
app.use((req, res, next) => {
  res.locals.user = req.session ? req.session.user : null;
  next();
});

/* ✅ 3️⃣ ROUTES */
app.use("/", require("./routes/authRoutes"));

app.listen(process.env.PORT, () => {
  console.log("Serveur lancé sur http://localhost:5000");
});