import prisma from "../prismaClient.js";

export const getAllIncomes = async (req, res) => {
  try {
    const incomes = await prisma.income.findMany({
      orderBy: { date: "desc" },
    });

    res.status(200).json(incomes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération des revenus", error });
  }
};

export const getIncomeById = async (req, res) => {
  try {
    const { id } = req.params;
    const incomeId = parseInt(id, 10);

    if (isNaN(incomeId)) {
      return res.status(400).json({ message: "ID invalide" });
    }

    const income = await prisma.income.findUnique({
      where: { id: incomeId },
    });

    if (!income) {
      return res.status(404).json({ message: "Revenu non trouvé" });
    }

    res.status(200).json(income);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération du revenu", error });
  }
};

// Crée un revenu
export const createIncome = async (req, res) => {
  try {
    const { amount, source, description, date, userId } = req.body;

    if (!amount || !source || !date || !userId) {
      return res.status(400).json({ message: "Les champs 'amount', 'source', 'date' et 'userId' sont requis" });
    }

    const income = await prisma.income.create({
      data: {
        amount: parseFloat(amount),
        source,
        description,
        date: new Date(date),
        userId: parseInt(userId),
      },
    });

    res.status(201).json({ message: "Revenu créé avec succès", data: income });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la création du revenu", error });
  }
};

// Met à jour un revenu
export const updateIncome = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, source, description, date, userId } = req.body;

    const incomeId = parseInt(id, 10);
    if (isNaN(incomeId)) {
      return res.status(400).json({ message: "ID invalide" });
    }

    if (!amount || !source || !date || !userId) {
      return res.status(400).json({ message: "Les champs 'amount', 'source', 'date' et 'userId' sont requis" });
    }

    const existingIncome = await prisma.income.findUnique({
      where: { id: incomeId },
    });
    if (!existingIncome) {
      return res.status(404).json({ message: "Revenu non trouvé" });
    }

    const income = await prisma.income.update({
      where: { id: incomeId },
      data: {
        amount: parseFloat(amount),
        source,
        description,
        date: new Date(date),
        userId: parseInt(userId),
      },
    });

    res.status(200).json({ message: "Revenu mis à jour avec succès", data: income });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la mise à jour du revenu", error });
  }
};

// Supprime un revenu
export const deleteIncome = async (req, res) => {
  try {
    const { id } = req.params;

    const incomeId = parseInt(id, 10);
    if (isNaN(incomeId)) {
      return res.status(400).json({ message: "ID invalide" });
    }

    const income = await prisma.income.findUnique({
      where: { id: incomeId },
    });

    if (!income) {
      return res.status(404).json({ message: "Revenu non trouvé" });
    }

    await prisma.income.delete({
      where: { id: incomeId },
    });

    res.json({ message: "Revenu supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    res.status(500).json({ message: "Erreur lors de la suppression du revenu", error });
  }
};
