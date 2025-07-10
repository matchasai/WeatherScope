import { AnimatePresence, motion } from 'framer-motion';
import { Cloud, Droplets, History, MapPin, Moon, Search, Star, Sun, ThermometerSun, Wind } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather?";
const FORECAST_API_URL = "https://api.openweathermap.org/data/2.5/forecast?";

interface WeatherData {
  name: string;
  main: {
    temp: number;
    humidity: number;
    feels_like: number;
    pressure: number;
  };
  wind: {
    speed: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  sys: {
    sunrise: number;
    sunset: number;
    country: string;
  };
  visibility: number;
  clouds: {
    all: number;
  };
  dt: number;
  timezone: number;
}

interface ForecastData {
  list: Array<{
    dt: number;
    main: {
      temp: number;
      temp_min: number;
      temp_max: number;
    };
    weather: Array<{
      main: string;
      description: string;
      icon: string;
    }>;
  }>;
}

function App() {
  const [city, setCity] = useState('New Delhi');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [recentSearches, setRecentSearches] = useState<Array<{ id: string; name: string }>>([]);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [isDarkMode, setIsDarkMode] = useState(false);

  const fetchData = async (searchCity: string, coords?: { lat: number; lon: number }) => {
    try {
      setLoading(true);
      setError('');
      
      const baseParams = `&appid=${API_KEY}&units=${unit}`;
      const locationParam = coords 
        ? `lat=${coords.lat}&lon=${coords.lon}` 
        : `q=${searchCity}`;

      const [weatherResponse, forecastResponse] = await Promise.all([
        fetch(`${WEATHER_API_URL}${locationParam}${baseParams}`),
        fetch(`${FORECAST_API_URL}${locationParam}${baseParams}`)
      ]);

      if (!weatherResponse.ok || !forecastResponse.ok) {
        throw new Error('Location not found. Please try again.');
      }

      const [weatherData, forecastData] = await Promise.all([
        weatherResponse.json(),
        forecastResponse.json()
      ]);

      setWeather(weatherData);
      setForecast(forecastData);

      if (searchCity && !recentSearches.some(search => search.name === searchCity)) {
        setRecentSearches(prev => [{
          id: `${Date.now()}-${searchCity}`,
          name: searchCity
        }, ...prev].slice(0, 5));
      }

      // Set dark mode based on local time
      const localTime = new Date((weatherData.dt + weatherData.timezone) * 1000);
      const localHour = localTime.getHours();
      setIsDarkMode(localHour >= 18 || localHour < 6);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(city);
  }, [unit]);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) {
      fetchData(city);
    }
  };

  const handleGeolocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchData('', {
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          setError('Unable to get your location. Please allow location access.');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
    }
  };

  const toggleFavorite = (cityName: string) => {
    setFavorites(prev => 
      prev.includes(cityName)
        ? prev.filter(c => c !== cityName)
        : [...prev, cityName]
    );
  };

  const getLocalTime = (timestamp: number, timezone: number) => {
    const localTime = new Date((timestamp + timezone) * 1000);
    return localTime.toLocaleTimeString([], { 
      hour: '2-digit',
      minute: '2-digit',
      hour12: true 
    });
  };

  const getWeatherAnimation = (condition: string) => {
    const animations = {
      Rain: (
        <motion.div 
          className="absolute inset-0 overflow-hidden pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-0.5 h-4 bg-blue-400/30"
              initial={{ 
                top: -15,
                left: `${Math.random() * 100}%`,
                opacity: 0,
              }}
              animate={{ 
                top: '100%',
                opacity: 0.7,
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: 'linear'
              }}
            />
          ))}
        </motion.div>
      ),
      Snow: (
        <motion.div 
          className="absolute inset-0 overflow-hidden pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full"
              initial={{ 
                top: -10,
                left: `${Math.random() * 100}%`,
                opacity: 0,
              }}
              animate={{ 
                top: '100%',
                opacity: 0.7,
                x: Math.sin(i) * 100
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: 'linear'
              }}
            />
          ))}
        </motion.div>
      ),
      Thunderstorm: (
        <motion.div 
          className="absolute inset-0 overflow-hidden pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.1, 0.9, 0.1, 0] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatDelay: Math.random() * 5 + 2
          }}
        >
          <div className="absolute inset-0 bg-white" />
        </motion.div>
      )
    };

    return animations[condition as keyof typeof animations] || null;
  };

  const getBackgroundImage = (weatherCondition?: string, temp?: number) => {
    const weatherBackgrounds: Record<string, string> = {
      Thunderstorm: 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?auto=format&fit=crop&q=80',
      Drizzle: 'https://images.unsplash.com/photo-1556485689-33e55ab56127?auto=format&fit=crop&q=80',
      Rain: 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?auto=format&fit=crop&q=80',
      Snow: 'https://images.unsplash.com/photo-1491002052546-bf38f186af56?auto=format&fit=crop&q=80',
      Mist: 'https://images.unsplash.com/photo-1543968996-ee822b8176ba?auto=format&fit=crop&q=80',
      Clear: isDarkMode 
        ? 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1601297183305-6df142704ea2?auto=format&fit=crop&q=80',
      Clouds: isDarkMode
        ? 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1611928482473-7b27d24eab80?auto=format&fit=crop&q=80'
    };

    if (weatherCondition && weatherBackgrounds[weatherCondition]) {
      return weatherBackgrounds[weatherCondition];
    }

    if (typeof temp === 'number') {
      if (temp <= 0) return 'https://images.unsplash.com/photo-1478719059408-592965723cbc?auto=format&fit=crop&q=80';
      if (temp <= 10) return 'https://images.unsplash.com/photo-1464457312035-3d7d0e0c058e?auto=format&fit=crop&q=80';
      if (temp <= 20) return 'https://images.unsplash.com/photo-1431440869543-efaf3388c585?auto=format&fit=crop&q=80';
      if (temp <= 30) return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80';
      return 'https://images.unsplash.com/photo-1561553873-e8491a564fd0?auto=format&fit=crop&q=80';
    }

    return isDarkMode
      ? 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1601297183305-6df142704ea2?auto=format&fit=crop&q=80';
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex items-center justify-center p-4 transition-all duration-1000 relative"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${getBackgroundImage(weather?.weather[0]?.main, weather?.main.temp)})`,
      }}
    >
      {weather && getWeatherAnimation(weather.weather[0].main)}
      
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-4xl bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl text-white"
      >
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter location..."
              className="flex-1 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors duration-200 backdrop-blur-sm border border-white/30"
              disabled={loading}
            >
              <Search className="w-6 h-6" />
            </button>
          </form>
          
          <div className="flex gap-2">
            <button
              onClick={handleGeolocation}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors duration-200 backdrop-blur-sm border border-white/30"
            >
              <MapPin className="w-6 h-6" />
            </button>
            <button
              onClick={() => setUnit(unit === 'metric' ? 'imperial' : 'metric')}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors duration-200 backdrop-blur-sm border border-white/30"
            >
              <ThermometerSun className="w-6 h-6" />
            </button>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors duration-200 backdrop-blur-sm border border-white/30"
            >
              {isDarkMode ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {recentSearches.length > 0 && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="mb-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <History className="w-4 h-4" />
              <span className="text-sm">Recent Searches</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search) => (
                <motion.button
                  key={search.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  onClick={() => {
                    setCity(search.name);
                    fetchData(search.name);
                  }}
                  className="px-3 py-1 text-sm rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-200"
                >
                  {search.name}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="text-red-300 text-center mb-4"
            >
              {error}
            </motion.div>
          )}

          {loading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="h-32 bg-white/10 rounded-xl animate-pulse" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 bg-white/10 rounded-xl animate-pulse" />
                ))}
              </div>
            </motion.div>
          ) : weather ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-2">
                  <h2 className="text-3xl font-medium">{weather.name}</h2>
                  <button
                    onClick={() => toggleFavorite(weather.name)}
                    className="text-yellow-300 hover:text-yellow-400 transition-colors"
                  >
                    <Star className={`w-6 h-6 ${favorites.includes(weather.name) ? 'fill-current' : ''}`} />
                  </button>
                </div>
                <p className="text-sm mb-4">
                  {new Date((weather.dt + weather.timezone) * 1000).toLocaleDateString(undefined, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                  {' '}
                  {getLocalTime(weather.dt, weather.timezone)}
                </p>
                <motion.h1 
                  key={weather.main.temp}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className="text-6xl font-light mb-4"
                >
                  {Math.round(weather.main.temp)}°{unit === 'metric' ? 'C' : 'F'}
                </motion.h1>
                <p className="text-xl opacity-80">{weather.weather[0].description}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  {
                    icon: <Sun className="w-6 h-6" />,
                    value: `${Math.round(weather.main.feels_like)}°${unit === 'metric' ? 'C' : 'F'}`,
                    label: 'Feels Like'
                  },
                  {
                    icon: <Droplets className="w-6 h-6" />,
                    value: `${weather.main.humidity}%`,
                    label: 'Humidity'
                  },
                  {
                    icon: <Wind className="w-6 h-6" />,
                    value: `${weather.wind.speed} ${unit === 'metric' ? 'km/h' : 'mph'}`,
                    label: 'Wind Speed'
                  },
                  {
                    icon: <Cloud className="w-6 h-6" />,
                    value: `${weather.clouds.all}%`,
                    label: 'Cloud Cover'
                  }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-center gap-2 bg-white/10 rounded-xl p-4"
                  >
                    {item.icon}
                    <div>
                      <p className="text-2xl font-medium">{item.value}</p>
                      <p className="text-sm opacity-70">{item.label}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {forecast && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="text-xl font-medium mb-4">5-Day Forecast</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {forecast.list
                      .filter((item, index) => index % 8 === 0)
                      .slice(0, 5)
                      .map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-white/10 rounded-xl p-4 text-center"
                        >
                          <p className="text-sm opacity-70">
                            {new Date(item.dt * 1000).toLocaleDateString(undefined, { weekday: 'short' })}
                          </p>
                          <p className="text-2xl font-medium my-2">
                            {Math.round(item.main.temp)}°{unit === 'metric' ? 'C' : 'F'}
                          </p>
                          <p className="text-sm">
                            {Math.round(item.main.temp_min)}° / {Math.round(item.main.temp_max)}°
                          </p>
                          <p className="text-sm opacity-70">{item.weather[0].main}</p>
                        </motion.div>
                      ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

export default App;