import { Request, Response } from 'express';
import Category from '../models/Category';

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, slug } = req.body;
    const categoryExists = await Category.findOne({ slug });

    if (categoryExists) {
      res.status(400);
      throw new Error('Category already exists');
    }

    const category = await Category.create({ name, description, slug });
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
