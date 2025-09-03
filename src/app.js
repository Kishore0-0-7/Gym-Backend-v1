const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const adminRoutes = require("./routes/admin.routes.js");

const app = express();

// ✅ CORS config - Allow all origins
app.use(
  cors({
    origin: "*", // allow all origins explicitly
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    credentials: true, // allow cookies & auth headers
  })
);

// Additional CORS headers for preflight requests
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie");
  res.header("Access-Control-Allow-Credentials", "true");
  
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/admin", adminRoutes);

module.exports = app;
