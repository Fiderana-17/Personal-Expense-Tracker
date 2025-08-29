import  prisma  from "../prismaClient.js";

// 💡 Liste toutes les catégories
export const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.status(200).json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération des catégories", error });
  }
};

// 💡 Crée une nouvelle catégorie
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


// 💡 Renomme une catégorie existante
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, userId } = req.body;

    if (!name || !userId) {
      return res.status(400).json({ message: "Le champ 'name' et 'userId' sont requis" });
    }

    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: {
        name,
        userId: parseInt(userId) // met à jour l'utilisateur si nécessaire
      },
    });

    res.status(200).json({ message: "Category updated", data: category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la mise à jour de la catégorie", error });
  }
};


// 💡 Supprime une catégorie (si non utilisée)
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifie si la catégorie est utilisée par une dépense
    const expenseCount = await prisma.expense.count({
      where: { categoryId: parseInt(id) },
    });

    if (expenseCount > 0) {
      return res.status(400).json({ message: "Impossible de supprimer une catégorie utilisée" });
    }

    // Supprime la catégorie
    const category = await prisma.category.delete({ where: { id: parseInt(id) } });

    res.status(200).json({ message: "Category deleted", data: category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la suppression de la catégorie", error });
  }
};
