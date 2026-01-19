export enum KeywordType {
  Brand = 'Brand',
  Generic = 'Generic',
  Competitor = 'Competitor'
}

export interface Keyword {
  term: string;
  type: KeywordType;
  volume: number; // Monthly Search Volume (Estimated)
  competition: number; // 0-100
  relevance: number; // 0-100
  cpc: number; // Estimated CPC
  selected: boolean;
}

export interface AdAsset {
  id: string;
  text: string;
  type: 'headline' | 'description';
}

export interface AdGroup {
  id: string;
  name: string;
  keywords: string[];
  headlines: string[]; // Max 15
  descriptions: string[]; // Max 4 (Standard RSA 90 chars)
  callouts: string[];
  sitelinks: string[];
  structuredSnippets: string[];
  generatedImage?: string; // Base64
}

export interface CampaignState {
  step: number;
  url: string;
  location: string;
  description: string;
  extractedInfo: {
    title: string;
    summary: string;
    currency: string;
    currencySymbol: string;
  } | null;
  keywords: Keyword[];
  adGroups: AdGroup[];
  isProcessing: boolean;
  processStatus: string;
}

export const HEADLINE_LIMIT = 30;
export const DESCRIPTION_LIMIT = 90; // Standard RSA limit
export const ASSET_LIMIT = 25; // Sitelinks, Callouts, Snippets
export const MAX_HEADLINES = 15;
export const MAX_DESCRIPTIONS = 4;
