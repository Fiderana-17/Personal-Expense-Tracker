
import express from "express";
import cors from "cors";
import dotenv from 'dotenv';
import authRoutes from './src/routes/auth.route.js';
import categoryRoutes from "./src/routes/category.route.js";
import expenseRoutes from "./src/routes/expense.route.js";
import incomeRoutes from "./src/routes/income.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use("/api/categories", categoryRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/incomes', incomeRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});