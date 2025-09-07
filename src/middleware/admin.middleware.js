// Registration Page
const validateCandidate = (req, res, next) => {
  const {
    candidateName,
    phoneNumber,
    dateOfBirth,
    bloodGroup,
    gender,
    candidateType,
    instructor,
    goal,
    premiumType,
    height,
    dateOfJoining,
    weight,
    address,
    password,
  } = req.body;

  if (
    !candidateName?.trim() ||
    !phoneNumber?.trim() ||
    !dateOfBirth ||
    !bloodGroup?.trim() ||
    !gender?.trim() ||
    !candidateType?.trim() ||
    !instructor?.trim() ||
    !goal?.trim() ||
    !premiumType?.trim() ||
    height == null ||
    !dateOfJoining ||
    weight == null ||
    !address?.trim() ||
    !password?.trim()
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (candidateName.length < 3 || candidateName.length > 100) {
    return res
      .status(400)
      .json({ error: "Candidate name must be 3-100 characters long" });
  }

  if (phoneNumber.length !== 10 || !/^\d{10}$/.test(phoneNumber)) {
    return res
      .status(400)
      .json({ error: "Phone number must be exactly 10 digits" });
  }

  if (!["male", "female"].includes(gender.toLowerCase())) {
    return res
      .status(400)
      .json({ error: "Gender must be either 'male' or 'female'" });
  }

  if (
    !["general trainer", "personal trainer"].includes(instructor.toLowerCase())
  ) {
    return res.status(400).json({
      error: "Instructor must be 'general trainer' or 'personal trainer'",
    });
  }

  if (!["gym", "cardio"].includes(candidateType.toLowerCase())) {
    return res
      .status(400)
      .json({ error: "Candidate type must be 'gym' or 'cardio'" });
  }

  if (
    goal &&
    !["weight loss", "weight gain", "fitness"].includes(goal.toLowerCase())
  ) {
    return res.status(400).json({
      error: "Goal must be 'weight loss', 'weight gain' or 'fitness'",
    });
  }

  if (password.length < 8 || password.length > 20) {
    return res
      .status(400)
      .json({ error: "Password must be 8-20 characters long" });
  }

  if (address.length < 5 || address.length > 200) {
    return res
      .status(400)
      .json({ error: "Address must be 5-200 characters long" });
  }

  if (isNaN(height) || height <= 0) {
    return res.status(400).json({ error: "Height must be a positive number" });
  }

  if (isNaN(weight) || weight <= 0) {
    return res.status(400).json({ error: "Weight must be a positive number" });
  }

  next();
};

const validateMembership = (req, res, next) => {
  const {
    userId,
    memberName,
    amount,
    duration,
    startDate,
    endDate,
    paymentType,
  } = req.body;

  if (
    !userId ||
    !memberName ||
    !startDate ||
    amount === undefined ||
    amount === null ||
    duration === undefined ||
    duration === null ||
    !endDate ||
    !paymentType
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (userId.length > 10) {
    return res
      .status(400)
      .json({ error: "userId must be at most 10 characters long" });
  }

  if (memberName.length === 0 || memberName.length > 50) {
    return res
      .status(400)
      .json({ error: "memberName must be between 1 and 50 characters long" });
  }

  if (amount < 999 || amount > 100000) {
    return res
      .status(400)
      .json({ error: "amount must be between 999 and 100000" });
  }

  if (duration > 13) {
    return res.status(400).json({ error: "duration must be below 12" });
  }

  if (paymentType.length === 0 || paymentType.length > 50) {
    return res
      .status(400)
      .json({ error: "paymentType must be between 1 and 50 characters long" });
  }

  next();
};

// Progress Page
const validateProgress = (req, res, next) => {
  const { date, vFat, userId, bmr, candidateName, bmi, weight, bAge, fat } =
    req.body;

  if (
    !date ||
    String(date).trim().length < 1 ||
    String(date).trim().length > 20
  ) {
    return res
      .status(400)
      .json({ error: "date is required and must be 1-20 characters" });
  }

  if (
    !userId ||
    String(userId).trim().length < 1 ||
    String(userId).trim().length > 20
  ) {
    return res
      .status(400)
      .json({ error: "userId is required and must be 1-20 characters" });
  }

  if (
    !candidateName ||
    String(candidateName).trim().length < 2 ||
    String(candidateName).trim().length > 50
  ) {
    return res
      .status(400)
      .json({ error: "candidateName is required and must be 2-50 characters" });
  }

  if (
    !vFat ||
    String(vFat).trim().length < 1 ||
    String(vFat).trim().length > 10
  ) {
    return res
      .status(400)
      .json({ error: "vFat is required and must be 1-10 characters" });
  }

  if (!bmr || String(bmr).trim().length < 1 || String(bmr).trim().length > 10) {
    return res
      .status(400)
      .json({ error: "bmr is required and must be 1-10 characters" });
  }

  if (!bmi || String(bmi).trim().length < 1 || String(bmi).trim().length > 10) {
    return res
      .status(400)
      .json({ error: "bmi is required and must be 1-10 characters" });
  }

  if (
    !weight ||
    String(weight).trim().length < 1 ||
    String(weight).trim().length > 10
  ) {
    return res
      .status(400)
      .json({ error: "weight is required and must be 1-10 characters" });
  }

  if (
    !bAge ||
    String(bAge).trim().length < 1 ||
    String(bAge).trim().length > 10
  ) {
    return res
      .status(400)
      .json({ error: "bAge is required and must be 1-10 characters" });
  }

  if (!fat || String(fat).trim().length < 1 || String(fat).trim().length > 10) {
    return res
      .status(400)
      .json({ error: "fat is required and must be 1-10 characters" });
  }

  next();
};

// Login Page
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  if (password.length < 7) {
    return res
      .status(400)
      .json({ message: "Password must be greater than 8 characters" });
  }

  next();
};

module.exports = {
  validateCandidate,
  validateProgress,
  validateMembership,
  validateLogin,
};
