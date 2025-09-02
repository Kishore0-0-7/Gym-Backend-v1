-- Create the candidates table
CREATE TABLE candidate (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(10) UNIQUE NOT NULL,
    candidate_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    blood_group VARCHAR(5),
    gender VARCHAR(6) NOT NULL CHECK (gender IN ('male', 'female')),
    trainer_type VARCHAR(16) NOT NULL CHECK (trainer_type IN ('trainer', 'personal trainer')),
    premium_type VARCHAR(50),
    candidate_type VARCHAR(20) NOT NULL CHECK (candidate_type IN ('gym','cardio')),
    goal VARCHAR(50) CHECK (goal IN ('weight loss','weight gain')),
    date_of_joining DATE NOT NULL,
    height DECIMAL(5,2),
    weight DECIMAL(5,2),
    address TEXT NOT NULL,
    email VARCHAR(100),
    is_membership BOOLEAN DEFAULT false,
    password TEXT NOT NULL,
    status VARCHAR(10) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Create a function to generate the next GYM ID
CREATE OR REPLACE FUNCTION generate_gym_id() RETURNS VARCHAR(10) AS $$
DECLARE
    next_num INTEGER;
    gym_id VARCHAR(10);
BEGIN
    -- Get the next number by finding the max number from existing GYM IDs
    SELECT COALESCE(MAX(CAST(SUBSTRING(user_id FROM 4) AS INTEGER)), 0) + 1 
    INTO next_num
    FROM candidates 
    WHERE user_id LIKE 'GYM%';
    
    -- Format the ID as GYM + zero-padded number (e.g., GYM01, GYM02, etc.)
    gym_id := 'GYM' || LPAD(next_num::TEXT, 2, '0');
    
    RETURN gym_id;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger function to auto-generate user_id before insert
CREATE OR REPLACE FUNCTION set_user_id() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.user_id IS NULL OR NEW.user_id = '' THEN
        NEW.user_id := generate_gym_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER trigger_set_user_id
    BEFORE INSERT ON candidates
    FOR EACH ROW
    EXECUTE FUNCTION set_user_id();

-- Create a trigger for updating the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_updated_at
    BEFORE UPDATE ON candidates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Sample INSERT queries (user_id will be auto-generated)
INSERT INTO candidates (
    candidate_name, phone_number, blood_group, gender, trainer_type, 
    premium_type, candidate_type, goal, date_of_joining, 
    height, weight, address, mail, password
) VALUES
(
    'Rahul Kumar', '9876543210', 'B+', 'Male', 'Trainer',
    'Gold', 'Gym', 'Weight Loss', '2025-08-01',
    175.50, 78.20, '123, MG Road, Bangalore', 'rahul.kumar@example.com', 'rahul@123'
);,
(
    'Priya Sharma', '9876501234', 'O+', 'Female', 'Personal Trainer',
    'Platinum', 'Cardio', 'Weight Gain', '2025-08-05',
    162.30, 54.10, '45, Anna Nagar, Chennai', 'priya.sharma@example.com', 'priya@123'
),
(
    'Arjun Singh', '9123456789', 'A-', 'Male', 'Trainer',
    'Silver', 'Gym', 'Weight Loss', '2025-08-10',
    180.00, 85.00, '78, Park Street, Kolkata', 'arjun.singh@example.com', 'arjun@123'
),
(
    'Sneha Reddy', '9988776655', 'AB+', 'Female', 'Personal Trainer',
    'Diamond', 'Cardio', 'Weight Gain', '2025-08-15',
    158.40, 50.00, '22, Jubilee Hills, Hyderabad', 'sneha.reddy@example.com', 'sneha@123'
);
-- Query to view all candidates
SELECT * FROM candidates ORDER BY user_id;

-- Query to get the next available GYM ID
SELECT generate_gym_id() as next_gym_id;