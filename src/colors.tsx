// Utility function to convert HSL to RGB
function hslToRgb(h: number, s: number, l: number): string {
    s /= 100;
    l /= 100;
  
    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) =>
      l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  
    const r = Math.round(255 * f(0));
    const g = Math.round(255 * f(8));
    const b = Math.round(255 * f(4));
  
    return `rgb(${r}, ${g}, ${b})`;
  }
  
  // Main function to generate varied country colors
  function getCountryColors(numCountries: number): string[] {
    const baseHue = Math.random() * 360; // Start with a random hue
    const colors: string[] = [];
  
    for (let i = 0; i < numCountries; i++) {
      // Vary hues by skipping large segments of the color wheel for more contrast
      const hueOffset = (i * (360 / numCountries)) * 2 % 360;
      const hue = (baseHue + hueOffset) % 360;
  
      // Increase variation in saturation and lightness for more distinction
      const saturation = 50 + Math.random() * 50; // Range from 50% to 100%
      const lightness = 30 + Math.random() * 40;  // Range from 30% to 70%
  
      // Convert HSL to RGB and add to the color list
      colors.push(hslToRgb(hue, saturation, lightness));
    }
  
    return colors;
  }
  
  // Function to darken and saturate a color
  function darkenAndSaturate(color: string): string {
    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!match) return color;

    const [, r, g, b] = match.map(Number);
    const darkenFactor = 0.7;
    const saturateFactor = 1.2;

    const newR = Math.round(r * darkenFactor * saturateFactor);
    const newG = Math.round(g * darkenFactor * saturateFactor);
    const newB = Math.round(b * darkenFactor * saturateFactor);

    return `rgb(${newR}, ${newG}, ${newB})`;
  }
  
  // Example usage: generate colors for 10 countries
  export const countryColors = getCountryColors(10);
  
  // Create lineColors as a darker and more saturated version of countryColors
  export const lineColors = countryColors.map(darkenAndSaturate);
  
  console.log(countryColors);
  console.log(lineColors);
