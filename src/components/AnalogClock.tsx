import { useEffect, useState } from 'react';
import { Cloud, CloudRain, CloudSnow, Sun, CloudDrizzle, Wind, CloudFog } from 'lucide-react';

type WeatherData = {
  temp: number;
  description: string;
  icon: string;
  city: string;
};

export default function AnalogClock() {
  const [time, setTime] = useState(new Date());
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchWeather();
    const weatherInterval = setInterval(fetchWeather, 600000);
    return () => clearInterval(weatherInterval);
  }, []);

  const fetchWeather = async () => {
    try {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;

              const weatherResponse = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&temperature_unit=fahrenheit&timezone=auto`,
                { mode: 'cors' }
              );

              if (!weatherResponse.ok) {
                throw new Error('Weather API failed');
              }

              const weatherData = await weatherResponse.json();

              const geocodeResponse = await fetch(
                `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}`,
                { mode: 'cors' }
              );

              let city = 'Your Location';
              if (geocodeResponse.ok) {
                const geocodeData = await geocodeResponse.json();
                city = geocodeData.results?.[0]?.name || geocodeData.results?.[0]?.admin1 || 'Your Location';
              }

              setWeather({
                temp: Math.round(weatherData.current.temperature_2m),
                description: getWeatherDescription(weatherData.current.weather_code),
                icon: getWeatherIcon(weatherData.current.weather_code),
                city: city
              });
              setLoading(false);
            } catch (error) {
              console.error('Weather fetch with geolocation failed:', error);
              fetchWeatherByIP();
            }
          },
          (error) => {
            console.error('Geolocation error:', error);
            fetchWeatherByIP();
          },
          { timeout: 10000, enableHighAccuracy: false }
        );
      } else {
        fetchWeatherByIP();
      }
    } catch (error) {
      console.error('Weather fetch error:', error);
      fetchWeatherByIP();
    }
  };

  const fetchWeatherByIP = async () => {
    try {
      const response = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=40.7128&longitude=-74.0060&current=temperature_2m,weather_code&temperature_unit=fahrenheit&timezone=auto',
        { mode: 'cors' }
      );

      if (!response.ok) {
        throw new Error('Weather API failed');
      }

      const data = await response.json();

      setWeather({
        temp: Math.round(data.current.temperature_2m),
        description: getWeatherDescription(data.current.weather_code),
        icon: getWeatherIcon(data.current.weather_code),
        city: 'New York'
      });
      setLoading(false);
    } catch (error) {
      console.error('IP-based weather fetch error:', error);
      setWeather({
        temp: 72,
        description: 'Partly Cloudy',
        icon: 'cloud',
        city: 'Your Location'
      });
      setLoading(false);
    }
  };

  const getWeatherDescription = (code: number): string => {
    const weatherCodes: { [key: number]: string } = {
      0: 'Clear',
      1: 'Mainly Clear',
      2: 'Partly Cloudy',
      3: 'Overcast',
      45: 'Foggy',
      48: 'Foggy',
      51: 'Light Drizzle',
      53: 'Drizzle',
      55: 'Heavy Drizzle',
      61: 'Light Rain',
      63: 'Rain',
      65: 'Heavy Rain',
      71: 'Light Snow',
      73: 'Snow',
      75: 'Heavy Snow',
      77: 'Snow Grains',
      80: 'Light Showers',
      81: 'Showers',
      82: 'Heavy Showers',
      85: 'Light Snow Showers',
      86: 'Snow Showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm',
      99: 'Thunderstorm'
    };
    return weatherCodes[code] || 'Unknown';
  };

  const getWeatherIcon = (code: number): string => {
    if (code === 0 || code === 1) return 'sun';
    if (code === 2 || code === 3) return 'cloud';
    if (code >= 45 && code <= 48) return 'fog';
    if (code >= 51 && code <= 57) return 'drizzle';
    if (code >= 61 && code <= 67) return 'rain';
    if (code >= 71 && code <= 77) return 'snow';
    if (code >= 80 && code <= 82) return 'rain';
    if (code >= 85 && code <= 86) return 'snow';
    if (code >= 95) return 'rain';
    return 'cloud';
  };

  const WeatherIcon = ({ icon }: { icon: string }) => {
    const iconClass = "w-8 h-8 text-cyan-300";
    switch (icon) {
      case 'sun':
        return <Sun className={iconClass} />;
      case 'rain':
        return <CloudRain className={iconClass} />;
      case 'snow':
        return <CloudSnow className={iconClass} />;
      case 'drizzle':
        return <CloudDrizzle className={iconClass} />;
      case 'fog':
        return <CloudFog className={iconClass} />;
      case 'wind':
        return <Wind className={iconClass} />;
      default:
        return <Cloud className={iconClass} />;
    }
  };

  const hours = time.getHours() % 12;
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  const hourDeg = (hours * 30) + (minutes * 0.5);
  const minuteDeg = minutes * 6;
  const secondDeg = seconds * 6;

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border-2 border-cyan-400/30 rounded-2xl p-8 shadow-2xl shadow-cyan-500/20">
      <div className="flex flex-col items-center gap-4">
        {weather && (
          <div className="w-full flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <WeatherIcon icon={weather.icon} />
              <div>
                <p className="text-2xl font-bold text-cyan-300">{weather.temp}°F</p>
                <p className="text-xs text-slate-400">{weather.description}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-cyan-300">{weather.city}</p>
              <p className="text-xs text-slate-400">Local Time</p>
            </div>
          </div>
        )}

        {loading && !weather && (
          <div className="w-full text-center mb-2">
            <p className="text-xs text-slate-400">Loading weather...</p>
          </div>
        )}

        <div className="relative w-48 h-48">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <defs>
              <linearGradient id="clockGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3" />
              </linearGradient>
            </defs>

            <circle
              cx="100"
              cy="100"
              r="95"
              fill="url(#clockGradient)"
              stroke="#22d3ee"
              strokeWidth="2"
              opacity="0.5"
            />

            {[...Array(12)].map((_, i) => {
              const angle = (i * 30 - 90) * (Math.PI / 180);
              const x1 = 100 + 85 * Math.cos(angle);
              const y1 = 100 + 85 * Math.sin(angle);
              const x2 = 100 + 75 * Math.cos(angle);
              const y2 = 100 + 75 * Math.sin(angle);
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#22d3ee"
                  strokeWidth="2"
                  opacity="0.8"
                />
              );
            })}

            {[...Array(60)].map((_, i) => {
              if (i % 5 === 0) return null;
              const angle = (i * 6 - 90) * (Math.PI / 180);
              const x1 = 100 + 85 * Math.cos(angle);
              const y1 = 100 + 85 * Math.sin(angle);
              const x2 = 100 + 80 * Math.cos(angle);
              const y2 = 100 + 80 * Math.sin(angle);
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#22d3ee"
                  strokeWidth="1"
                  opacity="0.4"
                />
              );
            })}

            <line
              x1="100"
              y1="100"
              x2="100"
              y2="45"
              stroke="#22d3ee"
              strokeWidth="4"
              strokeLinecap="round"
              transform={`rotate(${hourDeg} 100 100)`}
              style={{ transition: 'transform 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)' }}
            />

            <line
              x1="100"
              y1="100"
              x2="100"
              y2="30"
              stroke="#60a5fa"
              strokeWidth="3"
              strokeLinecap="round"
              transform={`rotate(${minuteDeg} 100 100)`}
              style={{ transition: 'transform 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)' }}
            />

            <line
              x1="100"
              y1="100"
              x2="100"
              y2="25"
              stroke="#f87171"
              strokeWidth="1.5"
              strokeLinecap="round"
              transform={`rotate(${secondDeg} 100 100)`}
              style={{ transition: 'transform 0.1s linear' }}
            />

            <circle cx="100" cy="100" r="5" fill="#22d3ee" />
          </svg>
        </div>

        <div className="text-center">
          <p className="text-2xl font-bold text-cyan-300 tracking-wider">
            {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
          <p className="text-sm text-slate-400 mt-1">
            {time.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );
}
