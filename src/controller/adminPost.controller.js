// Import from the Database folder
const db = require("../db/db.js");

// Importing the module
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET =
  "859f98bb8b60e7f3d6d3497859b6d0b70c7a2c3873add50f38b12c303600a402ef777820e86824081a022af2c2fffe70ee2b417908396cd48bba06b649d0354c";

// Candidate Registeration Page
const registerCandidate = async (req, res) => {
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const {
      userId,
      candidateName,
      phoneNumber,
      dateOfBirth,
      bloodGroup,
      gender,
      instructor,
      premiumType = "None",
      candidateType,
      goal = null,
      dateOfJoining,
      height,
      weight,
      address,
      email = null,
      isMembership = false,
      password,
    } = req.body;

    const existingCheck = await client.query(
      "SELECT id FROM candidate WHERE phone_number = $1 LIMIT 1",
      [phoneNumber]
    );

    if (existingCheck.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "Candidate with this phone number already exists",
      });
    }

    const genderLower = gender.toLowerCase();
    const instructorLower = instructor.toLowerCase();
    const candidateTypeLower = candidateType.toLowerCase();
    const goalLower = goal ? goal.toLowerCase() : null;

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const insertCandidateQuery = `
      INSERT INTO candidate (
        user_id,
        candidate_name,
        phone_number,
        date_of_birth,
        blood_group,
        gender,
        instructor,
        premium_type,
        candidate_type,
        goal,
        date_of_joining,
        height,
        weight,
        address,
        email,
        is_membership
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
      RETURNING id, user_id;
    `;

    const candidateValues = [
      userId,
      candidateName,
      phoneNumber,
      dateOfBirth,
      bloodGroup,
      genderLower,
      instructorLower,
      premiumType,
      candidateTypeLower,
      goalLower,
      dateOfJoining,
      height,
      weight,
      address,
      email,
      isMembership,
    ];

    const { rows: candidateRows } = await client.query(
      insertCandidateQuery,
      candidateValues
    );

    const insertUserQuery = `
      INSERT INTO users (user_id, username, password)
      VALUES ($1, $2, $3)
      RETURNING id;
    `;
    await client.query(insertUserQuery, [
      userId,
      candidateName,
      hashedPassword,
    ]);

    await client.query("COMMIT");

    res.status(201).json({
      message: "Candidate registered successfully",
      id: candidateRows[0].id,
      userId: candidateRows[0].user_id,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error registering candidate:", err);
    res.status(500).json({ error: "Server error" });
  } finally {
    client.release();
  }
};

const registerMemberShip = async (req, res) => {
  const {
    userId,
    memberName,
    amount,
    duration,
    startDate,
    endDate,
    paymentType,
  } = req.body;

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const paymentTypeLower = paymentType.toLowerCase();

    const insertMembershipQuery = `
      INSERT INTO membership_details (
        user_id, member_name, amount, duration, start_date, end_date, payment_type
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;

    const membershipValues = [
      userId,
      memberName,
      amount,
      duration,
      startDate,
      endDate,
      paymentTypeLower,
    ];

    const { rows: membershipRows } = await client.query(
      insertMembershipQuery,
      membershipValues
    );

    const insertRevenueQuery = `
      INSERT INTO revenue_analysis (amount, date_payes)
      VALUES ($1, $2)
      RETURNING *;
    `;

    await client.query(insertRevenueQuery, [amount, startDate]);

    await client.query("COMMIT");

    res.status(201).json({
      message: "Membership registered successfully",
      data: membershipRows[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error registering membership:", err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    client.release();
  }
};

// Progress Page
const registerProgress = async (req, res) => {
  const { date, vFat, userId, bmr, bmi, weight, bAge, fat } = req.body;

  try {
    const lowerUserId = userId;

    const query = `
      INSERT INTO progress_tracking (
        user_id,
        entry_date,
        weight_kg,
        fat,
        v_fat,
        bmr,
        bmi,
        b_age
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *;
    `;

    const values = [lowerUserId, date, weight, fat, vFat, bmr, bmi, bAge];

    const { rows } = await db.query(query, values);

    res.status(201).json({
      message: "Progress registered successfully",
      data: rows[0],
    });
  } catch (err) {
    console.error("Error inserting progress:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Login Page
const registerLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await db.query(
      "SELECT * FROM admin_login WHERE email_address = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const insertQuery = `
      INSERT INTO admin_login (email_address, password)
      VALUES ($1, $2)
      RETURNING id, email_address;
    `;
    const result = await db.query(insertQuery, [email, hashedPassword]);

    res.status(201).json({
      message: "Admin registered successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Error registering admin:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const returnToken = async (req, res) => {
  try {
    const { email, password, isRemember } = req.body;

    const query = "SELECT * FROM admin_login WHERE email_address = $1";
    const { rows } = await db.query(query, [email]);

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const payload = { id: user.id, email: user.email_address };
    const expiresIn = isRemember ? "24h" : "1h";

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn });
    const maxAge = isRemember ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000;

    const isProduction = true; // change to true when deploying

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax", // "none" for cross-domain in production
      maxAge: maxAge,
    });

    res.status(200).json({
      message: "Login successful",
      expiresIn,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const addMembershipAmount = async (req, res) => {
  const { candidateType, instructor, duration, amount } = req.body;

  if (!candidateType || !instructor || !duration || !amount) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const sql = `
      INSERT INTO membership_settings 
        (candidate_type, instructor, duration, amount) 
      VALUES ($1, $2, $3, $4)
    `;

    await db.query(sql, [candidateType, instructor, duration, amount]);

    return res.status(201).json({ message: "Membership added successfully" });
  } catch (error) {
    console.error("Error adding membership:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  registerCandidate,
  registerProgress,
  registerMemberShip,
  registerLogin,
  returnToken,
  addMembershipAmount,
};
