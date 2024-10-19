// Main function to generate varied country colors
function getCountryColors(): Map<number, string> {
  const colors = [
    '#FF5733', // Fiery Red
    '#33FF57', // Vivid Green
    '#3357FF', // Bright Blue
    '#FF33A1', // Hot Pink
    '#FF8C33', // Orange
    '#33FFF5', // Aqua
    '#8C33FF', // Purple
    '#FF3333', // Red
    '#33FF8C', // Mint
    '#FF33FF', // Magenta
    '#33A1FF', // Sky Blue
    '#A1FF33', // Lime
    '#FF5733', // Coral
    '#5733FF', // Indigo
    '#33FF33', // Neon Green
    '#FFD700', // Gold
    '#FF4500', // Orange Red
    '#32CD32', // Lime Green
    '#1E90FF', // Dodger Blue
    '#FF1493', // Deep Pink
    '#00FA9A', // Medium Spring Green
    '#8B0000', // Dark Red
    '#9400D3', // Dark Violet
    '#00CED1', // Dark Turquoise
    '#FF69B4', // Hot Pink
    '#B22222', // Firebrick
    '#228B22', // Forest Green
    '#FF6347', // Tomato
    '#4682B4', // Steel Blue
  ];

  const countryColors = new Map<number, string>();
  colors.forEach((color, index) => {
    countryColors.set(index, color);
  });

  return countryColors;
}

// Function to darken and saturate a color
export function darkenAndSaturate(color: string): string {
  const match = color.match(/#([0-9a-f]{6})/i);
  if (!match) return color;

  const hex = match[1];
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const darkenFactor = 0.3;
  const saturateFactor = 1.2;

  const newR = Math.min(255, Math.round(r * darkenFactor * saturateFactor));
  const newG = Math.min(255, Math.round(g * darkenFactor * saturateFactor));
  const newB = Math.min(255, Math.round(b * darkenFactor * saturateFactor));

  return `#${((1 << 24) + (newR << 16) + (newG << 8) + newB).toString(16).slice(1).toUpperCase()}`;
}

// Create lineColors as a Map with darker and more saturated versions of countryColors
export const countryColors = getCountryColors();
