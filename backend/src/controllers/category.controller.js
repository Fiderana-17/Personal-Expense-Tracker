import prisma from "../prismaClient.js";

// Récupère toutes les catégories de l'utilisateur connecté
export const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { userId: req.user.id }, 
    });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des catégories", error });
  }
};

// Crée une nouvelle catégorie
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Le champ 'name' est requis" });
    }

    const category = await prisma.category.create({
      data: {
        name,
        userId: req.user.id,
      },
    });

    res.status(201).json({ message: "Category created", data: category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la création de la catégorie", error });
  }
};

// Mettre à jour une catégorie (seulement si elle appartient à l'utilisateur)
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const category = await prisma.category.findUnique({ where: { id: parseInt(id) } });
    if (!category) return res.status(404).json({ message: "Catégorie non trouvée" });

    if (category.userId !== req.user.id) {
      return res.status(403).json({ message: "Non autorisé à modifier cette catégorie" });
    }

    const updated = await prisma.category.update({
      where: { id: parseInt(id) },
      data: { name },
    });

    res.status(200).json({ message: "Category updated", data: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la mise à jour de la catégorie", error });
  }
};

// Supprimer une catégorie (seulement si elle appartient à l'utilisateur)
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({ where: { id: parseInt(id) } });
    if (!category) return res.status(404).json({ message: "Catégorie non trouvée" });

    if (category.userId !== req.user.id) {
      return res.status(403).json({ message: "Non autorisé à supprimer cette catégorie" });
    }

    await prisma.category.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Catégorie supprimée avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la suppression", error: error.message });
  }
};
