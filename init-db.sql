-- Initialize database with customers table
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO customers (name, email, phone) VALUES 
    ('John Doe', 'john.doe@example.com', '123-456-7890'),
    ('Jane Smith', 'jane.smith@company.com', '098-765-4321'),
    ('Bob Johnson', 'bob.johnson@test.org', '555-123-4567'),
    ('Alice Brown', 'alice.brown@email.net', '777-888-9999'),
    ('Charlie Wilson', 'charlie.wilson@demo.io', '111-222-3333');
