import React, { useState } from 'react';
import { Check, ArrowRight, Zap, Shield, Trophy } from 'lucide-react';

interface PricingViewProps {
  onSelectPlan: (plan: string) => void;
}

export const PricingView: React.FC<PricingViewProps> = ({ onSelectPlan }) => {
  const [annualBilling, setAnnualBilling] = useState(true);

  const plans = [
    {
      id: 'driver',
      name: 'Sim Driver',
      badge: 'Individual',
      price: annualBilling ? 19 : 24,
      period: '/month',
      desc: 'Precision telemetry analysis for competitive sim racers and track day drivers.',
      features: [
        'Live Telemetry Overlay HUD',
        'Speed, Throttle, Brake & Gear Traces',
        'Full Circuit Vector Maps',
        'MoTeC & CSV Telemetry Import',
        '5 Saved Car Setups per Track',
        'Community Leaderboard Access',
      ],
      popular: false,
      cta: 'Get Started Free',
    },
    {
      id: 'pro',
      name: 'TrackPulse Pro',
      badge: 'Most Popular',
      price: annualBilling ? 49 : 59,
      period: '/month',
      desc: 'Full-stack AI coaching, ghost delta overlays, and multi-session telemetry sync.',
      features: [
        'Everything in Sim Driver',
        'AI Driver Coach & Corner Insights',
        'Multi-Lap Ghost Overlay & Scrubber',
        'Theoretical Best Lap Synthesizer',
        '4-Wheel Tire Thermal & Wear Model',
        'G-Force Polar Envelope & Apex Speeds',
        'Unlimited Setups & Cloud Sync',
      ],
      popular: true,
      cta: 'Start 14-Day Pro Trial',
    },
    {
      id: 'team',
      name: 'Factory Racing Team',
      badge: 'Teams & Engineers',
      price: annualBilling ? 199 : 239,
      period: '/month',
      desc: 'Dedicated multi-driver engineering pitwall for esports teams and professional racing outfits.',
      features: [
        'Everything in Pro',
        'Up to 10 Drivers & Race Engineers',
        'Real-time Live Pitwall Data Streaming',
        'Custom CAN-bus & Telemetry API Feeds',
        'Aerodynamic Downforce Wind-Tunnel Matrix',
        'Direct Discord / Radio Voice Integration',
        'Dedicated 24/7 Race Engineer Support',
      ],
      popular: false,
      cta: 'Contact Race Control',
    },
  ];

  return (
    <div className="relative min-h-[calc(100vh-80px)] w-full bg-[#08090b] text-white p-6 lg:p-12">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 text-xs font-mono text-[#e10600] uppercase tracking-widest bg-red-950/40 border border-red-800/40 px-3 py-1 rounded-full mb-3">
            <span>ENGINEERED FOR CHAMPIONS</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-white">
            Transparent Pricing for Drivers & Teams
          </h2>
          <p className="mt-4 text-base text-neutral-400">
            From hotlap enthusiasts to professional racing teams. Scale your telemetry performance without limits.
          </p>

          {/* Billing Switcher */}
          <div className="mt-8 inline-flex items-center rounded-full border border-white/15 bg-white/5 p-1">
            <button
              onClick={() => setAnnualBilling(false)}
              className={`rounded-full px-5 py-2 text-xs font-semibold transition ${
                !annualBilling ? 'bg-[#e10600] text-white shadow-lg' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setAnnualBilling(true)}
              className={`flex items-center space-x-1.5 rounded-full px-5 py-2 text-xs font-semibold transition ${
                annualBilling ? 'bg-[#e10600] text-white shadow-lg' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
              <span className="rounded bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.5 border border-emerald-500/40">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((p) => (
            <div
              key={p.id}
              className={`relative rounded-2xl flex flex-col justify-between p-8 backdrop-blur-2xl transition duration-300 ${
                p.popular
                  ? 'border-2 border-[#e10600] bg-gradient-to-b from-[#161a22] to-[#0c0f14] shadow-[0_0_40px_rgba(225,6,0,0.2)] md:-translate-y-2'
                  : 'border border-white/10 bg-[#0d1017]/90 hover:border-white/20'
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#e10600] px-4 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider text-white shadow-md">
                  {p.badge}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-xl font-bold text-white">{p.name}</h3>
                  {!p.popular && (
                    <span className="text-xs font-mono text-neutral-400">{p.badge}</span>
                  )}
                </div>

                <p className="mt-2 text-xs text-neutral-400 leading-relaxed min-h-[36px]">{p.desc}</p>

                <div className="mt-6 flex items-baseline">
                  <span className="font-telemetry text-4xl font-extrabold text-white">${p.price}</span>
                  <span className="font-mono text-xs text-neutral-400 ml-1">{p.period}</span>
                </div>

                {/* Features List */}
                <ul className="mt-8 space-y-3 text-xs text-neutral-300 border-t border-white/10 pt-6">
                  {p.features.map((f, idx) => (
                    <li key={idx} className="flex items-start space-x-2.5">
                      <Check className="h-4 w-4 shrink-0 text-[#e10600]" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-4">
                <button
                  onClick={() => onSelectPlan(p.name)}
                  className={`w-full py-3 rounded-md text-xs font-bold transition flex items-center justify-center space-x-2 ${
                    p.popular
                      ? 'bg-[#e10600] text-white hover:bg-[#c20500] shadow-lg shadow-red-950'
                      : 'border border-white/20 bg-white/5 text-white hover:bg-white/10'
                  }`}
                >
                  <span>{p.cta}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
