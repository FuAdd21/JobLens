import { Link } from 'react-router-dom';
import styles from './Landing.module.css';

const Landing = () => (
  <div className={styles.page}>
    {/* Top Navigation */}
    <nav className={styles.nav}>
      <Link to="/" className={styles.navLogo}>
        <span className={`material-symbols-outlined ${styles.navLogoIcon}`}>lens_blur</span>
        <span className={styles.navLogoText}>JobLens</span>
      </Link>

      <div className={styles.navLinks}>
        {/* "How it works" maps to the value-prop section below. Features/Pricing have no
            corresponding page yet -- kept as "#" placeholders, matching Stitch's own source
            rather than inventing destinations. */}
        <a href="#value-prop">How it works</a>
        <a href="#">Features</a>
        <a href="#">Pricing</a>
      </div>

      <div className={styles.navActions}>
        <Link className={styles.loginLink} to="/login">Log In</Link>
        <Link className={styles.getStartedNav} to="/register">Get Started</Link>
      </div>
    </nav>

    <main className={styles.main}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroLeft}>
          <h1 className={styles.heroHeadline}>
            Stop Searching.<br />Let Jobs Find You.
          </h1>
          <p className={styles.heroDescription}>
            JobLens uses AI to analyze your skills and career trajectory, automatically
            matching you with high-signal opportunities before they hit the open market.
          </p>

          <div className={styles.heroActions}>
            <Link to="/register" className={styles.primaryBtn}>Get Started</Link>
            <a href="#value-prop" className={styles.secondaryBtn}>See How It Works</a>
          </div>

          <div className={styles.heroNote}>
            <span className={`material-symbols-outlined ${styles.heroNoteIcon}`}>check_circle</span>
            <span>No credit card required</span>
          </div>
        </div>

        <div className={styles.heroImageWrap}>
          <img
            className={styles.heroImage}
            alt="A high-end, minimalist isometric mockup of a modern dashboard interface displaying career data and AI job matches, in a bright white and light gray palette with emerald green and deep navy accents."
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBG2Zv1SnMlgJ5Kb6ybDw4ghEoRWgS7uyC5HadmG9j4-2QHNuzIMul1zdT_Q6VFqbZ6Zn7viDULTQgaWe-rcFjmJ2g1Sf4h3PqCkQMmsv892ySOMsA7uwK7ADJ0YE4OG_Gkf7cAwICMaW5Kgr7TrFTh_Ez9SIGg86PycItbFkh2Urps5hnZBBcaddGnrLTX1-gfywmO1h689_kn2-nNiQnaS3xtonUmvL1mB7JZK7uL5DageZG3GCRKWA"
          />
        </div>
      </section>

      {/* Value prop / feature cards */}
      <section id="value-prop" className={styles.valueSection}>
        <div className={styles.valueGrid}>
          <div className={styles.valueCard}>
            <div className={styles.valueIconBox}>
              <span className={`material-symbols-outlined ${styles.icon}`}>troubleshoot</span>
            </div>
            <h3 className={styles.valueTitle}>AI-Powered Analysis</h3>
            <p className={styles.valueDescription}>
              Our engine parses your resume and online presence to build a deep, structural
              understanding of your career arc.
            </p>
          </div>

          <div className={styles.valueCard}>
            <div className={styles.valueIconBox} data-accent="secondary">
              <span className={`material-symbols-outlined ${styles.icon}`}>radar</span>
            </div>
            <h3 className={styles.valueTitle}>Silent Discovery</h3>
            <p className={styles.valueDescription}>
              We constantly monitor the market, surfacing high-relevance roles without you
              lifting a finger.
            </p>
          </div>

          <div className={styles.valueCard}>
            <div className={styles.valueIconBox}>
              <span className={`material-symbols-outlined ${styles.icon}`}>insights</span>
            </div>
            <h3 className={styles.valueTitle}>Precision Insights</h3>
            <p className={styles.valueDescription}>
              Understand your market value and identify missing skills necessary for your
              next targeted move.
            </p>
          </div>
        </div>
      </section>
    </main>

    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerBrand}>
          <span className={`material-symbols-outlined ${styles.footerBrandIcon}`}>lens_blur</span>
          <span className={styles.footerBrandText}>© 2024 JobLens</span>
        </div>
        <div className={styles.footerLinks}>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
        </div>
      </div>
    </footer>
  </div>
);

export default Landing;