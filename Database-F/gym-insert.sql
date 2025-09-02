-- 1. Insert into candidate
INSERT INTO candidate (
    user_id, candidate_name, phone_number, date_of_birth, blood_group, gender,
    trainer_type, premium_type, candidate_type, goal, date_of_joining,
    height, weight, address, email, is_membership
) VALUES (
    'U1', 'John Doe', '9876543210', '1995-05-15', 'O+', 'male',
    'trainer', 'gold', 'gym', 'weight gain', '2023-08-01',
    175.00, 70.50, '123 Main Street, Springfield', 'john.doe@example.com', true
);

-- 2. Insert into users (login info)
INSERT INTO users (user_id, username, password)
VALUES ('U1', 'johndoe', 'securepassword123');

-- 3. Insert into membership_details
INSERT INTO membership_details (
    user_id, member_name, member_type, amount, duration, start_date, end_date, payment_type
) VALUES (
    'U1', 'John Doe', 'gold', 5000.00, 12, '2023-08-01', '2024-08-01', 'credit card'
);

-- 4. Insert into progress_tracking
INSERT INTO progress_tracking (
    user_id, candidate_name, entry_date, weight_kg, fat, v_fat, bmr, bmi, b_age
) VALUES (
    'U1', 'John Doe', '2023-09-01', 72.00, 18.00, 10.00, 1600.00, 23.50, 28
);

-- 5. Insert into revenue_analysis
INSERT INTO revenue_analysis (amount, date_payes)
VALUES (5000.00, '2023-08-01');
