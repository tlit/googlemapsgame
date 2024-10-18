// Import necessary dependencies from React and other libraries
import React, { useState, useCallback, useRef, useMemo } from 'react';
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

// Update the return type of processGeometry
const processGeometry = (geometry: any): google.maps.LatLngLiteral[][][] => {
  if (geometry.type === 'Polygon') {
    return [[convertToLatLngLiteral(geometry.coordinates[0])]];
  } else if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.map((polygon: number[][][]) => [convertToLatLngLiteral(polygon[0])]);
  }
  return [];
};

// Define color variables
const colorRed = '#FF0000';
const colorBlue = '#0000FF';
const colorGreen = '#00FF00';
const colorYellow = '#FFFF00';
const colorPurple = '#800080';
const colorOrange = '#FFA500';
const colorCyan = '#00FFFF';
const colorMagenta = '#FF00FF';
const colorLime = '#32CD32';
const colorPink = '#FFC0CB';
const colorTeal = '#008080';
const colorLavender = '#E6E6FA';
const colorBrown = '#A52A2A';
const colorBeige = '#F5F5DC';
const colorMaroon = '#800000';
const colorMint = '#98FF98';
const colorOlive = '#808000';
const colorApricot = '#FBCEB1';
const colorNavy = '#000080';
const colorCoral = '#FF7F50';

// Create an array of colors
const polygonColors = [
  colorRed, colorBlue, colorGreen, colorYellow, colorPurple,
  colorOrange, colorCyan, colorMagenta, colorLime, colorPink,
  colorTeal, colorLavender, colorBrown, colorBeige, colorMaroon,
  colorMint, colorOlive, colorApricot, colorNavy, colorCoral
];

// Helper function to get a random color from the array
const getRandomColor = () => polygonColors[Math.floor(Math.random() * polygonColors.length)];

// Main App component
function App() {
  // State variables to manage game data
  const [countries, setCountries] = useState<string[]>([]); // List of correctly guessed countries
  const [score, setScore] = useState(0); // Player's score
  const [inputValue, setInputValue] = useState(''); // Current input value
  const [message, setMessage] = useState(''); // Feedback message for the player
  const mapRef = useRef<google.maps.Map | null>(null); // Reference to the Google Map instance
  const [polygons, setPolygons] = useState<{ country: string; paths: google.maps.LatLngLiteral[][] }[]>([]);

  // Use useMemo to create a stable reference for countryColors
  const countryColors = useMemo(() => new Map<string, string>(), []);

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
        setCountries(prevCountries => [...prevCountries, countryName]);
        setScore(prevScore => prevScore + 1);
        setMessage(`Correct! ${countryName} added.`);

        // Assign a color to the country if it doesn't have one
        if (!countryColors.has(countryName)) {
          countryColors.set(countryName, getRandomColor());
        }

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
          setPolygons(prevPolygons => [
            ...prevPolygons,
            ...newPolygons.map(paths => ({ country: countryName, paths }))
          ]);
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
        {polygons.map(({ country, paths }, index) => {
          const color = countryColors.get(country) || getRandomColor();
          return (
            <Polygon
              key={`${country}-${index}`}
              paths={paths}
              options={{
                fillColor: color,
                fillOpacity: 0.35,
                strokeColor: '#000000',
                strokeOpacity: 1,
                strokeWeight: 2,
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
