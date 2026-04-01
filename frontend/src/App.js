import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [skillInput, setSkillInput] = useState('');
  const [nicheInput, setNicheInput] = useState('');
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'https://onpurpose-backend-clean-production.up.railway.app' 
    : 'https://onpurpose-backend-clean-production.up.railway.app';

  useEffect(() => {
    loadStats();
    loadSavedIdeas();
    handleUrlParameters();
  }, []);

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`${CONFIG.API_URL}/api/stats`);
      if (response.ok) {
        const stats = await response.json();
        updateStats(stats);
      }
    } catch (error) {
      console.error('Stats failed:', error);
    }
  };

  const updateStats = (stats) => {
    if (stats.providers) document.getElementById('hostsCount').textContent = stats.providers;
    if (stats.bookings) document.getElementById('bookingsCount').textContent = stats.bookings;
    if (stats.countries) document.getElementById('countriesCount').textContent = stats.countries;
  };

  const loadSavedIdeas = () => {
    const savedData = localStorage.getItem('lastGeneratedIdeas');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        const ageInHours = (Date.now() - data.timestamp) / (1000 * 60 * 60);
        if (ageInHours < 24 && data.ideas && data.ideas.length > 0) {
          setSkillInput(data.skill || '');
          setNicheInput(data.niche || '');
          setIdeas(data.ideas);
          setShowResults(true);
        }
      } catch (error) {
        console.log('Error loading saved ideas:', error);
      }
    }
  };

  const handleUrlParameters = () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('fbclid')) {
      localStorage.setItem('trafficSource', 'facebook');
    }
    if (urlParams.get('utm_source')) {
      localStorage.setItem('utmSource', urlParams.get('utm_source'));
    }
    if (urlParams.get('utm_campaign')) {
      localStorage.setItem('utmCampaign', urlParams.get('utm_campaign'));
    }
    if (window.location.search) {
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  };

  const handleEarlyAccess = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    
    if (!email) {
      showMessage('Please enter a valid email address', 'error');
      return;
    }
    
    try {
      const response = await fetch(`${CONFIG.API_URL}/api/early-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (response.ok) {
        showMessage('🎉 Welcome! You\'re on the early access list.', 'success');
        e.target.email.value = '';
      } else {
        throw new Error('Failed to join early access');
      }
    } catch (error) {
      console.log('Early access signup (demo mode):', email);
      showMessage('🎉 Welcome! You\'re on the early access list.', 'success');
      e.target.email.value = '';
    }
  };

  const generateIdeas = async () => {
    if (!skillInput || !nicheInput) {
      alert('Please enter both your skill and target market');
      return;
    }
    
    setLoading(true);
    setShowResults(false);
    
    try {
      const response = await fetch(`${CONFIG.API_URL}/api/ideas/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skill: skillInput, niche: nicheInput })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data && data.data.ideas) {
          setIdeas(data.data.ideas);
          displayIdeas(data.data.ideas);
        } else {
          throw new Error('Invalid response format');
        }
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      console.log('AI API error, using fallback ideas:', error);
      const fallbackIdeas = generateFallbackIdeas(skillInput, nicheInput);
      setIdeas(fallbackIdeas);
      displayIdeas(fallbackIdeas);
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackIdeas = (skill, niche) => {
    const templates = [
      {
        title: `${skill} Consulting for ${niche}`,
        description: `Provide expert ${skill.toLowerCase()} consulting services tailored specifically for ${niche.toLowerCase()} to help them achieve their goals and overcome challenges.`,
        category: 'Consulting',
        price: '$75-150/hour'
      },
      {
        title: `${skill} Coaching Program`,
        description: `Create a comprehensive coaching program that teaches ${niche.toLowerCase()} how to master ${skill.toLowerCase()} through personalized guidance and support.`,
        category: 'Coaching',
        price: '$50-100/session'
      },
      {
        title: `Done-for-You ${skill} Service`,
        description: `Offer a complete ${skill.toLowerCase()} service where you handle everything from strategy to execution for busy ${niche.toLowerCase()}.`,
        category: 'Service',
        price: '$200-500/project'
      }
    ];
    
    return templates.map(template => ({
      ...template,
      uniqueId: Math.random().toString(36).substr(2, 9)
    }));
  };

  const displayIdeas = (ideasList) => {
    setIdeas(ideasList);
    setShowResults(true);
    
    localStorage.setItem('lastGeneratedIdeas', JSON.stringify({
      ideas: ideasList,
      timestamp: Date.now(),
      skill: skillInput,
      niche: nicheInput
    }));
    
    setTimeout(() => {
      document.getElementById('ideasResult')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  };

  const generateMoreIdeas = () => {
    if (skillInput && nicheInput) {
      generateIdeas();
    }
  };

  const becomeProvider = () => {
    if (ideas.length > 0) {
      localStorage.setItem('providerIdeas', JSON.stringify(ideas));
      localStorage.setItem('providerSkill', skillInput);
      localStorage.setItem('providerNiche', nicheInput);
    }
    window.location.href = '/provider.html';
  };

  const scrollToIdeaGenerator = () => {
    document.getElementById('ideaGenerator')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const goToProvider = () => {
    localStorage.setItem('providerSource', 'homepage-direct');
    window.location.href = '/provider.html';
  };

  return (
    <div className="App">
      {/* Bouncing Logo */}
      <div className="logo-container">
        <div className="logo">OP</div>
      </div>

      <div className="container">
        <h1>Book People. Not Places.</h1>
        <h2 className="subtitle">not dating connection for skills & human services</h2>
        
        <div className="alert alert-red">
          ⚡ Limited early access — first 100 users only
        </div>
        
        <div className="alert alert-green">
          ✨ Already used by 50+ early users
        </div>
        
        <p>
          OnPurpose connects you directly with real people offering real skills —
          from coaching to creative services.
        </p>

        <div className="cta">
          <form className="email-form" onSubmit={handleEarlyAccess}>
            <input 
              type="email" 
              name="email"
              placeholder="Enter your email" 
              required
            />
            <button type="submit">
              Join Early Access
            </button>
          </form>
          {message && <div className={`message ${messageType}`}>{message}</div>}
        </div>

        {/* SERVICE CHOICE SECTION */}
        <div className="service-choice">
          <h3>Ready to Start Your Service Business?</h3>
          <p>Choose how you'd like to get started with OnPurpose</p>
          
          <div className="service-buttons">
            <button onClick={scrollToIdeaGenerator}>
              <div>💡</div>
              <div>Generate My Service</div>
              <div>Let AI create ideas for you</div>
            </button>
            
            <button onClick={goToProvider}>
              <div>🚀</div>
              <div>I Already Have a Service</div>
              <div>Start listing right away</div>
            </button>
          </div>
        </div>

        {/* AI GENERATOR SECTION */}
        <div className="ai-generator">
          <div className="bg-decoration bg-1"></div>
          <div className="bg-decoration bg-2"></div>
          <div className="bg-decoration bg-3"></div>
          
          <div className="ai-content">
            <h2>💡 AI Service Idea Generator</h2>
            <p>
              Discover your perfect service offering with our AI-powered idea generator.<br/>
              <span>Tell us your skills and interests, and we'll create personalized business ideas for you.</span>
            </p>
            
            <div className="idea-generator">
              <div className="input-grid">
                <div>
                  <label>YOUR SKILL/EXPERTISE</label>
                  <input 
                    type="text" 
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="e.g. Web Development, Marketing, Design..." 
                  />
                </div>
                <div>
                  <label>TARGET MARKET</label>
                  <input 
                    type="text" 
                    value={nicheInput}
                    onChange={(e) => setNicheInput(e.target.value)}
                    placeholder="e.g. Small Businesses, Startups, Creators..." 
                  />
                </div>
              </div>
              
              <button onClick={generateIdeas} disabled={loading}>
                {loading ? '🤖 AI Thinking...' : '🚀 Generate AI Ideas'}
              </button>
              
              {loading && (
                <div className="loading-state">
                  <div>🤖 AI is generating your personalized ideas...</div>
                  <div>This usually takes 2-3 seconds</div>
                  <div className="spinner"></div>
                </div>
              )}
              
              {showResults && (
                <div className="ideas-result">
                  <div className="ideas-container">
                    <h3>✨ Your AI-Generated Service Ideas</h3>
                    <div className="ideas-list">
                      {ideas.map((idea, index) => (
                        <div key={idea.uniqueId || index} className="idea-card">
                          <h4>{index + 1}. {idea.title}</h4>
                          <p>{idea.description}</p>
                          <div className="idea-meta">
                            <span className="category">{idea.category}</span>
                            <span className="price">{idea.price || 'Competitive rates'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="actions">
                    <p>Ready to turn these ideas into reality?</p>
                    <div className="action-buttons">
                      <button onClick={becomeProvider}>🎯 Become a Provider</button>
                      <button onClick={generateMoreIdeas}>🔄 Generate More</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="stats">
          <div className="stat">
            <div className="stat-number" id="hostsCount">50+</div>
            <div className="stat-label">Expert Hosts</div>
          </div>
          <div className="stat">
            <div className="stat-number" id="bookingsCount">100+</div>
            <div className="stat-label">Bookings Made</div>
          </div>
          <div className="stat">
            <div className="stat-number" id="countriesCount">12+</div>
            <div className="stat-label">Countries</div>
          </div>
        </div>

        <div className="features">
          <div className="card">
            <h3>🎯 Career Coaching</h3>
            <p>Get personalized career guidance from industry professionals.</p>
          </div>
          <div className="card">
            <h3>📣 Marketing Help</h3>
            <p>Boost your brand with expert marketing strategies and support.</p>
          </div>
          <div className="card">
            <h3>🎨 Design Services</h3>
            <p>Professional design solutions for your creative projects.</p>
          </div>
        </div>

        <footer>
          © 2026 OnPurpose — Marketplace for human connection
        </footer>
      </div>
    </div>
  );
}

export default App;
