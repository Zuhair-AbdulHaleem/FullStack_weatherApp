import { useRef } from 'react';
import { format } from 'date-fns';
import ErrorMessage from './ErrorMessage';
import { usePDF } from 'react-to-pdf';
import { useWeather } from '../context/WeatherContext';

const formatDay = (timestamp) => {
  try {
    if (!timestamp || isNaN(timestamp)) return 'Invalid date';
    const date = new Date(timestamp * 1000);
    if (isNaN(date.getTime())) return 'Invalid date';
    return {
      day: format(date, 'EEEE'),
      date: format(date, 'MMM d')
    };
  } catch (error) {
    console.error('Date formatting error:', error);
    return { day: 'Invalid date', date: '' };
  }
};

export default function Forecast({ location, currentWeather }) {
  const { forecastData, loading, error } = useWeather();
  const contentRef = useRef();
  const { toPDF, targetRef } = usePDF({ filename: 'weather-report.pdf' });

  if (!location || !forecastData) return null;

  // Process the data to get one forecast per day
  const dailyForecast = forecastData.list.reduce((acc, item) => {
    if (!item || !item.dt || isNaN(item.dt) || !item.weather || !item.weather[0]) return acc;
    const date = format(new Date(item.dt * 1000), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = item;
    }
    return acc;
  }, {});

  // Convert to array and take first 5 days
  const fiveDayForecast = Object.values(dailyForecast).slice(0, 5);

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">5-Day Forecast</h2>
        {currentWeather && fiveDayForecast.length > 0 && (
          <button
            onClick={() => toPDF()}
            className="btn btn-primary flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z"
                clipRule="evenodd"
              />
            </svg>
            Download Report
          </button>
        )}
      </div>
      
      {error && <ErrorMessage message={error} onClose={() => {}} />}
      
      <div ref={targetRef}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {loading ? (
            <div className="col-span-full flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : fiveDayForecast.length > 0 ? (
            fiveDayForecast.map((day) => {
              const { day: dayName, date } = formatDay(day.dt);
              return (
                <div
                  key={day.dt}
                  className="bg-white p-4 rounded-lg shadow-sm text-center"
                >
                  <p className="font-medium">{dayName}</p>
                  <p className="text-sm text-gray-500 mb-2">{date}</p>
                  <img
                    src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                    alt={day.weather[0].description}
                    className="mx-auto w-16 h-16"
                  />
                  <p className="text-lg font-semibold mt-2">
                    {Math.round(day.main.temp)}°C
                  </p>
                  <p className="text-sm text-gray-500">
                    {day.weather[0].description}
                  </p>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center text-gray-500">
              No forecast data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 