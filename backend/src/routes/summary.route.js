import express from "express";
import {
  getMonthlySummary,
  getSummaryBetweenDates,
  getAlerts,
  getRecentTransactions,
  getMonthlyExpensesSummary,
} from "../controllers/summary.controller.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/monthly", authenticateToken, getMonthlySummary);
router.get("/", authenticateToken, getSummaryBetweenDates);
router.get("/alerts", authenticateToken, getAlerts);
router.get("/recent", authenticateToken, getRecentTransactions);
router.get("/chart", authenticateToken, getMonthlyExpensesSummary);

export default router;