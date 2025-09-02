const jwt = require("jsonwebtoken");

const JWT_SECRET =
  "2cda5d853d78bc5e20f9d272f809abfaaff4154b7c0e2643dd2434a8b9386eb4";

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

module.exports = { authMiddleware };
