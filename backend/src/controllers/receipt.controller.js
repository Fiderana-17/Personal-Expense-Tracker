import multer from 'multer';
import path from 'path';
import fs from 'fs';
import prisma from '../prismaClient.js';

// --- Multer Storage Config ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = './uploads/receipts';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: function (req, file, cb) {
    const allowed = /jpeg|jpg|png|pdf/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.test(ext)) return cb(null, true);
    cb(new Error('Only JPG, PNG and PDF are allowed'));
  },
}).single('receipt');

// --- Upload receipt ---
export const uploadReceipt = async (req, res) => {
  upload(req, res, async function (err) {
    if (err) return res.status(400).json({ message: err.message });

    const { expenseId } = req.body;
    const userId = req.user?.id;

    // Vérifie que la dépense existe et appartient à l’utilisateur
    const expense = await prisma.expense.findUnique({ where: { id: Number(expenseId) } });
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    if (expense.userId !== Number(userId)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Vérifie si un receipt existe déjà
    const existingReceipt = await prisma.receipt.findUnique({ where: { expenseId: Number(expenseId) } });
    if (existingReceipt) {
      fs.unlinkSync(existingReceipt.filePath);
      await prisma.receipt.delete({ where: { id: existingReceipt.id } });
    }

    // Sauvegarde en DB
    const receipt = await prisma.receipt.create({
      data: {
        filePath: req.file.path,
        expenseId: Number(expenseId),
      },
    });

    res.status(201).json({ message: "Receipt uploaded successfully", data: receipt });
  });
};

// --- View receipt (inline in browser) ---
export const viewReceipt = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;

  const receipt = await prisma.receipt.findUnique({
    where: { id: Number(id) },
    include: { expense: true },
  });

  if (!receipt) return res.status(404).json({ message: "Receipt not found" });
  if (receipt.expense.userId !== Number(userId)) return res.status(403).json({ message: "Not authorized" });

  res.sendFile(path.resolve(receipt.filePath));
};

// --- Download receipt ---
export const downloadReceipt = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;

  const receipt = await prisma.receipt.findUnique({
    where: { id: Number(id) },
    include: { expense: true },
  });

  if (!receipt) return res.status(404).json({ message: "Receipt not found" });
  if (receipt.expense.userId !== Number(userId)) return res.status(403).json({ message: "Not authorized" });

  res.download(receipt.filePath);
};

// --- Get all receipts ---
export const getAllReceipts = async (req, res) => {
  const userId = req.user?.id;
  const receipts = await prisma.receipt.findMany({
    include: { expense: true },
    where: { expense: { userId: Number(userId) } },
  });
  res.json(receipts);
};

// --- Delete receipt ---
export const deleteReceiptController = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;

  const receipt = await prisma.receipt.findUnique({
    where: { id: Number(id) },
    include: { expense: true },
  });

  if (!receipt) return res.status(404).json({ message: "Receipt not found" });
  if (receipt.expense.userId !== Number(userId)) return res.status(403).json({ message: "Not authorized" });

  fs.unlinkSync(receipt.filePath);
  await prisma.receipt.delete({ where: { id: Number(id) } });

  res.json({ message: "Receipt deleted successfully" });
};
