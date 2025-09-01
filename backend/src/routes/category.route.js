import express from 'express';
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory
} from '../controllers/category.controller.js';

const router = express.Router();


router.post('/', createCategory);
router.get('/:userId', getCategories);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);


export default router;
