import express from 'express';
import { getReports } from '../controllers/reports.controller.js';
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get('/reports', authenticateToken, getReports);

export default router;
