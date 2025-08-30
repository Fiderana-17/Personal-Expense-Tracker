# <div align="center">📊 Personal Expense Tracker 📊</div>

A full-stack web application that allows users to track personal expenses and income, upload receipts, set up recurring expenses with a defined duration, and receive alerts when they exceed their monthly budget.

---

## 🚀 Technologies Used

| Frontend      | Backend     | Database    | Tools               |
|---------------|-------------|-------------|---------------------|
| React + Vite  | Express.js  | PostgreSQL  | Tailwind CSS        |
| React Router  | Node.js     | Prisma      | TypeScript          |
|               | Multer (file upload) |   | JWT (authentication) |

---

## 👥 Project Team

| Reference | Last Name        | First Name              | Role in the Project                        |
|-----------|------------------|-------------------------|--------------------------------------------|
| STD24013  | RAKOTOARISON     | Santatriniaina Fiderana | Developer – Categories & Dashboard         |
| STD24039  | RANDRIAMANANTENA | Mitia Jessica           | Developer – Income Management              |
| STD24060  | RAKOTOARISON     | Irina Stéphane          | Developer – Authentication & Security      |
| STD24071  | NOMENJANAHARY    | Tsikiniaina Tsilavina   | Developer – Expense Management             |

---

## 📌 Features

- **Secure Authentication** (JWT)  
- **Expense and Income Management**  
- **Customizable Categories**  
- **Receipt Upload** (JPG, PNG, PDF)  
- **Monthly Summary** with charts  
- **Budget Alert** if expenses > income  
- **Dark Mode** (optional)  

---

## 🚀 Setup & Run

### Backend

> [!IMPORTANT]  
> Do not forget to create a `.env` file at the root of the **backend** project and configure it with the URL of an **empty database** that already exists.  
> Prisma will use this database to apply the schema defined in `schema.prisma`.  
> You can use the `.env.template` file as a reference to correctly set up the required variables.

```bash
cd backend
npm install
npx prisma db push
npm run dev
```
By default it will run on `http://localhost/3000`


### Frontend

```bash
cd frontend
npm install
npm run dev
```

> [!IMPORTANT]  
> Make sure to create a `.env.local` file at the root of the **frontend** project and define your own value for `VITE_API_BASE_URL` (as shown in `.env.template`).  
> This variable corresponds to the URL of your API.

---

## 📂 Project structure
```
Personal-Expense-Tracker/  
│  
├── backend/  
│   ├── src/  
│   │   ├── index.js 
│   │   ├── routes/  
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── middlewares/ 
│   │   └── utils/
│   │  
│   ├── prisma/  
│   │   └── schema.prisma  
│   │  
│   ├── package.json  
│   └── .gitignore  
│  
├── frontend/  
│   ├── public/ 
│   │  
│   ├── src/  
│   │   ├── assets/  
│   │   ├── components/
│   │   ├── pages/
│   │   ├── index.css
│   │   └── main.jsx  
│   │  
│   ├── package.json  
│   └── .gitignore  
│── README.md  

```

## 🔌 Backend API Endpoints

| Méthode | Endpoint              | Description                        |
|---------|-----------------------|------------------------------------|
| POST    | `/auth/signup`        | Register a new user                |
| POST    | `/auth/login`         | Login and receive JWT token        |
| GET     | `/user/profile`       | Get user profile                   |
| GET     | `/expenses`           | List all user expenses             |
| POST    | `/expenses`           | Create a new expense               |
| GET     | `/expenses/{id}`      | Get a single expense               |
| PUT     | `/expenses/{id}`      | Update an expense                  |
| DELETE  | `/expenses/{id}`      | Delete an expense                  |
| GET     | `/incomes`            | List all incomes                   |
| POST    | `/incomes`            | Create a new income                |
| GET     | `/incomes/{id}`       | Get an income entry                |
| PUT     | `/incomes/{id}`       | Update an income entry             |
| DELETE  | `/incomes/{id}`       | Delete an income entry             |
| GET     | `/categories`         | List user categories               |
| POST    | `/categories`         | Create a new category              |
| PUT     | `/categories/{id}`    | Rename a category                  |
| DELETE  | `/categories/{id}`    | Delete a category                  |
| GET     | `/receipts/{id}`      | Download or view a receipt         |
| GET     | `/summary/monthly`    | Get current month’s summary        |
| GET     | `/summary`            | Get summary for custom date range  |
| GET     | `/summary/alerts`     | Budget overrun alert               |
