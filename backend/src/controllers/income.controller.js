// backend/controllers/income.controller.js
import prisma from "../prismaClient.js";

// Récupère tous les revenus de l'utilisateur connecté
export const getAllIncomes = async (req, res) => {
  try {
    const incomes = await prisma.income.findMany({
      where: { userId: req.user.id },
      orderBy: { date: "desc" },
    });
    res.status(200).json(incomes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération des revenus", error });
  }
};

// Récupère un revenu par ID (uniquement si il appartient à l'utilisateur)
export const getIncomeById = async (req, res) => {
  try {
    const incomeId = parseInt(req.params.id, 10);
    if (Number.isNaN(incomeId)) return res.status(400).json({ message: "ID invalide" });

    const income = await prisma.income.findUnique({ where: { id: incomeId } });
    if (!income) return res.status(404).json({ message: "Revenu non trouvé" });
    if (income.userId !== req.user.id) {
      return res.status(403).json({ message: "Non autorisé à accéder à ce revenu" });
    }

    res.status(200).json(income);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération du revenu", error });
  }
};

// Crée un revenu (date générée automatiquement, userId = req.user.id)
export const createIncome = async (req, res) => {
  try {
    const { amount, source, description } = req.body;

    const parsedAmount = parseFloat(amount);
    if (Number.isNaN(parsedAmount)) {
      return res.status(400).json({ message: "Le champ 'amount' est requis et doit être un nombre" });
    }

    const income = await prisma.income.create({
      data: {
        amount: parsedAmount,
        source,
        description,
        date: new Date(),       // ✅ date auto côté backend
        userId: req.user.id,    // ✅ sécurité: pas de userId venant du client
      },
    });

    res.status(201).json({ message: "Revenu créé avec succès", data: income });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la création du revenu", error });
  }
};

// Met à jour un revenu (n'autorise pas la modification du userId / date)
export const updateIncome = async (req, res) => {
  try {
    const incomeId = parseInt(req.params.id, 10);
    if (Number.isNaN(incomeId)) return res.status(400).json({ message: "ID invalide" });

    const { amount, source, description } = req.body;

    const existingIncome = await prisma.income.findUnique({ where: { id: incomeId } });
    if (!existingIncome) return res.status(404).json({ message: "Revenu non trouvé" });

    if (existingIncome.userId !== req.user.id) {
      return res.status(403).json({ message: "Non autorisé à modifier ce revenu" });
    }

    const updateData = {};
    if (amount !== undefined) {
      const parsedAmount = parseFloat(amount);
      if (Number.isNaN(parsedAmount)) {
        return res.status(400).json({ message: "Le champ 'amount' doit être un nombre" });
      }
      updateData.amount = parsedAmount;
    }
    if (source !== undefined) updateData.source = source;
    if (description !== undefined) updateData.description = description;
    // ❌ pas de mise à jour de date ni de userId ici

    const updatedIncome = await prisma.income.update({
      where: { id: incomeId },
      data: updateData,
    });

    res.status(200).json({ message: "Revenu mis à jour avec succès", data: updatedIncome });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la mise à jour du revenu", error });
  }
};

// Supprime un revenu (seulement si il appartient à l'utilisateur)
export const deleteIncome = async (req, res) => {
  try {
    const incomeId = parseInt(req.params.id, 10);
    if (Number.isNaN(incomeId)) return res.status(400).json({ message: "ID invalide" });

    const income = await prisma.income.findUnique({ where: { id: incomeId } });
    if (!income) return res.status(404).json({ message: "Revenu non trouvé" });

    if (income.userId !== req.user.id) {
      return res.status(403).json({ message: "Non autorisé à supprimer ce revenu" });
    }

    await prisma.income.delete({ where: { id: incomeId } });
    res.json({ message: "Revenu supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    res.status(500).json({ message: "Erreur lors de la suppression du revenu", error });
  }
};
