import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import Customization from '../models/Customization';
import Product from '../models/Product';

const BASE_MAKING_CHARGE = 2500;

// @desc    Calculate dynamic price
// @route   POST /api/customize/price
// @access  Public
export const calculatePrice = async (req: Request, res: Response) => {
  try {
    const { metalId, gemId, shapeName, weight = 5, productId } = req.body;

    if (!metalId || !gemId || !shapeName) {
      res.status(400);
      throw new Error('Metal ID, Gem ID, and Shape Name are required');
    }

    const { getMetals } = await import('./metalController');
    
    // We will simulate a req/res to get live metals, or just call the DB directly.
    // To fetch live prices easily, let's construct the metal manually or we can call the same getLiveRates from metalController. 
    // Ideally metal controller exposes a helper, but we'll fetch from DB and check live cache manually here.
    const Metal = (await import('../models/Metal')).default;
    const Gem = (await import('../models/Gem')).default;
    const Shape = (await import('../models/Shape')).default;

    const metalDoc = await Metal.findById(metalId);
    if (!metalDoc) throw new Error('Metal not found');

    const gemDoc = await Gem.findById(gemId);
    if (!gemDoc) throw new Error('Gem not found');

    const shapeDoc = await Shape.findOne({ name: shapeName });
    if (!shapeDoc) throw new Error('Shape not found');

    // We need live rates for Metal. We could just rely on the fallback from DB if live scrape fails.
    let metalRate = metalDoc.pricePerGram;
    
    const { default: NodeCache } = await import('node-cache');
    // It's better to fetch from rateController cache directly if available.
    // However rateCache is not exported from rateController. Let's just use what's in Metal directly or assume frontend passes the rate? No, backend must calculate.
    // We will read the cache from our own rateCache or just import the rate service itself.
    const { scrapeGoldRates } = await import('../services/rates/goldScraper');
    const { scrapeSilverRates } = await import('../services/rates/silverScraper');
    
    try {
        if(metalDoc.type === 'Gold') {
           const gold = await scrapeGoldRates('bikaner');
           metalRate = metalDoc.name.includes('22K') ? gold['22k'] : gold['24k'];
        } else if (metalDoc.type === 'Silver') {
           const silver = await scrapeSilverRates('bikaner');
           metalRate = silver;
        }
    } catch(err) {
        console.warn("Failed to scrape live rates for calculatePrice, using DB fallback", err);
    }
    
    const metalPrice = metalRate * Number(weight);
    const gemPrice = gemDoc.pricePerCarat || 15000;
    const shapeMultiplier = shapeDoc.multiplier || 1.0;
    const makingCharges = Math.round(BASE_MAKING_CHARGE * shapeMultiplier);

    // Get product base price if provided
    let basePrice = 0;
    if (productId) {
      const product = await Product.findById(productId);
      if (product) basePrice = product.price;
    }

    const total = basePrice + metalPrice + gemPrice + makingCharges;

    res.json({
      breakdown: {
        basePrice,
        metalPrice,
        gemPrice,
        makingCharges,
        total,
      },
      meta: { metal: metalDoc.name, gem: gemDoc.name, shape: shapeDoc.name, shapeMultiplier, weight, metalRate },
    });
  } catch (error: any) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ message: error.message });
  }
};

// @desc    Save a customization design
// @route   POST /api/customize/save
// @access  Private
export const saveCustomization = async (req: AuthRequest, res: Response) => {
  try {
    const { productId, metal, gem, shape, story, price } = req.body;

    if (!productId || !metal || !gem || !shape) {
      res.status(400);
      throw new Error('All customization fields are required');
    }

    const customization = await Customization.create({
      user: req.user._id,
      product: productId,
      metal,
      gem,
      shape,
      story: story || {},
      price: price || {},
    });

    res.status(201).json(customization);
  } catch (error: any) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ message: error.message });
  }
};

// @desc    Get user's saved customizations
// @route   GET /api/customize/my
// @access  Private
export const getMyCustomizations = async (req: AuthRequest, res: Response) => {
  try {
    const customizations = await Customization.find({ user: req.user._id })
      .populate('product', 'name images price')
      .sort({ createdAt: -1 });
    res.json(customizations);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
