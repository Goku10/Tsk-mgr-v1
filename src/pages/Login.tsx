import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Login logic will be implemented later
    console.log('Login attempted with:', { email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Futuristic grid overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>

      {/* Metallic gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent"></div>

      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-slate-900/40 backdrop-blur-xl border-2 border-cyan-400/30 rounded-2xl p-10 shadow-2xl shadow-cyan-500/20">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-cyan-300 hover:text-cyan-200 transition-colors duration-300 mb-8 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-semibold">Back to Home</span>
          </button>

          <h1 className="text-5xl font-bold mb-12 text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-300 to-cyan-400 tracking-wide">
            Login
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label
                htmlFor="email"
                className="block text-cyan-300 font-semibold mb-3 text-lg tracking-wide"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-5 py-4 bg-slate-800/50 border-2 border-cyan-400/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 backdrop-blur-sm"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-cyan-300 font-semibold mb-3 text-lg tracking-wide"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-5 py-4 bg-slate-800/50 border-2 border-cyan-400/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 backdrop-blur-sm"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-10 group relative px-8 py-5 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 border-2 border-cyan-400/50 rounded-lg text-cyan-300 font-bold text-xl tracking-wider hover:border-cyan-300 hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 backdrop-blur-sm"
            >
              <span className="relative z-10">Login</span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/40 group-hover:to-blue-500/40 rounded-lg transition-all duration-300"></div>
            </button>
          </form>

          {/* Decorative elements */}
          <div className="mt-8 flex justify-center gap-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping-slow"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping-slow" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping-slow" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
