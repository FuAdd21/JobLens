import { BriefcaseBusiness, Radar, Filter, Sparkles, BellRing, Check, MessageCircleQuestion } from 'lucide-react';
import { Link } from 'react-router-dom';

// A rider on a bike, phone raised to check job matches mid-commute -- the actual idea
// behind the illustration, not just decorative shapes. `flip` mirrors it for the second rider.
const Cyclist = ({ flip = false, bodyColor = '#241D45', topColor = '#E8437A', bagColor = '#F4793B' }) => (
  <svg
    viewBox="0 0 260 200"
    className="h-full w-full"
    style={{ transform: flip ? 'scaleX(-1)' : undefined }}
  >
    {/* wheels */}
    <circle cx="60" cy="150" r="42" fill="none" stroke={bodyColor} strokeWidth="7" />
    <circle cx="60" cy="150" r="6" fill={bodyColor} />
    <circle cx="200" cy="150" r="42" fill="none" stroke={bodyColor} strokeWidth="7" />
    <circle cx="200" cy="150" r="6" fill={bodyColor} />
    {[0, 60, 120].map((deg) => (
      <g key={`l-${deg}`}>
        <line x1="60" y1="150" x2={60 + 40 * Math.cos((deg * Math.PI) / 180)} y2={150 + 40 * Math.sin((deg * Math.PI) / 180)} stroke={bodyColor} strokeWidth="2.5" opacity="0.55" />
        <line x1="200" y1="150" x2={200 + 40 * Math.cos((deg * Math.PI) / 180)} y2={150 + 40 * Math.sin((deg * Math.PI) / 180)} stroke={bodyColor} strokeWidth="2.5" opacity="0.55" />
      </g>
    ))}

    {/* frame */}
    <path d="M60,150 L118,95 L165,95 L145,150" fill="none" stroke={bodyColor} strokeWidth="7" strokeLinejoin="round" strokeLinecap="round" />
    <path d="M118,95 L145,150 L200,150" fill="none" stroke={bodyColor} strokeWidth="7" strokeLinejoin="round" strokeLinecap="round" />
    <path d="M145,150 L155,80" fill="none" stroke={bodyColor} strokeWidth="7" strokeLinecap="round" />
    <path d="M118,95 L100,60" fill="none" stroke={bodyColor} strokeWidth="7" strokeLinecap="round" />
    <line x1="90" y1="58" x2="112" y2="58" stroke={bodyColor} strokeWidth="7" strokeLinecap="round" />
    {/* pedal crank */}
    <circle cx="145" cy="150" r="5" fill={bodyColor} />
    <line x1="145" y1="150" x2="128" y2="168" stroke={bodyColor} strokeWidth="5" strokeLinecap="round" />
    <line x1="145" y1="150" x2="162" y2="132" stroke={bodyColor} strokeWidth="5" strokeLinecap="round" />

    {/* backpack */}
    <rect x="118" y="58" width="26" height="34" rx="8" fill={bagColor} transform="rotate(8 131 75)" />

    {/* legs (seated, mid-pedal) */}
    <path d="M155,80 L140,120 L128,168" fill="none" stroke="#FBCB98" strokeWidth="9" strokeLinecap="round" />
    <path d="M155,80 L168,110 L162,132" fill="none" stroke="#FBCB98" strokeWidth="9" strokeLinecap="round" />

    {/* torso, leaning forward toward handlebar */}
    <path d="M155,80 L112,60" fill="none" stroke={topColor} strokeWidth="18" strokeLinecap="round" />

    {/* arm reaching up holding phone */}
    <path d="M120,64 L95,42" fill="none" stroke={topColor} strokeWidth="8" strokeLinecap="round" />
    <path d="M95,42 L82,26" fill="none" stroke="#FBCB98" strokeWidth="8" strokeLinecap="round" />

    {/* other arm to handlebar */}
    <path d="M120,66 L104,56" fill="none" stroke={topColor} strokeWidth="8" strokeLinecap="round" />

    {/* head */}
    <circle cx="108" cy="50" r="15" fill="#FBCB98" />
    <path d="M94,46 Q100,26 118,34 Q126,38 122,48 Q120,36 108,36 Q96,36 94,46 Z" fill={bodyColor} />

    {/* phone in raised hand, screen glowing -- this IS the point of the illustration */}
    <g transform="translate(66,10) rotate(-12)">
      <rect x="0" y="0" width="20" height="34" rx="4" fill={bodyColor} />
      <rect x="2.5" y="3" width="15" height="24" rx="1.5" fill="#EAF6FB" />
      <rect x="6" y="8" width="8" height="2" rx="1" fill={topColor} />
      <rect x="6" y="13" width="8" height="2" rx="1" fill="#2F6FED" />
      <rect x="6" y="18" width="5" height="2" rx="1" fill="#7ED957" />
    </g>
    {/* signal arcs above the phone */}
    <path d="M62,4 Q70,-8 82,4" stroke="#2F6FED" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.8" />
    <path d="M56,10 Q70,-14 88,10" stroke="#2F6FED" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.5" />
  </svg>
);

