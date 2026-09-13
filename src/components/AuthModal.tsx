import React, { useState } from 'react';
import { Shield, Sparkles, User, Mail, Lock, LogIn, UserPlus, Zap } from 'lucide-react';
import { authApi, setToken } from '../services/api';
import { soundFx } from '../sound';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onSuccess: (authData: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    soundFx.playClick();

    try {
      if (mode === 'register') {
        if (!username.trim()) {
          throw new Error('Please inscribe your adventurer name.');
        }
        const res = await authApi.register({ username, email, password });
        if (res.data?.token) {
          setToken(res.data.token);
          soundFx.playCelebration();
          onSuccess(res.data);
        }
      } else {
        const res = await authApi.login({ email, password });
        if (res.data?.token) {
          setToken(res.data.token);
          soundFx.playCelebration();
          onSuccess(res.data);
        }
      }
    } catch (err: any) {
      soundFx.playClick();
      setError(err.message || 'Failed to authenticate in the Realm.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setError(null);
    setLoading(true);
    soundFx.playClick();

    const demoEmail = 'shadow@realm.rpg';
    const demoPassword = 'realmPassword123';
    const demoUsername = 'SHADOW';

    try {
      // Attempt login first
      const loginRes = await authApi.login({ email: demoEmail, password: demoPassword }).catch(async () => {
        // If not found, register demo hero
        return await authApi.register({ username: demoUsername, email: demoEmail, password: demoPassword });
      });

      if (loginRes.data?.token) {
        setToken(loginRes.data.token);
        soundFx.playCelebration();
        onSuccess(loginRes.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate demo hero.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md p-6 sm:p-8 rounded-2xl bg-[#0e1022] border-2 border-purple-500/50 shadow-[0_0_50px_rgba(168,85,247,0.3)] overflow-hidden">
        {/* Glow ambient accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-900/60 border border-purple-400/60 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.5)] mb-1">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black font-cinzel tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-amber-200 to-purple-200 uppercase">
            {mode === 'login' ? 'Enter the Realm' : 'Inscribe Legend'}
          </h2>
          <p className="text-xs text-slate-400 font-serif">
            {mode === 'login'
              ? 'Enter your credentials to resume your journey'
              : 'Create your hero character and begin leveling real life'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 mb-6 rounded-xl bg-[#080914] border border-purple-950/60">
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setMode('login');
              setError(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-purple-900/70 text-purple-200 shadow-md border border-purple-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setMode('register');
              setError(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-purple-900/70 text-purple-200 shadow-md border border-purple-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs font-medium animate-in fade-in">
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Hero Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. SHADOW"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#080914] border border-purple-900/50 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              Codex Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hero@realm.rpg"
                className="w-full pl-10 pr-4 py-2.5 bg-[#080914] border border-purple-900/50 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              Passphrase
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-[#080914] border border-purple-900/50 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-700 hover:from-purple-600 hover:to-indigo-500 text-white text-xs font-black uppercase tracking-wider shadow-[0_0_20px_rgba(168,85,247,0.4)] border border-purple-400/50 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block animate-spin">⚡</span>
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Enter The Realm</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Inscribe Hero & Begin</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Hero Button */}
        <div className="mt-4 pt-4 border-t border-purple-950/60">
          <button
            type="button"
            onClick={handleQuickDemo}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-950/30 hover:bg-amber-950/60 border border-amber-500/40 hover:border-amber-400 text-amber-300 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>Instant Demo Adventurer (SHADOW)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
