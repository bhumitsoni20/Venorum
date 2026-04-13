import { Request, Response } from 'express';
import Gem from '../models/Gem';

// Cache gems in memory (refreshes every 10 minutes)
let cachedGems: any[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 10 * 60 * 1000;

// @desc    Get all gems
// @route   GET /api/gems
// @access  Public
export const getGems = async (_req: Request, res: Response) => {
  try {
    if (cachedGems && Date.now() - cacheTime < CACHE_TTL) {
      return res.json(cachedGems);
    }
    const gems = await Gem.find({}).sort({ name: 1 });
    cachedGems = gems;
    cacheTime = Date.now();
    res.json(gems);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Seed default gems
// @route   POST /api/gems/seed
// @access  Admin
export const seedGems = async (_req: Request, res: Response) => {
  try {
    const existing = await Gem.countDocuments();
    if (existing > 0) {
      return res.json({ message: 'Gems already seeded', count: existing });
    }

    const defaults = [
      { name: 'Diamond', pricePerCarat: 45000, color: '#E8E8E8', image: '', description: 'The eternal symbol of brilliance and clarity. Each diamond is hand-selected for maximum fire and scintillation.' },
      { name: 'Ruby', pricePerCarat: 32000, color: '#E0115F', image: '', description: 'A crimson embodiment of passion. Our rubies possess an intense, saturated hue coveted by royalty.' },
      { name: 'Emerald', pricePerCarat: 28000, color: '#50C878', image: '', description: 'Nature\'s masterpiece in verdant green. Each emerald carries the mystique of ancient forests.' },
      { name: 'Sapphire', pricePerCarat: 35000, color: '#0F52BA', image: '', description: 'Royal blue depth that captures the heavens. Our sapphires are sourced from the finest deposits.' },
      { name: 'Amethyst', pricePerCarat: 8000, color: '#9966CC', image: '', description: 'A regal purple gemstone symbolizing wisdom and spirituality. Perfect for contemporary luxury.' },
      { name: 'Topaz', pricePerCarat: 12000, color: '#FFC87C', image: '', description: 'Warm golden hues that evoke the glow of sunset. A versatile gem for sophisticated designs.' },
    ];

    await Gem.insertMany(defaults);
    cachedGems = null;
    res.status(201).json({ message: 'Gems seeded successfully', count: defaults.length });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
