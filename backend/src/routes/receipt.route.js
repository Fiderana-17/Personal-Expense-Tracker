import express from "express";
import multer from "multer";
import { getAllReceipts, getReceiptById } from "../controllers/receipt.controller.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Configuration multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "../uploads/receipts/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "application/pdf"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Format de fichier non supporté"), false);
  },
});

router.get("/", authenticateToken, getAllReceipts);
router.get("/:id", authenticateToken, getReceiptById);

export default router;
