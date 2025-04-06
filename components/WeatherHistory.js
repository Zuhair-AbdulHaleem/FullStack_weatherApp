import { useState, useEffect } from 'react';
import { format, parseISO, isValid } from 'date-fns';
import ErrorMessage from './ErrorMessage';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';

export default function WeatherHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    location: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }
    if (user) {
      fetchHistory();
    }
  }, [user, authLoading]);

  const getAuthHeader = async () => {
    const token = await user.getIdToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const fetchHistory = async () => {
    try {
      if (!user) return;
      
      setLoading(true);
      const headers = await getAuthHeader();
      const response = await fetch('/api/weather/history', {
        headers
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch history');
      }
      const data = await response.json();
      setHistory(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const validateDates = (startDate, endDate) => {
    if (!startDate || !endDate) {
      throw new Error('Both start and end dates are required');
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('Invalid date format');
    }

    if (start > end) {
      throw new Error('Start date must be before end date');
    }

    if (end > today) {
      throw new Error('End date cannot be in the future');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      validateDates(formData.startDate, formData.endDate);

      const headers = await getAuthHeader();
      const response = await fetch('/api/weather/history', {
        method: 'POST',
        headers,
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save weather data');
      }
      
      await fetchHistory();
      setFormData({
        location: '',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd')
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      if (!user) {
        setError('You must be logged in to delete history');
        return;
      }

      const token = await user.getIdToken();
      const response = await fetch(`/api/weather/history/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete weather history');
      }

      // Refresh the history list
      await fetchHistory();
    } catch (error) {
      console.error('Error deleting history:', error);
      setError(error.message);
    }
  };

  const handleUpdate = async (id, updatedData) => {
    try {
      if (updatedData.startDate && updatedData.endDate) {
        validateDates(updatedData.startDate, updatedData.endDate);
      }

      const headers = await getAuthHeader();
      const response = await fetch(`/api/weather/history/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update record');
      }
      
      await fetchHistory();
    } catch (err) {
      setError(err.message);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Weather History</h2>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="input w-full"
              placeholder="Enter location"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={formData.startDate}
              max={format(new Date(), 'yyyy-MM-dd')}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="input w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={formData.endDate}
              max={format(new Date(), 'yyyy-MM-dd')}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="input w-full"
              required
            />
          </div>
        </div>
        <button type="submit" className="btn btn-primary mt-4">
          Save Weather Data
        </button>
      </form>

      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Range
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Average Temp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {history.map((record) => (
                <tr key={record.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {record.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {format(parseISO(record.startDate), 'MMM d, yyyy')} -{' '}
                    {format(parseISO(record.endDate), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {record.averageTemp}°C
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleDelete(record.id)}
                      className="text-red-600 hover:text-red-900 mr-4"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleUpdate(record.id, { ...record, location: prompt('Enter new location:', record.location) })}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 