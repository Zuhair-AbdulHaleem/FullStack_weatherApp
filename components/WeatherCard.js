import { format } from 'date-fns';

export default function WeatherCard({ weather }) {
  if (!weather || !weather.weather || !weather.weather[0]) {
    return null;
  }

  const { main, weather: weatherInfo, wind, name, dt } = weather;
  const { description, icon } = weatherInfo[0];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">{name}</h2>
          <p className="text-gray-500">
            {format(new Date(dt * 1000), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <div className="text-right">
          <img
            src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
            alt={description}
            className="w-16 h-16"
          />
          <p className="text-gray-600 capitalize">{description}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-500">Temperature</p>
          <p className="text-2xl font-semibold">{Math.round(main.temp)}°C</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-500">Feels Like</p>
          <p className="text-2xl font-semibold">{Math.round(main.feels_like)}°C</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-500">Humidity</p>
          <p className="text-2xl font-semibold">{main.humidity}%</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-500">Wind Speed</p>
          <p className="text-2xl font-semibold">{wind.speed} m/s</p>
        </div>
      </div>
    </div>
  );
} 