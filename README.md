# E-Commerce Web Application

## a. Overview and Key Features
This is a full-stack e-commerce web application built using the MVC pattern.  
It includes secure authentication, a product catalog, cart and checkout system, and a dedicated admin dashboard.

### Core Features
- Secure **JWT-based authentication** (Admin + Customer roles)
- Password hashing using **bcrypt**
- **MongoDB** for product catalog
- **PostgreSQL + Prisma** for Users, Orders, Order Items
- **Admin-only** product CRUD operations
- Full **cart and checkout flow**
- **SQL and MongoDB aggregation reports**
- Search, filter, pagination, and **server-side sorting**
- Fully responsive **Next.js 14** frontend

---

## b. Tech Stack and Dependencies

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- React Hooks

### Backend
- Node.js + Express.js
- Prisma ORM
- PostgreSQL
- MongoDB (Mongoose)
- JSON Web Token (JWT)
- Bcrypt

### Other Tools
- Render (Backend Deployment)
- Vercel (Frontend Deployment)
- dotenv for environment configuration
- Jest for backend testing

---

## c. Setup and Environment Variables

### 1. Clone the Repository
```bash
git clone https://github.com/<your-repo-name>.git
cd <your-repo-name>
```

###2. Backend Setup
```bash
cd backend
npm install
```

###Create backend/.env file:
```ini
PORT=4000
DATABASE_URL="postgresql://<user>:<password>@<host>:5432/<dbname>?schema=public"
MONGO_URI="mongodb+srv://<username>:<password>@<cluster>/<db>"
JWT_SECRET="your_secret"
JWT_EXPIRES_IN="7d"
BCRYPT_SALT_ROUNDS=10
FRONTEND_ORIGIN="http://localhost:3000"
```

###Start backend locally:
```
npm run dev
```

##3. Frontend Setup
```
cd frontend
npm install
```

###Create frontend/.env.local:
```
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

###Start frontend:
```
npm run dev
```

###d. Database Configuration & Migration Steps
PostgreSQL (via Prisma)
Run the following commands:
```
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

##This will create your tables in PostgreSQL.
MongoDB Setup
Use MongoDB Atlas or a local MongoDB instance.
Seed sample products (if seeder exists):
```
npm run seed:mongo
```
###e. Testing Instructions
Backend testing is done using Jest.
Run all tests:
```
cd backend
npm run test
```

###What is Tested
User authentication (register/login)
Server-side product sorting
Order creation flow
Basic API validation

###f. API & Frontend Route Summary
#Backend API Routes
#Route	Method	Description
```/api/auth/register```	POST	Create new user
```/api/auth/login```	POST	Login & receive JWT
```/api/products```	GET	List products with search, filter, pagination, sort
```/api/products/:id```	GET	Get single product
```/api/products```	POST	Create product (Admin only)
```/api/products/:id```	PUT	Update product (Admin only)
```/api/products/:id```	DELETE	Delete product (Admin only)
```/api/orders/checkout```	POST	Checkout, create order
```/api/orders/user```	GET	User order history
```/api/reports/sql```	GET	SQL aggregation report
```/api/reports/mongo```	GET	MongoDB aggregation report

#Frontend Routes
Path	Description
```/```	Home page
```/products```	User product listing
```/cart```	User cart
```/orders```	User order history
```/auth/login```	Login
```/auth/register```	Register
```/products/admin```	Admin dashboard
```/products/admin/create```	Add product
```/products/admin/edit/[id]```	Edit product

###g. Deployment URLs
##Update these after deploying:
Frontend (Vercel): https://<your-frontend>.vercel.app
Backend (Render):  https://<your-backend>.onrender.com

##h. Admin Login Credentials (For Evaluation) ADMIN CREDENTIALS
```
Email: admin@example.com
Password: Admin@123
```

###i. Folder Structure
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

###j. Deployment Instructions (Short)
Backend – Render
Go to https://render.com
Create New → Web Service
Select GitHub repo
Root Directory → backend
Build Command → npm install
Start Command → npm run start
Add ENV variables (DATABASE_URL, MONGO_URI, JWT_SECRET, etc.)
Frontend – Vercel
Go to https://vercel.com
New Project → Import GitHub repo
Root Directory → frontend
Add ENV variable:
NEXT_PUBLIC_API_URL = https://<your-backend>.onrender.com

##THANK YOU 

