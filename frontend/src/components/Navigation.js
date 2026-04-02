import React from 'react';
import { Link } from 'react-router-dom';

function Navigation() {
  return (
    <nav className="nav" id="main-nav">
      <div className="nav-inner">
        <Link to="/" onClick={() => window.location.reload()} className="nav-logo">
          <img src="/assets/logo.png" alt="OnPurpose" width="40" height="40"/>
          <div className="nav-logo-text">
            <span className="nav-logo-name">OnPurpose</span>
            <span className="nav-logo-sub">Connection, not dating</span>
          </div>
        </Link>

        <ul className="nav-links">
          <li><Link to="/" onClick={() => window.location.reload()}>Home</Link></li>
          <li><Link to="/services.html" onClick={() => window.location.reload()}>Services</Link></li>
          <li><Link to="/provider.html" onClick={() => window.location.reload()}>Become a Provider</Link></li>
          <li><Link to="/contact.html" onClick={() => window.location.reload()}>Contact</Link></li>
        </ul>

        <div className="nav-auth">
          <div id="nav-auth-row" style={{display:'flex',gap:'8px'}}>
            <button className="btn-ghost-nav" onClick={() => window.location.reload()}>Login</button>
            <button className="btn-nav-primary" onClick={() => window.location.reload()}>Sign Up</button>
          </div>
          <button className="nav-user-btn" id="nav-user-btn" onClick={() => window.location.reload()}>
            <div className="nav-av" id="nav-av">?</div>
            <span id="nav-name">Account</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
