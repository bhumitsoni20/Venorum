import { Request, Response } from 'express';
import Category from '../models/Category';

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, mainCategory, description, slug } = req.body;
    const categoryExists = await Category.findOne({ slug });

    if (categoryExists) {
      res.status(400);
      throw new Error('Category already exists');
    }

    const category = await Category.create({ name, mainCategory, description, slug });
    res.status(201).json(category);
  } catch(error:any) {
      res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ message: error.message });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find({});
    res.json(categories);
  } catch(error:any) {
      res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ message: error.message });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const category = await Category.findById(req.params.id);
    if(category) {
      await category.deleteOne();
      res.json({ message: 'Category Drop Successful.' });
    } else {
      res.status(404).json({ message: "Category not found." });
    }
  } catch(error:any) {
    res.status(500).json({ message: error.message });
  }
}
