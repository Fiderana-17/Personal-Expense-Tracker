
import express from "express";
import cors from "cors";
import dotenv from 'dotenv';
import authRoutes from './src/routes/auth.routes.js';
import categoryRoutes from "./src/routes/category.routes.js";
import expenseRoutes from "./src/routes/expense.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use("/api/categories", categoryRoutes);
app.use('/api/expenses', expenseRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});