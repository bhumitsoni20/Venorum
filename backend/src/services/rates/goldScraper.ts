import axios from 'axios';
import * as cheerio from 'cheerio';

export interface GoldRates {
  '22k': number;
  '24k': number;
}

/**
 * Gold Rate Scraper for Kalyan Jewellers.
 * 
 * The Kalyan site is a Next.js SSR application. The gold rate data is
 * embedded in a <script id="__NEXT_DATA__"> JSON blob within the HTML.
 * We parse that JSON directly — no CSS selector gymnastics needed.
 */
export const scrapeGoldRates = async (city: string): Promise<GoldRates> => {
  try {
    const url = `https://store.kalyanjewellers.net/kalyan-jewellers-store-rani-bazar-bikaner/bik/gold-rate`;
    
    const { data: html } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(html);

    // Extract the __NEXT_DATA__ JSON from the script tag
    const nextDataScript = $('#__NEXT_DATA__').html();

    if (!nextDataScript) {
      throw new Error('Could not find __NEXT_DATA__ script tag on the Kalyan Jewellers page.');
    }

    const nextData = JSON.parse(nextDataScript);
    const goldRateArray: any[] = nextData?.props?.pageProps?.goldRate;

    if (!goldRateArray || goldRateArray.length === 0) {
      throw new Error('goldRate array is empty or missing from page data.');
    }

    // The array contains objects like:
    // [0] -> { "karat_24(995)": { price_per_gram: 15235 } }
    // [1] -> { "karat_22": { price_per_gram: 13965 } }
    
    let price24k = 0;
    let price22k = 0;

    for (const entry of goldRateArray) {
      const key = Object.keys(entry)[0];
      if (key.startsWith('karat_24')) {
        price24k = entry[key].price_per_gram;
      } else if (key === 'karat_22') {
        price22k = entry[key].price_per_gram;
      }
    }

    if (price24k === 0 || price22k === 0) {
      throw new Error(`Parsed goldRate but could not find 22k/24k values for ${city}.`);
    }

    // Prices from Kalyan are already per gram
    return {
      '22k': price22k,
      '24k': price24k,
    };
  } catch (error: any) {
    console.error(`Gold Scraper Error [${city}]:`, error.message);
    throw error;
  }
};
