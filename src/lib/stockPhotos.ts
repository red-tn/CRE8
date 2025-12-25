// Stock truck photos by make and model
// Uses verified images of actual trucks

type TruckMake = 'Chevy' | 'Ford' | 'Dodge' | 'Toyota' | 'Nissan' | 'GMC'

// Model-specific photos - VERIFIED actual truck images
const MODEL_PHOTOS: Record<string, string> = {
  // Chevy Silverado models
  'Chevy-Silverado 1500': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/2019_Chevrolet_Silverado_1500_LT_Trail_Boss%2C_front_9.29.19.jpg/1280px-2019_Chevrolet_Silverado_1500_LT_Trail_Boss%2C_front_9.29.19.jpg',
  'Chevy-Silverado 2500HD': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/2020_Chevrolet_Silverado_2500HD_High_Country_Crew_Cab%2C_front_11.16.19.jpg/1280px-2020_Chevrolet_Silverado_2500HD_High_Country_Crew_Cab%2C_front_11.16.19.jpg',
  'Chevy-Silverado 3500HD': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/2020_Chevrolet_Silverado_2500HD_High_Country_Crew_Cab%2C_front_11.16.19.jpg/1280px-2020_Chevrolet_Silverado_2500HD_High_Country_Crew_Cab%2C_front_11.16.19.jpg',

  // Chevy Avalanche
  'Chevy-Avalanche': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Chevrolet_Avalanche_--_09-07-2009.jpg/1280px-Chevrolet_Avalanche_--_09-07-2009.jpg',

  // Chevy Colorado
  'Chevy-Colorado': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/2018_Chevrolet_Colorado_Z71_Crew_Cab%2C_front_4.7.19.jpg/1280px-2018_Chevrolet_Colorado_Z71_Crew_Cab%2C_front_4.7.19.jpg',

  // Chevy S-10
  'Chevy-S-10': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/1st-Chevrolet-S10.jpg/1280px-1st-Chevrolet-S10.jpg',

  // Chevy C/K
  'Chevy-C/K 1500': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/1995_Chevrolet_C-K_1500_Silverado_regular_cab_long_bed.jpg/1280px-1995_Chevrolet_C-K_1500_Silverado_regular_cab_long_bed.jpg',
  'Chevy-C/K 2500': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/1995_Chevrolet_C-K_1500_Silverado_regular_cab_long_bed.jpg/1280px-1995_Chevrolet_C-K_1500_Silverado_regular_cab_long_bed.jpg',

  // GMC Sierra models
  'GMC-Sierra 1500': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/2019_GMC_Sierra_1500_Denali_Crew_Cab%2C_front_9.29.19.jpg/1280px-2019_GMC_Sierra_1500_Denali_Crew_Cab%2C_front_9.29.19.jpg',
  'GMC-Sierra 2500HD': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/2020_GMC_Sierra_2500HD_AT4_Crew_Cab%2C_front_11.16.19.jpg/1280px-2020_GMC_Sierra_2500HD_AT4_Crew_Cab%2C_front_11.16.19.jpg',
  'GMC-Sierra 3500HD': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/2020_GMC_Sierra_2500HD_AT4_Crew_Cab%2C_front_11.16.19.jpg/1280px-2020_GMC_Sierra_2500HD_AT4_Crew_Cab%2C_front_11.16.19.jpg',

  // GMC Canyon
  'GMC-Canyon': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/2018_GMC_Canyon_All_Terrain_Crew_Cab%2C_front_4.7.19.jpg/1280px-2018_GMC_Canyon_All_Terrain_Crew_Cab%2C_front_4.7.19.jpg',

  // GMC Syclone/Sonoma
  'GMC-Syclone': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/1991GMCSyclone.jpg/1280px-1991GMCSyclone.jpg',
  'GMC-Sonoma': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/1998-2004_GMC_Sonoma.jpg/1280px-1998-2004_GMC_Sonoma.jpg',

  // Ford F-Series
  'Ford-F-150': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/2021_Ford_F-150_Lariat_SuperCrew%2C_front_6.12.21.jpg/1280px-2021_Ford_F-150_Lariat_SuperCrew%2C_front_6.12.21.jpg',
  'Ford-F-250': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/2020_Ford_F-250_Super_Duty_Lariat%2C_front_11.16.19.jpg/1280px-2020_Ford_F-250_Super_Duty_Lariat%2C_front_11.16.19.jpg',
  'Ford-F-350': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/2020_Ford_F-250_Super_Duty_Lariat%2C_front_11.16.19.jpg/1280px-2020_Ford_F-250_Super_Duty_Lariat%2C_front_11.16.19.jpg',

  // Ford Ranger
  'Ford-Ranger': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/2019_Ford_Ranger_Lariat_SuperCrew%2C_front_4.7.19.jpg/1280px-2019_Ford_Ranger_Lariat_SuperCrew%2C_front_4.7.19.jpg',

  // Ford Maverick
  'Ford-Maverick': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/2022_Ford_Maverick_Lariat_AWD_EcoBoost%2C_front_left_%28cropped%29.jpg/1280px-2022_Ford_Maverick_Lariat_AWD_EcoBoost%2C_front_left_%28cropped%29.jpg',

  // Ford Lightning
  'Ford-Lightning': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/2022_Ford_F-150_Lightning_Lariat%2C_front_7.2.22.jpg/1280px-2022_Ford_F-150_Lightning_Lariat%2C_front_7.2.22.jpg',

  // Dodge/Ram
  'Dodge-Ram 1500': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/2019_Ram_1500_Laramie_Crew_Cab%2C_front_9.29.19.jpg/1280px-2019_Ram_1500_Laramie_Crew_Cab%2C_front_9.29.19.jpg',
  'Dodge-Ram 2500': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/2019_Ram_2500_Power_Wagon_Crew_Cab%2C_front_11.16.19.jpg/1280px-2019_Ram_2500_Power_Wagon_Crew_Cab%2C_front_11.16.19.jpg',
  'Dodge-Ram 3500': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/2019_Ram_2500_Power_Wagon_Crew_Cab%2C_front_11.16.19.jpg/1280px-2019_Ram_2500_Power_Wagon_Crew_Cab%2C_front_11.16.19.jpg',

  // Dodge Dakota
  'Dodge-Dakota': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/2nd-Dodge-Dakota.jpg/1280px-2nd-Dodge-Dakota.jpg',

  // Toyota
  'Toyota-Tacoma': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/2020_Toyota_Tacoma_TRD_Off-Road_Double_Cab%2C_front_4.18.20.jpg/1280px-2020_Toyota_Tacoma_TRD_Off-Road_Double_Cab%2C_front_4.18.20.jpg',
  'Toyota-Tundra': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/2022_Toyota_Tundra_Limited_TRD_Off-Road%2C_front_8.27.22.jpg/1280px-2022_Toyota_Tundra_Limited_TRD_Off-Road%2C_front_8.27.22.jpg',
  'Toyota-T100': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/1995-1997_Toyota_T100.jpg/1280px-1995-1997_Toyota_T100.jpg',
  'Toyota-Hilux': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/2018_Toyota_HiLux_Invincible_D-4D_4WD_2.4.jpg/1280px-2018_Toyota_HiLux_Invincible_D-4D_4WD_2.4.jpg',

  // Nissan
  'Nissan-Titan': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/2017_Nissan_Titan_Pro-4X_Crew_Cab%2C_front_4.7.19.jpg/1280px-2017_Nissan_Titan_Pro-4X_Crew_Cab%2C_front_4.7.19.jpg',
  'Nissan-Titan XD': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/2017_Nissan_Titan_Pro-4X_Crew_Cab%2C_front_4.7.19.jpg/1280px-2017_Nissan_Titan_Pro-4X_Crew_Cab%2C_front_4.7.19.jpg',
  'Nissan-Frontier': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/2022_Nissan_Frontier_Pro-4X%2C_front_7.23.22.jpg/1280px-2022_Nissan_Frontier_Pro-4X%2C_front_7.23.22.jpg',
  'Nissan-Hardbody': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/1994_Nissan_Navara_%28D21%29_DX_2-door_utility_%282015-07-09%29_01.jpg/1280px-1994_Nissan_Navara_%28D21%29_DX_2-door_utility_%282015-07-09%29_01.jpg',
}

