export type AdType = "search" | "shopping";

export interface Advertiser {
  id: string;
  businessName: string;
  domain: string;
  displayUrl: string;
  headline: string;
  description: string;
  adType: AdType;
  position: number;
  price?: string;
  rating?: number;
  reviews?: number;
}

export interface SearchParams {
  keyword: string;
  zipCode: string;
  adType: AdType;
}

export interface SearchResponse {
  success: boolean;
  data?: Advertiser[];
  error?: string;
  query?: string;
  location?: string;
  total?: number;
}
