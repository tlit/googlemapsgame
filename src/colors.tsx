
  // Main function to generate varied country colors
  function getCountryColors(): string[] {
    const colors: string[] = [
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
    ];
  
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
  export const countryColors = getCountryColors();
  
  // Create lineColors as a darker and more saturated version of countryColors
  export const lineColors = countryColors.map(darkenAndSaturate);
  
  console.log(countryColors);
  console.log(lineColors);
