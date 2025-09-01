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

