import prisma from "../prismaClient.js";

// Récupérer tous les receipts
export const getAllReceipts = async (req, res) => {
  try {
    const receipts = await prisma.receipt.findMany({
      include: { expense: true },
    });
    res.json(receipts);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération des receipts" });
  }
};

// Récupérer un receipt par ID
export const getReceiptById = async (req, res) => {
  try {
    const { id } = req.params;
    const receipt = await prisma.receipt.findUnique({
      where: { id: parseInt(id) },
      include: { expense: true },
    });

    if (!receipt) return res.status(404).json({ error: "Receipt introuvable" });
    res.json(receipt);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération du receipt" });
  }
};
