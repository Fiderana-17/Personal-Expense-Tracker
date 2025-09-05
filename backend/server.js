import express from "express";
import cors from "cors";
import dotenv from 'dotenv';
import { authRoutes, categoryRoutes, expenseRoutes, incomeRoutes ,reportRoutes } from "./src/routes/index.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use("/api/categories", categoryRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/incomes', incomeRoutes);
app.use('/api/reports', reportRoutes);




app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});