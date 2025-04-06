import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, query, where, orderBy, limit, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { format } from 'date-fns';

const WeatherContext = createContext();

export function WeatherProvider({ children }) {
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const { user } = useAuth();

  const fetchSearchHistory = async () => {
    if (!user) {
      setSearchHistory([]);
      return;
    }

    try {
      const searchHistoryRef = collection(db, 'searchHistory');
      const q = query(
        searchHistoryRef,
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc'),
        limit(5)
      );
      const querySnapshot = await getDocs(q);
      const history = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSearchHistory(history);
    } catch (err) {
      console.error('Error fetching search history:', err);
      setSearchHistory([]);
    }
  };

  // Initialize search history when user changes
  useEffect(() => {
    if (user) {
      fetchSearchHistory();
    } else {
      setSearchHistory([]);
    }
    setIsInitialized(true);
  }, [user]);

  const saveSearchHistory = async (location) => {
    if (!user) return;

    try {
      const searchHistoryRef = collection(db, 'searchHistory');
      await addDoc(searchHistoryRef, {
        location,
        userId: user.uid,
        timestamp: new Date()
      });
      fetchSearchHistory();
    } catch (err) {
      console.error('Error saving search history:', err);
    }
  };

  const deleteSearchHistory = async (id) => {
    if (!user) return;

    try {
      const searchHistoryRef = doc(db, 'searchHistory', id);
      await deleteDoc(searchHistoryRef);
      fetchSearchHistory();
    } catch (err) {
      console.error('Error deleting search history:', err);
    }
  };

  const fetchWeatherData = async (location) => {
    setLoading(true);
    setError(null);

    try {
      const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
      if (!apiKey) {
        throw new Error('OpenWeather API key is not configured');
      }

      // Fetch current weather
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
          location
        )}&units=metric&appid=${apiKey}`
      );

      if (!weatherResponse.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const weatherData = await weatherResponse.json();
      setWeatherData(weatherData);

      // Fetch 5-day forecast
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
          location
        )}&units=metric&appid=${apiKey}`
      );

      if (!forecastResponse.ok) {
        throw new Error('Failed to fetch forecast data');
      }

      const forecastData = await forecastResponse.json();
      setForecastData(forecastData);

      // Save to search history if user is logged in
      if (user) {
        saveSearchHistory(location);
        
        // Also save to weather history
        try {
          const response = await fetch('/api/weather/history', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${await user.getIdToken()}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              location,
              startDate: format(new Date(), 'yyyy-MM-dd'),
              endDate: format(new Date(), 'yyyy-MM-dd'),
              averageTemp: weatherData.main.temp
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error('Failed to save to weather history:', errorData.error);
          }
        } catch (err) {
          console.error('Error saving to weather history:', err);
        }
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching weather data:', err);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    weatherData,
    forecastData,
    loading,
    error,
    searchHistory,
    fetchWeatherData,
    deleteSearchHistory,
    fetchSearchHistory,
    isInitialized
  };

  return (
    <WeatherContext.Provider value={value}>
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeather() {
  const context = useContext(WeatherContext);
  if (context === undefined) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
} 