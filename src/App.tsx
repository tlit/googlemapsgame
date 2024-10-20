// Import necessary dependencies from React and other libraries
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Polygon } from '@react-google-maps/api';
import { processGeometry, getRandomColor } from './utils';
import { darkenAndSaturate } from './colors';
import { countryNames } from './countries';
import GameInterface from './GameInterface';
import { TEST_IDS } from './testIds';
import simplify from 'simplify-js';

// Define the style for the map container
const mapContainerStyle = {
  width: '100%',
  height: '100vh', // 100% of the viewport height
};

// Set the initial center of the map (0 latitude, 0 longitude)
const center = {
  lat: 0,
  lng: 0,
};

// Configure map options to remove default UI and hide country labels
const mapOptions = {
  disableDefaultUI: true, // Remove default controls like zoom, street view, etc.
  styles: [
    {
      featureType: 'administrative.country',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }], // Hide country labels on the map
    },
  ],
};

// Function to process and simplify geometry
const processAndSimplifyGeometry = (geojson: any) => {
  const polygons = processGeometry(geojson);
  return polygons.map(paths => 
    paths.map(path => 
      simplify(path.map(point => ({ x: point.lng, y: point.lat })), 0.03)
        .map(simplifiedPoint => ({ lat: simplifiedPoint.y, lng: simplifiedPoint.x }))
    )
  );
};

// Main App component
function App() {
  // State variables to manage game data
  const [countries, setCountries] = useState<string[]>([]); // List of correctly guessed countries
  const [score, setScore] = useState(0); // Player's score
  const [inputValue, setInputValue] = useState(''); // Current input value
  const [message, setMessage] = useState(''); // Feedback message for the player
  const mapRef = useRef<google.maps.Map | null>(null); // Reference to the Google Map instance
  const [polygons, setPolygons] = useState<{ country: string; paths: google.maps.LatLngLiteral[][] }[]>([]);
  const colorMapRef = useRef<Map<string, string>>(new Map());

  // Load the Google Maps JavaScript API
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyBBKp7HVAFZcGjlUl3Cfcqg64oYW5Q8OpM", // Your Google Maps API key
  });

  // Callback function to store the map instance when it's loaded
  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  // State variable to track loading status
  const [isLoading, setIsLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Add this useEffect hook
  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  // Handle form submission when a country is entered
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const countryName = inputValue.trim().toLowerCase();
    const standardizedCountryName = Object.keys(countryNames).find(
      key => key.toLowerCase() === countryName
    );

    if (!standardizedCountryName) {
      setMessage(`Invalid country name: "${inputValue}". Try again!`);
      return;
    }

    const matchedCountryName = countryNames[standardizedCountryName];

    if (countries.includes(matchedCountryName)) {
      setMessage('You already entered this country!');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      // Fetch country data from the REST Countries API
      const response = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(standardizedCountryName)}`);
      
      if (!response.ok) {
        throw new Error(`REST Countries API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.length > 0) {
        setCountries(prevCountries => {
          const updatedCountries = [...prevCountries, matchedCountryName];
          return updatedCountries.sort(); // Sort countries alphabetically
        });
        setScore(prevScore => prevScore + 1);
        setMessage(`Correct! ${matchedCountryName} added.`);

        // Fetch country boundaries
        const boundariesResponse = await fetch(`https://nominatim.openstreetmap.org/search?country=${encodeURIComponent(matchedCountryName)}&polygon_geojson=1&format=json`);
        
        if (!boundariesResponse.ok) {
          throw new Error(`Nominatim API error: ${boundariesResponse.status} ${boundariesResponse.statusText}`);
        }

        const boundariesData = await boundariesResponse.json();
        if (boundariesData.length > 0 && boundariesData[0].geojson) {
          const newPolygons = processAndSimplifyGeometry(boundariesData[0].geojson);
          if (newPolygons.length > 0) {
            setPolygons(prevPolygons => [
              ...prevPolygons,
              ...newPolygons.map(paths => ({ country: matchedCountryName, paths }))
            ]);

            // Calculate bounds for the country
            const bounds = new google.maps.LatLngBounds();
            newPolygons.forEach(paths => {
              paths.forEach(path => {
                path.forEach(latlng => bounds.extend(latlng));
              });
            });

            // Fit the map to the bounds with a padding
            mapRef.current?.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
          } else {
            console.warn(`No valid polygons found for ${matchedCountryName}`);
          }
        } else {
          console.warn(`No boundary data found for ${matchedCountryName}`);
        }
      } else {
        setMessage(`No response.`);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage(`Error occurred: ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
      setIsLoading(false);
      setInputValue('');
    }
  };

  // Show error message if the map fails to load
  if (loadError) {
    return <div>Error loading maps</div>;
  }

  // Show loading message while the map is loading
  if (!isLoaded) {
    return <div>Loading maps</div>;
  }

  // Render the main application
  return (
    <div className="relative h-screen" data-testid={TEST_IDS.APP_CONTAINER}>
      {/* Google Map component */}
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={2}
        options={mapOptions}
        onLoad={onMapLoad}
        data-testid={TEST_IDS.GOOGLE_MAP}
      >
        {polygons.map(({ country, paths }, index) => {
          if (!colorMapRef.current.has(country)) {
            colorMapRef.current.set(country, getRandomColor(country));
          }
          const color = colorMapRef.current.get(country)!;
          const strokeColor = darkenAndSaturate(color);

          return (
            <Polygon
              key={`${country}-${index}`}
              paths={paths}
              options={{
                fillColor: color,
                fillOpacity: 0.35,
                strokeColor: strokeColor,
                strokeOpacity: 1,
                strokeWeight: 3,
              }}
              data-testid={TEST_IDS.POLYGON(country)}
            />
          );
        })}
      </GoogleMap>
      {/* Game interface overlay */}
      <GameInterface
        score={score}
        inputValue={inputValue}
        isLoading={isLoading}
        message={message}
        countries={countries}
        inputRef={inputRef}
        handleSubmit={handleSubmit}
        setInputValue={setInputValue}
      />
    </div>
  );
}

export default App;
