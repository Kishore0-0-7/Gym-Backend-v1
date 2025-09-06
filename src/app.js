const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const adminRoutes = require("./routes/admin.routes.js");

const app = express();

app.use(
  cors({
    origin: [
  "http://localhost:5173", // for local dev
  "https://gym.artechnology.pro", // main frontend domain (prod)
  "https://gym-backend.artechnology.pro", // optional (API domain itself)
],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("trust proxy", 1);
app.use("/api/admin", adminRoutes);

module.exports = app;
