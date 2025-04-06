import { useState } from 'react';
import { useWeather } from '../context/WeatherContext';
import toast from 'react-hot-toast';

export default function WeatherDisplay({ user }) {
  const [location, setLocation] = useState('');
  const { weather, loading, error, fetchWeather } = useWeather();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetchWeather(location, user);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter location (city, zip code, or coordinates)"
            className="input flex-grow"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary whitespace-nowrap"
          >
            {loading ? 'Loading...' : 'Get Weather'}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {weather?.current && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">{weather.current.name}</h2>
            <img
              src={`https://openweathermap.org/img/wn/${weather.current.weather[0].icon}@2x.png`}
              alt={weather.current.weather[0].description}
              className="w-16 h-16"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Temperature</p>
              <p className="text-3xl font-bold">{Math.round(weather.current.main.temp)}°C</p>
            </div>
            <div>
              <p className="text-gray-600">Feels Like</p>
              <p className="text-3xl font-bold">{Math.round(weather.current.main.feels_like)}°C</p>
            </div>
            <div>
              <p className="text-gray-600">Humidity</p>
              <p className="text-3xl font-bold">{weather.current.main.humidity}%</p>
            </div>
            <div>
              <p className="text-gray-600">Wind Speed</p>
              <p className="text-3xl font-bold">{weather.current.wind.speed} m/s</p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-gray-600">Description</p>
            <p className="text-xl capitalize">{weather.current.weather[0].description}</p>
          </div>
        </div>
      )}
    </div>
  );
} 