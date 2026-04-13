import { Request, Response } from 'express';
import Metal from '../models/Metal';
import NodeCache from 'node-cache';
import { scrapeGoldRates } from '../services/rates/goldScraper';
import { scrapeSilverRates } from '../services/rates/silverScraper';

const rateCache = new NodeCache({ stdTTL: 600 }); // 10 minutes cache

// Helper function to fetch live rates
const getLiveRates = async () => {
  const cacheKey = 'rates_bikaner';
  const cached = rateCache.get(cacheKey);
  if (cached) return cached as { gold: any, silver: any };

  try {
    const [goldResult, silverResult] = await Promise.allSettled([
      scrapeGoldRates('bikaner'),
      scrapeSilverRates('bikaner')
    ]);

    const gold = goldResult.status === 'fulfilled' ? goldResult.value : null;
    const silver = silverResult.status === 'fulfilled' ? silverResult.value : null;

    const rates = { gold, silver };
    if (gold || silver) {
      rateCache.set(cacheKey, rates);
    }
    return rates;
  } catch (error) {
    console.error('Error fetching live rates:', error);
    return { gold: null, silver: null };
  }
};

// @desc    Get all metals with dynamic live pricing
// @route   GET /api/metals
// @access  Public
export const getMetals = async (req: Request, res: Response) => {
  try {
    let metals = await Metal.find({}).lean();
    const liveRates = await getLiveRates();

    // Inject live prices into metals where applicable
    const updatedMetals = metals.map(metal => {
      let livePrice = metal.pricePerGram;
      
      if (metal.type === 'Gold' && liveRates.gold) {
        // Use 24k gold rate if available, adjust logic as needed
        livePrice = metal.name.includes('22K') ? liveRates.gold['22k'] : liveRates.gold['24k'];
      } else if (metal.type === 'Silver' && liveRates.silver) {
        livePrice = liveRates.silver;
      }
      
      // Update priceHint format
      const priceHint = `₹${livePrice.toLocaleString('en-IN')}/g`;

      return {
        ...metal,
        pricePerGram: livePrice || metal.pricePerGram,
        priceHint
      };
    });

    res.json(updatedMetals);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Seed default metals
// @route   POST /api/metals/seed
// @access  Admin
export const seedMetals = async (req: Request, res: Response) => {
  try {
    const existing = await Metal.countDocuments();
    if (existing > 0) {
      return res.json({ message: 'Metals already seeded', count: existing });
    }

    const defaults = [
      { name: '24K Gold', type: 'Gold', pricePerGram: 6200, hex: '#D4AF37', icon: '✦', priceHint: '₹6,200/g' },
      { name: 'Sterling Silver', type: 'Silver', pricePerGram: 82, hex: '#C0C0C0', icon: '◆', priceHint: '₹82/g' },
      { name: 'Rose Gold', type: 'Gold', pricePerGram: 5800, hex: '#B76E79', icon: '❖', priceHint: '₹5,800/g' },
    ];

    await Metal.insertMany(defaults);
    res.status(201).json({ message: 'Metals seeded successfully', count: defaults.length });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
