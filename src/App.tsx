// Import necessary dependencies from React and other libraries
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Polygon } from '@react-google-maps/api';
import { MapPin } from 'lucide-react';
import { processGeometry, getRandomColor } from './utils';
import { darkenAndSaturate } from './colors';

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
    const countryName = inputValue.trim();
    const capitalizedCountryName = countryName.charAt(0).toUpperCase() + countryName.slice(1);
    
    if (countries.includes(capitalizedCountryName)) {
      setMessage('You already entered this country!');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      // Fetch country data from the REST Countries API
      const response = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}`);
      
      if (!response.ok) {
        throw new Error(`REST Countries API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.length > 0) {
        setCountries(prevCountries => {
          const updatedCountries = [...prevCountries, capitalizedCountryName];
          return updatedCountries.sort(); // Sort countries alphabetically
        });
        setScore(prevScore => prevScore + 1);
        setMessage(`Correct! ${capitalizedCountryName} added.`);

        // Fetch country boundaries
        const boundariesResponse = await fetch(`https://nominatim.openstreetmap.org/search?country=${encodeURIComponent(capitalizedCountryName)}&polygon_geojson=1&format=json`);
        
        if (!boundariesResponse.ok) {
          throw new Error(`Nominatim API error: ${boundariesResponse.status} ${boundariesResponse.statusText}`);
        }

        const boundariesData = await boundariesResponse.json();
        if (boundariesData.length > 0 && boundariesData[0].geojson) {
          const newPolygons = processGeometry(boundariesData[0].geojson);
          if (newPolygons.length > 0) {
            setPolygons(prevPolygons => [
              ...prevPolygons,
              ...newPolygons.map(paths => ({ country: capitalizedCountryName, paths }))
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
            console.warn(`No valid polygons found for ${capitalizedCountryName}`);
          }
        } else {
          console.warn(`No boundary data found for ${capitalizedCountryName}`);
        }
      } else {
        setMessage('Invalid country name. Try again!');
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
    <div className="relative h-screen">
      {/* Google Map component */}
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={2}
        options={mapOptions}
        onLoad={onMapLoad}
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
            />
          );
        })}
      </GoogleMap>
      {/* Game interface overlay */}
      <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-2">Country Game</h1>
        <p className="mb-2">Score: {score}</p>
        <form onSubmit={handleSubmit} className="flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter a country name"
            className="border border-gray-300 rounded-l px-4 py-2 w-full"
            disabled={isLoading}
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600" disabled={isLoading}>
            {isLoading ? 'Loading...' : <MapPin size={24} />}
          </button>
        </form>
        {message && <p className="mt-2 text-sm">{message}</p>}
        {/* Alphabetized list of correct guesses */}
        <div className="mt-4 max-h-40 overflow-y-auto">
          <ul className="list-disc pl-5">
            {countries.map((country, index) => (
              <li key={index} className="text-sm">{country}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
