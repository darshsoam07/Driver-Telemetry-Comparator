import React, { useState } from 'react';
import { Search, Volume2, VolumeX, Menu, X, ArrowRight } from 'lucide-react';
import { NavigationTab } from '../types';

interface NavbarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenSignIn: () => void;
  onOpenGetStarted: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenSignIn,
  onOpenGetStarted,
  soundEnabled,
  onToggleSound,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navItems: { id: NavigationTab; label: string; badge?: string }[] = [
    { id: 'product', label: 'Product' },
    { id: '3d-track', label: '3D Track', badge: 'R3F' },
    { id: 'telemetry', label: 'Telemetry' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'community', label: 'Community' },
  ];

  return (
    <header className="relative z-50 w-full border-b border-white/5 bg-[#08090b]/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
        {/* Logo */}
        <button
          id="nav-logo"
          onClick={() => onSelectTab('product')}
          className="group flex items-center space-x-3 text-left transition-transform active:scale-95"
        >
          {/* Dual Slanted Racing Bars */}
          <div className="flex h-6 w-6 items-center justify-center space-x-1">
            <span className="h-6 w-1.5 -skew-x-18 bg-[#e10600] transition-all duration-300 group-hover:scale-y-110" />
            <span className="h-6 w-1.5 -skew-x-18 bg-white transition-all duration-300 group-hover:scale-y-110" />
          </div>

          <div className="flex flex-col">
            <div className="font-racing text-2xl font-bold tracking-tight text-white">
              Track<span className="text-[#e10600]">Pulse</span>
            </div>
            <span className="font-mono text-[9px] tracking-[0.25em] text-neutral-400">
              DRIVEN BY DATA
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center space-x-8 md:flex">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                className={`group relative flex items-center space-x-1.5 text-sm font-medium transition-colors ${
                  isActive ? 'text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="rounded bg-[#e10600]/20 text-[#ef4444] border border-[#e10600]/40 text-[9px] font-mono px-1 py-0.2">
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute -bottom-2 left-0 right-0 h-[2px] bg-[#e10600] shadow-[0_0_8px_#e10600]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Action Buttons */}
        <div className="hidden items-center space-x-4 md:flex">
          {/* Engine Audio Toggle */}
          <button
            id="nav-sound-toggle"
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute simulated F1 engine audio' : 'Enable simulated F1 engine audio'}
            className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
              soundEnabled
                ? 'border-[#e10600]/40 bg-[#e10600]/10 text-[#e10600]'
                : 'border-white/10 bg-white/5 text-neutral-400 hover:text-white'
            }`}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>

          {/* Quick Search */}
          <div className="relative">
            {searchOpen ? (
              <div className="flex items-center rounded-lg border border-white/20 bg-black/60 px-2 py-1">
                <Search className="mr-2 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search telemetry..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={() => !searchQuery && setSearchOpen(false)}
                  autoFocus
                  className="w-36 bg-transparent text-xs text-white focus:outline-none"
                />
                <button onClick={() => setSearchOpen(false)} className="text-neutral-400 hover:text-white">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <button
                id="nav-search-btn"
                onClick={() => setSearchOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-neutral-400 transition-colors hover:text-white"
              >
                <Search className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Sign In Button */}
          <button
            id="nav-signin-btn"
            onClick={onOpenSignIn}
            className="rounded-full border border-white/20 bg-neutral-900/60 px-5 py-2 text-sm font-medium text-neutral-200 backdrop-blur-sm transition hover:border-white/40 hover:bg-neutral-800/80 hover:text-white"
          >
            Sign In
          </button>

          {/* Get Started CTA */}
          <button
            id="nav-get-started-btn"
            onClick={onOpenGetStarted}
            className="group flex items-center space-x-1.5 rounded-md bg-[#e10600] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-red-950/40 transition hover:bg-[#c20500] active:scale-95"
          >
            <span>Get Started</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center space-x-2 md:hidden">
          <button
            onClick={onToggleSound}
            className="p-2 text-neutral-400 hover:text-white"
          >
            {soundEnabled ? <Volume2 className="h-5 w-5 text-[#e10600]" /> : <VolumeX className="h-5 w-5" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-neutral-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-white/10 bg-[#0c0f14] px-6 py-6 md:hidden">
          <nav className="flex flex-col space-y-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`text-left text-base font-medium ${
                  currentTab === item.id ? 'text-[#e10600]' : 'text-neutral-300'
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="pt-4 flex flex-col space-y-3">
              <button
                onClick={() => {
                  onOpenSignIn();
                  setMobileMenuOpen(false);
                }}
                className="w-full rounded-md border border-white/20 py-2 text-center text-sm font-medium text-white"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  onOpenGetStarted();
                  setMobileMenuOpen(false);
                }}
                className="w-full rounded-md bg-[#e10600] py-2 text-center text-sm font-semibold text-white"
              >
                Get Started
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
