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
  getPreviousMemberships,
  getPreviousPremium,
  getNewUserId,
  getMembershipDetails,
  getCandidateLists,
  getMonthRevenueGraph,
  getPieChart,
} = require("../controller/adminGet.controller");

const {
  removeCandidate,
  upgradePremium,
  updateCandidateInfo,
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
  authMiddleware,
  validateCandidate,
  registerCandidate
);
router.post(
  "/register-membership",
  authMiddleware,
  validateMembership,
  registerMemberShip
);
router.post(
  "/register-progress",
  authMiddleware,
  validateProgress,
  registerProgress
);
router.post("/get-candidate-info", getCandidateInformation);
router.post("/add-login", registerLogin);
router.post("/login", validateLogin, returnToken);
router.post("/logout", handleLogout);
router.post("/get-dashboard", authMiddleware, getDashboard);

// Routes Get
router.get("/get-old-membership/:id", authMiddleware, getMembershipDetails);
router.get("/new-user-id", authMiddleware, getNewUserId);
router.get("/get-list", authMiddleware, getCandidateLists);
router.get("/progress/:id", authMiddleware, getAllProgress);
router.get("/get-progress", authMiddleware, getProgress);
router.get("/get-membership/:id", getMembershipDetails);
router.get("/get-user-lists", authMiddleware, getUserList);
router.get("/get-expiry-list", authMiddleware, getExpireMembership);
router.get("/get-dashboard-graph", authMiddleware, getDashboardGraph);
router.get("/get-report", authMiddleware, getReport);
router.get("/revenue-year-graph", authMiddleware, getRevenueGraph);
router.get("/revenue-month-graph", authMiddleware, getMonthRevenueGraph);
router.get("/get-pie-chart", authMiddleware, getPieChart);
// router.get("/get-memberhip-plans", authMiddleware, getMembershipPlans);
router.get("/get-old-premium", authMiddleware, getPreviousMemberships);
router.get("/get-previous-premium", authMiddleware, getPreviousPremium);
router.get("/auth-me", checkAuth);

// Router put
router.put("/upgrade-premium", authMiddleware, upgradePremium);
router.put("/update-details", authMiddleware, updateCandidateInfo);

// Routes delete
router.delete("/remove-candidate/:id", authMiddleware, removeCandidate);

module.exports = router;
