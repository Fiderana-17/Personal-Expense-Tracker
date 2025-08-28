import prisma from "../prismaClient.js";

// GET /api/incomes
export const getAllIncomes = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const incomes = await prisma.income.findMany({
      where: { userId: parseInt(userId) },
      orderBy: { date: "desc" },
    });

    res.status(200).json(incomes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching incomes", error: error.message });
  }
};

// GET /api/incomes/:id
export const getIncomeById = async (req, res) => {
  try {
    const { id } = req.params;

    const income = await prisma.income.findUnique({
      where: { id: parseInt(id) },
    });

    if (!income) {
      return res.status(404).json({ message: "Income not found" });
    }

    res.status(200).json(income);
  } catch (error) {
    res.status(500).json({ message: "Error fetching income", error: error.message });
  }
};

// POST /api/incomes
export const createIncome = async (req, res) => {
  try {
    const { amount, source, description, date, userId } = req.body;

    if (!amount || !source || !date || !userId) {
      return res.status(400).json({ message: "Missing required fields" });
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

    res.status(201).json({ message: "Income created successfully", income });
  } catch (error) {
    res.status(500).json({ message: "Error creating income", error: error.message });
  }
};

// PUT /api/incomes/:id
export const updateIncome = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, source, description, date } = req.body;

    const income = await prisma.income.update({
      where: { id: parseInt(id) },
      data: {
        amount: amount !== undefined ? parseFloat(amount) : undefined,
        source,
        description,
        date: date ? new Date(date) : undefined,
      },
    });

    res.status(200).json({ message: "Income updated successfully", income });
  } catch (error) {
    res.status(500).json({ message: "Error updating income", error: error.message });
  }
};

// DELETE /api/incomes/:id
export const deleteIncome = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.income.delete({ where: { id: parseInt(id) } });

    res.status(200).json({ message: "Income deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting income", error: error.message });
  }
};
