const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const adminRoutes = require("./routes/admin.routes.js");

const app = express();

// ✅ Allowed origins
const allowedOrigins = [
  "http://localhost:5173", // for local dev
  "https://gym.artechnology.pro", // main frontend domain (prod)
  "https://gym-backend.artechnology.pro", // optional (API domain itself)
];

// ✅ Secure CORS config
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like curl or Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // allow cookies & auth headers
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/admin", adminRoutes);

module.exports = app;
