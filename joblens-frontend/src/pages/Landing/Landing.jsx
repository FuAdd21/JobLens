import { BriefcaseBusiness, SearchCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const Landscape = () => (
  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 overflow-hidden rounded-b-[28px]">
    <div className="absolute bottom-0 left-0 h-28 w-full bg-[#A6EAF1]" />
    <div className="absolute bottom-14 left-0 h-32 w-[58%] rounded-tr-[100%] bg-[#E8F8FB]" />
    <div className="absolute bottom-16 right-0 h-28 w-[52%] rounded-tl-[100%] bg-[#DDF4F7]" />
    <div className="absolute bottom-11 left-[32%] h-12 w-[34%] rounded-t-[100%] bg-[#F7DBAF]" />
    <div className="absolute bottom-0 h-20 w-full bg-[#82D832]" />
    <div className="absolute bottom-0 left-0 h-14 w-48 rounded-tr-full bg-[#07964D]" />
    <div className="absolute bottom-0 right-0 h-14 w-48 rounded-tl-full bg-[#07964D]" />
    <div className="absolute bottom-20 left-16 h-24 w-32 rounded-[45%] border-8 border-[#241D45]" />
    <div className="absolute bottom-20 right-24 h-24 w-32 rounded-[45%] border-8 border-[#E8437A]" />
    <div className="absolute bottom-44 left-24 h-20 w-16 rounded-full bg-[#FF9B64]" />
    <div className="absolute bottom-40 left-12 h-12 w-24 rounded-full bg-[#241D45]" />
    <div className="absolute bottom-36 right-44 h-16 w-12 rounded-full bg-[#FF9B64]" />
    <div className="absolute bottom-34 right-24 h-28 w-20 rounded-t-full bg-[#E8437A]" />
    <div className="absolute bottom-52 left-44 flex h-9 w-9 items-center justify-center rounded-md bg-blue text-white">
      <SearchCheck size={18} />
    </div>
    <div className="absolute bottom-52 right-60 flex h-9 w-9 items-center justify-center rounded-md bg-blue text-white">
      <BriefcaseBusiness size={18} />
    </div>
  </div>
);

const Landing = () => (
  <main className="min-h-screen bg-gradient-to-b from-skywash to-white px-4 py-8 text-navy sm:px-8">
    <section className="relative mx-auto min-h-[720px] max-w-6xl overflow-hidden rounded-[28px] bg-white shadow-[0_28px_80px_rgba(47,111,237,0.10)]">
      <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #241D45 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      <nav className="relative z-10 flex items-center justify-between px-8 py-8 md:px-14">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-md border-2 border-navy text-navy">
            <BriefcaseBusiness size={19} />
          </span>
          <span className="sr-only">JobLens</span>
        </Link>
        <div className="hidden items-center gap-10 text-xs font-bold text-navy md:flex">
          <Link to="/dashboard">Find Jobs</Link>
          <a href="#companies">Companies</a>
          <a href="#blog">Blog</a>
          <a href="#faq">FAQ</a>
        </div>
        <Link to="/register" className="rounded-lg border-2 border-magenta px-9 py-3 text-xs font-bold text-magenta hover:bg-magenta hover:text-white">
          Sign up
        </Link>
      </nav>

      <div className="relative z-10 mx-auto max-w-3xl px-6 pt-24 text-center">
        <h1 className="text-4xl font-extrabold leading-tight text-navy md:text-5xl">
          Find Recent Jobs That <span className="relative inline-block">Fit You
            <svg className="absolute -bottom-2 left-0 h-4 w-full" viewBox="0 0 180 18" fill="none">
              <path d="M4 11C44 2 80 18 176 7" stroke="#75D68B" strokeWidth="5" strokeLinecap="round" />
            </svg>
          </span>
        </h1>
        <p className="mt-4 text-base text-muted">
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
  </main>
);

export default Landing;
