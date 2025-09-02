
CREATE TABLE membership_details(
  user_id varchar(10),
  candidate_name VARCHAR(50),
  member_type varchar(50) not null,
  amount decimal(8,2),
  duration int,
  end_date date,
  payment_type varchar(50)
);


CREATE TABLE revenue_analysis (
  amount DECIMAL(8,2),
  date_payes DATE
);

CREATE TABLE diet_plans (
    -- plan_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(10),
    date_created DATE,
    diet_type VARCHAR(50),
    day1_diet TEXT,
    day2_diet TEXT,
    day3_diet TEXT,
    day4_diet TEXT,
    day5_diet TEXT,
    day6_diet TEXT,
    day7_diet TEXT,
    day1_workout TEXT,
    day2_workout TEXT,
    day3_workout TEXT,
    day4_workout TEXT,
    day5_workout TEXT,
    day6_workout TEXT,
    day7_workout TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);