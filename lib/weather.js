import axios from 'axios';

export async function getWeatherData(location) {
  if (!process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY) {
    throw new Error('OpenWeatherMap API key is missing. Please check your .env.local file.');
  }

  try {
    console.log('Making API request to OpenWeatherMap...');
    const currentWeatherResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}`
    );

    const forecastResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?q=${location}&units=metric&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}`
    );

    return {
      current: currentWeatherResponse.data,
      forecast: forecastResponse.data
    };
  } catch (error) {
    console.error('OpenWeatherMap API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 401) {
      throw new Error('Invalid OpenWeatherMap API key. Please check your .env.local file and make sure the API key is correct.');
    }
    
    throw new Error(error.response?.data?.message || 'Failed to fetch weather data');
  }
}

export function processForecastData(forecast) {
  if (!forecast) return null;

  const dailyForecast = forecast.list.reduce((acc, item) => {
    const date = new Date(item.dt * 1000).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = {
        date,
        temp: [],
        weather: item.weather[0],
        humidity: [],
        wind: []
      };
    }
    acc[date].temp.push(item.main.temp);
    acc[date].humidity.push(item.main.humidity);
    acc[date].wind.push(item.wind.speed);
    return acc;
  }, {});

  return Object.values(dailyForecast).map(day => ({
    ...day,
    temp: Math.round(day.temp.reduce((a, b) => a + b, 0) / day.temp.length),
    humidity: Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length),
    wind: Math.round(day.wind.reduce((a, b) => a + b, 0) / day.wind.length)
  })).slice(0, 5);
} 