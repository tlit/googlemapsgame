// Import necessary dependencies from React and other libraries
import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Polygon } from '@react-google-maps/api';
import { MapPin } from 'lucide-react';

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

// Helper function to convert GeoJSON coordinates to Google Maps LatLngLiteral
const convertToLatLngLiteral = (coordinates: number[][]): google.maps.LatLngLiteral[] => {
  return coordinates.map(coord => ({
    lat: coord[1],
    lng: coord[0],
  }));
};

// Helper function to process GeoJSON geometry
const processGeometry = (geometry: any): google.maps.LatLngLiteral[][] => {
  if (geometry.type === 'Polygon') {
    return [convertToLatLngLiteral(geometry.coordinates[0])];
  } else if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.map((polygon: number[][][]) => convertToLatLngLiteral(polygon[0]));
  }
  return [];
};

// Main App component
function App() {
  // State variables to manage game data
  const [countries, setCountries] = useState<string[]>([]); // List of correctly guessed countries
  const [score, setScore] = useState(0); // Player's score
  const [inputValue, setInputValue] = useState(''); // Current input value
  const [message, setMessage] = useState(''); // Feedback message for the player
  const mapRef = useRef<google.maps.Map | null>(null); // Reference to the Google Map instance
  const [polygons, setPolygons] = useState<google.maps.LatLngLiteral[][][]>([]); // Store country polygons

  // Load the Google Maps JavaScript API
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyBBKp7HVAFZcGjlUl3Cfcqg64oYW5Q8OpM", // Your Google Maps API key
  });

  // Callback function to store the map instance when it's loaded
  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  // Handle form submission when a country is entered
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent the form from refreshing the page
    const countryName = inputValue.trim(); // Remove whitespace from input
    
    // Check if the country has already been guessed
    if (countries.includes(countryName)) {
      setMessage('You already entered this country!');
      return;
    }

    try {
      // Fetch country data from the REST Countries API
      const response = await fetch(`https://restcountries.com/v3.1/name/${countryName}`);
      const data = await response.json();

      if (data.length > 0) {
        // If the country is valid
        const country = data[0];
        setCountries([...countries, countryName]); // Add country to the list
        setScore(score + 1); // Increase score
        setMessage(`Correct! ${countryName} added.`);

        // Pan and zoom the map to the country's location
        if (country.latlng && mapRef.current) {
          mapRef.current.panTo({ lat: country.latlng[0], lng: country.latlng[1] });
          mapRef.current.setZoom(5);
        }

        // Fetch country boundaries and add polygon
        const boundariesResponse = await fetch(`https://nominatim.openstreetmap.org/search?country=${countryName}&polygon_geojson=1&format=json`);
        const boundariesData = await boundariesResponse.json();
        if (boundariesData.length > 0 && boundariesData[0].geojson) {
          const newPolygons = processGeometry(boundariesData[0].geojson);
          setPolygons([...polygons, ...newPolygons]); // Add new polygons to the list
        }
      } else {
        setMessage('Invalid country name. Try again!');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error occurred. Please try again.');
    }

    setInputValue(''); // Clear the input field
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
        {/* Render polygons for each correctly guessed country */}
        {polygons.map((paths, index) => (
          <Polygon
            key={index}
            paths={paths}
            options={{
              fillColor: '#FF0000',
              fillOpacity: 0.35,
              strokeColor: '#FF0000',
              strokeOpacity: 1,
              strokeWeight: 2,
            }}
          />
        ))}
      </GoogleMap>
      {/* Game interface overlay */}
      <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-2">Country Game</h1>
        <p className="mb-2">Score: {score}</p>
        <form onSubmit={handleSubmit} className="flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter a country name"
            className="border border-gray-300 rounded-l px-4 py-2 w-full"
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600">
            <MapPin size={24} />
          </button>
        </form>
        {message && <p className="mt-2 text-sm">{message}</p>}
      </div>
    </div>
  );
}

export default App;