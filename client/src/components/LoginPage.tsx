import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Monitor, Wifi, Settings2, Sun, Moon } from 'lucide-react';
import { FlyingFlight } from './FlyingFlight';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [shake, setShake] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('dark_mode');
    return saved === 'true';
  });

  // Feature flag
  const showDarkMode = false;

  const { login } = useAuth();
  const navigate = useNavigate();

  // Handle dark mode
  useEffect(() => {
    localStorage.setItem('dark_mode', isDarkMode.toString());

    const colorScheme = isDarkMode ? 'dark' : 'light';
    document.documentElement.setAttribute('data-color-scheme', colorScheme);
    document.querySelector('meta[name="color-scheme"]')?.setAttribute('content', colorScheme);
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setShake(false);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          login(data.token);
          navigate('/');
        }, 800);
      } else {
        setError(data.error || 'Invalid credentials. Please try again.');
        setShake(true);
        setTimeout(() => setShake(false), 600);
      }
    } catch {
      setError('Unable to connect to the server.');
      setShake(true);
      setTimeout(() => setShake(false), 600);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-inherit">

      {/* Left decorative panel */}
      <div
        className="hidden lg:flex flex-col w-[52%] relative overflow-hidden side-panel-container"
        style={{
          background: isDarkMode
            ? 'linear-gradient(135deg, #0A1628 0%, #162E4A 100%)'
            : '#0067B1'
        }}
      >
        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />

        {/* Soft radial glow */}
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-m3-on-primary/5 -translate-x-1/3 translate-y-1/3 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-m3-primary/40 translate-x-1/4 -translate-y-1/4 pointer-events-none" />

        {/* Interactive flying planes in full background */}
        <FlyingFlight className="absolute inset-0 z-0 pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full p-12">
          {/* Top branding */}
          <div className="relative h-16">
            <div className="absolute top-0 left-0 flex items-center gap-3">
              <div className="w-9 h-9 bg-m3-on-primary/15 rounded-xl flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-m3-on-primary fill-current">
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-base tracking-wide leading-none text-m3-on-primary">NextGen Config Manager</p>
                <p className="text-m3-on-primary/60 text-[11px] tracking-widest uppercase leading-none mt-0.5">Config Manager</p>
              </div>
            </div>
          </div>

          {/* Center hero content */}
          <div className="my-auto">
            {/* Large decorative display illustration */}
            <div className="mb-10 relative">
              {/* IFE screen mockup */}
              <div className="w-64 h-44 bg-m3-on-primary/10 border border-m3-on-primary/20 rounded-2xl p-3 shadow-2xl backdrop-blur-sm">
                {/* Screen header bar */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-m3-on-primary/40"></div>
                  <div className="flex-1 h-1.5 bg-m3-on-primary/20 rounded-full"></div>
                  <div className="w-8 h-1.5 bg-m3-on-primary/20 rounded-full"></div>
                </div>
                {/* Screen content rows */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="w-12 h-8 rounded-lg bg-m3-on-primary/15 flex items-center justify-center">
                      <Monitor className="w-4 h-4 text-m3-on-primary/60" />
                    </div>
                    <div className="flex-1 space-y-1.5 pt-0.5">
                      <div className="h-1.5 bg-m3-on-primary/30 rounded-full w-3/4"></div>
                      <div className="h-1 bg-m3-on-primary/15 rounded-full w-1/2"></div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-12 h-8 rounded-lg bg-m3-primary/20 flex items-center justify-center">
                      <Wifi className="w-4 h-4 text-m3-on-primary/70" />
                    </div>
                    <div className="flex-1 space-y-1.5 pt-0.5">
                      <div className="h-1.5 bg-m3-on-primary/30 rounded-full w-2/3"></div>
                      <div className="h-1 bg-m3-on-primary/15 rounded-full w-2/5"></div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-12 h-8 rounded-lg bg-m3-on-primary/15 flex items-center justify-center">
                      <Settings2 className="w-4 h-4 text-m3-on-primary/60" />
                    </div>
                    <div className="flex-1 space-y-1.5 pt-0.5">
                      <div className="h-1.5 bg-m3-on-primary/30 rounded-full w-4/5"></div>
                      <div className="h-1 bg-m3-on-primary/15 rounded-full w-1/3"></div>
                    </div>
                  </div>
                </div>
                {/* Bottom bar */}
                <div className="mt-3 flex gap-2">
                  <div className="h-5 flex-1 bg-m3-on-primary/20 rounded-md"></div>
                  <div className="h-5 w-12 bg-m3-primary/40 rounded-md"></div>
                </div>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-m3-on-primary leading-tight mb-3">
              NextGen Config<br />Manager
            </h1>
            <p className="text-m3-on-primary/65 text-sm leading-relaxed max-w-xs">
              Manage and deploy next-gen companion app configurations with ease.
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-4 text-m3-on-primary/40 text-[11px]">
            {/* <span>© 2024 Panasonic Avionics</span> */}
            {/* <span>·</span> */}
            <span>ONLY FOR DEMO PURPOSE</span>
            <span>v1.0</span>
          </div>
        </div>
      </div>

      {/* Right login panel */}
      <div className={`flex-1 flex flex-col items-center justify-center px-6 py-12 transition-all duration-300 relative ${shake ? 'animate-shake' : ''}`}>

        {/* Dark mode toggle */}
        {showDarkMode && (
          <button
            onClick={toggleDarkMode}
            className="absolute top-6 right-6 p-2 rounded-full bg-m3-surface-variant/30 hover:bg-m3-primary hover:text-m3-on-primary hover:border-m3-primary text-m3-on-surface transition-all border-[3px] border-m3-outline shadow hover:shadow-lg"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        )}

        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5 mb-10">
            <div className="w-8 h-8 bg-m3-primary rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-m3-on-primary fill-current">
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-sm text-m3-on-surface leading-none">Panasonic Avionics</p>
              <p className="text-m3-on-surface-variant text-[10px] uppercase tracking-widest mt-0.5">CA Config</p>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-m3-on-background mb-1">Welcome back</h2>
            <p className="text-m3-on-surface-variant text-sm">Sign in to your configuration workspace.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-xs font-semibold text-m3-on-surface uppercase tracking-wider mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-m3-surface border border-m3-outline rounded-xl px-4 py-3 text-m3-on-surface text-sm placeholder-m3-on-surface-variant focus:outline-none focus:ring-2 focus:ring-m3-primary/25 focus:border-m3-primary transition-all"
                placeholder="Enter your username"
                autoComplete="username"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-m3-on-surface uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-m3-surface border border-m3-outline rounded-xl px-4 py-3 pr-11 text-m3-on-surface text-sm placeholder-m3-on-surface-variant focus:outline-none focus:ring-2 focus:ring-m3-primary/25 focus:border-m3-primary transition-all"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-m3-on-surface-variant hover:text-m3-on-surface transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-start gap-2.5 bg-m3-error-container border border-m3-error text-m3-error px-4 py-3 rounded-xl text-sm">
                <svg className="w-4 h-4 mt-0.5 shrink-0 text-m3-error" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading || isSuccess}
              className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer mt-2
                ${isSuccess
                  ? 'bg-emerald-500 text-white'
                  : 'bg-m3-primary hover:bg-m3-primary/90 active:scale-[0.98] text-m3-on-primary shadow-sm disabled:opacity-60'
                }
              `}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </>
              ) : isSuccess ? (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Signed in!
                </>
              ) : (
                <>
                  <LogIn size={15} />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <p className="mt-8 text-center text-xs text-m3-on-surface-variant">
            Access restricted to authorized personnel only.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>
    </div>
  );
};

export default LoginPage;
