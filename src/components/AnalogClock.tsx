import { useEffect, useState } from 'react';

export default function AnalogClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours() % 12;
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  const hourDeg = (hours * 30) + (minutes * 0.5);
  const minuteDeg = minutes * 6;
  const secondDeg = seconds * 6;

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border-2 border-cyan-400/30 rounded-2xl p-8 shadow-2xl shadow-cyan-500/20">
      <div className="flex flex-col items-center gap-4">
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
