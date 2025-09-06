-- Initialize PropertyOS Database
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create initial admin user table if not exists
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user (change password in production!)
INSERT INTO admin_users (email, password_hash, name) 
VALUES ('admin@propertyos.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LQ0nZy6vE/3y4vYpm', 'PropertyOS Admin')
ON CONFLICT (email) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_created_at ON admin_users(created_at);
