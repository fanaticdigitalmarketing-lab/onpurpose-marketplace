import React, { useState, useEffect } from 'react';
import { Check, X, Eye, User, MapPin, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const HostApproval = () => {
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHost, setSelectedHost] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadPendingHosts();
  }, []);

  const loadPendingHosts = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockHosts = [
        {
          id: 1,
          name: 'Sarah Chen',
          email: 'sarah@example.com',
          title: 'Marketing Professional & Coffee Enthusiast',
          bio: 'I\'m a marketing professional with 8 years of experience in tech startups. I love connecting with people over great coffee and sharing insights about building brands and growing businesses. When I\'m not working, you can find me exploring NYC\'s coffee scene or planning my next adventure.',
          specialties: 'Brand strategy, startup growth, coffee culture, networking',
          offerings: 'Career mentorship, marketing advice, coffee shop tours, professional networking guidance',
          hourlyRate: 45,
          categories: ['mentorship', 'business', 'food_drink'],
          profilePhoto: 'https://via.placeholder.com/100',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
          status: 'pending'
        },
        {
          id: 2,
          name: 'Marcus Johnson',
          email: 'marcus@example.com',
          title: 'Wellness Coach & Meditation Teacher',
          bio: 'Former corporate executive turned wellness coach. I help busy professionals find balance and reduce stress through mindfulness practices. I\'ve been teaching meditation for 5 years and have helped hundreds of people develop sustainable wellness habits.',
          specialties: 'Stress management, meditation, work-life balance, mindfulness',
          offerings: 'Meditation sessions, wellness coaching, stress reduction techniques, mindfulness training',
          hourlyRate: 60,
          categories: ['wellness', 'mentorship'],
          profilePhoto: 'https://via.placeholder.com/100',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
          status: 'pending'
        }
      ];

      setHosts(mockHosts);
    } catch (error) {
      toast.error('Failed to load pending hosts');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (hostId) => {
    try {
      // await axios.post(`/api/admin/hosts/${hostId}/approve`);
      setHosts(hosts.filter(h => h.id !== hostId));
      toast.success('Host approved successfully');
    } catch (error) {
      toast.error('Failed to approve host');
    }
  };

  const handleReject = async (hostId) => {
    try {
      // await axios.post(`/api/admin/hosts/${hostId}/reject`);
      setHosts(hosts.filter(h => h.id !== hostId));
      toast.success('Host application rejected');
    } catch (error) {
      toast.error('Failed to reject host');
    }
  };

  const viewHostDetails = (host) => {
    setSelectedHost(host);
    setShowModal(true);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const HostModal = ({ host, onClose }) => {
    if (!host) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '32px',
          maxWidth: '600px',
          maxHeight: '80vh',
          overflow: 'auto',
          width: '90%'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>
              Host Application Details
            </h2>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
            >
              ×
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
            <img
              src={host.profilePhoto}
              alt={host.name}
              style={{ width: '80px', height: '80px', borderRadius: '40px', marginRight: '16px' }}
            />
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>{host.name}</h3>
              <p style={{ color: '#64748b', marginBottom: '4px' }}>{host.email}</p>
              <p style={{ color: '#64748b', fontSize: '14px' }}>Applied {formatDate(host.createdAt)}</p>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontWeight: '600', marginBottom: '8px' }}>Professional Title</h4>
            <p style={{ color: '#64748b' }}>{host.title}</p>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontWeight: '600', marginBottom: '8px' }}>Bio</h4>
            <p style={{ color: '#64748b', lineHeight: '1.6' }}>{host.bio}</p>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontWeight: '600', marginBottom: '8px' }}>Specialties</h4>
            <p style={{ color: '#64748b' }}>{host.specialties}</p>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontWeight: '600', marginBottom: '8px' }}>What They Offer</h4>
            <p style={{ color: '#64748b', lineHeight: '1.6' }}>{host.offerings}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div>
              <h4 style={{ fontWeight: '600', marginBottom: '8px' }}>Hourly Rate</h4>
              <p style={{ color: '#64748b' }}>${host.hourlyRate}/hour</p>
            </div>
            <div>
              <h4 style={{ fontWeight: '600', marginBottom: '8px' }}>Categories</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {host.categories.map((category) => (
                  <span
                    key={category}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#f1f5f9',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#64748b'
                    }}
                  >
                    {category.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => {
                handleReject(host.id);
                onClose();
              }}
              className="btn btn-danger"
            >
              <X size={16} />
              Reject
            </button>
            <button
              onClick={() => {
                handleApprove(host.id);
                onClose();
              }}
              className="btn btn-success"
            >
              <Check size={16} />
              Approve
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Loading pending host applications...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
          Host Approval
        </h1>
        <p style={{ color: '#64748b' }}>
          Review and approve new host applications ({hosts.length} pending)
        </p>
        {hosts.length > 0 && (
          <button
            onClick={() => {
              hosts.forEach(host => handleApprove(host.id));
            }}
            className="btn btn-success"
            style={{ marginTop: '16px' }}
          >
            <Check size={16} style={{ marginRight: '8px' }} />
            Approve All Hosts
          </button>
        )}
      </div>

      {hosts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <User size={48} color="#64748b" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ color: '#0f172a', marginBottom: '8px' }}>No Pending Applications</h3>
          <p style={{ color: '#64748b' }}>All host applications have been reviewed.</p>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Host</th>
                <th>Title</th>
                <th>Rate</th>
                <th>Applied</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {hosts.map((host) => (
                <tr key={host.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <img
                        src={host.profilePhoto}
                        alt={host.name}
                        style={{ width: '40px', height: '40px', borderRadius: '20px', marginRight: '12px' }}
                      />
                      <div>
                        <div style={{ fontWeight: '600' }}>{host.name}</div>
                        <div style={{ fontSize: '14px', color: '#64748b' }}>{host.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ maxWidth: '200px' }}>
                      <div style={{ fontWeight: '500', marginBottom: '4px' }}>{host.title}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {host.categories.join(', ')}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: '600' }}>${host.hourlyRate}/hr</span>
                  </td>
                  <td>
                    <span style={{ color: '#64748b' }}>{formatDate(host.createdAt)}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => viewHostDetails(host)}
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px' }}
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => handleApprove(host.id)}
                        className="btn btn-success"
                        style={{ padding: '6px 12px' }}
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => handleReject(host.id)}
                        className="btn btn-danger"
                        style={{ padding: '6px 12px' }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <HostModal
          host={selectedHost}
          onClose={() => {
            setShowModal(false);
            setSelectedHost(null);
          }}
        />
      )}
    </div>
  );
};

export default HostApproval;
