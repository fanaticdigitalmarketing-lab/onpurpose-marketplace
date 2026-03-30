import React, { useState, useEffect } from 'react';
import { Users, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalHosts: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingHosts: 0,
    activeDisputes: 0
  });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Mock data for now - replace with actual API calls
      const mockStats = {
        totalUsers: 1247,
        totalHosts: 89,
        totalBookings: 456,
        totalRevenue: 12450,
        pendingHosts: 12,
        activeDisputes: 3
      };

      const mockChartData = [
        { name: 'Jan', bookings: 65, revenue: 2400 },
        { name: 'Feb', bookings: 78, revenue: 2800 },
        { name: 'Mar', bookings: 90, revenue: 3200 },
        { name: 'Apr', bookings: 81, revenue: 2900 },
        { name: 'May', bookings: 95, revenue: 3400 },
        { name: 'Jun', bookings: 102, revenue: 3600 }
      ];

      setStats(mockStats);
      setChartData(mockChartData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '4px' }}>
            {title}
          </p>
          <p style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
            {value}
          </p>
          {subtitle && (
            <p style={{ fontSize: '12px', color: '#64748b' }}>
              {subtitle}
            </p>
          )}
        </div>
        <div style={{
          padding: '12px',
          borderRadius: '8px',
          backgroundColor: `${color}20`
        }}>
          <Icon size={24} color={color} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
          Dashboard
        </h1>
        <p style={{ color: '#64748b' }}>
          Overview of OnPurpose platform metrics and activity
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={Users}
          color="#2f6fe4"
          subtitle="+12% from last month"
        />
        <StatCard
          title="Active Hosts"
          value={stats.totalHosts}
          icon={Users}
          color="#22c55e"
          subtitle={`${stats.pendingHosts} pending approval`}
        />
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings.toLocaleString()}
          icon={Calendar}
          color="#f59e0b"
          subtitle="This month: 89"
        />
        <StatCard
          title="Platform Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="#8b5cf6"
          subtitle="20% platform fee"
        />
      </div>

      {/* Charts */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Booking Trends</h3>
            <p className="card-subtitle">Monthly booking volume over time</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="bookings" 
                stroke="#2f6fe4" 
                strokeWidth={2}
                dot={{ fill: '#2f6fe4' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Revenue Growth</h3>
            <p className="card-subtitle">Monthly revenue trends</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#22c55e" 
                strokeWidth={2}
                dot={{ fill: '#22c55e' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Quick Actions</h3>
          <p className="card-subtitle">Common administrative tasks</p>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          <a href="/hosts" className="btn btn-primary">
            <Users size={16} />
            Review Host Applications ({stats.pendingHosts})
          </a>
          <a href="/disputes" className="btn btn-secondary">
            <TrendingUp size={16} />
            Manage Disputes ({stats.activeDisputes})
          </a>
          <a href="/analytics" className="btn btn-secondary">
            <TrendingUp size={16} />
            View Detailed Analytics
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
