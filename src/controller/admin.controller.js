// Import from the Database folder
const db = require("../db/db.js");

// For Regestration Page
const removeCandidate = async (req, res) => {
  const { userId } = req.body;

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
    memberType,
    amount,
    duration,
    endDate,
    paymentType,
  } = req.body;

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const memberTypeLower = memberType.toLowerCase();
    const paymentTypeLower = paymentType.toLowerCase();

    const insertMembershipQuery = `
      INSERT INTO membership_details (
        user_id, member_name, member_type, amount, duration, end_date, payment_type
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;

    const membershipValues = [
      userId,
      memberName,
      memberTypeLower,
      amount,
      duration,
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

module.exports = { removeCandidate, upgradePremium };
