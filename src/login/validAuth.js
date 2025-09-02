const checkAuth = async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  res.status(200).json({ message: "Authenticated" });
};

const handleLogout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out" });
};

module.exports = { checkAuth, handleLogout };
