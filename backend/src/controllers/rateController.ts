import { Request, Response } from 'express';
import NodeCache from 'node-cache';
import { scrapeGoldRates } from '../services/rates/goldScraper';
import { scrapeSilverRates } from '../services/rates/silverScraper';

// Cache for 10 minutes (600 seconds)
const rateCache = new NodeCache({ stdTTL: 600 });

export const getBikanerRates = async (req: Request, res: Response) => {
  const city = String(req.params.city || 'bikaner').toLowerCase();
  const cacheKey = `rates_${city}`;

  // Check cache first
  const cachedData = rateCache.get(cacheKey);
  if (cachedData) {
    res.status(200).json({
      success: true,
      data: cachedData,
      source: 'cache'
    });
    return;
  }

  try {
    // Run scrapers in parallel, handle partial failures
    const [goldResult, silverResult] = await Promise.allSettled([
      scrapeGoldRates(city),
      scrapeSilverRates(city)
    ]);

    const gold = goldResult.status === 'fulfilled' ? goldResult.value : null;
    const silver = silverResult.status === 'fulfilled' ? silverResult.value : null;

    if (!gold && !silver) {
      throw new Error('Both gold and silver scrapers failed.');
    }

    const result: any = {
      city: city.charAt(0).toUpperCase() + city.slice(1),
      lastUpdated: new Date().toISOString()
    };

    if (gold) {
      result.gold = gold;
    } else {
      result.gold = null;
      result.goldError = 'Gold rate extraction failed.';
    }

    if (silver) {
      result.silver = silver;
    } else {
      result.silver = null;
      result.silverError = 'Silver rate extraction failed. Site may require JavaScript rendering.';
    }

    // Only cache if at least gold succeeded (primary data)
    if (gold) {
      rateCache.set(cacheKey, result);
    }

    res.status(200).json({
      success: true,
      data: result,
      source: 'live'
    });
  } catch (error: any) {
    console.error('Rates Controller Error:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve current bullion rates. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
