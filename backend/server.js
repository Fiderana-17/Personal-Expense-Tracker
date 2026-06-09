import express from "express";
import cors from "cors";
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { authRoutes, categoryRoutes, expenseRoutes, incomeRoutes, summaryRoutes, receiptRoutes } from "./src/routes/index.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use("/api/categories", categoryRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/incomes', incomeRoutes);
app.use("/api/summary", summaryRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/uploads', express.static('uploads'));

app.use(express.static(join(__dirname, '../frontend/dist')));

// ✅ Pas de wildcard — fallback middleware
app.use((req, res) => {
  res.sendFile(join(__dirname, '../frontend/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});