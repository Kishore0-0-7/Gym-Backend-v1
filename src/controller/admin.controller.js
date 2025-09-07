// Packages
const bcrypt = require("bcrypt");

// Import from the Database folder
const db = require("../db/db.js");

// For Regestration Page
const removeCandidate = async (req, res) => {
  const { id } = req.params;

  const userId = id;

  if (!userId || userId.trim() === "") {
    return res.status(400).json({ message: "User ID is required" });
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const deleteUserQuery = `
      DELETE FROM users 
      WHERE user_id = $1
      RETURNING *;
    `;
    const { rows: deletedUsers } = await client.query(deleteUserQuery, [
      userId,
    ]);

    const deleteCandidateQuery = `
      DELETE FROM candidate 
      WHERE user_id = $1
      RETURNING *;
    `;
    const { rows: deletedCandidates } = await client.query(
      deleteCandidateQuery,
      [userId]
    );

    if (deletedCandidates.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Candidate not found" });
    }

    await client.query("COMMIT");

    res.status(200).json({
      message: "Candidate and related user removed successfully",
      deletedUser: deletedUsers[0] || null,
      deletedCandidate: deletedCandidates[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error removing candidate:", err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    client.release();
  }
};

// For Upgrading the Permium
const upgradePremium = async (req, res) => {
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
      VALUES ($1, CURRENT_DATE)
      RETURNING *;
    `;

    await client.query(insertRevenueQuery, [amount]);

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

const updateCandidateInfo = async (req, res) => {
  const {
    userId,
    phone_number,
    blood_group,
    height,
    weight,
    gender,
    instructor,
    candidate_type,
    goal,
    address,
    username,
    password,
  } = req.body;

  if (!userId || userId.trim() === "") {
    return res.status(400).json({ message: "User ID is required" });
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    // Update only the required candidate fields
    const updateCandidateQuery = `
      UPDATE candidate
      SET phone_number = $1,
          blood_group = $2,
          height = $3,
          weight = $4,
          gender = $5,
          instructor = $6,
          candidate_type = $7,
          goal = $8,
          address = $9,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $10
      RETURNING *;
    `;

    const candidateValues = [
      phone_number,
      blood_group,
      height,
      weight,
      gender,
      instructor,
      candidate_type,
      goal,
      address,
      userId,
    ];

    const { rows: candidateRows } = await client.query(
      updateCandidateQuery,
      candidateValues
    );

    if (candidateRows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Candidate not found" });
    }

    // Update username/password if provided
    if (username || password) {
      let hashedPassword = null;
      if (password) {
        const saltRounds = 10;
        hashedPassword = await bcrypt.hash(password, saltRounds);
      }

      const updateUserQuery = `
        UPDATE users
        SET username = COALESCE($1, username),
            password = COALESCE($2, password)
        WHERE user_id = $3
        RETURNING *;
      `;
      const userValues = [username, hashedPassword, userId];
      await client.query(updateUserQuery, userValues);
    }

    await client.query("COMMIT");

    res.status(200).json({
      message: "Candidate details updated successfully",
      candidate: candidateRows[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error updating candidate info:", err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    client.release();
  }
};

const updateLoginDetails = async (req, res) => {
  const { userId, username, password } = req.body;

  if (!userId || userId.trim() === "") {
    return res.status(400).json({ message: "User ID is required" });
  }

  if (!username && !password) {
    return res
      .status(400)
      .json({ message: "At least username or password must be provided" });
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    let hashedPassword = null;
    if (password) {
      const saltRounds = 10;
      hashedPassword = await bcrypt.hash(password, saltRounds);
    }

    const updateQuery = `
      UPDATE users
      SET username = COALESCE($1, username),
          password = COALESCE($2, password)
      WHERE user_id = $3
      RETURNING *;
    `;

    const values = [username, hashedPassword, userId];

    const { rows } = await client.query(updateQuery, values);

    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "User not found" });
    }

    await client.query("COMMIT");

    res.status(200).json({
      message: "Login details updated successfully",
      user: rows[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error updating login details:", err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    client.release();
  }
};

module.exports = {
  removeCandidate,
  upgradePremium,
  updateCandidateInfo,
  updateLoginDetails,
};
