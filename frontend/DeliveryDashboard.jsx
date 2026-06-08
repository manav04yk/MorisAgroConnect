// src/pages/DeliveryDashboard.jsx
import React, { useState, useEffect } from 'react';
import FloatingChat from '../components/FloatingChat';

function DeliveryDashboard() {
  const [user, setUser] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState(null);

  useEffect(() => {
    // Get user from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
    fetchDeliveries();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchDeliveries, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchDeliveries = async () => {
    try {
      // Mock data - will be replaced with real API call to /api/deliveries
      setDeliveries([
        {
          id: 1,
          orderId: 'ORD-001',
          buyer: 'Le Meridien Hotel',
          buyerLocation: 'Pointe aux Piments',
          farmer: 'Jean-Pierre Farm',
          farmerLocation: 'Riviere du Rempart',
          product: 'Tomatoes',
          quantity: 100,
          status: 'assigned',
          eta: '45 min',
          distance: '12 km',
          route: 'A2 highway then coastal road'
        },
        {
          id: 2,
          orderId: 'ORD-002',
          buyer: 'Bel Ombre Resort',
          buyerLocation: 'Bel Ombre',
          farmer: 'Green Farms MU',
          farmerLocation: 'Curepipe',
          product: 'Lettuce',
          quantity: 50,
          status: 'picked_up',
          eta: '30 min',
          distance: '8 km',
          route: 'M1 highway'
        }
      ]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
    }
  };

  const updateDeliveryStatus = async (deliveryId, newStatus) => {
    try {
      // TODO: Replace with real API call
      // await api.patch(`/api/deliveries/${deliveryId}/status`, { status: newStatus });
      
      // Update local state
      setDeliveries(deliveries.map(delivery => 
        delivery.id === deliveryId 
          ? { ...delivery, status: newStatus }
          : delivery
      ));
      
      // Show appropriate message
      const statusMessages = {
        picked_up: '✅ Picked up! Customer notified.',
        in_transit: '🚚 In transit! ETA updated.',
        delivered: '🎉 Delivered! Order completed.'
      };
      
      alert(statusMessages[newStatus] || `Status updated to ${newStatus}`);
      
      // Refresh after 2 seconds
      setTimeout(fetchDeliveries, 2000);
    } catch (error) {
      console.error('Error updating delivery:', error);
      alert('Failed to update status. Please try again.');
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
    return actions[status];
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

  return (
    <div className="container-fluid mt-3 mb-5">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-2 col-12 mb-3">
          <div className="card">
            <div className="card-body">
              <h6 className="fw-bold">Welcome,</h6>
              <p className="text-success fw-bold">{user?.name || 'Driver'}</p>
              <hr />
              <nav className="nav flex-column">
                <a className="nav-link text-dark active" href="#">
                  🚚 My Deliveries
                </a>
                <a className="nav-link text-dark" href="#">
                  📍 Route Map
                </a>
                <a className="nav-link text-dark" href="#">
                  📊 My Stats
                </a>
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-10 col-12">
          <div className="card mb-4">
            <div className="card-header bg-white">
              <h5 className="mb-0">🚚 Today's Deliveries</h5>
              <small className="text-muted">You have {deliveries.length} deliveries today</small>
            </div>
            <div className="card-body">
              {deliveries.map(delivery => {
                const nextAction = getNextAction(delivery.status);
                return (
                  <div key={delivery.id} className="card mb-3 shadow-sm">
                    <div className="card-body">
                      <div className="row">
                        {/* Delivery Info */}
                        <div className="col-md-8">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h6 className="mb-0">Order #{delivery.orderId}</h6>
                            <span className={getStatusBadge(delivery.status)}>
                              {getStatusText(delivery.status)}
                            </span>
                          </div>
                          
                          <div className="row mt-3">
                            <div className="col-md-6">
                              <small className="text-muted">📦 Product</small>
                              <p className="mb-2">{delivery.product} - {delivery.quantity} kg</p>
                              
                              <small className="text-muted">🏪 From (Farmer)</small>
                              <p className="mb-2">{delivery.farmer}<br/><small>{delivery.farmerLocation}</small></p>
                            </div>
                            
                            <div className="col-md-6">
                              <small className="text-muted">🏨 To (Buyer)</small>
                              <p className="mb-2">{delivery.buyer}<br/><small>{delivery.buyerLocation}</small></p>
                              
                              <small className="text-muted">📏 Distance</small>
                              <p className="mb-2">{delivery.distance}</p>
                            </div>
                          </div>
                          
                          <div className="mt-2">
                            <small className="text-muted">🗺️ Best Route</small>
                            <p className="mb-0"><small>{delivery.route}</small></p>
                          </div>
                          
                          {delivery.status !== 'delivered' && (
                            <div className="mt-2">
                              <small className="text-muted">⏱️ Estimated Time</small>
                              <p className="mb-0 fw-bold text-success">{delivery.eta}</p>
                            </div>
                          )}
                        </div>
                        
                        {/* Action Button */}
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
                          
                          {/* ETA Progress Bar for in-transit */}
                          {delivery.status === 'in_transit' && (
                            <div className="mt-2">
                              <div className="progress">
                                <div className="progress-bar bg-success progress-bar-striped progress-bar-animated" 
                                     style={{ width: '65%' }}>
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
              
              {deliveries.length === 0 && (
                <div className="text-center py-5">
                  <div className="display-1">🚚</div>
                  <h5>No deliveries assigned</h5>
                  <p className="text-muted">Check back later for new deliveries</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Delivery Tips Card */}
          <div className="card bg-light">
            <div className="card-body">
              <h6 className="mb-2">💡 Delivery Tips</h6>
              <ul className="small mb-0">
                <li>Always confirm pickup with farmer before marking "Picked Up"</li>
                <li>Use the shortest route suggested by our Logistics Agent</li>
                <li>Call buyer 10 minutes before arrival</li>
                <li>Mark "Delivered" only after buyer confirms receipt</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating AI Chat */}
      <FloatingChat currentPage="Delivery Dashboard" userRole="driver" />
    </div>
  );
}

export default DeliveryDashboard;