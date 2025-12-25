// Stock truck photos by make and model
// Uses Unsplash for reliable, hotlink-friendly images

type TruckMake = 'Chevy' | 'Ford' | 'Dodge' | 'Toyota' | 'Nissan' | 'GMC'

// Model-specific photos - Unsplash images of actual truck types
const MODEL_PHOTOS: Record<string, string> = {
  // Chevy Silverado - full-size pickup
  'Chevy-Silverado 1500': 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&q=80',
  'Chevy-Silverado 2500HD': 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&q=80',
  'Chevy-Silverado 3500HD': 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&q=80',

  // Chevy Avalanche - sport utility truck
  'Chevy-Avalanche': 'https://images.unsplash.com/photo-1566008885218-90abf9200ddb?w=800&q=80',

  // Chevy Colorado - mid-size
  'Chevy-Colorado': 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80',

  // Chevy S-10
  'Chevy-S-10': 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80',

  // Chevy C/K classic
  'Chevy-C/K 1500': 'https://images.unsplash.com/photo-1592853285512-628d46140a81?w=800&q=80',
  'Chevy-C/K 2500': 'https://images.unsplash.com/photo-1592853285512-628d46140a81?w=800&q=80',

  // GMC Sierra - full-size pickup (similar to Silverado)
  'GMC-Sierra 1500': 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&q=80',
  'GMC-Sierra 2500HD': 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&q=80',
  'GMC-Sierra 3500HD': 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&q=80',

  // GMC Canyon
  'GMC-Canyon': 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80',

  // GMC Syclone/Sonoma
  'GMC-Syclone': 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80',
  'GMC-Sonoma': 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80',

  // Ford F-Series
  'Ford-F-150': 'https://images.unsplash.com/photo-1605893477799-b99e3b8b93fe?w=800&q=80',
  'Ford-F-250': 'https://images.unsplash.com/photo-1605893477799-b99e3b8b93fe?w=800&q=80',
  'Ford-F-350': 'https://images.unsplash.com/photo-1605893477799-b99e3b8b93fe?w=800&q=80',

  // Ford Ranger
  'Ford-Ranger': 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80',

  // Ford Maverick
  'Ford-Maverick': 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80',

  // Ford Lightning
  'Ford-Lightning': 'https://images.unsplash.com/photo-1605893477799-b99e3b8b93fe?w=800&q=80',

  // Dodge/Ram
  'Dodge-Ram 1500': 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800&q=80',
  'Dodge-Ram 2500': 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800&q=80',
  'Dodge-Ram 3500': 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800&q=80',

  // Dodge Dakota
  'Dodge-Dakota': 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80',

  // Toyota
  'Toyota-Tacoma': 'https://images.unsplash.com/photo-1621993202323-f438eec934ff?w=800&q=80',
  'Toyota-Tundra': 'https://images.unsplash.com/photo-1621993202323-f438eec934ff?w=800&q=80',
  'Toyota-T100': 'https://images.unsplash.com/photo-1621993202323-f438eec934ff?w=800&q=80',
  'Toyota-Hilux': 'https://images.unsplash.com/photo-1621993202323-f438eec934ff?w=800&q=80',

  // Nissan
  'Nissan-Titan': 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&q=80',
  'Nissan-Titan XD': 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&q=80',
  'Nissan-Frontier': 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80',
  'Nissan-Hardbody': 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80',
}

// Fallback photos by make
const MAKE_PHOTOS: Record<TruckMake, string> = {
  Chevy: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&q=80',
  Ford: 'https://images.unsplash.com/photo-1605893477799-b99e3b8b93fe?w=800&q=80',
  Dodge: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800&q=80',
  Toyota: 'https://images.unsplash.com/photo-1621993202323-f438eec934ff?w=800&q=80',
  Nissan: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&q=80',
  GMC: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&q=80',
}

// Default truck photo
const DEFAULT_TRUCK_PHOTO = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'

/**
 * Get a stock photo URL for a truck based on make and model
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