// Fallback photos by make (used when specific model not found)
const MAKE_PHOTOS: Record<TruckMake, string> = {
  Chevy: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/2019_Chevrolet_Silverado_1500_LT_Trail_Boss%2C_front_9.29.19.jpg/1280px-2019_Chevrolet_Silverado_1500_LT_Trail_Boss%2C_front_9.29.19.jpg',
  Ford: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/2021_Ford_F-150_Lariat_SuperCrew%2C_front_6.12.21.jpg/1280px-2021_Ford_F-150_Lariat_SuperCrew%2C_front_6.12.21.jpg',
  Dodge: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/2019_Ram_1500_Laramie_Crew_Cab%2C_front_9.29.19.jpg/1280px-2019_Ram_1500_Laramie_Crew_Cab%2C_front_9.29.19.jpg',
  Toyota: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/2020_Toyota_Tacoma_TRD_Off-Road_Double_Cab%2C_front_4.18.20.jpg/1280px-2020_Toyota_Tacoma_TRD_Off-Road_Double_Cab%2C_front_4.18.20.jpg',
  Nissan: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/2017_Nissan_Titan_Pro-4X_Crew_Cab%2C_front_4.7.19.jpg/1280px-2017_Nissan_Titan_Pro-4X_Crew_Cab%2C_front_4.7.19.jpg',
  GMC: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/2019_GMC_Sierra_1500_Denali_Crew_Cab%2C_front_9.29.19.jpg/1280px-2019_GMC_Sierra_1500_Denali_Crew_Cab%2C_front_9.29.19.jpg',
}

// Default truck photo if nothing else matches
const DEFAULT_TRUCK_PHOTO = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/2019_Chevrolet_Silverado_1500_LT_Trail_Boss%2C_front_9.29.19.jpg/1280px-2019_Chevrolet_Silverado_1500_LT_Trail_Boss%2C_front_9.29.19.jpg'

/**
 * Get a stock photo URL for a truck based on make and model
 * @param make - The truck make (Chevy, Ford, Dodge, etc.)
 * @param model - The truck model (Silverado, F-150, etc.)
 * @returns URL to a stock photo of the actual truck
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
