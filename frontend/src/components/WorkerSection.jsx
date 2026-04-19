import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './WorkerSection.css';

const featuresData = [
  {
    icon: "✅",
    title: "Verified Workforce",
    desc: "Every worker goes through background verification, ID check and skill assessment before deployment."
  },
  {
    icon: "⚡",
    title: "Quick Deployment",
    desc: "We provide trained staff within 24 hours of your request — no delays, no excuses."
  },
  {
    icon: "📍",
    title: "GPS Tracked",
    desc: "Real-time location tracking for security and field staff ensures accountability at all times."
  },
  {
    icon: "🏅",
    title: "Quality Assured",
    desc: "Rigorous training programs and regular performance reviews ensure consistent service quality."
  }
];

const servicesData = [
  { icon: "⚡", name: "Electrician", count: "200+ Available", color: "#dbeafe" },
  { icon: "🔧", name: "Plumber", count: "180+ Available", color: "#dcfce7" },
  { icon: "🪚", name: "Carpenter", count: "150+ Available", color: "#fef3c7" },
  { icon: "👷", name: "Daily Labour", count: "800+ Available", color: "#e0f2fe" },
  { icon: "🔩", name: "Skilled Labour", count: "500+ Available", color: "#ffedd5" },
  { icon: "🚗", name: "Driver", count: "150+ Available", color: "#f3e8ff" },
  { icon: "❄️", name: "AC Technician", count: "120+ Available", color: "#ecfdf5" },
  { icon: "🛡️", name: "Security", count: "450+ Available", color: "#fce7f3" },
  { icon: "👁️", name: "Watchman", count: "300+ Available", color: "#f0fdf4" },
  { icon: "💼", name: "Office Boy", count: "120+ Available", color: "#ede9fe" },
  { icon: "🧹", name: "Housekeeping", count: "280+ Available", color: "#fff7ed" },
];

