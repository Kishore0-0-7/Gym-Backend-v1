const jwt = require("jsonwebtoken");

const JWT_SECRET =
  "859f98bb8b60e7f3d6d3497859b6d0b70c7a2c3873add50f38b12c303600a402ef777820e86824081a022af2c2fffe70ee2b417908396cd48bba06b649d0354c";

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
