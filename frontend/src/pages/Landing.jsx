import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Button } from '../components/ui/Button';

export const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      num: '01',
      title: 'AI Food Scanner',
      desc: 'Point your camera at any dish or barcode. Automatic Indian meal recognition with macro & glycemic calculation.'
    },
    {
      num: '02',
      title: 'Ayurvedic Diet Engine',
      desc: 'Therapeutic meal planning targeted specifically for Type 2 Diabetes, Hypertension, PCOS, and weight management.'
    },
    {
      num: '03',
      title: 'Freshness Detection',
      desc: 'TensorFlow.js computer vision scanner evaluates fruit & vegetable ripeness and predicts remaining shelf life.'
    }
  ];

  return (
    <div className="min-h-screen bg-white text-black flex flex-col font-sans selection:bg-black selection:text-white">
      <Navbar isLanding />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 md:px-8 max-w-[680px] mx-auto text-center flex flex-col items-center">
        <div className="flex items-center gap-2 mb-6">
          <span className="w-8 h-[1px] bg-black" />
          <span className="font-mono text-[11px] uppercase tracking-[2px] text-label">
            AYURVEDIC NUTRITION INTELLIGENCE
          </span>
        </div>

        <h1 className="font-serif text-[48px] md:text-[58px] font-normal tracking-[-1.5px] leading-[1.1] text-black mb-6">
          Track food. <span className="italic text-muted font-normal">Heal better.</span> Live well.
        </h1>

        <p className="font-sans text-[15px] text-muted leading-relaxed max-w-lg mb-8">
          The production-grade Indian nutrition PWA that combines modern AI macro tracking with ancient Ayurvedic dietary wisdom.
        </p>

        <div className="flex items-center justify-center gap-4 w-full sm:w-auto">
          <Button variant="primary" size="lg" onClick={() => navigate('/auth?tab=signup')}>
            Start Free Trial
          </Button>
          <Button variant="secondary" size="lg" onClick={() => navigate('/auth')}>
            Live Demo →
          </Button>
        </div>
      </section>

      {/* Features Strip */}
      <section id="features" className="w-full border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 flex items-center justify-between border-b border-border">
          <h2 className="font-serif text-[28px] text-black font-bold">Everything in one place.</h2>
          <span className="font-mono text-[11px] uppercase tracking-[2px] text-label">03 FEATURES</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full border-b border-border">
          {features.map((feat, idx) => (
            <div
              key={feat.num}
              className={`p-8 border-border bg-white flex flex-col justify-between min-h-[240px] ${
                idx !== features.length - 1 ? 'border-b md:border-b-0 md:border-r' : ''
              }`}
            >
              <div>
                <span className="font-mono text-[12px] font-medium text-label block mb-4">
                  {feat.num}
                </span>
                <h3 className="font-serif text-[22px] font-bold text-black mb-2">{feat.title}</h3>
                <p className="font-sans text-[14px] text-muted leading-relaxed">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center border-t border-border font-mono text-[11px] text-label uppercase tracking-widest">
        NutriVedic • Designed for Desktop & Installable Android PWA
      </footer>
    </div>
  );
};
