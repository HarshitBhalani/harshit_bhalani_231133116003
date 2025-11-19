# Admin Registration and Login System - API Documentation

## Overview
Complete admin registration and login system for managing users and roles in your e-commerce platform.

---

## 🔐 Admin Endpoints

### 1. Register Admin User
**POST** `/api/admin/register`

Register a new admin account.

**Request Body:**
```json
{
  "name": "Admin Name",
  "email": "admin@example.com",
  "password": "SecurePassword123"
}
```

**Validation:**
- Name: Required, non-empty string
- Email: Required, valid email format
- Password: Required, minimum 8 characters (for admin security)

**Response (201 - Created):**
```json
{
  "message": "Admin registered successfully.",
  "user": {
    "id": 1,
    "name": "Admin Name",
    "email": "admin@example.com",
    "role": "admin",
    "createdAt": "2025-11-19T07:30:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- 400: Missing required fields or validation failed
- 409: Email already registered

---

### 2. Admin Login
**POST** `/api/admin/login`

Authenticate an admin user.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "SecurePassword123"
}
```

**Response (200 - OK):**
```json
{
  "message": "Login successful.",
  "user": {
    "id": 1,
    "name": "Admin Name",
    "email": "admin@example.com",
    "role": "admin",
    "createdAt": "2025-11-19T07:30:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- 400: Missing email or password
- 401: Invalid credentials
- 403: User exists but is not an admin

---

### 3. Get Admin Profile
**GET** `/api/admin/me`

Get the authenticated admin's profile information.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 - OK):**
```json
{
  "user": {
    "id": 1,
    "name": "Admin Name",
    "email": "admin@example.com",
    "role": "admin",
    "createdAt": "2025-11-19T07:30:00Z"
  }
}
```

**Error Responses:**
- 401: Invalid or missing token
- 403: User role is not admin
- 404: User not found

---

### 4. Get All Users
**GET** `/api/admin/users`

Fetch a list of all users in the system (admin only).

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 - OK):**
```json
{
  "users": [
    {
      "id": 1,
      "name": "Admin Name",
      "email": "admin@example.com",
      "role": "admin",
      "createdAt": "2025-11-19T07:30:00Z"
    },
    {
      "id": 2,
      "name": "Customer Name",
      "email": "customer@example.com",
      "role": "customer",
      "createdAt": "2025-11-19T08:00:00Z"
    }
  ]
}
```

**Error Responses:**
- 401: Invalid or missing token
- 403: User role is not admin

---

### 5. Update User
**PATCH** `/api/admin/users/{id}`

Update user role or name (admin only).

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "role": "admin",
  "name": "Updated Name"
}
```

**Note:** You cannot change your own admin role.

**Response (200 - OK):**
```json
{
  "message": "User updated successfully.",
  "user": {
    "id": 2,
    "name": "Updated Name",
    "email": "customer@example.com",
    "role": "admin",
    "createdAt": "2025-11-19T08:00:00Z"
  }
}
```

**Error Responses:**
- 400: Invalid user ID or attempting to change own role
- 401: Invalid or missing token
- 403: User role is not admin
- 404: User not found

---

### 6. Delete User
**DELETE** `/api/admin/users/{id}`

Delete a user account (admin only).

**Headers:**
```
Authorization: Bearer {token}
```

**Note:** You cannot delete your own account.

**Response (200 - OK):**
```json
{
  "message": "User deleted successfully.",
  "user": {
    "id": 2,
    "name": "Customer Name",
    "email": "customer@example.com",
    "role": "customer",
    "createdAt": "2025-11-19T08:00:00Z"
  }
}
```

**Error Responses:**
- 400: Invalid user ID or attempting to delete own account
- 401: Invalid or missing token
- 403: User role is not admin
- 404: User not found

---

## 🌐 Regular User Endpoints (Existing)

### Register Customer
**POST** `/api/auth/register`

Register a new customer account.

**Request Body:**
```json
{
  "name": "Customer Name",
  "email": "customer@example.com",
  "password": "password123"
}
```

**Response (201 - Created):**
```json
{
  "message": "Registration successful.",
  "user": {
    "id": 2,
    "name": "Customer Name",
    "email": "customer@example.com",
    "role": "customer"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Login Customer
**POST** `/api/auth/login`

Authenticate a customer user.

**Request Body:**
```json
{
  "email": "customer@example.com",
  "password": "password123"
}
```

**Response (200 - OK):**
```json
{
  "message": "Login successful.",
  "user": {
    "id": 2,
    "name": "Customer Name",
    "email": "customer@example.com",
    "role": "customer"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 🛠️ Seeding Initial Admin

### Command
```bash
npm run seed:admin
```

This creates an initial admin user using environment variables:
- `SEED_ADMIN_EMAIL` (default: `admin@example.com`)
- `SEED_ADMIN_PASSWORD` (default: `Admin@123`)
- `SEED_ADMIN_NAME` (default: `Admin User`)

### Example .env Configuration
```env
SEED_ADMIN_EMAIL=admin@yourdomain.com
SEED_ADMIN_PASSWORD=YourSecureAdminPassword123
SEED_ADMIN_NAME=Your Admin Name
```

---

## 🔑 JWT Token

All tokens are JWT format containing:
```json
{
  "id": 1,
  "email": "admin@example.com",
  "name": "Admin Name",
  "role": "admin"
}
```

Token expires in: `7d` (configured in `.env` as `JWT_EXPIRES_IN`)

---

## 📝 Environment Variables Required

```env
PORT=4000
DATABASE_URL=postgresql://user:password@localhost:5432/ecomdb
MONGO_URI=mongodb://localhost:27017/ecom
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=Admin@123
SEED_ADMIN_NAME=Admin User
```

---

## 🧪 Example Usage

### 1. Register Admin
```bash
curl -X POST http://localhost:4000/api/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin",
    "email": "admin@example.com",
    "password": "SecurePassword123"
  }'
```

### 2. Login Admin
```bash
curl -X POST http://localhost:4000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SecurePassword123"
  }'
```

### 3. Get All Users (requires token)
```bash
curl -X GET http://localhost:4000/api/admin/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Update User Role
```bash
curl -X PATCH http://localhost:4000/api/admin/users/2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "role": "admin"
  }'
```

---

## 🔒 Security Features

✅ Password hashing with bcrypt (10 salt rounds)  
✅ JWT token-based authentication  
✅ Role-based access control (RBAC)  
✅ Protected admin endpoints  
✅ Email validation  
✅ Minimum password length enforcement  
✅ User cannot modify own role  
✅ User cannot delete own account  
✅ Token verification on each protected request  

---

## 📚 Database Schema

### User Model
```prisma
model User {
  id            Int     @id @default(autoincrement())
  name          String
  email         String  @unique
  passwordHash  String
  role          String  @default("customer")
  createdAt     DateTime @default(now())
  orders        Order[]
}
```

**Roles:**
- `customer` - Regular user, can browse and order products
- `admin` - Administrator, can manage users and system

---

## ⚠️ Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Token missing" | Authorization header not provided | Add `Authorization: Bearer {token}` header |
| "Invalid token" | Token expired or corrupted | Login again to get fresh token |
| "Admin role required" | User is not an admin | Only admin accounts can access this endpoint |
| "Email already registered" | Email exists in database | Use different email or login |
| "Cannot change your own role" | Attempting to modify own role | Use another admin account |

---

## 🚀 Next Steps

1. Run `npm run seed:admin` to create initial admin
2. Use admin credentials to login and get token
3. Use token to manage other users
4. Integrate with frontend for admin dashboard

