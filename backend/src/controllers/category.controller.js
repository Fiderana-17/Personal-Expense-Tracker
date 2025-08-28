import prisma from '../prismaClient.js';

//Créer une nouvelle catégorie
export const createCategory = async (req, res) => {
  try {
    const { name, userId } = req.body;

    if (!name || !userId) {
      return res.status(400).json({ message: 'Name and userId are required' });
    }

    const category = await prisma.category.create({
      data: {
        name,
        userId: parseInt(userId),
      },
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error creating category', error });
  }
};

//  Récupérer toutes les catégories d’un utilisateur
export const getCategoriesByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const categories = await prisma.category.findMany({
      where: {
        userId: parseInt(userId),
      },
      include: {
        expenses: true, // optionnel : si tu veux aussi les dépenses liées
      },
    });

    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error });
  }
};

// Mettre à jour une catégorie
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: { name },
    });

    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error updating category', error });
  }
};
