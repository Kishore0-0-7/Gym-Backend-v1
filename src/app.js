const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const adminRoutes = require("./routes/admin.routes.js");

const app = express();

// ✅ CORS config - Allow all origins
app.use(
  cors({
    origin: true, // allow all origins
    credentials: true, // allow cookies & auth headers
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/admin", adminRoutes);

module.exports = app;
