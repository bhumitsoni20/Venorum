import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Silver Rate Scraper for BankBazaar.
 * 
 * BankBazaar renders its rate tables via client-side JavaScript, so the
 * actual numeric price isn't in the initial HTML. However, the page contains
 * structured data and meta tags that we can extract from.
 * 
 * Strategy:
 * 1. Try to parse LD+JSON structured data (schema.org) if present.
 * 2. Try to extract from the visible table cells.
 * 3. Try to match any rupee amount pattern in the page body text.
 */
export const scrapeSilverRates = async (city: string): Promise<number> => {
  try {
    const url = `https://www.bankbazaar.com/silver-rate-${city}.html`;

    const { data: html } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(html);

    // Strategy 1: Look for LD+JSON structured data
    const ldJsonScripts = $('script[type="application/ld+json"]');
    for (let i = 0; i < ldJsonScripts.length; i++) {
      try {
        const jsonText = $(ldJsonScripts[i]).html();
        if (jsonText) {
          const parsed = JSON.parse(jsonText);
          // Look for price in structured data
          if (parsed?.mainEntity?.acceptedAnswer?.text) {
            const match = parsed.mainEntity.acceptedAnswer.text.match(/₹\s*([\d,]+)/);
            if (match) {
              return parseFloat(match[1].replace(/,/g, ''));
            }
          }
        }
      } catch { /* skip malformed JSON */ }
    }

    // Strategy 2: Look for table cells with silver rate data
    let silverPrice = 0;
    $('table tbody tr, table tr').each((i, row) => {
      const cells = $(row).find('td');
      if (cells.length >= 2) {
        const label = $(cells[0]).text().trim().toLowerCase();
        if (label.includes('1 gram') || label.includes('1gram')) {
          const priceText = $(cells[1]).text().replace(/[₹\s,]/g, '');
          const price = parseFloat(priceText);
          if (!isNaN(price) && price > 0) {
            silverPrice = price;
          }
        }
      }
    });
    if (silverPrice > 0) return silverPrice;

    // Strategy 3: Look for any element with class containing 'price' or 'rate'
    $('[class*="price"], [class*="rate"], [class*="amount"]').each((i, el) => {
      if (silverPrice > 0) return;
      const text = $(el).text().trim();
      const match = text.match(/₹\s*([\d,]+(?:\.\d+)?)/);
      if (match) {
        const price = parseFloat(match[1].replace(/,/g, ''));
        // Silver per gram in India is typically between ₹50 and ₹300
        if (price >= 50 && price <= 500) {
          silverPrice = price;
        }
      }
    });
    if (silverPrice > 0) return silverPrice;

    // Strategy 4: Regex scan for silver price patterns in full page text
    const bodyText = $('body').text();
    
    // Pattern: "₹ XX,XXX" followed by per kg indicators
    const kgMatch = bodyText.match(/₹\s*([\d,]+(?:\.\d+)?)\s*(?:per\s*kg|\/\s*kg)/i);
    if (kgMatch) {
      const perKg = parseFloat(kgMatch[1].replace(/,/g, ''));
      if (perKg > 50000 && perKg < 500000) {
        return perKg / 1000; // Convert to per gram
      }
    }

    // Pattern: "₹ XXX" near "per gram" or "1 gram"
    const gramMatch = bodyText.match(/₹\s*([\d,]+(?:\.\d+)?)\s*(?:per\s*gram|\/\s*gram)/i);
    if (gramMatch) {
      const perGram = parseFloat(gramMatch[1].replace(/,/g, ''));
      if (perGram >= 50 && perGram <= 500) {
        return perGram;
      }
    }

    throw new Error(`All extraction strategies failed for silver rates in ${city}. The site may require JavaScript rendering.`);
  } catch (error: any) {
    console.error(`Silver Scraper Error [${city}]:`, error.message);
    throw error;
  }
};
