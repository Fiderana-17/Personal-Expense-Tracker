import express from 'express';
import {
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategories,
} from '../controllers/category.controller.js';

const router = express.Router();


router.post('/', createCategory);
router.get('/', getAllCategories); 
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);


export default router;
