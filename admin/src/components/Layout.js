import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Users, 
  AlertTriangle, 
  BarChart3, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/hosts', icon: Users, label: 'Host Approval' },
    { path: '/disputes', icon: AlertTriangle, label: 'Disputes' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' }
  ];

  return (
    <div className="layout">
      <div className="sidebar">
        <div style={{ padding: '0 20px', marginBottom: '32px' }}>
          <h2 style={{ color: '#2f6fe4', fontWeight: '700', fontSize: '20px' }}>
            OnPurpose Admin
          </h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
            Welcome, {user?.name}
          </p>
        </div>

        <nav>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  `nav-item ${isActive ? 'active' : ''}`
                }
              >
                <Icon size={20} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div style={{ position: 'absolute', bottom: '20px', width: '100%' }}>
          <button
            onClick={handleLogout}
            className="nav-item"
            style={{ 
              width: '100%', 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </div>

      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

export default Layout;
