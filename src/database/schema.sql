-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Superadmin Table
CREATE TABLE IF NOT EXISTS superadmin (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    password_updated_at TIMESTAMP WITHOUT TIME ZONE
);

-- Admin Table
CREATE TABLE IF NOT EXISTS admin (
    id SERIAL PRIMARY KEY,
    superadmin_id INTEGER NOT NULL REFERENCES superadmin(id),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(10) NOT NULL,
    password TEXT NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    password_updated_at TIMESTAMP WITHOUT TIME ZONE
);

-- Wallet Table
CREATE TABLE IF NOT EXISTS wallet (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER NOT NULL REFERENCES admin(id),
    balance DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- QR Table
CREATE TABLE IF NOT EXISTS qr (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER NOT NULL REFERENCES admin(id),
    qr_data TEXT NOT NULL,
    encrypted_data TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Customer Table
CREATE TABLE IF NOT EXISTS customer (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER NOT NULL REFERENCES admin(id),
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Admin Transaction Table
CREATE TABLE IF NOT EXISTS admin_transaction (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER NOT NULL REFERENCES admin(id),
    amount DECIMAL(10,2) NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    razorpay_payment_id VARCHAR(255),
    razorpay_order_id VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Customer Transaction Table
CREATE TABLE IF NOT EXISTS customer_transaction (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customer(id),
    qr_id INTEGER NOT NULL REFERENCES qr(id),
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_wallet_updated_at
    BEFORE UPDATE ON wallet
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_qr_updated_at
    BEFORE UPDATE ON qr
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_updated_at
    BEFORE UPDATE ON customer
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_transaction_updated_at  `
    BEFORE UPDATE ON admin_transaction
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();