import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, DollarSign, Calendar } from 'lucide-react';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({});

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      // Mock data for now - replace with actual API calls
      const mockData = {
        userGrowth: [
          { month: 'Jan', users: 120, hosts: 15 },
          { month: 'Feb', users: 189, hosts: 22 },
          { month: 'Mar', users: 267, hosts: 31 },
          { month: 'Apr', users: 345, hosts: 42 },
          { month: 'May', users: 456, hosts: 58 },
          { month: 'Jun', users: 589, hosts: 73 }
        ],
        bookingsByCategory: [
          { name: 'Mentorship', value: 35, color: '#2f6fe4' },
          { name: 'Wellness', value: 25, color: '#22c55e' },
          { name: 'Business', value: 20, color: '#f59e0b' },
          { name: 'Creative', value: 12, color: '#8b5cf6' },
          { name: 'Other', value: 8, color: '#64748b' }
        ],
        revenueData: [
          { month: 'Jan', revenue: 2400, bookings: 65 },
          { month: 'Feb', revenue: 2800, bookings: 78 },
          { month: 'Mar', revenue: 3200, bookings: 90 },
          { month: 'Apr', revenue: 2900, bookings: 81 },
          { month: 'May', revenue: 3400, bookings: 95 },
          { month: 'Jun', revenue: 3600, bookings: 102 }
        ],
        topHosts: [
          { name: 'Sarah Chen', bookings: 45, revenue: 1800, rating: 4.9 },
          { name: 'Marcus Johnson', bookings: 38, revenue: 2280, rating: 4.8 },
          { name: 'Elena Rodriguez', bookings: 32, revenue: 1280, rating: 4.9 },
          { name: 'David Kim', bookings: 28, revenue: 1120, rating: 4.7 },
          { name: 'Lisa Wang', bookings: 25, revenue: 1250, rating: 4.8 }
        ]
      };

      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, change, icon: Icon, color }) => (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '4px' }}>
            {title}
          </p>
          <p style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
            {value}
          </p>
          <p style={{ 
            fontSize: '12px', 
            color: change > 0 ? '#22c55e' : '#ef4444',
            display: 'flex',
            alignItems: 'center'
          }}>
            <TrendingUp size={12} style={{ marginRight: '4px' }} />
            {change > 0 ? '+' : ''}{change}% vs last period
          </p>
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
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
            Analytics
          </h1>
          <p style={{ color: '#64748b' }}>
            Detailed insights into platform performance and user behavior
          </p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            backgroundColor: 'white'
          }}
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <StatCard
          title="Total Revenue"
          value="$18,240"
          change={12.5}
          icon={DollarSign}
          color="#22c55e"
        />
        <StatCard
          title="Total Bookings"
          value="511"
          change={8.2}
          icon={Calendar}
          color="#2f6fe4"
        />
        <StatCard
          title="Active Users"
          value="1,247"
          change={15.3}
          icon={Users}
          color="#f59e0b"
        />
        <StatCard
          title="Conversion Rate"
          value="3.2%"
          change={-2.1}
          icon={TrendingUp}
          color="#8b5cf6"
        />
      </div>

      {/* Charts Row 1 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">User Growth</h3>
            <p className="card-subtitle">Monthly user and host registration trends</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.userGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="users" 
                stroke="#2f6fe4" 
                strokeWidth={2}
                name="Users"
              />
              <Line 
                type="monotone" 
                dataKey="hosts" 
                stroke="#22c55e" 
                strokeWidth={2}
                name="Hosts"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Bookings by Category</h3>
            <p className="card-subtitle">Distribution of booking categories</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.bookingsByCategory}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {analyticsData.bookingsByCategory?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Revenue & Bookings</h3>
            <p className="card-subtitle">Monthly revenue and booking volume correlation</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Bar yAxisId="left" dataKey="revenue" fill="#2f6fe4" name="Revenue ($)" />
              <Bar yAxisId="right" dataKey="bookings" fill="#22c55e" name="Bookings" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Top Performing Hosts</h3>
            <p className="card-subtitle">Hosts with highest booking volume and revenue</p>
          </div>
          <div style={{ padding: '16px 0' }}>
            {analyticsData.topHosts?.map((host, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 0',
                borderBottom: index < analyticsData.topHosts.length - 1 ? '1px solid #e2e8f0' : 'none'
              }}>
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                    #{index + 1} {host.name}
                  </div>
                  <div style={{ fontSize: '14px', color: '#64748b' }}>
                    {host.bookings} bookings • ⭐ {host.rating}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '600', color: '#22c55e' }}>
                    ${host.revenue}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    revenue
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Platform Health Summary</h3>
          <p className="card-subtitle">Key performance indicators for platform health</p>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '24px',
          padding: '16px 0'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#2f6fe4', marginBottom: '4px' }}>
              94.2%
            </div>
            <div style={{ fontSize: '14px', color: '#64748b' }}>
              Host Approval Rate
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#22c55e', marginBottom: '4px' }}>
              4.8
            </div>
            <div style={{ fontSize: '14px', color: '#64748b' }}>
              Average Rating
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b', marginBottom: '4px' }}>
              2.1%
            </div>
            <div style={{ fontSize: '14px', color: '#64748b' }}>
              Dispute Rate
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#8b5cf6', marginBottom: '4px' }}>
              67%
            </div>
            <div style={{ fontSize: '14px', color: '#64748b' }}>
              Repeat Booking Rate
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
