import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWeather } from '../context/WeatherContext';
import Layout from '../components/Layout';
import WeatherCard from '../components/WeatherCard';
import Forecast from '../components/Forecast';
import LocationDetails from '../components/LocationDetails';
import ErrorMessage from '../components/ErrorMessage';
import WeatherHistory from '../components/WeatherHistory';

export default function Home() {
  const { user } = useAuth();
  const { 
    weatherData, 
    loading, 
    error, 
    searchHistory, 
    fetchWeatherData, 
    fetchSearchHistory,
    isInitialized 
  } = useWeather();
  const [location, setLocation] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (user) {
      fetchSearchHistory();
    }
  }, [user, fetchSearchHistory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (location.trim()) {
      await fetchWeatherData(location);
    }
  };

  if (!isClient || !isInitialized) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="flex gap-4">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter location"
                className="input flex-1"
                required
              />
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Loading...' : 'Get Weather'}
              </button>
            </div>
          </form>

          {error && <ErrorMessage message={error} onClose={() => {}} />}

          {weatherData && (
            <>
              <WeatherCard weather={weatherData} />
              <Forecast location={location} currentWeather={weatherData} />
              <LocationDetails location={location} />
            </>
          )}

          <WeatherHistory />

          {user && searchHistory.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Search History</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchHistory.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white p-4 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => {
                      setLocation(item.location);
                      fetchWeatherData(item.location);
                    }}
                  >
                    <p className="font-medium">{item.location}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
} 