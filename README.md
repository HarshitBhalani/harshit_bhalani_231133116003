# E-Commerce Web Application (NeoShop)

## Overview and Key Features

NeoShop is a full-stack e-commerce web application built following the MVC pattern. It includes complete authentication, product management, shopping cart, checkout flow, order management, and an admin dashboard.

### Core Features
- Secure JWT Authentication (Admin + Customer)
- Password hashing using bcrypt
- MongoDB for product catalog
- PostgreSQL + Prisma ORM for Users, Orders, Order Items
- Admin-only product CRUD operations
- Full cart & checkout system
- Search, filter, pagination, sorting
- SQL & MongoDB aggregation reports
- Fully responsive Next.js 14 frontend (App Router)

## Tech Stack and Dependencies

### Frontend
- Next.js 14 (App Router)
- React + TypeScript
- Tailwind CSS
- Axios
- React Hooks

### Backend
- Node.js + Express.js
- Prisma ORM
- PostgreSQL
- MongoDB + Mongoose
- JSON Web Token (JWT)
- bcrypt
- dotenv

### Other Tools
- Render (Backend Deployment)
- Vercel (Frontend Deployment)
- Jest (Testing Framework)

## Setup and Environment Variables

### 1. Clone the Repository
```bash
git clone https://github.com/HarshitBhalani/harshit_bhalani_231133116003.git
cd harshit_bhalani_231133116003
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
PORT=4000
DATABASE_URL="postgresql://<user>:<password>@<host>:5432/<dbname>?schema=public"
MONGO_URI="mongodb+srv://<username>:<password>@<cluster>/<db>"
JWT_SECRET="your_secret"
JWT_EXPIRES_IN="7d"
BCRYPT_SALT_ROUNDS=10
FRONTEND_ORIGIN="http://localhost:3000"
```

Start Backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

Start Frontend:
```bash
npm run dev
```

## Database Configuration & Migration Steps

### PostgreSQL (via Prisma)
Run:
```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

This will create all required tables in PostgreSQL.

### MongoDB
Use MongoDB Atlas or local instance.
If seeder is available:
```bash
npm run seed:mongo
```

## Testing Instructions
### Testing Framework Used

- Jest (Backend testing)

### Run All Tests
```bash
cd backend
npm run test
```

### What is Tested
- User authentication (register/login)
- Product search + sorting logic
- Checkout & order creation flow
- Basic API validation and error handling

## API & Frontend Route Summary

### Backend API Routes
| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/register` | POST | Create new user |
| `/api/auth/login` | POST | Login & receive JWT |
| `/api/products` | GET | List products (search, filter, pagination, sort) |
| `/api/products/:id` | GET | Get single product |
| `/api/products` | POST | Create product (Admin only) |
| `/api/products/:id` | PUT | Update product (Admin only) |
| `/api/products/:id` | DELETE | Delete product (Admin only) |
| `/api/orders/checkout` | POST | Checkout and create order |
| `/api/orders/user` | GET | User order history |
| `/api/reports/sql` | GET | SQL analytics report |
| `/api/reports/mongo` | GET | MongoDB aggregation report |

### Frontend Routes
| Path | Description |
|------|-------------|
| `/` | Home page |
| `/products` | All products |
| `/cart` | Shopping cart |
| `/orders` | User order history |
| `/auth/login` | Login |
| `/auth/register` | Register |
| `/products/admin` | Admin dashboard |
| `/products/admin/create` | Create product |
| `/products/admin/edit/[id]` | Edit product |

## Deployment URLs

- **Frontend (Vercel):** `[https://harshit-bhalani-231133116003.vercel.app](https://harshit-bhalani-231133116003.vercel.app/)`
- **Backend (Render):** `[https://harshit-bhalani-231133116003.onrender.com](https://harshit-bhalani-231133116003.onrender.com)`

## Admin Login Credentials (For Evaluation)

- **Email:** `admin@example.com`
- **Password:** `Admin@123`

## Folder Structure

```
project-root/
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── config/
│   ├── tests/
│   ├── prisma/
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── app/
    ├── components/
    ├── lib/
    ├── public/
    └── package.json
```

## Deployment Instructions

### Backend – Render

1. Go to [https://render.com](https://render.com)
2. Click **New → Web Service**
3. Connect GitHub repo
4. **Root Directory** → `backend`
5. **Build Command** →
   ```bash
   npm install
   ```
6. **Start Command** →
   ```bash
   npm run start
   ```
7. Add ENV variables: `DATABASE_URL`, `MONGO_URI`, `JWT_SECRET`, etc.

### Frontend – Vercel
1. Go to [https://vercel.com](https://vercel.com)
2. Import GitHub repo
3. **Root Directory** → `frontend`
4. Add ENV variable:
   ```
   NEXT_PUBLIC_API_URL = https://<your-backend>.onrender.com
   ```

---

## THANK YOU 🎉
