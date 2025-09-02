CREATE TABLE progress_tracking (
    user_id VARCHAR(10) NOT NULL,
    candidate_name VARCHAR(100),
    entry_date DATE NOT NULL,
    weight_kg DECIMAL(5,2) NOT NULL,
    fat DECIMAL(5,2) NOT NULL,
    v_fat DECIMAL(5,2) NOT NULL,
    bmr DECIMAL(8,2) NOT NULL,
    bmi DECIMAL(5,2) NOT NULL,
    b_age INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


delete from progress_tracking;

INSERT INTO progress_tracking 
(user_id, candidate_name, entry_date, weight_kg, fat, v_fat, bmr, bmi, b_age)
VALUES
-- USER123 Progress
('USER123', 'Alice Johnson', '2025-08-01', 67.2, 24, 13.2, 1435, 23.0, 25),
('USER123', 'Alice Johnson', '2025-08-10', 66.5, 23, 13.0, 1420, 22.7, 25),
('USER123', 'Alice Johnson', '2025-08-18', 65.0, 22, 12.5, 1400, 22.3, 25),

-- USER456 Progress
('USER456', 'Bob Smith', '2025-07-15', 72.0, 20, 12.0, 1500, 24.5, 26),
('USER456', 'Bob Smith', '2025-08-01', 73.0, 21, 12.2, 1520, 25.0, 27),
('USER456', 'Bob Smith', '2025-08-17', 73.5, 21.8, 12.4, 1525, 25.3, 27),

-- USER789 Progress
('USER789', 'Charlie Davis', '2025-07-20', 80.0, 26, 15.0, 1600, 27.5, 30),
('USER789', 'Charlie Davis', '2025-08-05', 79.2, 25.5, 14.8, 1590, 27.2, 30),
('USER789', 'Charlie Davis', '2025-08-18', 78.0, 25.0, 14.5, 1580, 26.8, 30)



-- SELECT 
--     user_id,
--     entry_date,
--     weight_kg,
--     LAG(weight_kg) OVER (PARTITION BY user_id ORDER BY entry_date) AS prev_weight,
--     (weight_kg - LAG(weight_kg) OVER (PARTITION BY user_id ORDER BY entry_date)) AS weight_change,

--     fat,
--     LAG(fat) OVER (PARTITION BY user_id ORDER BY entry_date) AS prev_fat,
--     (fat - LAG(fat) OVER (PARTITION BY user_id ORDER BY entry_date)) AS fat_change,

--     v_fat,
--     (v_fat - LAG(v_fat) OVER (PARTITION BY user_id ORDER BY entry_date)) AS vfat_change,

--     bmr,
--     (bmr - LAG(bmr) OVER (PARTITION BY user_id ORDER BY entry_date)) AS bmr_change,

--     bmi,
--     (bmi - LAG(bmi) OVER (PARTITION BY user_id ORDER BY entry_date)) AS bmi_change,

--     b_age,
--     (b_age - LAG(b_age) OVER (PARTITION BY user_id ORDER BY entry_date)) AS b_age_change
-- FROM progress_tracking
-- ORDER BY user_id, entry_date;
