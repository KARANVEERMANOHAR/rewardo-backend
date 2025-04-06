# QR Code Generation and Payment System

A robust Node.js Express application with TypeScript for generating QR codes with encrypted data and handling payments through Razorpay integration.

## Features

- Super Admin panel to manage admins
- Admin authentication using JWT
- Admin wallet system
- QR code generation with encrypted data
- Payment gateway integration (Razorpay)
- PostgreSQL database
- TypeScript support
- Comprehensive API documentation

## Prerequisites

- Node.js >= 14.0.0
- PostgreSQL >= 12
- Razorpay account for payment integration

## Database Setup

Before running the application, you need to set up PostgreSQL:

1. Log in to PostgreSQL as superuser:
```bash
sudo -u postgres psql
```

2. Create a database user (change password as needed):
```sql
CREATE USER postgres WITH PASSWORD 'postgres' CREATEDB;
```

3. Create the main and test databases:
```sql
CREATE DATABASE qr_product_db WITH OWNER = postgres;
CREATE DATABASE qr_product_test_db WITH OWNER = postgres;
```

4. Grant privileges:
```sql
GRANT ALL PRIVILEGES ON DATABASE qr_product_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE qr_product_test_db TO postgres;
```

5. Exit PostgreSQL:
```sql
\q
```

## Environment Setup

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=qr_product_db

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key

# Encryption
ENCRYPTION_KEY=your_32_character_encryption_key
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd rewardo
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
npm run db:setup
```

4. Start the development server:
```bash
npm run dev
```

Or use the combined command:
```bash
npm run start:dev
```

For production deployment:
```bash
npm run start:prod
```

## Default Super Admin

After initialization, a default super admin account is created:
- Username: superadmin
- Password: Admin123!

**Important**: Change the password immediately after first login.

## API Documentation

### Authentication Routes

- POST `/api/auth/login` - User login
- GET `/api/auth/profile` - Get user profile
- PUT `/api/auth/profile` - Update user profile
- PUT `/api/auth/password` - Update password
- POST `/api/auth/create-admin` - Create new admin (Super Admin only)

### QR Code Routes

- POST `/api/qr/generate` - Generate QR code
- POST `/api/qr/verify` - Verify QR code
- PUT `/api/qr/:id/deactivate` - Deactivate QR code
- GET `/api/qr/transactions` - Get QR transactions
- GET `/api/qr/active` - Get active QR codes
- GET `/api/qr/stats` - Get QR statistics

### Payment Routes

- POST `/api/payments/create-order` - Create payment order
- POST `/api/payments/verify` - Verify payment
- POST `/api/payments/failure` - Handle payment failure
- GET `/api/payments/history` - Get payment history
- GET `/api/payments/stats` - Get payment statistics
- GET `/api/payments/pending` - Get pending payments

## Available Scripts

```bash
# Start production server
npm start

# Start development server
npm run dev

# Build the application
npm run build

# Watch for changes and rebuild
npm run watch

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Set up database
npm run db:setup

# Reset database
npm run db:reset

# Clean build directory
npm run clean

# Prepare for production
npm run prepare

# Start production server with build
npm run start:prod
```

## Project Structure

```
src/
├── __tests__/        # Test files
├── controllers/      # Request handlers
├── middleware/       # Express middleware
├── routes/          # API routes
├── repositories/     # Database operations
├── utils/           # Utility functions
├── types/           # TypeScript types
├── validations/     # Request validation schemas
├── database/        # Database schema
├── scripts/         # Setup scripts
└── app.ts           # Application entry point
```

## Security Features

- JWT based authentication
- Password hashing using bcrypt
- Data encryption for QR codes
- Request validation using Joi
- TypeScript for type safety
- CORS protection

## Error Handling

The application implements a centralized error handling mechanism with custom error types:
- ValidationError
- AuthenticationError
- AuthorizationError
- DatabaseError

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

