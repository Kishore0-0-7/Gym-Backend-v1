// Import from the Database folder
const db = require("../db/db.js");

// Progress Page
const getProgress = async (req, res) => {
  const { userId } = req.body;

  try {
    const query = `
      SELECT 
        entry_date, 
        weight_kg, 
        fat, 
        v_fat, 
        bmr, 
        bmi, 
        b_age
      FROM 
        progress_tracking
      WHERE 
        user_id = $1
      ORDER BY 
        entry_date DESC;
    `;

    const { rows } = await db.query(query, [String(userId).toLowerCase()]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No progress records found for this user." });
    }

    res.status(200).json({
      message: "Progress records retrieved successfully",
      data: rows,
    });
  } catch (err) {
    console.error("Error retrieving progress:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAllProgress = async (req, res) => {
  try {
    const query = `
      SELECT 
        entry_date, 
        weight_kg, 
        fat, 
        v_fat, 
        bmr, 
        bmi, 
        b_age
      FROM 
        progress_tracking
    `;

    const { rows } = await db.query(query);

    if (rows.length === 0) {
      return res.status(404).json({ message: "No progress records found." });
    }

    res.status(200).json({
      message: "Progress records retrieved successfully",
      data: rows,
    });
  } catch (err) {
    console.error("Error retrieving all progress records:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Membership Register Page
const getUsernameAndId = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const query = `SELECT candidate_name FROM public.candidate WHERE user_id = $1`;
    const { rows } = await db.query(query, [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      userId,
      candidateName: rows[0].candidate_name,
    });
  } catch (err) {
    console.error("Error fetching username:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// User list page
const getUserList = async (req, res) => {
  try {
    const query = `
      SELECT 
        c.user_id,
        c.candidate_name,
        c.phone_number,
        c.date_of_joining,
        c.blood_group,
        c.premium_type,
        CASE 
          WHEN m.end_date IS NOT NULL AND m.end_date < (CURRENT_DATE + INTERVAL '1 day') THEN 'inactive'
          ELSE 'active'
        END AS status
      FROM candidate c
      LEFT JOIN membership_details m 
        ON c.user_id = m.user_id;
    `;

    const { rows } = await db.query(query);
    return res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching user list:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Candidate Information Page
const getCandidateInformation = async (req, res) => {
  const { userId } = req.body;

  if (!userId || userId.trim() === "") {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const query = `
      SELECT 
          c.candidate_name,
          c.user_id,
          c.phone_number,
          c.blood_group,
          c.height,
          c.weight,
          c.gender,
          c.trainer_type,
          c.candidate_type,
          c.goal,
          c.address,
          pt.bmr,
          pt.bmi,
          m.duration,
          m.amount,
          m.start_date,
          m.end_date,
          u.username,
          u.password
      FROM candidate c
      LEFT JOIN (
          SELECT DISTINCT ON (user_id)
              user_id, bmr, bmi
          FROM progress_tracking
          ORDER BY user_id, entry_date DESC
      ) pt ON c.user_id = pt.user_id
      LEFT JOIN membership_details m ON c.user_id = m.user_id
      LEFT JOIN users u ON c.user_id = u.user_id
      WHERE c.user_id = $1
      LIMIT 1;
    `;

    const { rows } = await db.query(query, [userId]);
    return res.status(200).json(rows[0] || {});
  } catch (error) {
    console.error("Error fetching candidate information:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Dashboard Page
const getExpireMembership = async (req, res) => {
  try {
    const query = `
      SELECT 
        c.user_id,
        c.candidate_name,
        c.phone_number,
        c.date_of_joining,
        c.blood_group,
        c.premium_type,
        md.end_date
      FROM candidate c
      JOIN membership_details md 
        ON c.user_id = md.user_id
      WHERE md.end_date IS NOT NULL;
    `;
    const { rows } = await db.query(query);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching expiring memberships:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getDashboard = async (req, res) => {
  try {
    const { year, month } = req.body;

    if (!year || !month) {
      return res.status(400).json({ message: "Year and month are required." });
    }

    let lastMonth = month - 1;
    let lastMonthYear = year;
    if (lastMonth === 0) {
      lastMonth = 12;
      lastMonthYear = year - 1;
    }

    const revenueQuery = `
      SELECT 
        COALESCE(SUM(CASE WHEN EXTRACT(YEAR FROM date_payes) = $1 
                           AND EXTRACT(MONTH FROM date_payes) = $2 
                      THEN amount END), 0) AS current_month,
        COALESCE(SUM(CASE WHEN EXTRACT(YEAR FROM date_payes) = $3 
                           AND EXTRACT(MONTH FROM date_payes) = $4 
                      THEN amount END), 0) AS last_month
      FROM revenue_analysis;
    `;

    const revenueResult = await db.query(revenueQuery, [
      year,
      month,
      lastMonthYear,
      lastMonth,
    ]);
    const revenueRow = revenueResult.rows[0];

    const revenue = parseFloat(revenueRow.current_month);
    const lastRevenue = parseFloat(revenueRow.last_month);
    const profitRevenue =
      lastRevenue === 0
        ? 100
        : (((revenue - lastRevenue) / lastRevenue) * 100).toFixed(2);

    const candidateQuery = `
      SELECT 
        COALESCE(COUNT(CASE WHEN EXTRACT(YEAR FROM date_of_joining) = $1 
                             AND EXTRACT(MONTH FROM date_of_joining) = $2 
                        THEN 1 END), 0) AS current_month_users,
        COALESCE(COUNT(CASE WHEN EXTRACT(YEAR FROM date_of_joining) = $3 
                             AND EXTRACT(MONTH FROM date_of_joining) = $4 
                        THEN 1 END), 0) AS last_month_users
      FROM candidate;
    `;

    const candidateResult = await db.query(candidateQuery, [
      year,
      month,
      lastMonthYear,
      lastMonth,
    ]);
    const candidateRow = candidateResult.rows[0];

    const candidate = parseInt(candidateRow.current_month_users);
    const lastCandidate = parseInt(candidateRow.last_month_users);
    const profitCandidate =
      lastCandidate === 0
        ? 100
        : (((candidate - lastCandidate) / lastCandidate) * 100).toFixed(2);

    const response = {
      revenue,
      profitRevenue: parseFloat(profitRevenue),
      candidate,
      profitCandidate: parseFloat(profitCandidate),
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getDashboardGraph = async (req, res) => {
  const { year } = req.body;

  const query = `
    WITH months AS (
      SELECT generate_series(1, 12) AS month
    )
    SELECT 
      m.month,
      COALESCE(SUM(r.amount), 0) AS total_amount
    FROM months m
    LEFT JOIN revenue_analysis r 
      ON EXTRACT(MONTH FROM r.date_payes) = m.month
      AND EXTRACT(YEAR FROM r.date_payes) = $1
    GROUP BY m.month
    ORDER BY m.month;
  `;

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  try {
    const { rows } = await db.query(query, [year]);

    const formatted = rows.map((row) => ({
      month: monthNames[row.month - 1],
      total_amount: parseFloat(row.total_amount),
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Error fetching dashboard graph data:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Report Page
const getReport = async (req, res) => {
  try {
    const query = `
      SELECT 
        (SELECT COALESCE(SUM(amount), 0) FROM revenue_analysis) AS total_revenue,
        (SELECT COALESCE(SUM(amount), 0) 
         FROM revenue_analysis 
         WHERE EXTRACT(MONTH FROM date_payes) = EXTRACT(MONTH FROM CURRENT_DATE)
           AND EXTRACT(YEAR FROM date_payes) = EXTRACT(YEAR FROM CURRENT_DATE)
        ) AS monthly_revenue,
        (SELECT COUNT(*) FROM candidate WHERE candidate_type = 'gym') AS gym_members,
        (SELECT COUNT(*) FROM candidate WHERE candidate_type = 'cardio') AS cardio_members;
    `;

    const { rows } = await db.query(query);

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error fetching report:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getRevenueGraph = async (req, res) => {
  try {
    const query = `
      SELECT 
        DATE_PART('month', md.start_date)::INT AS month_number,
        TO_CHAR(md.start_date, 'Mon') AS month_name,
        c.candidate_type,
        COALESCE(SUM(md.amount), 0) AS revenue
      FROM membership_details md
      JOIN candidate c ON c.user_id = md.user_id
      GROUP BY month_number, month_name, c.candidate_type
      ORDER BY month_number;
    `;
    const { rows } = await db.query(query);

    // Initialize all months with zero values
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const result = months.map((m) => ({ month: m, gym: 0, cardio: 0 }));
    const monthIndexMap = months.reduce((acc, m, idx) => {
      acc[m] = idx;
      return acc;
    }, {});

    // Fill data from DB
    rows.forEach((row) => {
      const monthIdx = monthIndexMap[row.month_name];
      if (row.candidate_type === "gym") {
        result[monthIdx].gym = parseFloat(row.revenue);
      }
      if (row.candidate_type === "cardio") {
        result[monthIdx].cardio = parseFloat(row.revenue);
      }
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching revenue graph:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getMembershipPlans = async (req, res) => {
  try {
    const query = `
      SELECT duration, COUNT(*) AS count
      FROM membership_details
      GROUP BY duration;
    `;

    const { rows } = await db.query(query);

    const resultMap = {
      "One Year": 0,
      "Six Months": 0,
      "Three Months": 0,
      "One Month": 0,
      Others: 0,
    };

    rows.forEach((row) => {
      const days = parseInt(row.duration);
      const count = parseInt(row.count);

      let planName;
      if (days >= 360 && days <= 370) planName = "One Year";
      else if (days >= 175 && days <= 185) planName = "Six Months";
      else if (days >= 85 && days <= 95) planName = "Three Months";
      else if (days >= 28 && days <= 32) planName = "One Month";
      else planName = "Others";

      resultMap[planName] += count;
    });

    const total = Object.values(resultMap).reduce((sum, c) => sum + c, 0);
    const result = Object.entries(resultMap).map(([plan, value]) => ({
      plan,
      value,
      percentage: total === 0 ? 0 : ((value / total) * 100).toFixed(1),
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching membership plans:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Membership upgrade page via user list
const getPreviousMemberships = async (req, res) => {
  const { userId } = req.body;

  try {
    const query = `
      SELECT 
        start_date,
        end_date,
        duration,
        amount
      FROM membership_details
      WHERE user_id = $1
      ORDER BY start_date DESC;
    `;

    const { rows } = await db.query(query, [userId]);

    const today = new Date();

    const memberships = rows.map((row) => {
      const startDate = new Date(row.start_date);
      const endDate = new Date(row.end_date);
      const status = today > endDate ? "Completed" : "Active";

      return {
        start_date: startDate.toISOString().split("T")[0],
        end_date: endDate.toISOString().split("T")[0],
        duration: row.duration,
        amount: parseFloat(row.amount),
        status,
      };
    });

    res.status(200).json(memberships);
  } catch (error) {
    console.error("Error fetching previous memberships:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getPreviousPremium = async (req, res) => {
  const { userId } = req.body;

  const query = `
    SELECT 
      amount, 
      duration, 
      start_date, 
      end_date 
    FROM membership_details
    WHERE user_id = $1
    ORDER BY start_date DESC
    LIMIT 1;
  `;

  try {
    const { rows } = await db.query(query, [userId]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No premium records found for this user" });
    }

    const premium = rows[0];
    const durationMonths = (premium.duration / 30).toFixed(1);

    const formatDate = (dateStr) => {
      const options = { day: "2-digit", month: "short", year: "numeric" };
      return new Date(dateStr).toLocaleDateString("en-GB", options);
    };

    const formattedStartDate = formatDate(premium.start_date);
    const formattedEndDate = formatDate(premium.end_date);

    res.status(200).json({
      amount: parseFloat(premium.amount),
      durationMonths: durationMonths,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
    });
  } catch (error) {
    console.error("Error fetching previous premium:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
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
};
