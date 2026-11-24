// Emoji used as friendly icons for meals and food groups.
// Only emoji up to Unicode Emoji 12 are used, so they render on Windows 10.
const MEAL_EMOJI = {
  ful_medames: '🥘', ful_tomato_onion: '🥘', ful_tahini: '🥘', taameya: '🧆', shakshuka: '🍳',
  cheese_stuffed_tomatoes: '🍅', eggs_cheese_plate: '🥚', koshari: '🍛', molokhia_chicken_rice: '🍗',
  bamia_beef_rice: '🍲', fasolia_beef_rice: '🥗', mesaqaa: '🍆', macarona_bechamel: '🍝',
  bisella_carrots_rice: '🥕', fried_tilapia_rice: '🐟', potato_beef_tray_rice: '🥔', mahshi_kousa: '🥒',
  hawawshi: '🥙', lentil_soup: '🥣', bessara: '🥬', baba_ghanoug: '🍆', eggah: '🍳',
  cheese_salad: '🧀', yogurt_banana: '🍌', tuna_sandwich: '🥪',
  keto_eggs_cheese: '🥚', keto_shakshuka: '🍳', keto_cheese_omelette: '🍳', grilled_chicken_salad: '🍗',
  kofta_salad: '🍢', grilled_tilapia_salad: '🐟', bamia_beef_no_rice: '🍲', molokhia_chicken_no_rice: '🍗',
  keto_cheese_salad: '🧀', keto_tuna_salad: '🥗', keto_baba_ghanoug: '🍆', yogurt_cucumber: '🥒',
  pasta_tomato_sauce: '🍝', rice_lentils: '🍛', potato_tray_veg_rice: '🥔', fasolia_veg_rice: '🥗',
  tayyibat_potatoes_ghee: '🥔', tayyibat_fried_potatoes: '🍟', banana_tahini: '🍌', rice_boiled_beef: '🍚',
  rice_minced_beef: '🍚', potato_beef_plain: '🥩', mashed_potatoes_ghee: '🥔', potatoes_minced_beef: '🥔',
  bananas_plate: '🍌', eggs_tuna_plate: '🥚', chicken_rice_big: '🍗', kofta_yogurt: '🍢',
};
const SLOT_EMOJI = { breakfast: '🌅', lunch: '🍲', dinner: '🌙' };
const GROUP_EMOJI = {
  grains: '🌾', legumes: '🥜', vegetables: '🥬', starchy: '🥔', fruits: '🍊', protein: '🍗',
  dairy: '🥛', fats: '🧈', sugars: '🍬', other: '🧂',
};

export const mealEmoji = (meal) => MEAL_EMOJI[meal?.key] ?? SLOT_EMOJI[meal?.slot] ?? '🍽️';
export const groupEmoji = (group) => GROUP_EMOJI[group] ?? '🛒';
