// Stock truck photos by make and model
// Uses Unsplash for reliable, high-quality truck images

type TruckMake = 'Chevy' | 'Ford' | 'Dodge' | 'Toyota' | 'Nissan' | 'GMC'

// Stock photos by make (general brand photos)
const MAKE_PHOTOS: Record<TruckMake, string> = {
  Chevy: 'https://images.unsplash.com/photo-1583267746897-2cf415887172?w=800&q=80', // Silverado
  Ford: 'https://images.unsplash.com/photo-1605893477799-b99e3b8b93fe?w=800&q=80', // F-150
  Dodge: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800&q=80', // Ram
  Toyota: 'https://images.unsplash.com/photo-1625231334168-25d7cf21080c?w=800&q=80', // Tacoma/Tundra
  Nissan: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&q=80', // Titan/Frontier
  GMC: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&q=80', // Sierra
}

// Model-specific photos where available
const MODEL_PHOTOS: Record<string, string> = {
  // Chevy models
  'Chevy-Silverado 1500': 'https://images.unsplash.com/photo-1583267746897-2cf415887172?w=800&q=80',
  'Chevy-Silverado 2500HD': 'https://images.unsplash.com/photo-1583267746897-2cf415887172?w=800&q=80',
  'Chevy-Silverado 3500HD': 'https://images.unsplash.com/photo-1583267746897-2cf415887172?w=800&q=80',
  'Chevy-Colorado': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80',

  // Ford models
  'Ford-F-150': 'https://images.unsplash.com/photo-1605893477799-b99e3b8b93fe?w=800&q=80',
  'Ford-F-250': 'https://images.unsplash.com/photo-1605893477799-b99e3b8b93fe?w=800&q=80',
  'Ford-F-350': 'https://images.unsplash.com/photo-1605893477799-b99e3b8b93fe?w=800&q=80',
  'Ford-Ranger': 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80',
  'Ford-Maverick': 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80',

  // Dodge/Ram models
  'Dodge-Ram 1500': 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800&q=80',
  'Dodge-Ram 2500': 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800&q=80',
  'Dodge-Ram 3500': 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800&q=80',

  // Toyota models
  'Toyota-Tacoma': 'https://images.unsplash.com/photo-1625231334168-25d7cf21080c?w=800&q=80',
  'Toyota-Tundra': 'https://images.unsplash.com/photo-1625231334168-25d7cf21080c?w=800&q=80',

  // Nissan models
  'Nissan-Titan': 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&q=80',
  'Nissan-Titan XD': 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&q=80',
  'Nissan-Frontier': 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&q=80',

  // GMC models
  'GMC-Sierra 1500': 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&q=80',
  'GMC-Sierra 2500HD': 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&q=80',
  'GMC-Sierra 3500HD': 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&q=80',
  'GMC-Canyon': 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&q=80',
}

// Default truck photo if nothing else matches
const DEFAULT_TRUCK_PHOTO = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'

/**
 * Get a stock photo URL for a truck based on make and model
 * @param make - The truck make (Chevy, Ford, Dodge, etc.)
 * @param model - The truck model (Silverado, F-150, etc.)
 * @returns URL to a stock photo
 */
export function getStockTruckPhoto(make?: string | null, model?: string | null): string {
  // Try model-specific photo first
  if (make && model) {
    const modelKey = `${make}-${model}`
    if (MODEL_PHOTOS[modelKey]) {
      return MODEL_PHOTOS[modelKey]
    }
  }

  // Fall back to make photo
  if (make && MAKE_PHOTOS[make as TruckMake]) {
    return MAKE_PHOTOS[make as TruckMake]
  }

  // Default truck photo
  return DEFAULT_TRUCK_PHOTO
}

/**
 * Get the best available photo for a member
 * Priority: member_media -> profile_photo_url -> truck_photo_url -> stock photo
 */
export function getMemberDisplayPhoto(
  memberMedia?: { url: string }[] | null,
  profilePhotoUrl?: string | null,
  truckPhotoUrl?: string | null,
  truckMake?: string | null,
  truckModel?: string | null
): string {
  // First priority: uploaded media
  if (memberMedia && memberMedia.length > 0 && memberMedia[0].url) {
    return memberMedia[0].url
  }

  // Second priority: profile photo
  if (profilePhotoUrl) {
    return profilePhotoUrl
  }

  // Third priority: truck photo
  if (truckPhotoUrl) {
    return truckPhotoUrl
  }

  // Final fallback: stock photo based on truck make/model
  return getStockTruckPhoto(truckMake, truckModel)
}
