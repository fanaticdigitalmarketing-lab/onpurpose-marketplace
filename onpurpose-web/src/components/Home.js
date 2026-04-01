import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

export default function Home() {
  return (
    <div className="home">
      <nav className="navbar">
        <div className="container">
          <div className="logo">
            <div className="logo-icon bouncing">⏰</div>
            <span>OnPurpose</span>
          </div>
          <Link to="/auth" className="btn btn-primary">
            Get Started
          </Link>
        </div>
      </nav>

      <header className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Your Time, <span className="text-blue">Your Purpose</span>
            </h1>
            <p className="hero-subtitle">
              Connect with real people for authentic services and experiences. 
              From career coaching to local expertise, find the perfect human connection.
            </p>
            <div className="hero-actions">
              <Link to="/auth" className="btn btn-primary btn-large">
                Start Your Journey
              </Link>
              <Link to="/auth" className="btn btn-outline btn-large">
                Become a Provider
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-card">
              <div className="card-header">
                <div className="avatar">JD</div>
                <div className="card-info">
                  <h4>Jane Doe</h4>
                  <p>Career Coach</p>
                </div>
                <div className="rating">⭐ 4.9</div>
              </div>
              <div className="card-body">
                <h5>Executive Career Transition</h5>
                <p>Help professionals navigate career changes with confidence...</p>
                <div className="card-footer">
                  <span className="price">$150/hr</span>
                  <button className="btn btn-primary btn-sm">Book Now</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="features">
        <div className="container">
          <h2 className="section-title">Why Choose OnPurpose?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Purposeful Connections</h3>
              <p>Every interaction is meaningful. No algorithms, just real human connections.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h3>Verified Providers</h3>
              <p>All providers are background-checked and verified for your safety and peace of mind.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3>Direct Communication</h3>
              <p>Connect directly with service providers. No middlemen, no hidden fees.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="categories">
        <div className="container">
          <h2 className="section-title">Popular Categories</h2>
          <div className="categories-grid">
            <div className="category-card">
              <div className="category-icon">💼</div>
              <h3>Career Coaching</h3>
              <p>Professional guidance and mentorship</p>
            </div>
            <div className="category-card">
              <div className="category-icon">🗺️</div>
              <h3>Local Experts</h3>
              <p>Discover your city like a local</p>
            </div>
            <div className="category-card">
              <div className="category-icon">🎨</div>
              <h3>Cultural Guides</h3>
              <p>Authentic cultural experiences</p>
            </div>
            <div className="category-card">
              <div className="category-icon">📈</div>
              <h3>Marketing Help</h3>
              <p>Grow your business with experts</p>
            </div>
            <div className="category-card">
              <div className="category-icon">💪</div>
              <h3>Fitness Training</h3>
              <p>Personalized fitness programs</p>
            </div>
            <div className="category-card">
              <div className="category-icon">📚</div>
              <h3>Tutoring</h3>
              <p>Learn from subject matter experts</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Get Started?</h2>
            <p>Join thousands of people making meaningful connections every day.</p>
            <Link to="/auth" className="btn btn-primary btn-large">
              Create Your Account
            </Link>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <div className="logo">
                <div className="logo-icon bouncing">⏰</div>
                <span>OnPurpose</span>
              </div>
              <p>Your Time, Your Purpose</p>
            </div>
            <div className="footer-section">
              <h4>Platform</h4>
              <ul>
                <li><Link to="/auth">Get Started</Link></li>
                <li><Link to="/auth">Become a Provider</Link></li>
                <li><Link to="/auth">How It Works</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Company</h4>
              <ul>
                <li><a href="https://onpurpose.earth" target="_blank" rel="noopener noreferrer">About</a></li>
                <li><a href="mailto:onpurposeearth@gmail.com">Contact</a></li>
                <li><a href="https://onpurpose.earth" target="_blank" rel="noopener noreferrer">Blog</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Legal</h4>
              <ul>
                <li><a href="https://onpurpose.earth/privacy" target="_blank" rel="noopener noreferrer">Privacy</a></li>
                <li><a href="https://onpurpose.earth/terms" target="_blank" rel="noopener noreferrer">Terms</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Follow Us</h4>
              <div className="social-links">
                <a href="https://www.instagram.com/onpurposeearth/" target="_blank" rel="noopener noreferrer" className="social-link">
                  <span className="social-icon">📷</span>
                  Instagram
                </a>
                <a href="https://x.com/onpurposeearth" target="_blank" rel="noopener noreferrer" className="social-link">
                  <span className="social-icon">𝕏</span>
                  X (Twitter)
                </a>
                <a href="https://www.facebook.com/profile.php?id=61577482846260" target="_blank" rel="noopener noreferrer" className="social-link">
                  <span className="social-icon">📘</span>
                  Facebook
                </a>
                <a href="https://www.linkedin.com/in/tyler-forbes-1704423bb/" target="_blank" rel="noopener noreferrer" className="social-link">
                  <span className="social-icon">💼</span>
                  LinkedIn
                </a>
                <a href="https://www.youtube.com/@onpurposeearth" target="_blank" rel="noopener noreferrer" className="social-link">
                  <span className="social-icon">�</span>
                  YouTube
                </a>
                <a href="https://www.tiktok.com/@onpurpose.app?lang=en" target="_blank" rel="noopener noreferrer" className="social-link">
                  <span className="social-icon">🎵</span>
                  TikTok
                </a>
                <a href="https://discord.gg/8megf4Snz" target="_blank" rel="noopener noreferrer" className="social-link">
                  <span className="social-icon">🎮</span>
                  Discord
                </a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 OnPurpose. All rights reserved.</p>
            <p>Made with ❤️ for human connections</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
