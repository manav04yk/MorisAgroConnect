// src/pages/DeliveryDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FloatingChat from '../components/FloatingChat';
import Toast from '../components/Toast';
import api from '../utils/api';

function DeliveryDashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('deliveries');
  const [toasts, setToasts] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [driverStats, setDriverStats] = useState({
    completedToday: 0,
    totalDeliveries: 0,
    totalDistance: 0,
    rating: 5.0
  });

  const navigate = useNavigate();

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }
    
    const currentUser = JSON.parse(userStr);
    if (currentUser.role !== 'driver') {
      navigate('/');
      return;
    }
    
    setUser(currentUser);
    fetchDeliveries();
    loadDriverStats();
    
    const interval = setInterval(fetchDeliveries, 10000);
    return () => clearInterval(interval);
  }, [navigate]);

  const fetchDeliveries = async () => {
    try {
      const response = await api.get('/deliveries');
      const deliveriesData = Array.isArray(response.data) ? response.data : [];
      setDeliveries(deliveriesData);
      
      const completedToday = deliveriesData.filter(d => 
        d.status === 'delivered' && 
        new Date(d.updated_at).toDateString() === new Date().toDateString()
      ).length;
      
      const totalDeliveries = deliveriesData.filter(d => d.status === 'delivered').length;
      
      setDriverStats(prev => ({
        ...prev,
        completedToday,
        totalDeliveries
      }));
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      setDeliveries([]);
      setLoading(false);
    }
  };

  const loadDriverStats = () => {
    const savedStats = localStorage.getItem('driverStats');
    if (savedStats) {
      setDriverStats(JSON.parse(savedStats));
    }
  };

  const updateDeliveryStatus = async (deliveryId, newStatus) => {
    try {
      await api.patch(`/deliveries/${deliveryId}/status`, { status: newStatus });
      
      const statusMessages = {
        picked_up: '✅ Picked up! Customer notified.',
        in_transit: '🚚 In transit! ETA updated.',
        delivered: '🎉 Delivered! Order completed.'
      };
      
      addToast(statusMessages[newStatus] || 'Status updated', 'success');
      await fetchDeliveries();
      
    } catch (error) {
      console.error('Error updating delivery status:', error);
      addToast(error.response?.data?.error || 'Failed to update status', 'error');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      assigned: 'badge bg-secondary',
      picked_up: 'badge bg-info',
      in_transit: 'badge bg-warning',
      delivered: 'badge bg-success'
    };
    return badges[status] || 'badge bg-secondary';
  };

  const getStatusText = (status) => {
    const texts = {
      assigned: '📋 Assigned',
      picked_up: '📦 Picked Up',
      in_transit: '🚚 In Transit',
      delivered: '✅ Delivered'
    };
    return texts[status] || status;
  };

  const getNextAction = (status) => {
    const actions = {
      assigned: { text: 'Mark as Picked Up', nextStatus: 'picked_up', color: 'btn-primary' },
      picked_up: { text: 'Mark as In Transit', nextStatus: 'in_transit', color: 'btn-warning' },
      in_transit: { text: 'Mark as Delivered', nextStatus: 'delivered', color: 'btn-success' },
      delivered: { text: 'Completed', nextStatus: null, color: 'btn-secondary', disabled: true }
    };
    return actions[status] || actions.assigned;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const activeDeliveries = deliveries.filter(d => d.status !== 'delivered');
  const completedDeliveries = deliveries.filter(d => d.status === 'delivered');

  return (
    <div className="container-fluid mt-3 mb-5">
      {toasts.map(toast => (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
      ))}

      <div className="row">
        <div className="col-md-2 col-12 mb-3">
          <div className="card">
            <div className="card-body">
              <h6 className="fw-bold">Welcome,</h6>
              <p className="text-success fw-bold">{user?.name || 'Driver'}</p>
              <hr />
              <nav className="nav flex-column">
                <button 
                  className={`nav-link text-dark ${activeTab === 'deliveries' ? 'active fw-bold bg-success bg-opacity-10' : ''}`}
                  onClick={() => setActiveTab('deliveries')}
                  style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
                >
                  🚚 My Deliveries ({activeDeliveries.length})
                </button>
                <button 
                  className={`nav-link text-dark ${activeTab === 'stats' ? 'active fw-bold bg-success bg-opacity-10' : ''}`}
                  onClick={() => setActiveTab('stats')}
                  style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
                >
                  📊 My Stats
                </button>
              </nav>
            </div>
          </div>
        </div>

        <div className="col-md-10 col-12">
          <div className="mb-4">
            <h2 className="text-success">🚚 Delivery Dashboard</h2>
          </div>
          
          {activeTab === 'deliveries' && (
            <div className="card">
              <div className="card-header bg-white">
                <h5 className="mb-0">🚚 My Deliveries</h5>
                <small className="text-muted">
                  {activeDeliveries.length} active | {completedDeliveries.length} completed
                </small>
              </div>
              <div className="card-body">
                
                {activeDeliveries.length === 0 && completedDeliveries.length === 0 ? (
                  <div className="text-center py-5">
                    <div className="display-1">🚚</div>
                    <h5>No deliveries assigned</h5>
                    <p className="text-muted">
                      When Agent 6 (Logistics Agent) assigns you a delivery, it will appear here.
                    </p>
                  </div>
                ) : (
                  <>
                    {activeDeliveries.map(delivery => {
                      const nextAction = getNextAction(delivery.status);
                      return (
                        <div key={delivery.id} className="card mb-3 shadow-sm">
                          <div className="card-body">
                            <div className="row">
                              <div className="col-md-8">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <h6 className="mb-0">Order #{delivery.order_id}</h6>
                                  <span className={getStatusBadge(delivery.status)}>
                                    {getStatusText(delivery.status)}
                                  </span>
                                </div>
                                
                                <div className="row mt-3">
                                  <div className="col-md-6">
                                    <small className="text-muted">📦 Product</small>
                                    <p className="mb-2">{delivery.product_name} - {delivery.quantity_kg} kg</p>
                                    <small className="text-muted">🏪 Pickup From (Farmer)</small>
                                    <p className="mb-2">{delivery.farmer_name}<br /><small>{delivery.farmer_location}</small></p>
                                  </div>
                                  <div className="col-md-6">
                                    <small className="text-muted">🏨 Dropoff To (Buyer)</small>
                                    <p className="mb-2">{delivery.buyer_name}<br /><small>{delivery.buyer_location}</small></p>
                                    <small className="text-muted">📏 Distance</small>
                                    <p className="mb-2">{delivery.distance || 'Calculating...'}</p>
                                  </div>
                                </div>
                                
                                {delivery.route && (
                                  <div className="mt-2">
                                    <small className="text-muted">🗺️ Best Route</small>
                                    <p className="mb-0"><small>{delivery.route}</small></p>
                                  </div>
                                )}
                                
                                {delivery.status !== 'delivered' && delivery.eta && (
                                  <div className="mt-2">
                                    <small className="text-muted">⏱️ Estimated Time</small>
                                    <p className="mb-0 fw-bold text-success">{delivery.eta}</p>
                                  </div>
                                )}
                              </div>
                              
                              <div className="col-md-4 text-center d-flex flex-column justify-content-center">
                                {nextAction.nextStatus ? (
                                  <button
                                    className={`btn ${nextAction.color} btn-lg mb-2`}
                                    onClick={() => updateDeliveryStatus(delivery.id, nextAction.nextStatus)}
                                  >
                                    {nextAction.text}
                                  </button>
                                ) : (
                                  <div className="text-center">
                                    <div className="display-4">🎉</div>
                                    <p className="text-success fw-bold mt-2">Completed!</p>
                                  </div>
                                )}
                                
                                {delivery.status === 'in_transit' && (
                                  <div className="mt-2">
                                    <div className="progress">
                                      <div className="progress-bar bg-success progress-bar-striped progress-bar-animated" style={{ width: '65%' }}>
                                        65% Complete
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {completedDeliveries.length > 0 && (
                      <>
                        <hr className="my-4" />
                        <h6 className="mb-3">✅ Completed Deliveries</h6>
                        {completedDeliveries.map(delivery => (
                          <div key={delivery.id} className="alert alert-success">
                            <strong>Order #{delivery.order_id}</strong> - {delivery.product_name} - 
                            Delivered on {new Date(delivery.updated_at).toLocaleDateString()}
                          </div>
                        ))}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="card">
              <div className="card-header bg-white">
                <h5 className="mb-0">📊 Driver Performance Statistics</h5>
              </div>
              <div className="card-body">
                <div className="row mb-4">
                  <div className="col-md-3 mb-3">
                    <div className="card bg-success text-white text-center">
                      <div className="card-body">
                        <div className="display-4">{driverStats.completedToday}</div>
                        <div>Completed Today</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="card bg-primary text-white text-center">
                      <div className="card-body">
                        <div className="display-4">{driverStats.totalDeliveries}</div>
                        <div>Total Deliveries</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="card bg-info text-white text-center">
                      <div className="card-body">
                        <div className="display-4">{driverStats.totalDistance} km</div>
                        <div>Total Distance Driven</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="card bg-warning text-white text-center">
                      <div className="card-body">
                        <div className="display-4">{driverStats.rating} ⭐</div>
                        <div>Customer Rating</div>
                      </div>
                    </div>
                  </div>
                </div>

                <hr />

                <h6 className="mb-3">📋 Delivery History</h6>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Product</th>
                        <th>Buyer</th>
                        <th>Distance</th>
                        <th>Status</th>
                        <th>Completed Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deliveries.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center text-muted">No deliveries yet</td>
                        </tr>
                      ) : (
                        deliveries.map(delivery => (
                          <tr key={delivery.id}>
                            <td>{delivery.order_id}</td>
                            <td>{delivery.product_name}</td>
                            <td>{delivery.buyer_name}</td>
                            <td>{delivery.distance || 'N/A'}</td>
                            <td>
                              <span className={getStatusBadge(delivery.status)}>
                                {getStatusText(delivery.status)}
                              </span>
                            </td>
                            <td>{delivery.status === 'delivered' ? new Date(delivery.updated_at).toLocaleDateString() : '-'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <hr />

                <div className="alert alert-info mt-3">
                  <strong>💡 How Deliveries Work:</strong>
                  <ul className="mb-0 mt-2">
                    <li>Agent 6 (Logistics Agent) automatically assigns deliveries</li>
                    <li>Route and ETA are calculated by the Logistics Agent</li>
                    <li>Updating status notifies the buyer in real-time</li>
                    <li>Complete deliveries on time to maintain your 5-star rating</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <FloatingChat currentPage="Delivery Dashboard" userRole="driver" />
    </div>
  );
}

export default DeliveryDashboard;
