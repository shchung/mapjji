/**
 * Type definitions for restaurant data collection pipeline
 */

export interface RestaurantReview {
  text: string
  rating: number
  date: string
}

export interface ScrapedRestaurant {
  name: string
  address: string
  lat: number
  lng: number
  phone?: string
  category?: string
  reviews: RestaurantReview[]
}

export interface AnalyzedRestaurant extends ScrapedRestaurant {
  analyzed_spice_level: number
  confidence: number
  reasoning: string
}

export interface SpiceAnalysisResult {
  spice_level: number
  confidence: number
  reasoning: string
}