const Landscape = () => (
  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 overflow-hidden rounded-b-[28px] sm:h-72 md:h-80">
    <div className="absolute bottom-0 left-0 h-24 w-full bg-[#A6EAF1] sm:h-28" />
    <div className="absolute bottom-12 left-0 h-28 w-[58%] rounded-tr-[100%] bg-[#E8F8FB] sm:bottom-14 sm:h-32" />
    <div className="absolute bottom-14 right-0 h-24 w-[52%] rounded-tl-[100%] bg-[#DDF4F7] sm:bottom-16 sm:h-28" />
    <div className="absolute bottom-10 left-[32%] h-10 w-[34%] rounded-t-[100%] bg-[#F7DBAF] sm:bottom-11 sm:h-12" />
    <div className="absolute bottom-0 h-16 w-full bg-[#82D832] sm:h-20" />
    <div className="absolute bottom-0 left-0 h-12 w-40 rounded-tr-full bg-[#07964D] sm:h-14 sm:w-48" />
    <div className="absolute bottom-0 right-0 h-12 w-40 rounded-tl-full bg-[#07964D] sm:h-14 sm:w-48" />

    <div className="absolute bottom-2 left-[4%] h-32 w-40 sm:bottom-3 sm:h-40 sm:w-52 md:h-48 md:w-64">
      <Cyclist bodyColor="#241D45" topColor="#E8437A" bagColor="#F4793B" />
    </div>
    <div className="absolute bottom-2 right-[4%] h-32 w-40 sm:bottom-3 sm:h-40 sm:w-52 md:h-48 md:w-64">
      <Cyclist flip bodyColor="#241D45" topColor="#2F6FED" bagColor="#7ED957" />
    </div>
  </div>
);

const NavLink = ({ to, children }) => (
  <Link to={to} className="text-navy hover:text-blue transition-colors">{children}</Link>
);

const pipeline = [
  { icon: Radar, step: '01', title: 'Scan', desc: 'Reads public Telegram job channels and job sites every 30 minutes for new postings.' },
  { icon: Filter, step: '02', title: 'Filter', desc: 'Drops anything expired, unreliable, or older than 45 days automatically — no stale listings.' },
  { icon: Sparkles, step: '03', title: 'Match', desc: 'Compares each posting to your profession and skills using semantic search, not just keywords.' },
  { icon: BellRing, step: '04', title: 'Notify', desc: 'Emails you the moment a strong, still-open match shows up. You just click Apply.' },
];

const faqs = [
  { q: 'Where do the job listings come from?', a: 'Public Telegram channels and job listing websites — sources you could find yourself, but JobLens checks all of them continuously so you don\'t have to.' },
  { q: 'Will I see jobs outside my field?', a: 'Only if they\'re genuinely open to any background, or match your listed skills closely. Postings that require years of experience you don\'t have are filtered out.' },
  { q: 'How fresh are the listings?', a: 'JobLens automatically expires anything past its deadline, or older than 45 days if no deadline was posted. What you see is what you can still apply to.' },
  { q: 'Is it free?', a: 'Yes — set up your profile, and JobLens does the searching in the background at no cost.' },
];

