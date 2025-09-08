import multer from 'multer';
import path from 'path';
import fs from 'fs';
import prisma from '../prismaClient.js';

// Storage Multer
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
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) return cb(null, true);
    cb(new Error('Seuls les fichiers JPG, PNG et PDF sont autorisés'));
  },
}).single('receipt');

// Upload receipt
export const uploadReceipt = async (req, res) => {
  upload(req, res, async function (err) {
    if (err) return res.status(400).json({ message: err.message });

    const { expenseId } = req.body;
    const userId = req.user?.id; // Token auth

    // Vérification que la dépense appartient à l'utilisateur
    const expense = await prisma.expense.findUnique({ where: { id: Number(expenseId) } });
    if (!expense || expense.userId !== Number(userId)) {
      return res.status(403).json({ message: "Action non autorisée" });
    }

    // Création du record Receipt
    const receipt = await prisma.receipt.create({
      data: {
        filePath: req.file.path,
        expenseId: Number(expenseId),
      },
    });

    res.status(201).json({ message: "Receipt uploaded successfully", data: receipt });
  });
};

// Download receipt
export const downloadReceipt = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;

  const receipt = await prisma.receipt.findUnique({ where: { id: Number(id) }, include: { expense: true } });
  if (!receipt) return res.status(404).json({ message: "Receipt not found" });
  if (receipt.expense.userId !== Number(userId)) return res.status(403).json({ message: "Action non autorisée" });

  res.download(receipt.filePath);
};

// Get all receipts of user
export const getAllReceipts = async (req, res) => {
  const userId = req.user?.id;
  const receipts = await prisma.receipt.findMany({
    include: { expense: true },
    where: { expense: { userId: Number(userId) } },
  });
  res.json(receipts);
};

// Delete receipt
export const deleteReceiptController = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;

  const receipt = await prisma.receipt.findUnique({ where: { id: Number(id) }, include: { expense: true } });
  if (!receipt) return res.status(404).json({ message: "Receipt not found" });
  if (receipt.expense.userId !== Number(userId)) return res.status(403).json({ message: "Action non autorisée" });

  // Supprimer le fichier
  fs.unlinkSync(receipt.filePath);

  await prisma.receipt.delete({ where: { id: Number(id) } });
  res.json({ message: "Receipt deleted successfully" });
};
