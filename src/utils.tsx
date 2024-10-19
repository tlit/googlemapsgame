import { countryColors } from './colors';

// Helper function to convert GeoJSON coordinates to Google Maps LatLngLiteral
export const convertToLatLngLiteral = (coordinates: number[][]): google.maps.LatLngLiteral[] => {
  return coordinates.map(coord => ({
    lat: coord[1],
    lng: coord[0],
  }));
};

// Process geometry for different types
type GeoJSONGeometry = {
  type: 'Polygon' | 'MultiPolygon';
  coordinates: number[][][] | number[][][][];
};

export const processGeometry = (geometry: GeoJSONGeometry): google.maps.LatLngLiteral[][][] => {
  if (geometry.type === 'Polygon') {
    return [[convertToLatLngLiteral(geometry.coordinates[0] as number[][])]];
  } else if (geometry.type === 'MultiPolygon') {
    return (geometry.coordinates as number[][][][]).map((polygon) => [convertToLatLngLiteral(polygon[0])]);
  }
  return [];
};

// Helper function to get a random color from the array
export const getRandomColor = (countryName: string): string => {
  const storedColors = JSON.parse(localStorage.getItem('countryColors') || '{}');
  if (storedColors[countryName]) {
    return storedColors[countryName];
  }

  const colorsArray = Array.from(countryColors.values());
  const randomColor = colorsArray[Math.floor(Math.random() * colorsArray.length)];
  storedColors[countryName] = randomColor;
  localStorage.setItem('countryColors', JSON.stringify(storedColors));

  return randomColor;
};
