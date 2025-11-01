import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

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
      <div className="relative z-10 text-center px-6 max-w-4xl w-full">
        <h1 className="text-5xl md:text-7xl font-bold mb-16 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-300 to-cyan-400 tracking-wide animate-pulse-slow">
          Welcome to My Task Manager
        </h1>

        <div className="flex flex-col md:flex-row gap-8 justify-center items-center mt-12">
          <button
            onClick={() => navigate('/login')}
            className="group relative px-12 py-6 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-400/50 rounded-lg text-cyan-300 font-semibold text-xl tracking-wider hover:border-cyan-300 hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 backdrop-blur-sm min-w-[200px]"
          >
            <span className="relative z-10">Login</span>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/30 group-hover:to-blue-500/30 rounded-lg transition-all duration-300"></div>
          </button>

          <button
            onClick={() => navigate('/signup')}
            className="group relative px-12 py-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-2 border-blue-400/50 rounded-lg text-blue-300 font-semibold text-xl tracking-wider hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 backdrop-blur-sm min-w-[200px]"
          >
            <span className="relative z-10">Signup</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/30 group-hover:to-purple-500/30 rounded-lg transition-all duration-300"></div>
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="group relative px-12 py-6 bg-gradient-to-r from-slate-500/20 to-cyan-500/20 border-2 border-slate-400/50 rounded-lg text-slate-300 font-semibold text-xl tracking-wider hover:border-slate-300 hover:shadow-lg hover:shadow-slate-500/50 transition-all duration-300 backdrop-blur-sm min-w-[200px]"
          >
            <span className="relative z-10">Go to Dashboard</span>
            <div className="absolute inset-0 bg-gradient-to-r from-slate-500/0 to-cyan-500/0 group-hover:from-slate-500/30 group-hover:to-cyan-500/30 rounded-lg transition-all duration-300"></div>
          </button>
        </div>

        {/* Decorative elements */}
        <div className="mt-20 flex justify-center gap-2">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping-slow"></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping-slow" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping-slow" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
}

export default Home;
