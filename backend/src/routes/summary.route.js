import express from "express";
import {
  getMonthlySummary,
  getSummaryBetweenDates,
  getAlerts,
  getMonthlyExpensesSummary,
  getAllTransactions, // <-- ajouter cette ligne
} from "../controllers/summary.controller.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/monthly", authenticateToken, getMonthlySummary);
router.get("/", authenticateToken, getSummaryBetweenDates);
router.get("/alerts", authenticateToken, getAlerts);
router.get("/chart", authenticateToken, getMonthlyExpensesSummary);
router.get("/transactions", authenticateToken, getAllTransactions); 

export default router;
