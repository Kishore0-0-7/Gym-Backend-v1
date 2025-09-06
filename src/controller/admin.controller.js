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
    candidate_name,
    phone_number,
    blood_group,
    height,
    weight,
    gender,
    instructor,
    candidate_type,
    goal,
    address,
    email,
    username,
    password,
  } = req.body;

  if (!userId || userId.trim() === "") {
    return res.status(400).json({ message: "User ID is required" });
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const updateCandidateQuery = `
      UPDATE candidate
      SET candidate_name = $1,
          phone_number = $2,
          blood_group = $3,
          height = $4,
          weight = $5,
          gender = $6,
          instructor = $7,
          candidate_type = $8,
          goal = $9,
          address = $10,
          email = $11,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $12
      RETURNING *;
    `;

    const candidateValues = [
      candidate_name,
      phone_number,
      blood_group,
      height,
      weight,
      gender,
      instructor,
      candidate_type,
      goal,
      address,
      email,
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

module.exports = { removeCandidate, upgradePremium, updateCandidateInfo };
