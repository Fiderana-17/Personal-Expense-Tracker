import express from "express"
import { getAllIncomes, getIncomeById, createIncome, updateIncome, deleteIncome } from "../controllers/income.controller.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticateToken);

router.get("/", getAllIncomes);
router.get("/:id", getIncomeById);
router.post("/", createIncome);
router.put("/:id", updateIncome);
router.delete("/:id", deleteIncome);

export default router;