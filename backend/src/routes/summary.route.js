import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import {
  getMonthlySummary,
  getSummaryBetweenDates,
  getAlerts,
} from "../controllers/summary.controller.js";

const router = express.Router();

// Résumé du mois courant ou spécifique
router.get("/monthly", authenticateToken, getMonthlySummary);

// Résumé entre deux dates
router.get("/", authenticateToken, getSummaryBetweenDates);

// Alertes budget
router.get("/alerts", authenticateToken, getAlerts);

export default router;
