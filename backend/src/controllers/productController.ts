import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import Product from '../models/Product';

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const product = new Product({
      name: req.body.name || 'Sample name',
      price: req.body.price || 0,
      user: req.user._id,
      image: req.body.image || '/images/sample.jpg',
      category: req.body.category,
      countInStock: req.body.countInStock || 0,
      numReviews: 0,
      description: req.body.description || 'Sample description',
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch(error:any) {
      res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ message: error.message });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find({}).populate('category', 'name slug');
    res.json(products);
  } catch(error:any) {
      res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ message: error.message });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');

    if (product) {
      res.json(product);
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch(error:any) {
      res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ message: error.message });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { name, price, description, image, category, countInStock } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.price = price || product.price;
      product.description = description || product.description;
      product.image = image || product.image;
      product.category = category || product.category;
      product.countInStock = countInStock || product.countInStock;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch(error:any) {
      res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ message: error.message });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await product.deleteOne();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch(error:any) {
      res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ message: error.message });
  }
};
