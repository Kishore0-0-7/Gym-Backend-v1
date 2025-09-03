// Imports from the packages
const express = require("express");

// Imports from the folder Controller
const {
  registerCandidate,
  registerProgress,
  registerMemberShip,
  registerLogin,
  returnToken,
} = require("../controller/adminPost.controller");

const {
  getProgress,
  getAllProgress,
  getUsernameAndId,
  getUserList,
  getCandidateInformation,
  getExpireMembership,
  getDashboard,
  getDashboardGraph,
  getReport,
  getRevenueGraph,
  getMembershipPlans,
  getPreviousMemberships,
  getPreviousPremium,
} = require("../controller/adminGet.controller");

const {
  removeCandidate,
  upgradePremium,
} = require("../controller/admin.controller");

// Imports from the folder Middleware
const {
  validateCandidate,
  validateProgress,
  validateMembership,
  validateLogin,
} = require("../middleware/admin.middleware");

// Imports from the folder Middleware for the authentication
const { authMiddleware } = require("../middleware/auth.middleware");

// Authanticate
const { checkAuth, handleLogout } = require("../login/validAuth");

// Routes
const router = express.Router();

// Routes post
router.post(
  "/register-candidate",
  
  validateCandidate,
  registerCandidate
);
router.post(
  "/register-membership",
  
  validateMembership,
  registerMemberShip
);
router.post(
  "/register-progress",
  
  validateProgress,
  registerProgress
);
router.post("/get-candidate-info",  getCandidateInformation);
router.post("/add-login", registerLogin);
router.post("/login", validateLogin, returnToken);
router.post("/logout", handleLogout);

// Routes Get
router.get("/progress-all",  getAllProgress);
router.get("/get-progress",  getProgress);
router.get("/get-name",  getUsernameAndId);
router.get("/get-user-lists",  getUserList);
router.get("/get-expiry-list",  getExpireMembership);
router.get("/get-dashboard",  getDashboard);
router.get("/get-dashboard-graph",  getDashboardGraph);
router.get("/get-report",  getReport);
router.get("/revenue-graph",  getRevenueGraph);
router.get("/get-memberhip-plans",  getMembershipPlans);
router.get("/get-old-premium",  getPreviousMemberships);
router.get("/get-previous-premium",  getPreviousPremium);
router.get("/auth-me", checkAuth);

// Router put
router.put("/upgrade-premium",  upgradePremium);

// Routes delete
router.delete("/remove-candidate",  removeCandidate);

module.exports = router;
