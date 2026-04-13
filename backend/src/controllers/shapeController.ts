import { Request, Response } from 'express';
import Shape from '../models/Shape';

// @desc    Get all shapes
// @route   GET /api/shapes
// @access  Public
export const getShapes = async (req: Request, res: Response) => {
  try {
    const shapes = await Shape.find({}).lean();
    res.json(shapes);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Seed default shapes
// @route   POST /api/shapes/seed
// @access  Admin
export const seedShapes = async (req: Request, res: Response) => {
  try {
    const existing = await Shape.countDocuments();
    if (existing > 0) {
      return res.json({ message: 'Shapes already seeded', count: existing });
    }

    const defaults = [
      { name: 'Round', multiplier: 1.0, icon: '●' },
      { name: 'Oval', multiplier: 1.1, icon: '⬬' },
      { name: 'Princess', multiplier: 1.25, icon: '◇' },
      { name: 'Heart', multiplier: 1.4, icon: '♥' },
    ];

    await Shape.insertMany(defaults);
    res.status(201).json({ message: 'Shapes seeded successfully', count: defaults.length });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