const WorkerSection = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (window.location.hash === "#services") {
      const section = document.getElementById("services");
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, []);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="landing-page">
      {/* SECTION 1: FIXED NAVBAR */}
      <nav className="fixed-navbar">
        <div className="nav-left">
          <div className="logo-box">
            <span className="logo-letter">H</span>
          </div>
          <div className="brand-text">
            <div className="brand-name">HanVika</div>
            <div className="brand-tagline">Manpower Supply</div>
          </div>
        </div>

        <div className="nav-center">
          <a href="#home">Home</a>
          <a href="#services">Services</a>
          <a href="#features">Features</a>
          <a href="#contact">Contact</a>
        </div>

        <div className="nav-right">
          <button className="cta-nav" onClick={() => navigate('/select')}>Login / Register</button>
          <button className="mobile-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            ☰
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="mobile-menu">
            <a href="#home" onClick={() => setIsMobileMenuOpen(false)}>Home</a>
            <a href="#services" onClick={() => setIsMobileMenuOpen(false)}>Services</a>
            <a href="#features" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
            <a href="#contact" onClick={() => setIsMobileMenuOpen(false)}>Contact</a>
          </div>
        )}
      </nav>

      {/* SECTION 2: HERO SECTION */}
      <section className="hero-section" id="home">
        <div className="hero-left">
          <div className="badge animate-on-scroll">
            ⭐ Trusted by 500+ Businesses Across Hyderabad
          </div>
          <h1 className="animate-on-scroll">
            Reliable Manpower <br />
            <span>Solutions for</span> <br />
            <span className="highlight-amber">Your Business</span>
          </h1>
          <p className="hero-subtitle animate-on-scroll">
            HanVika provides verified, trained workforce for security,
            housekeeping, drivers, skilled &amp; unskilled labour across Hyderabad
            and surrounding regions.
          </p>
          <div className="hero-buttons animate-on-scroll">
            <button className="btn-primary" onClick={() => navigate('/create-request')}>
              Request Workers →
            </button>
            <a href="https://wa.me/919515029658" target="_blank" rel="noreferrer" className="btn-secondary">
              💬 WhatsApp Us
            </a>
          </div>
          <div className="trust-row animate-on-scroll">
            ✓ No advance payment &nbsp; ✓ 24hr deployment &nbsp; ✓ Trained staff
          </div>
        </div>

        <div className="hero-right">
          <div className="visual-card">
            <div className="glow-circle"></div>
            <div className="stat-floating card-top">
              <span className="icon">👷</span>
              <span className="text">50+ Workers Deployed</span>
            </div>
            <div className="stat-floating card-bottom">
              <span className="icon">⭐ 4.9 Rating</span>
              <span className="text">150+ Happy Clients</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: STATS BAR */}
      <section className="stats-bar">
        <div className="stat-box animate-on-scroll">
          <div className="stat-number">50+</div>
          <div className="stat-label">Workers Deployed</div>
        </div>
        <div className="stat-box animate-on-scroll">
          <div className="stat-number">150+</div>
          <div className="stat-label">Happy Clients</div>
        </div>
        <div className="stat-box animate-on-scroll">
          <div className="stat-number">3+</div>
          <div className="stat-label">Cities Covered</div>
        </div>
        <div className="stat-box animate-on-scroll">
          <div className="stat-number">7+</div>
          <div className="stat-label">Services Offered</div>
        </div>
      </section>

      {/* SECTION 4: SERVICES SECTION */}
      <section className="services-section" id="services">
        <div className="section-header animate-on-scroll">
          <div className="section-label">WHAT WE OFFER</div>
          <h2>Our Services</h2>
          <p>Comprehensive workforce solutions for every business need</p>
        </div>
        <div className="services-grid">
          {servicesData.map((service, idx) => (
            <div className="service-card animate-on-scroll" key={idx} onClick={() => navigate(`/create-request?service=${encodeURIComponent(service.name)}`)}>
              <div className="service-icon" style={{ background: service.color }}>
                {service.icon}
              </div>
              <h3 className="service-title">{service.name}</h3>
              <p className="service-count">{service.count}</p>
              <div className="service-arrow">→</div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5: FEATURES SECTION */}
      <section className="features-section" id="features">
        <div className="section-header animate-on-scroll">
          <div className="section-label">WHY CHOOSE US</div>
          <h2>Why Choose HanVika?</h2>
          <p>We deliver quality, reliability and speed — every single time</p>
        </div>
        <div className="features-grid">
          {featuresData.map((feature, idx) => (
            <div className="feature-card animate-on-scroll" key={idx}>
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-desc">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 6: CTA SECTION */}
      <section className="cta-section" id="contact">
        <div className="cta-box animate-on-scroll">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="cta-content">
            <div className="cta-label">GET STARTED</div>
            <h2>Ready to Hire Trained Workers?</h2>
            <p>
              Join 500+ businesses who trust HanVika for their workforce needs.
              Quick setup, no paperwork.
            </p>
            <div className="cta-buttons">
              <button className="btn-primary" onClick={() => navigate('/select')}>
                Get Started Free
              </button>
              <a href="tel:+919515029658" className="btn-outline">
                📞 Call: +91 95150 29658
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: FOOTER */}
      <footer className="footer-section">
        <div className="footer-columns">
          <div className="footer-col col-brand">
            <div className="footer-logo">
              <div className="logo-box">
                <span className="logo-letter">H</span>
              </div>
              <div className="brand-text">
                <div className="brand-name">HanVika</div>
              </div>
            </div>
            <p>Connecting businesses with verified manpower since 2015</p>
            <a href="https://wa.me/919515029658" target="_blank" rel="noreferrer" className="whatsapp-pill">
              💬 WhatsApp
            </a>
          </div>

          <div className="footer-col col-links">
            <h4>Quick Links</h4>
            <a href="#home">Home</a>
            <a href="#services">Services</a>
            <a href="#features">Features</a>
            <a onClick={() => navigate('/select')} style={{ cursor: 'pointer' }}>Login</a>
            <a href="#contact">Contact</a>
          </div>

          <div className="footer-col col-contact">
            <h4>Contact Us</h4>
            <a href="tel:+919515029658">📞 +91 95150 29658</a>
            <a href="mailto:nreddy1624@gmail.com">📧 nreddy1624@gmail.com</a>
            <span>📍 Hyderabad, Telangana</span>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 HanVika Manpower Supply Private Limited. All rights reserved.</span>
          <span>Made with ❤️ in Hyderabad</span>
        </div>
      </footer>
    </div>
  );
};

export default WorkerSection;
