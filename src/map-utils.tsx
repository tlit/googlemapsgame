// src/map-utils.ts
import { useCallback, useRef } from 'react';

// Define the style for the map container
export const mapContainerStyle = {
  width: '100%',
  height: '100vh', // 100% of the viewport height
};

// Set the initial center of the map (0 latitude, 0 longitude)
export const center = {
  lat: 0,
  lng: 0,
};

// Configure map options to remove default UI and hide country labels
export const mapOptions = {
  disableDefaultUI: true, // Remove default controls like zoom, street view, etc.
  styles: [
    {
      featureType: 'administrative.country',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }], // Hide country labels on the map
    },
  ],
};

// Hook to manage map reference
export function useMap() {
  const mapRef = useRef<google.maps.Map | null>(null);

  // Callback function to store the map instance when it's loaded
  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  return { mapRef, onMapLoad };
}

