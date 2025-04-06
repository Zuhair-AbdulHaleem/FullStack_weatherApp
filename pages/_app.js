import { AuthProvider } from '../context/AuthContext';
import { WeatherProvider } from '../context/WeatherContext';
import '../styles/globals.css';
import { Toaster } from 'react-hot-toast';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <WeatherProvider>
        <Component {...pageProps} />
        <Toaster position="top-right" />
      </WeatherProvider>
    </AuthProvider>
  );
}

export default MyApp; 