const Landing = () => (
  <main className="min-h-screen bg-gradient-to-b from-skywash to-white px-4 py-8 text-navy sm:px-8">
    {/* Hero */}
    <section className="relative mx-auto min-h-[640px] max-w-6xl overflow-hidden rounded-[28px] bg-white shadow-[0_28px_80px_rgba(47,111,237,0.10)] sm:min-h-[720px] md:min-h-[780px]">
      <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #241D45 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      <nav className="relative z-10 flex items-center justify-between px-8 py-8 md:px-14">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-md border-2 border-navy text-navy">
            <BriefcaseBusiness size={19} />
          </span>
          <span className="font-display font-bold text-navy">JobLens</span>
        </Link>
        <div className="hidden items-center gap-10 text-xs font-bold md:flex">
          <NavLink to="/dashboard">Find Jobs</NavLink>
          <a className="text-navy hover:text-blue transition-colors" href="#how-it-works">How it works</a>
          <a className="text-navy hover:text-blue transition-colors" href="#faq">FAQ</a>
        </div>
        <Link to="/register" className="rounded-lg border-2 border-magenta px-9 py-3 text-xs font-bold text-magenta hover:bg-magenta hover:text-white transition-colors">
          Sign up
        </Link>
      </nav>

      <div className="relative z-10 mx-auto max-w-3xl px-6 pt-12 text-center sm:pt-20 md:pt-24">
        <h1 className="text-5xl font-extrabold leading-[1.08] tracking-tight text-navy md:text-6xl lg:text-7xl">
          Find Recent Jobs That <span className="relative inline-block">Fit You
            <svg className="absolute -bottom-2 left-0 h-4 w-full" viewBox="0 0 180 18" fill="none">
              <path d="M4 11C44 2 80 18 176 7" stroke="#75D68B" strokeWidth="5" strokeLinecap="round" />
            </svg>
          </span>
        </h1>
        <p className="mt-5 text-lg text-muted md:text-xl">
          JobLens scans Telegram channels and job sites, removes stale posts, and ranks matches by your skills.
        </p>
        <Link
          to="/register"
          className="mt-9 inline-flex min-w-56 items-center justify-center rounded-lg bg-gradient-to-r from-orange to-magenta px-10 py-4 text-sm font-extrabold text-white shadow-[0_18px_35px_rgba(232,67,122,0.28)]"
        >
          Get Started
        </Link>
      </div>
      <Landscape />
    </section>

    {/* Problem framing */}
    <section className="mx-auto max-w-3xl px-6 py-20 text-center">
      <p className="font-display text-2xl leading-relaxed text-muted md:text-3xl">
        "You studied one field. Job boards show you <span className="text-navy font-semibold">everything</span>.
        Somewhere in that noise is the one post you should've applied to —{' '}
        <span className="text-magenta font-semibold">yesterday</span>."
      </p>
    </section>

    {/* Pipeline */}
    <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="font-display text-4xl font-bold tracking-tight text-navy mb-3">How it focuses</h2>
      <p className="text-muted mb-10 max-w-lg">Four steps, running quietly in the background every 30 minutes.</p>
      <div className="grid gap-5 md:grid-cols-4">
        {pipeline.map(({ icon: Icon, step, title, desc }) => (
          <div key={step} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-line">
            <div className="mb-4 flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blueSoft text-blue">
                <Icon size={18} />
              </span>
              <span className="font-mono text-xs text-muted">{step}</span>
            </div>
            <h3 className="font-display text-lg font-bold text-navy mb-1.5">{title}</h3>
            <p className="text-sm leading-relaxed text-muted">{desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Comparison */}
    <section className="mx-auto max-w-6xl px-6 py-16 grid gap-6 md:grid-cols-2">
      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-line">
        <h3 className="font-display text-lg font-bold text-muted mb-5">Every other job board</h3>
        <ul className="space-y-3 text-sm text-muted">
          <li>Thousands of unrelated postings to scroll past</li>
          <li>Listings from months ago, deadline long gone</li>
          <li>You do the searching, every single day</li>
        </ul>
      </div>
      <div className="rounded-2xl bg-white p-8 shadow-[0_18px_45px_rgba(126,217,87,0.14)] ring-1 ring-green/30">
        <h3 className="font-display text-lg font-bold text-navy mb-5">JobLens</h3>
        <ul className="space-y-3 text-sm text-navy">
          {['Only postings that match your field', 'Only jobs still open to apply', 'Runs itself — you just check your inbox'].map((t) => (
            <li key={t} className="flex items-start gap-2">
              <Check size={16} className="mt-0.5 shrink-0 text-green" /> {t}
            </li>
          ))}
        </ul>
      </div>
    </section>

    {/* FAQ */}
    <section id="faq" className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-10 flex items-center gap-3">
        <MessageCircleQuestion size={22} className="text-blue" />
        <h2 className="font-display text-4xl font-bold tracking-tight text-navy">Common questions</h2>
      </div>
      <div className="space-y-4">
        {faqs.map((f) => (
          <details key={f.q} className="group rounded-xl bg-white p-5 shadow-sm ring-1 ring-line">
            <summary className="cursor-pointer list-none font-display font-semibold text-navy marker:content-none">
              {f.q}
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted">{f.a}</p>
          </details>
        ))}
      </div>
    </section>

    {/* Final CTA */}
    <section className="mx-auto max-w-3xl px-6 py-20 text-center">
      <h2 className="font-display text-4xl font-bold tracking-tight text-navy md:text-5xl mb-5">
        Stop scrolling. Start applying.
      </h2>
      <p className="text-muted mb-8">Set up your profile once. JobLens does the searching from here.</p>
      <Link
        to="/register"
        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange to-magenta px-10 py-4 text-sm font-extrabold text-white shadow-[0_18px_35px_rgba(232,67,122,0.28)]"
      >
        Create your account
      </Link>
    </section>

    <footer className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8 text-xs text-muted">
      <span className="font-display font-semibold text-navy">JobLens</span>
      <span>Built in Ethiopia</span>
    </footer>
  </main>
);

export default Landing;