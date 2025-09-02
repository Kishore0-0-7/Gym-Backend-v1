const { Client } = require("pg");

const adminConfig = {
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "1234",
  port: 5432,
};

const targetDb = "gym";

const createDatabaseAndTables = async () => {
  // 1. Connect to default database
  const adminClient = new Client(adminConfig);
  await adminClient.connect();

  // 2. Create database if not exists
  const dbCheck = await adminClient.query(
    `SELECT 1 FROM pg_database WHERE datname='${targetDb}'`
  );
  if (dbCheck.rowCount === 0) {
    await adminClient.query(`CREATE DATABASE ${targetDb}`);
    console.log(`Database '${targetDb}' created.`);
  } else {
    console.log(`Database '${targetDb}' already exists.`);
  }
  await adminClient.end();

  // 3. Connect to the new database
  const dbClient = new Client({
    ...adminConfig,
    database: targetDb,
  });
  await dbClient.connect();

  // 4. Create tables
  const schema = `
    CREATE TABLE IF NOT EXISTS candidate (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(10) UNIQUE NOT NULL,
      candidate_name VARCHAR(100) NOT NULL,
      phone_number VARCHAR(15) NOT NULL,
      date_of_birth DATE NOT NULL,
      blood_group VARCHAR(5),
      gender VARCHAR(6) NOT NULL,
      trainer_type VARCHAR(16) NOT NULL,
      premium_type VARCHAR(50),
      candidate_type VARCHAR(20) NOT NULL,
      goal VARCHAR(50) ,
      date_of_joining DATE NOT NULL,
      height DECIMAL(5,2),
      weight DECIMAL(5,2),
      address TEXT NOT NULL,
      email VARCHAR(100),
      is_membership BOOLEAN DEFAULT false,
      status VARCHAR(10) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS progress_tracking (
      user_id VARCHAR(10) NOT NULL,
      candidate_name VARCHAR(50),
      entry_date DATE NOT NULL,
      weight_kg DECIMAL(5,2) NOT NULL,
      fat DECIMAL(5,2) NOT NULL,
      v_fat DECIMAL(5,2) NOT NULL,
      bmr DECIMAL(8,2) NOT NULL,
      bmi DECIMAL(5,2) NOT NULL,
      b_age INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES candidate(user_id)
    );

    CREATE TABLE IF NOT EXISTS membership_details (
      user_id VARCHAR(10) NOT NULL,
      member_name VARCHAR(100) NOT NULL,
      member_type VARCHAR(50) NOT NULL,
      amount DECIMAL(8,2),
      duration INT,
      start_date DATE DEFAULT CURRENT_DATE,
      end_date DATE,
      payment_type VARCHAR(50),
      CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES candidate(user_id)
    );

    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(10) NOT NULL,
      username VARCHAR(100) NOT NULL,
      password TEXT NOT NULL,
      CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES candidate(user_id)
    );

    CREATE TABLE IF NOT EXISTS revenue_analysis (
      amount DECIMAL(8,2),
      date_payes DATE
    );

    CREATE TABLE admin_login (
      id SERIAL PRIMARY KEY,
      email_address VARCHAR(50) UNIQUE NOT NULL,
      password TEXT NOT NULL
    );

  `;

  await dbClient.query(schema);
  console.log("All tables created successfully.");
  await dbClient.end();
};

createDatabaseAndTables().catch((err) => {
  console.error("Error creating database or tables:", err);
});
