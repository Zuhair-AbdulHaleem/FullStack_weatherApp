export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { location } = req.query;

  if (!location) {
    return res.status(400).json({ error: 'Location is required' });
  }

  if (!process.env.OPENWEATHER_API_KEY) {
    console.error('OpenWeather API key is missing');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
        location
      )}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenWeather API error:', errorData);
      return res.status(response.status).json({ 
        error: errorData.message || 'Failed to fetch forecast data' 
      });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching forecast:', error);
    res.status(500).json({ error: 'Failed to fetch forecast data' });
  }
} 