# Weather Forecast App

Live Demo- https://fullstackweather-app.vercel.app/auth/login

A full-stack weather application built as a submission for the PM accelerator assesment with Next.js, Firebase, and Tailwind CSS. The app allows users to search for weather information by location and view current weather conditions along with a 5-day forecast.

## Features

- User authentication (sign up, login, logout)
  - Secure email/password authentication
  - Persistent login sessions
  - Protected routes for authenticated users
- Search weather by location (city, zip code, or coordinates)
- View current weather conditions
- 5-day weather forecast
- Location on map with Google Maps integration
- Related YouTube videos for each location
- Weather history tracking
  - Save weather data for specific dates
  - View historical weather records
  - Edit or delete saved history entries
- Search history with user-specific entries
  - Automatically saves recent searches
  - View and manage search history
  - Clear individual or all search entries
- User-specific data persistence
  - Weather history tied to user account
  - Search history maintained per user
  - Data synchronization across devices
- Responsive design for all devices
- Error handling and user feedback
- Firebase integration for data persistence

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Firebase account
- OpenWeatherMap API key
- Google Maps API key
- YouTube Data API v3 key

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd weather-app
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
   NEXT_PUBLIC_OPENWEATHER_API_KEY=your_openweather_api_key
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Firebase Setup

1. Create a new Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password provider
3. Create a Firestore database with the following collections:
   - `users`: Stores user profiles
   - `searchHistory`: Stores user search history
   - `weatherHistory`: Stores weather history records
4. Set up Firestore security rules to protect user data
5. Get your Firebase configuration and add it to the `.env.local` file

## API Setup

### OpenWeatherMap
1. Sign up for a free account at [https://openweathermap.org/](https://openweathermap.org/)
2. Get your API key from the account dashboard
3. Add the API key to your `.env.local` file

### Google Maps
1. Create a project in the Google Cloud Console
2. Enable the Maps JavaScript API and Geocoding API
3. Create credentials and get your API key
4. Add the API key to your `.env.local` file

### YouTube Data API
1. In the same Google Cloud Console project
2. Enable the YouTube Data API v3
3. Create credentials and get your API key
4. Add the API key to your `.env.local` file

## Project Structure

```
weather-app/
├── components/           # Reusable UI components
│   ├── LocationDetails.js # Map and YouTube integration
│   ├── WeatherDisplay.js  # Current weather display
│   ├── Forecast.js       # 5-day forecast
│   ├── WeatherHistory.js # Weather history tracking
│   ├── SearchHistory.js  # Search history management
│   └── ErrorMessage.js   # Error handling component
├── context/             # React context providers
│   ├── AuthContext.js   # Authentication context
│   └── WeatherContext.js # Weather data context
├── firebase/            # Firebase configuration
├── pages/               # Next.js pages
│   ├── api/            # API routes
│   │   ├── auth/      # Authentication endpoints
│   │   └── weather/   # Weather data endpoints
│   └── auth/           # Authentication pages
├── public/             # Static assets
├── styles/             # Global styles
├── .env.local          # Environment variables
├── next.config.js      # Next.js configuration
├── package.json        # Project dependencies
├── postcss.config.js   # PostCSS configuration
├── tailwind.config.js  # Tailwind CSS configuration
└── README.md           # Project documentation
```

## Technologies Used

- Next.js - React framework
- Firebase - Authentication and database
- Tailwind CSS - Styling
- OpenWeatherMap API - Weather data
- Google Maps API - Location visualization
- YouTube Data API - Related videos
- React Hot Toast - Notifications
- Axios - HTTP client
- date-fns - Date manipulation
- Firebase Admin SDK - Server-side authentication
- JWT - Secure token handling

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request 
