import React, { useState, useEffect } from 'react';
import { AlertTriangle, MessageSquare, Clock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const DisputeManagement = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadDisputes();
  }, []);

  const loadDisputes = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockDisputes = [
        {
          id: 1,
          bookingId: 'BK-001',
          guest: { name: 'John Doe', email: 'john@example.com' },
          host: { name: 'Sarah Chen', email: 'sarah@example.com' },
          type: 'payment',
          status: 'open',
          priority: 'high',
          description: 'Payment was charged but session was cancelled by host last minute',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
          messages: [
            {
              from: 'guest',
              message: 'I was charged $45 but Sarah cancelled 30 minutes before our session',
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2)
            }
          ]
        },
        {
          id: 2,
          bookingId: 'BK-002',
          guest: { name: 'Emily Wilson', email: 'emily@example.com' },
          host: { name: 'Marcus Johnson', email: 'marcus@example.com' },
          type: 'service',
          status: 'investigating',
          priority: 'medium',
          description: 'Host did not show up for scheduled wellness session',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
          messages: [
            {
              from: 'guest',
              message: 'Marcus never showed up for our meditation session yesterday',
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1)
            },
            {
              from: 'admin',
              message: 'We are investigating this issue and will contact the host',
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12)
            }
          ]
        }
      ];

      setDisputes(mockDisputes);
    } catch (error) {
      toast.error('Failed to load disputes');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (disputeId, resolution) => {
    try {
      // await axios.post(`/api/admin/disputes/${disputeId}/resolve`, { resolution });
      setDisputes(disputes.map(d => 
        d.id === disputeId ? { ...d, status: 'resolved' } : d
      ));
      toast.success('Dispute resolved successfully');
    } catch (error) {
      toast.error('Failed to resolve dispute');
    }
  };

  const viewDisputeDetails = (dispute) => {
    setSelectedDispute(dispute);
    setShowModal(true);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return '#ef4444';
      case 'investigating': return '#f59e0b';
      case 'resolved': return '#22c55e';
      default: return '#64748b';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#22c55e';
      default: return '#64748b';
    }
  };

  const DisputeModal = ({ dispute, onClose }) => {
    const [newMessage, setNewMessage] = useState('');
    
    if (!dispute) return null;

    const handleSendMessage = () => {
      if (!newMessage.trim()) return;
      
      // Add message logic here
      toast.success('Message sent');
      setNewMessage('');
    };

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
          maxWidth: '700px',
          maxHeight: '80vh',
          overflow: 'auto',
          width: '90%'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>
              Dispute #{dispute.id}
            </h2>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
            >
              ×
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div>
              <h4 style={{ fontWeight: '600', marginBottom: '8px' }}>Guest</h4>
              <p style={{ color: '#64748b' }}>{dispute.guest.name}</p>
              <p style={{ color: '#64748b', fontSize: '14px' }}>{dispute.guest.email}</p>
            </div>
            <div>
              <h4 style={{ fontWeight: '600', marginBottom: '8px' }}>Host</h4>
              <p style={{ color: '#64748b' }}>{dispute.host.name}</p>
              <p style={{ color: '#64748b', fontSize: '14px' }}>{dispute.host.email}</p>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontWeight: '600', marginBottom: '8px' }}>Description</h4>
            <p style={{ color: '#64748b', lineHeight: '1.6' }}>{dispute.description}</p>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontWeight: '600', marginBottom: '16px' }}>Messages</h4>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {dispute.messages.map((msg, index) => (
                <div key={index} style={{
                  padding: '12px',
                  backgroundColor: msg.from === 'admin' ? '#f1f5f9' : '#fef7f0',
                  borderRadius: '8px',
                  marginBottom: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '600', fontSize: '14px' }}>
                      {msg.from === 'admin' ? 'Admin' : msg.from === 'guest' ? dispute.guest.name : dispute.host.name}
                    </span>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      {formatDate(msg.timestamp)}
                    </span>
                  </div>
                  <p style={{ color: '#64748b', fontSize: '14px' }}>{msg.message}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontWeight: '600', marginBottom: '8px' }}>Send Message</h4>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your response..."
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                minHeight: '80px',
                resize: 'vertical'
              }}
            />
            <button
              onClick={handleSendMessage}
              className="btn btn-primary"
              style={{ marginTop: '8px' }}
            >
              <MessageSquare size={16} />
              Send Message
            </button>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => {
                handleResolve(dispute.id, 'refund_guest');
                onClose();
              }}
              className="btn btn-success"
            >
              Refund Guest
            </button>
            <button
              onClick={() => {
                handleResolve(dispute.id, 'favor_host');
                onClose();
              }}
              className="btn btn-secondary"
            >
              Favor Host
            </button>
            <button
              onClick={() => {
                handleResolve(dispute.id, 'partial_refund');
                onClose();
              }}
              className="btn btn-primary"
            >
              Partial Refund
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Loading disputes...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
          Dispute Management
        </h1>
        <p style={{ color: '#64748b' }}>
          Handle disputes between guests and hosts ({disputes.filter(d => d.status !== 'resolved').length} active)
        </p>
      </div>

      {disputes.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <CheckCircle size={48} color="#22c55e" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ color: '#0f172a', marginBottom: '8px' }}>No Active Disputes</h3>
          <p style={{ color: '#64748b' }}>All disputes have been resolved.</p>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Dispute</th>
                <th>Parties</th>
                <th>Type</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {disputes.map((dispute) => (
                <tr key={dispute.id}>
                  <td>
                    <div>
                      <div style={{ fontWeight: '600' }}>#{dispute.id}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        Booking: {dispute.bookingId}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '14px' }}>
                      <div><strong>Guest:</strong> {dispute.guest.name}</div>
                      <div><strong>Host:</strong> {dispute.host.name}</div>
                    </div>
                  </td>
                  <td>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      backgroundColor: '#f1f5f9',
                      color: '#64748b'
                    }}>
                      {dispute.type}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: `${getStatusColor(dispute.status)}20`,
                      color: getStatusColor(dispute.status)
                    }}>
                      {dispute.status}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: `${getPriorityColor(dispute.priority)}20`,
                      color: getPriorityColor(dispute.priority)
                    }}>
                      {dispute.priority}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: '#64748b', fontSize: '14px' }}>
                      {formatDate(dispute.createdAt)}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => viewDisputeDetails(dispute)}
                      className="btn btn-primary"
                      style={{ padding: '6px 12px' }}
                    >
                      <MessageSquare size={14} />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <DisputeModal
          dispute={selectedDispute}
          onClose={() => {
            setShowModal(false);
            setSelectedDispute(null);
          }}
        />
      )}
    </div>
  );
};

export default DisputeManagement;
