import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Radar,
  Filter,
  Sparkles,
  BellRing,
  Check,
  Telescope,
} from 'lucide-react';

// Signature element: an aperture that "stops down" (focuses) as the hero scrolls past.
// Built as a set of rotating blade shapes rather than a stock icon — this is the one
// place the design spends its boldness; everything else stays quiet.
const ApertureGraphic = ({ progress }) => {
  const blades = 8;
  const closeAmount = progress * 34; // degrees each blade rotates inward

  return (
    <svg viewBox="0 0 400 400" className="w-full h-full">
      <circle cx="200" cy="200" r="180" fill="none" stroke="#1D2740" strokeWidth="1" />
      <circle cx="200" cy="200" r="140" fill="none" stroke="#1D2740" strokeWidth="1" />
      {Array.from({ length: blades }).map((_, i) => {
        const angle = (360 / blades) * i;
        return (
          <g key={i} transform={`rotate(${angle} 200 200)`}>
            <path
              d="M200,200 L200,40 A160,160 0 0,1 260,64 Z"
              fill="#C99A3E"
              opacity={0.14}
              transform={`rotate(${closeAmount} 200 200)`}
              style={{ transition: 'transform 0.1s linear' }}
            />
          </g>
        );
      })}
      <circle
        cx="200"
        cy="200"
        r={60 - progress * 30}
        fill="none"
        stroke="#3FBF9F"
        strokeWidth="2"
        style={{ transition: 'r 0.1s linear' }}
      />
    </svg>
  );
};

const Landing = () => {
  const heroRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -rect.top / rect.height));
      setProgress(p);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="bg-ink text-text font-body min-h-screen overflow-x-hidden">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-6 max-w-7xl mx-auto">
        <span className="font-display font-semibold text-lg tracking-tight">
          Job<span className="text-brass">Lens</span>
        </span>
        <div className="flex items-center gap-6">
          <Link to="/login" className="text-sm text-muted hover:text-text transition-colors">
            Log in
          </Link>
          <Link
            to="/register"
            className="text-sm bg-brass text-ink font-semibold px-4 py-2 rounded-full hover:bg-brassLight transition-colors"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section ref={heroRef} className="relative max-w-7xl mx-auto px-6 md:px-12 pt-16 pb-32 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-signal border border-signal/30 rounded-full px-3 py-1 mb-6">
            <Telescope size={12} /> Now scanning Telegram + job boards
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-semibold leading-[1.05] tracking-tight mb-6">
            Every job that fits you.
            <br />
            <span className="text-brass">Nothing that doesn't.</span>
          </h1>
          <p className="text-muted text-lg leading-relaxed mb-8 max-w-md">
            JobLens reads hundreds of job posts a day across Telegram channels and job sites,
            then shows you only the ones that actually match your profession — recent, real,
            and not expired.
          </p>
          <div className="flex items-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-brass text-ink font-semibold px-6 py-3 rounded-full hover:bg-brassLight transition-colors"
            >
              Find my matches <ArrowRight size={16} />
            </Link>
            <span className="text-xs text-muted">No credit card. Takes 2 minutes.</span>
          </div>
        </div>

        <div className="relative aspect-square max-w-md mx-auto w-full">
          <ApertureGraphic progress={progress} />
        </div>
      </section>

      {/* Problem framing */}
      <section className="max-w-4xl mx-auto px-6 md:px-12 py-20 text-center">
        <p className="font-display text-2xl md:text-3xl leading-snug text-muted">
          "You studied one field. Job boards show you{' '}
          <span className="text-text">everything</span>. Somewhere in that noise is the one
          post you should've applied to — <span className="text-brass">yesterday</span>."
        </p>
      </section>

      {/* Pipeline — a real sequence, so numbering is earned here */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-20">
        <h2 className="font-display text-3xl font-semibold mb-2">How it focuses</h2>
        <p className="text-muted mb-12 max-w-lg">
          Four steps, running quietly in the background every 30 minutes.
        </p>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { icon: Radar, step: '01', title: 'Scan', desc: 'Reads public Telegram channels and job sites for new postings.' },
            { icon: Filter, step: '02', title: 'Filter', desc: 'Drops expired, spammy, and unreliable-source postings automatically.' },
            { icon: Sparkles, step: '03', title: 'Match', desc: 'Compares each posting to your profession and skills using semantic search.' },
            { icon: BellRing, step: '04', title: 'Notify', desc: 'Emails you the moment a strong, still-open match appears.' },
          ].map(({ icon: Icon, step, title, desc }) => (
            <div key={step} className="bg-surface rounded-2xl p-6 border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <Icon size={20} className="text-brass" />
                <span className="text-xs text-muted font-mono">{step}</span>
              </div>
              <h3 className="font-display font-semibold mb-2">{title}</h3>
              <p className="text-sm text-muted leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What it's not */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-20 grid md:grid-cols-2 gap-8">
        <div className="bg-surface rounded-2xl p-8 border border-white/5">
          <h3 className="font-display text-lg font-semibold mb-4 text-muted">Every other job board</h3>
          <ul className="space-y-3 text-sm text-muted">
            <li>Thousands of unrelated postings to scroll past</li>
            <li>Listings from months ago, deadline long gone</li>
            <li>You do the searching, every single day</li>
          </ul>
        </div>
        <div className="bg-surface2 rounded-2xl p-8 border border-signal/20">
          <h3 className="font-display text-lg font-semibold mb-4 text-signal">JobLens</h3>
          <ul className="space-y-3 text-sm">
            {['Only postings that match your field', 'Only jobs still open to apply', 'Runs itself — you just check your inbox'].map((t) => (
              <li key={t} className="flex items-start gap-2">
                <Check size={16} className="text-signal mt-0.5 shrink-0" /> {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 md:px-12 py-24 text-center">
        <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4">
          Stop scrolling. Start applying.
        </h2>
        <p className="text-muted mb-8">Set up your profile once. JobLens does the searching from here.</p>
        <Link
          to="/register"
          className="inline-flex items-center gap-2 bg-brass text-ink font-semibold px-8 py-3.5 rounded-full hover:bg-brassLight transition-colors"
        >
          Create your account <ArrowRight size={16} />
        </Link>
      </section>

      <footer className="max-w-7xl mx-auto px-6 md:px-12 py-8 border-t border-white/5 text-xs text-muted flex justify-between">
        <span>JobLens</span>
        <span>Built in Ethiopia</span>
      </footer>
    </div>
  );
};

export default Landing;
