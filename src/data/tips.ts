// pre-written tips used as instant content while gemini loads (or as
// permanent fallback if gemini errors / times out). 30 entries, mix of
// crops, seasons and general farm hygiene.

export const FARMING_TIPS: string[] = [
  '💧 Water your crops early in the morning before the sun gets harsh — soil holds the moisture for longer and reduces evaporation.',
  '🌱 Check the underside of leaves for whiteflies and aphids during your morning walk. Catching them early saves a lot of spraying later.',
  '🌾 Rotate your crops every season. Growing the same crop in the same patch wears down the soil and invites pests.',
  '🌧️ Before any heavy rain, clear drainage channels in low-lying patches so standing water does not rot the roots.',
  '🍅 For tomato and brinjal, stake the plants once they cross knee-height. It keeps fruit off the wet ground and reduces fungal spots.',
  '🌶️ Mulch around chilli and capsicum with dry leaves or paddy straw to keep soil moisture steady in the heat.',
  '🐝 Avoid spraying pesticide during flowering hours (8 am–11 am). Bees and pollinators are most active then.',
  '🌽 For maize, side-dress nitrogen at knee-height stage — that is when the plant takes up the most nitrogen.',
  '🥔 For potato and onion, stop irrigation 7–10 days before harvest. The skin sets harder and storage life improves.',
  '🍌 In banana, deflower the male bud after the last hand sets. Energy goes into fruit fill instead of the bud.',
  '🌳 Add a thin layer of cow dung compost around fruit trees once a month — it is slower-release than urea and feeds the soil too.',
  '☀️ During heat waves above 38°C, give a light afternoon spray of plain water on leafy greens to bring leaf temperature down.',
  '🍃 Spray a 1% neem oil + soap solution every 10 days as a routine — keeps most pests below damage levels without needing chemicals.',
  '💨 Before strong wind days, tie young banana, papaya and maize stems to short bamboo stakes. Saves you a replant.',
  '🌻 For sunflower and cotton, do hand pollination by gently shaking flowers in the morning if bee activity looks low.',
  '🥒 In cucumber and bottle gourd, train vines on a simple trellis. Fruit hangs straight, gets fewer rot patches.',
  '🌿 Test soil pH once a year — between 6 and 7.5 is the sweet spot for most vegetables.',
  '💚 Mix a handful of azolla into your paddy field — it fixes nitrogen for free and reduces weed growth.',
  '🍇 Prune grapes after harvest, not before flowering. Wrong timing costs you next season yield.',
  '🌶️ Yellow sticky traps (8–10 per acre) at canopy height catch most flying pests without any spray.',
  '🥕 For carrot and radish, thin out crowded seedlings two weeks after sowing. Crowded roots stay thin and stunted.',
  '🐛 Hand-pick fruit borer larvae in tomato in the early morning when they are still on the surface.',
  '🌾 Wheat and rice respond well to a light foliar spray of 2% urea at flowering — boosts grain fill.',
  '🪴 Keep a small nursery patch ready with seedlings of your main crops. Saves time when a row gets damaged.',
  '🌵 In drought-prone weeks, mulching alone reduces water need by 30%. Use whatever dry matter you have on hand.',
  '🪨 Avoid working soil right after heavy rain — wet soil compacts and chokes roots. Wait at least one full day.',
  '🌼 Plant a row of marigold around the field edges. They repel many root nematodes and look nice too.',
  '🧪 Mix Trichoderma in your compost heap. It cuts down soil-borne fungal disease in the next crop cycle.',
  '🐄 If you have cattle, dilute fresh urine 1:10 with water and apply to leafy greens — natural nitrogen boost.',
  '📅 Keep a small notebook of sowing date, fertiliser dates and harvest yield per plot. Looking back at a year of notes pays off the next season.',
];

// pick a tip deterministically based on the day so the same farmer sees the
// same tip all day instead of it flickering on every refresh
export function pickTipForToday(seed = ''): string {
  const day = Math.floor(Date.now() / (24 * 60 * 60 * 1000));
  let h = day;
  for (const ch of seed) {
    h = (h * 31 + ch.charCodeAt(0)) & 0xffffffff;
  }
  const idx = Math.abs(h) % FARMING_TIPS.length;
  return FARMING_TIPS[idx];
}
