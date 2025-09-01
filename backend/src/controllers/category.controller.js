import prisma from "../prismaClient.js";

// Liste de toutes les catégories
export const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.status(200).json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération des catégories", error });
  }
};



// Crée une nouvelle catégorie
export const createCategory = async (req, res) => {
  try {
    const { name, userId } = req.body;
    if (!name || !userId) {
      return res.status(400).json({ message: "Le champ 'name' et 'userId' sont requis" });
    }

    const category = await prisma.category.create({
      data: {
        name,
        userId: parseInt(userId) // Assure-toi que c’est bien un entier
      }
    });

    res.status(201).json({ message: "Category created", data: category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la création de la catégorie", error });
    }
};
