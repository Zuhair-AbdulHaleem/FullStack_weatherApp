import { useState, useEffect, useCallback, useMemo } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import ErrorMessage from './ErrorMessage';

const mapContainerStyle = {
  width: '100%',
  height: '400px'
};

const defaultCenter = {
  lat: 0,
  lng: 0
};

export default function LocationDetails({ location }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [mapError, setMapError] = useState(null);
  const [mapLoading, setMapLoading] = useState(false);
  const [mapKey, setMapKey] = useState(Date.now());

  // Memoize the API key
  const googleMapsApiKey = useMemo(() => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!key) {
      console.error('Google Maps API key is not configured');
      setMapError('Google Maps is not properly configured. Please contact support.');
      return null;
    }
    return key;
  }, []);

  // Memoize the YouTube API key
  const youtubeApiKey = useMemo(() => {
    const key = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
    if (!key) {
      console.error('YouTube API key is not configured');
      setError('YouTube videos are not available. API key is missing.');
      return null;
    }
    return key;
  }, []);

  // Reset map states when location changes
  useEffect(() => {
    setMapLoading(true);
    setMapError(null);
    setMapKey(Date.now());
    setLoading(true);
    setError(null);
  }, [location]);

  // Fetch location coordinates
  useEffect(() => {
    const getCoordinates = async () => {
      if (!location || !googleMapsApiKey) {
        setMapLoading(false);
        return;
      }

      try {
        console.log('Fetching coordinates for:', location);
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            location
          )}&key=${googleMapsApiKey}`
        );

        const data = await response.json();
        console.log('Geocoding response:', data.status);

        if (!response.ok) {
          throw new Error('Failed to fetch location data');
        }

        if (data.status === 'ZERO_RESULTS') {
          throw new Error(`Could not find coordinates for "${location}"`);
        }

        if (data.status === 'REQUEST_DENIED') {
          console.error('Geocoding request denied:', data.error_message);
          throw new Error('Map service is currently unavailable. Please try again later.');
        }

        if (data.status !== 'OK') {
          throw new Error(data.error_message || 'Failed to geocode location');
        }

        if (!data.results || !data.results[0]) {
          throw new Error('No results found for this location');
        }

        const { lat, lng } = data.results[0].geometry.location;
        console.log('Found coordinates:', { lat, lng });
        setMapCenter({ lat, lng });
        setMapError(null);
      } catch (err) {
        console.error('Error fetching coordinates:', err);
        setMapError(err.message);
        setMapCenter(defaultCenter);
      } finally {
        setMapLoading(false);
      }
    };

    getCoordinates();
  }, [location, googleMapsApiKey]);

  // Fetch YouTube videos
  useEffect(() => {
    const fetchVideos = async () => {
      if (!location || !youtubeApiKey) {
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching videos for:', location);
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
            `travel ${location} tourism`
          )}&maxResults=4&type=video&key=${youtubeApiKey}`
        );

        const data = await response.json();
        
        if (!response.ok) {
          if (data.error && data.error.code === 403 && 
              data.error.errors && data.error.errors[0].reason === 'quotaExceeded') {
            console.error('YouTube API quota exceeded:', data.error);
            setError('YouTube API quota exceeded. You can search directly on YouTube.');
            setVideos([]);
          } else {
            throw new Error(data.error?.message || 'Failed to fetch videos');
          }
        } else {
          console.log('Found videos:', data.items?.length || 0);
          setVideos(data.items || []);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching YouTube videos:', err);
        setError('Failed to load videos. Please try again later.');
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [location, youtubeApiKey]);

  const onMapLoad = useCallback((map) => {
    console.log('Map loaded successfully');
  }, []);

  const handleMapError = useCallback((error) => {
    console.error('Google Maps Error:', error);
    setMapError('Failed to load map. Please refresh the page and try again.');
  }, []);

  if (!location) return null;

  return (
    <div className="mt-8 space-y-8">
      {/* Google Maps Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Location on Map</h2>
        <div className="h-[400px] w-full rounded-lg overflow-hidden relative">
          {!googleMapsApiKey ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="text-center p-6">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20a8 8 0 100-16 8 8 0 000 16z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Map Error</h3>
                <p className="mt-1 text-sm text-gray-500">{mapError}</p>
              </div>
            </div>
          ) : mapError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="text-center p-6">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20a8 8 0 100-16 8 8 0 000 16z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Map Error</h3>
                <p className="mt-1 text-sm text-gray-500">{mapError}</p>
                <button
                  onClick={() => {
                    setMapError(null);
                    setMapKey(Date.now());
                  }}
                  className="mt-4 text-sm text-blue-600 hover:text-blue-500"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : mapLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <LoadScript 
              googleMapsApiKey={googleMapsApiKey}
              onError={handleMapError}
              key={mapKey}
            >
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={mapCenter}
                zoom={12}
                onLoad={onMapLoad}
              >
                <Marker position={mapCenter} />
              </GoogleMap>
            </LoadScript>
          )}
        </div>
      </div>

      {/* YouTube Videos Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Related Videos</h2>
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <p className="text-red-500 mb-3">{error}</p>
            {error.includes('quota') && (
              <a 
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`travel ${location} tourism`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Search on YouTube
              </a>
            )}
          </div>
        ) : videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videos.map((video) => (
              <div key={video.id.videoId} className="relative pb-[56.25%] h-0">
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${video.id.videoId}`}
                  title={video.snippet.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No videos found for this location.</p>
        )}
      </div>
    </div>
  );
} 