import { Request, Response } from 'express';

// @desc    Get AI style suggestion using Gemini
// @route   POST /api/ai/style-suggest
// @access  Public
export const styleSuggest = async (req: Request, res: Response) => {
  try {
    const { occasion, outfitColor } = req.body;

    if (!occasion || !outfitColor) {
      res.status(400);
      throw new Error('Occasion and outfit color are required');
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // If no API key, return intelligent fallback suggestions
    if (!apiKey) {
      return res.json(generateFallbackSuggestion(occasion, outfitColor));
    }

    const prompt = `You are a luxury jewelry stylist for Venorum, a premium jewelry brand. A customer needs jewelry styling advice.

Occasion: ${occasion}
Outfit Color: ${outfitColor}

Suggest the best jewelry combination. Respond ONLY in this exact JSON format, nothing else:
{
  "metal": "Gold" or "Silver" or "Rose Gold",
  "gem": "Diamond" or "Ruby" or "Emerald" or "Sapphire" or "Amethyst" or "Topaz",
  "shape": "Round" or "Oval" or "Princess" or "Heart",
  "reasoning": "A brief, elegant 2-sentence explanation of why this combination works.",
  "styleNote": "A one-line luxury fashion tip."
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 300 },
        }),
      }
    );

    if (!response.ok) {
      console.error('Gemini API error:', response.status);
      return res.json(generateFallbackSuggestion(occasion, outfitColor));
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return res.json({
        success: true,
        suggestion: {
          metal: parsed.metal || 'Gold',
          gem: parsed.gem || 'Diamond',
          shape: parsed.shape || 'Round',
          reasoning: parsed.reasoning || 'A classic combination for timeless elegance.',
          styleNote: parsed.styleNote || 'Let the jewelry do the talking.',
        },
        source: 'ai',
      });
    }

    return res.json(generateFallbackSuggestion(occasion, outfitColor));
  } catch (error: any) {
    console.error('AI suggestion error:', error.message);

    // Graceful fallback
    const { occasion, outfitColor } = req.body;
    return res.json(generateFallbackSuggestion(occasion || 'party', outfitColor || 'black'));
  }
};

// Intelligent fallback when Gemini is unavailable
function generateFallbackSuggestion(occasion: string, outfitColor: string) {
  const occ = occasion.toLowerCase();
  const color = outfitColor.toLowerCase();

  let metal = 'Gold';
  let gem = 'Diamond';
  let shape = 'Round';
  let reasoning = '';
  let styleNote = '';

  // Occasion-based logic
  if (occ.includes('wedding') || occ.includes('bridal')) {
    metal = 'Gold';
    gem = 'Diamond';
    shape = 'Princess';
    reasoning = 'Weddings demand regal splendor — gold and diamonds create an unforgettable bridal statement. The princess cut mirrors the grandeur of your special day.';
    styleNote = 'Layer with a matching tennis bracelet for complete bridal radiance.';
  } else if (occ.includes('party') || occ.includes('cocktail')) {
    metal = 'Rose Gold';
    gem = 'Ruby';
    shape = 'Heart';
    reasoning = 'Rose gold and rubies bring warmth and boldness to evening celebrations. The heart shape adds a playful yet sophisticated charm.';
    styleNote = 'Pair with statement earrings for maximum impact under evening lights.';
  } else if (occ.includes('daily') || occ.includes('casual') || occ.includes('everyday')) {
    metal = 'Silver';
    gem = 'Amethyst';
    shape = 'Oval';
    reasoning = 'Silver and amethyst create an understated elegance perfect for daily wear. The oval shape offers timeless versatility.';
    styleNote = 'Stack with minimalist bands for an effortless layered look.';
  } else if (occ.includes('formal') || occ.includes('office') || occ.includes('business')) {
    metal = 'Gold';
    gem = 'Sapphire';
    shape = 'Oval';
    reasoning = 'Sapphire\'s deep blue conveys authority and sophistication in professional settings. Gold framing adds a touch of executive luxury.';
    styleNote = 'Keep it singular — one statement piece speaks volumes in boardrooms.';
  } else if (occ.includes('anniversary') || occ.includes('date') || occ.includes('romantic')) {
    metal = 'Rose Gold';
    gem = 'Emerald';
    shape = 'Heart';
    reasoning = 'Rose gold and emerald symbolize enduring love and renewal. The heart shape makes an unforgettable romantic gesture.';
    styleNote = 'Add a personal engraving to make this moment eternal.';
  } else {
    reasoning = 'A versatile combination that transitions effortlessly from day to night. Diamond\'s brilliance pairs beautifully with warm gold tones.';
    styleNote = 'Confidence is the best accessory — wear it boldly.';
  }

  // Color-based refinements
  if (color.includes('red') || color.includes('maroon')) {
    gem = 'Diamond';
    metal = 'Gold';
  } else if (color.includes('blue') || color.includes('navy')) {
    gem = 'Sapphire';
  } else if (color.includes('green')) {
    gem = 'Emerald';
  } else if (color.includes('pink') || color.includes('blush')) {
    metal = 'Rose Gold';
    gem = 'Amethyst';
  } else if (color.includes('white') || color.includes('cream') || color.includes('ivory')) {
    gem = 'Diamond';
    metal = 'Gold';
  } else if (color.includes('silver') || color.includes('grey') || color.includes('gray')) {
    metal = 'Silver';
    gem = 'Topaz';
  }

  return {
    success: true,
    suggestion: { metal, gem, shape, reasoning, styleNote },
    source: 'curated',
  };
}
