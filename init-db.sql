-- Create customers table with email column as required
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data with email addresses for masking verification
INSERT INTO customers (email, first_name, last_name) VALUES 
('john.doe@example.com', 'John', 'Doe'),
('jane.smith@company.com', 'Jane', 'Smith'),
('bob.johnson@email.com', 'Bob', 'Johnson'),
('alice.williams@test.org', 'Alice', 'Williams'),
('charlie.brown@sample.net', 'Charlie', 'Brown')
ON CONFLICT DO NOTHING;
