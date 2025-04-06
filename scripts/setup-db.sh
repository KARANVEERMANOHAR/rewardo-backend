#!/bin/bash

# PostgreSQL connection settings
DB_USER="postgres"
DB_NAME="rewardo"
DB_TEST_NAME="rewardo_test"

echo "Setting up PostgreSQL databases..."

# Create database user if not exists (you'll be prompted for PostgreSQL superuser password)
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD 'postgres' CREATEDB;" || true

# Create main database if not exists
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME WITH OWNER = $DB_USER;" || true

# Create test database if not exists
sudo -u postgres psql -c "CREATE DATABASE $DB_TEST_NAME WITH OWNER = $DB_USER;" || true

# Grant privileges
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_TEST_NAME TO $DB_USER;"

echo "Database setup completed!"
echo "Main database: $DB_NAME"
echo "Test database: $DB_TEST_NAME"
echo "User: $DB_USER"
echo ""
echo "You can now run 'npm run start:dev' to start the application"