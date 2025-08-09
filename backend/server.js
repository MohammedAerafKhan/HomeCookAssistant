const express = require("express");
const dotenv = require("dotenv");
const cors = require('cors');
const session = require("express-session");

const authRoutes = require('./routes/auth');
const mealRoutes = require("./routes/meal");
const connectDB = require("./config/db");

dotenv.config();

const app = express();
app.use(cors({
  origin: "http://localhost:3001",
  credentials: true
}));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 1000 * 60 * 60 * 1
  }
}));

app.use("/api/auth", authRoutes);
app.use("/api/meal", mealRoutes);

if (require.main === module) {
  connectDB();
  const PORT = process.env.PORT || 3005;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
