import { GoogleGenAI, Type } from "@google/genai";
import { Keyword, AdGroup, KeywordType } from "../types";

// Helper to get AI instance
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const extractContentAndAnalyze = async (url: string, location: string, manualCurrency?: string) => {
  const ai = getAI();
  
  const currencyInstruction = manualCurrency 
    ? `IMPORTANT: The user has explicitly requested to use '${manualCurrency}' as the currency. You MUST estimate all CPC values in ${manualCurrency}. Return '${manualCurrency}' as the currency code and the appropriate symbol.`
    : `Determine the local currency for the location provided. Default to 'GBP' (£) if location suggests UK or is ambiguous. Return the currency code (e.g., USD, GBP) and symbol.`;

  const prompt = `
    Analyze the website content for: ${url}. 
    The target location is: ${location}.
    
    1. Extract the likely page title and a brief summary of what the business offers.
    2. ${currencyInstruction}
    3. Generate a comprehensive list of 20 Google Ads keywords suitable for this business. 
       - Include long-tail variations.
       - Include specific competitor brand names if relevant.
       - Categorize them strictly into 'Brand' (using the domain name/business name), 'Generic' (industry terms/services), and 'Competitor' (likely competitors).
       - Estimate a 'volume' (0-10000), 'competition' (0-100), and 'cpc' (cost per click in the determined currency, e.g., 0.50 to 50.00) for each based on general knowledge.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }], // Use grounding to find actual site info
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          summary: { type: Type.STRING },
          currency: { type: Type.STRING },
          currencySymbol: { type: Type.STRING },
          keywords: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                term: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['Brand', 'Generic', 'Competitor'] },
                volume: { type: Type.INTEGER },
                competition: { type: Type.INTEGER },
                relevance: { type: Type.INTEGER },
                cpc: { type: Type.NUMBER }
              }
            }
          }
        }
      }
    }
  });

  const res = JSON.parse(response.text || "{}");
  // Defaults if AI misses it
  if (!res.currency) res.currency = manualCurrency || "GBP";
  if (!res.currencySymbol) res.currencySymbol = "£";
  return res;
};

export const generateAdGroupsStructure = async (keywords: Keyword[], businessSummary: string) => {
  const ai = getAI();
  const selectedTerms = keywords.filter(k => k.selected).map(k => k.term).join(', ');

  const prompt = `
    Based on the business summary: "${businessSummary}" and these selected keywords: ${selectedTerms}.
    
    Create logical Google Ads Ad Groups. 
    Theme Strategy: Strictly segregate ad groups by theme. Keep 'Brand' keywords in their own group, 'Competitor' keywords in their own, and 'Generic' themes split by specific service/product lines.

    For each ad group:
    1. Give it a campaign-compliant name.
    2. Assign relevant keywords from the list.
    3. **Generate 15 Headlines** (Max 30 chars). 
       - CRITICAL: Aggressively insert the assigned keywords into the headlines. 
       - Aim for natural keyword density.
       - Use as close to 30 characters as possible for maximum visibility.
    4. **Generate 4 Descriptions** (Max 90 chars). 
       - CRITICAL: Include keywords naturally.
       - Focus on benefits and call-to-actions.
       - Use as close to 90 characters as possible.
    5. Write 4 Callout texts (Max 25 chars).
    6. Write 4 Sitelink texts (Max 25 chars).
    7. Write 4 Structured Snippet values (Max 25 chars).
    
    Strictly adhere to character limits.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            assigned_keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            headlines: { type: Type.ARRAY, items: { type: Type.STRING } }, // 15
            descriptions: { type: Type.ARRAY, items: { type: Type.STRING } }, // 4
            callouts: { type: Type.ARRAY, items: { type: Type.STRING } },
            sitelinks: { type: Type.ARRAY, items: { type: Type.STRING } },
            structuredSnippets: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    }
  });

  const rawGroups = JSON.parse(response.text || "[]");
  
  // Transform to App Type and Ensure constraints
  return rawGroups.map((g: any, index: number) => ({
    id: `group-${Date.now()}-${index}`,
    name: g.name,
    keywords: g.assigned_keywords,
    headlines: g.headlines || [],
    descriptions: g.descriptions || [],
    longDescriptions: [], // Deprecated in favor of standard descriptions
    callouts: g.callouts || [],
    sitelinks: g.sitelinks || [],
    structuredSnippets: g.structuredSnippets || [],
  }));
};

export const generateAdImage = async (adGroup: AdGroup, businessSummary: string) => {
  const ai = getAI();
  const prompt = `Create a professional, high-quality digital advertising image for a business described as: ${businessSummary}. 
  Focus on the theme: ${adGroup.name}. 
  The style should be modern, clean, and suitable for a social media or display ad. 
  No text on the image.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image', // Using 2.5 flash image as per guidelines for general generation
    contents: prompt,
    config: {
        // No responseMimeType for image models
    }
  });

  // Extract image
  let base64Image = "";
  if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
              base64Image = part.inlineData.data;
              break;
          }
      }
  }
  
  return base64Image ? `data:image/png;base64,${base64Image}` : null;
};