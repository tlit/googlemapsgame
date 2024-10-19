import { countryColors } from './colors';
import simplify from 'simplify-js';

// Helper function to convert GeoJSON coordinates to Google Maps LatLngLiteral
export const convertToLatLngLiteral = (coordinates: number[][]): google.maps.LatLngLiteral[] => {
  return coordinates.map(coord => ({
    lat: coord[1],
    lng: coord[0],
  }));
};

// New helper function to simplify coordinates
function simplifyCoordinates(
  coordinates: google.maps.LatLngLiteral[], 
  tolerance: number = 0.0005, 
  highQuality: boolean = false
): google.maps.LatLngLiteral[] {
  // Convert LatLngLiteral to Point format required by simplify-js
  const points = coordinates.map(coord => ({ x: coord.lng, y: coord.lat }));
  
  // Simplify the points using the simplify-js library
  // 'tolerance' determines the degree of simplification
  // 'highQuality' flag indicates whether to use a slower, more accurate algorithm
  const simplifiedPoints = simplify(points, tolerance, highQuality);
  
  // Convert the simplified points back to LatLngLiteral format
  return simplifiedPoints.map(point => ({
    lat: point.y,
    lng: point.x,
  }));
}

// Process geometry for different types
type GeoJSONGeometry = {
  type: 'Polygon' | 'MultiPolygon';
  coordinates: number[][][] | number[][][][];
};

export const processGeometry = (geometry: GeoJSONGeometry): google.maps.LatLngLiteral[][][] => {
  if (geometry.type === 'Polygon') {
    const simplified = simplifyCoordinates(convertToLatLngLiteral(geometry.coordinates[0] as number[][]));
    return [[simplified]];
  } else if (geometry.type === 'MultiPolygon') {
    return (geometry.coordinates as number[][][][]).map((polygon) => {
      const simplified = simplifyCoordinates(convertToLatLngLiteral(polygon[0]));
      return [simplified];
    });
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
