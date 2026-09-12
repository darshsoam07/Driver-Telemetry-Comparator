import React, { useState } from 'react';
import { X, ArrowRight, ShieldCheck, Mail, Lock, User } from 'lucide-react';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'signin' | 'signup';
}

export const SignInModal: React.FC<SignInModalProps> = ({
  isOpen,
  onClose,
  mode: initialMode,
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [team, setTeam] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md rounded-2xl border border-white/20 bg-[#0c0f15] p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-neutral-400 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-1 mb-2">
            <span className="h-4 w-1 -skew-x-12 bg-[#e10600]" />
            <span className="h-4 w-1 -skew-x-12 bg-white" />
            <span className="font-racing font-bold text-lg text-white ml-1">
              Track<span className="text-[#e10600]">Pulse</span>
            </span>
          </div>

          <h3 className="font-heading text-xl font-bold text-white">
            {mode === 'signin' ? 'Sign In to Pitwall' : 'Create Driver Account'}
          </h3>
          <p className="text-xs text-neutral-400 mt-1">
            Access live telemetry, AI coaching logs, and team setups.
          </p>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3 animate-in zoom-in-95">
            <ShieldCheck className="h-12 w-12 text-[#e10600] mx-auto" />
            <h4 className="font-bold text-white text-base">Telemetry Session Authenticated</h4>
            <p className="text-xs text-neutral-400">Connecting to telemetry datalink...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-mono text-neutral-400 mb-1">
                  DRIVER / TEAM NAME
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
                  <input
                    type="text"
                    required
                    value={team}
                    onChange={(e) => setTeam(e.target.value)}
                    placeholder="e.g. Scuderia Sim Racing"
                    className="w-full rounded-md border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-xs text-white placeholder-neutral-500 focus:border-[#e10600] focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-mono text-neutral-400 mb-1">
                EMAIL ADDRESS
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="driver@f1racing.com"
                  className="w-full rounded-md border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-xs text-white placeholder-neutral-500 focus:border-[#e10600] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-neutral-400 mb-1">
                PASSWORD
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-md border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-xs text-white placeholder-neutral-500 focus:border-[#e10600] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-md bg-[#e10600] py-2.5 text-xs font-bold text-white hover:bg-[#c20500] shadow-lg shadow-red-950 transition flex items-center justify-center space-x-1.5"
            >
              <span>{mode === 'signin' ? 'Authenticate & Enter' : 'Create Free Account'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                className="text-xs text-neutral-400 hover:text-white transition"
              >
                {mode === 'signin'
                  ? "Don't have an account? Sign up"
                  : 'Already registered? Sign in'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
