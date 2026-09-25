import React, { useState, useEffect } from 'react';
import { useEnergy } from '../../context/EnergyContext';
import {
  X,
  User,
  Mail,
  Lock,
  Home,
  MapPin,
  ShieldCheck,
  UserPlus,
  LogIn,
  Zap,
  CheckCircle2,
  AlertCircle,
  Building
} from 'lucide-react';

export function AuthModal() {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    login,
    signup,
    currentUser,
    allUsers,
    switchUser
  } = useEnergy();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Signup fields
  const [name, setName] = useState('');
  const [doorNo, setDoorNo] = useState('');
  const [address, setAddress] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!isAuthModalOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsAuthModalOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, setIsAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      setSuccessMsg(`Welcome, ${res.user.name}!`);
      setTimeout(() => {
        setIsAuthModalOpen(false);
      }, 700);
    } else {
      setError(res.message || 'Login failed. Please check credentials.');
    }
  };

  const handleSignupSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!name.trim()) return setError('Please enter your full name.');
    if (!doorNo.trim()) return setError('Please enter your door or flat number.');
    if (!address.trim()) return setError('Please enter your full address.');
    if (!email.trim() || !email.includes('@')) return setError('Please enter a valid email.');
    if (password.length < 4) return setError('Password must be at least 4 characters long.');

    setLoading(true);
    const res = await signup({
      name: name.trim(),
      doorNo: doorNo.trim(),
      address: address.trim(),
      email: email.trim(),
      password
    });
    setLoading(false);

    if (res.success) {
      setSuccessMsg(`Resident account created! Consumer ID: ${res.user.consumer_id}`);
      setTimeout(() => {
        setIsAuthModalOpen(false);
      }, 1000);
    } else {
      setError(res.message || 'Account registration failed.');
    }
  };

  const quickDemoLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setLoading(true);
    const res = await login(demoEmail, demoPassword);
    setLoading(false);
    if (res.success) {
      setSuccessMsg(`Switched to ${res.user.name}`);
      setTimeout(() => {
        setIsAuthModalOpen(false);
      }, 600);
    } else {
      setError(res.message || 'Demo login failed');
    }
  };

  return (
    <div 
      onClick={() => setIsAuthModalOpen(false)}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden text-neutral-100 flex flex-col cursor-default"
      >
        {/* Top Header */}
        <div className="relative p-6 border-b border-neutral-800/80 bg-neutral-900/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                GridSense Resident Portal
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Local SQLite
                </span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Personalized energy tracking, appliance controls & billing
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/40 p-1.5 gap-1.5 mx-6 mt-5 rounded-2xl border">
          <button
            type="button"
            onClick={() => { setAuthModalMode('login'); setError(''); setSuccessMsg(''); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              authModalMode === 'login'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setAuthModalMode('signup'); setError(''); setSuccessMsg(''); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              authModalMode === 'signup'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Register New Resident
          </button>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 overflow-y-auto max-h-[65vh]">
          {authModalMode === 'login' ? (
            /* SIGN IN FORM */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1.5">
                  Resident Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. dhanush@smartenergy.in"
                    className="w-full bg-neutral-950/70 border border-neutral-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1.5">
                  Account Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter local password"
                    className="w-full bg-neutral-950/70 border border-neutral-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold rounded-2xl shadow-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? 'Authenticating...' : 'Sign In to Smart Energy Conservation'}
              </button>

              {/* Quick One-Click Demo Profiles */}
              <div className="pt-4 border-t border-neutral-800/80">
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-2">
                  ⚡ Quick Demo Accounts (1-Click Switch)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => quickDemoLogin('dhanush@smartenergy.in', 'password123')}
                    className="p-3 rounded-2xl bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-700/60 text-left transition-colors cursor-pointer flex items-center gap-2.5"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center shrink-0">
                      DY
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-white truncate">Dhanush Yadav</p>
                      <p className="text-[10px] text-neutral-400 truncate">Flat 402, Block B</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => quickDemoLogin('priya@smartenergy.in', 'password123')}
                    className="p-3 rounded-2xl bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-700/60 text-left transition-colors cursor-pointer flex items-center gap-2.5"
                  >
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 font-bold text-xs flex items-center justify-center shrink-0">
                      PS
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-white truncate">Priya Sharma</p>
                      <p className="text-[10px] text-neutral-400 truncate">Villa 12, Whitefield</p>
                    </div>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* SIGN UP FORM */
            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Varma"
                      className="w-full bg-neutral-950/70 border border-neutral-800 rounded-2xl pl-10 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">
                    Door / Flat Number *
                  </label>
                  <div className="relative">
                    <Home className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={doorNo}
                      onChange={(e) => setDoorNo(e.target.value)}
                      placeholder="e.g. Flat 301, Tower A"
                      className="w-full bg-neutral-950/70 border border-neutral-800 rounded-2xl pl-10 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">
                  Full Residential Address *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Prestige Shantiniketan, Whitefield, Bengaluru - 560048"
                    className="w-full bg-neutral-950/70 border border-neutral-800 rounded-2xl pl-10 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. rahul@gmail.com"
                      className="w-full bg-neutral-950/70 border border-neutral-800 rounded-2xl pl-10 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">
                    Account Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 4 characters"
                      className="w-full bg-neutral-950/70 border border-neutral-800 rounded-2xl pl-10 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-neutral-950/50 border border-neutral-800/80 text-[11px] text-neutral-400">
                <p className="flex items-center gap-1.5 font-semibold text-neutral-300">
                  <Building className="w-3.5 h-3.5 text-blue-400" />
                  BESCOM Consumer ID Generation
                </p>
                <p className="mt-1 leading-relaxed">
                  A unique, compliant Karnataka electricity consumer identifier will be automatically generated and bound to this local SQLite profile.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold rounded-2xl shadow-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? 'Creating Profile...' : 'Register Resident & Provision Meter'}
              </button>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
          <span>Current active resident: <strong className="text-neutral-200">{currentUser?.name || 'None'}</strong></span>
          <span className="font-mono text-[10px] text-neutral-400">{currentUser?.consumer_id || 'Not logged in'}</span>
        </div>
      </div>
    </div>
  );
}
