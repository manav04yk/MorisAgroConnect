// src/pages/DeliveryDashboard.jsx
import React, { useState, useEffect } from 'react';
import FloatingChat from '../components/FloatingChat';
import Toast from '../components/Toast';

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

  // Add toast notification
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  // Remove toast
  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
    
    loadDeliveries();
    loadDriverStats();
    
    // Refresh every 10 seconds (but keep saved statuses)
    const interval = setInterval(refreshDeliveriesOnly, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadDeliveries = () => {
    const savedDeliveries = localStorage.getItem('driverDeliveries');
    if (savedDeliveries) {
      setDeliveries(JSON.parse(savedDeliveries));
    } else {
      // Initial mock data
      const initialDeliveries = [
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
        },
        {
          id: 3,
          orderId: 'ORD-003',
          buyer: 'Lux Grand Gaube',
          buyerLocation: 'Grand Gaube',
          farmer: 'Jean-Pierre Farm',
          farmerLocation: 'Riviere du Rempart',
          product: 'Carrots',
          quantity: 75,
          status: 'in_transit',
          eta: '20 min',
          distance: '6 km',
          route: 'Coastal road'
        }
      ];
      setDeliveries(initialDeliveries);
      localStorage.setItem('driverDeliveries', JSON.stringify(initialDeliveries));
    }
    setLoading(false);
  };

  const saveDeliveries = (updatedDeliveries) => {
    setDeliveries(updatedDeliveries);
    localStorage.setItem('driverDeliveries', JSON.stringify(updatedDeliveries));
  };

  const refreshDeliveriesOnly = () => {
    const currentDeliveries = JSON.parse(localStorage.getItem('driverDeliveries') || '[]');
    if (currentDeliveries.length > 0) {
      setDeliveries(currentDeliveries);
    }
  };

  const loadDriverStats = () => {
    const savedStats = localStorage.getItem('driverStats');
    if (savedStats) {
      setDriverStats(JSON.parse(savedStats));
    }
  };

  const saveDriverStats = (stats) => {
    setDriverStats(stats);
    localStorage.setItem('driverStats', JSON.stringify(stats));
  };

  const updateDeliveryStatus = (deliveryId, newStatus) => {
    const updatedDeliveries = deliveries.map(delivery => 
      delivery.id === deliveryId 
        ? { ...delivery, status: newStatus }
        : delivery
    );
    
    saveDeliveries(updatedDeliveries);
    
    const statusMessages = {
      picked_up: '✅ Picked up! Customer notified.',
      in_transit: '🚚 In transit! ETA updated.',
      delivered: '🎉 Delivered! Order completed.'
    };
    
    addToast(statusMessages[newStatus], 'success');
    
    if (newStatus === 'delivered') {
      const updatedStats = {
        ...driverStats,
        completedToday: driverStats.completedToday + 1,
        totalDeliveries: driverStats.totalDeliveries + 1
      };
      saveDriverStats(updatedStats);
    }
  };

  const createNewDelivery = () => {
    const newDelivery = {
      id: Date.now(),
      orderId: document.getElementById('newOrderId')?.value || `ORD-${String(deliveries.length + 4).padStart(3, '0')}`,
      buyer: document.getElementById('newBuyer')?.value || 'New Buyer',
      buyerLocation: document.getElementById('newBuyerLocation')?.value || 'Unknown',
      farmer: document.getElementById('newFarmer')?.value || 'New Farmer',
      farmerLocation: document.getElementById('newFarmerLocation')?.value || 'Unknown',
      product: document.getElementById('newProduct')?.value || 'Unknown Product',
      quantity: parseInt(document.getElementById('newQuantity')?.value) || 50,
      status: 'assigned',
      eta: document.getElementById('newEta')?.value || '45 min',
      distance: document.getElementById('newDistance')?.value || '10 km',
      route: document.getElementById('newRoute')?.value || 'Standard route'
    };
    
    const updatedDeliveries = [...deliveries, newDelivery];
    saveDeliveries(updatedDeliveries);
    addToast(`✅ New delivery created for ${newDelivery.product}`, 'success');
    
    // Clear form
    resetForm();
    
    // Switch to deliveries tab
    setActiveTab('deliveries');
  };

  const resetForm = () => {
    const fields = ['newOrderId', 'newProduct', 'newQuantity', 'newDistance', 'newFarmer', 
                     'newFarmerLocation', 'newBuyer', 'newBuyerLocation', 'newRoute', 'newEta'];
    fields.forEach(field => {
      const element = document.getElementById(field);
      if (element) element.value = '';
    });
    addToast('Form cleared', 'info');
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
      {/* Toast Notifications */}
      {toasts.map(toast => (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
      ))}

      <div className="row">
        {/* Sidebar with Tabs */}
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
                  🚚 My Deliveries
                </button>
                <button 
                  className={`nav-link text-dark ${activeTab === 'create' ? 'active fw-bold bg-success bg-opacity-10' : ''}`}
                  onClick={() => setActiveTab('create')}
                  style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
                >
                  ➕ New Delivery
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

        {/* Main Content based on Active Tab */}
        <div className="col-md-10 col-12">
          
          {/* MY DELIVERIES TAB */}
          {activeTab === 'deliveries' && (
            <div className="card">
              <div className="card-header bg-white">
                <h5 className="mb-0">🚚 Today's Deliveries</h5>
                <small className="text-muted">You have {deliveries.filter(d => d.status !== 'delivered').length} active deliveries today</small>
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
                                
                                <small className="text-muted">🏪 Pickup From (Farmer)</small>
                                <p className="mb-2">{delivery.farmer}<br/><small>{delivery.farmerLocation}</small></p>
                              </div>
                              
                              <div className="col-md-6">
                                <small className="text-muted">🏨 Dropoff To (Buyer)</small>
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
                
                {deliveries.filter(d => d.status !== 'delivered').length === 0 && (
                  <div className="text-center py-5">
                    <div className="display-1">🎉</div>
                    <h5>All deliveries completed!</h5>
                    <p className="text-muted">Great job! Check back later for new deliveries.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CREATE NEW DELIVERY TAB */}
          {activeTab === 'create' && (
            <div className="card">
              <div className="card-header bg-white">
                <h5 className="mb-0">➕ Create New Test Delivery</h5>
              </div>
              <div className="card-body">
                <div className="alert alert-info">
                  <strong>📌 For Testing Only:</strong> In the real system, deliveries are automatically created by Agent 6 (Logistics Agent).
                  This form is for demo purposes to show how deliveries work.
                </div>
                
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label">Order ID</label>
                    <input type="text" className="form-control" id="newOrderId" placeholder="e.g., ORD-004" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Product</label>
                    <input type="text" className="form-control" id="newProduct" placeholder="e.g., Eggplant" />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Quantity (kg)</label>
                    <input type="number" className="form-control" id="newQuantity" placeholder="50" />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Distance</label>
                    <input type="text" className="form-control" id="newDistance" placeholder="e.g., 15 km" />
                  </div>
                  
                  <div className="col-md-4">
                    <label className="form-label">Farmer Name</label>
                    <input type="text" className="form-control" id="newFarmer" placeholder="e.g., Jean-Pierre Farm" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Farmer Location</label>
                    <input type="text" className="form-control" id="newFarmerLocation" placeholder="e.g., Riviere du Rempart" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Buyer Name</label>
                    <input type="text" className="form-control" id="newBuyer" placeholder="e.g., Le Meridien Hotel" />
                  </div>
                  
                  <div className="col-md-4">
                    <label className="form-label">Buyer Location</label>
                    <input type="text" className="form-control" id="newBuyerLocation" placeholder="e.g., Pointe aux Piments" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Route</label>
                    <input type="text" className="form-control" id="newRoute" placeholder="e.g., A2 highway" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">ETA</label>
                    <input type="text" className="form-control" id="newEta" placeholder="e.g., 30 min" />
                  </div>
                  
                  <div className="col-12">
                    <button type="button" className="btn btn-success" onClick={createNewDelivery}>
                      ➕ Create Delivery
                    </button>
                    <button type="button" className="btn btn-secondary ms-2" onClick={resetForm}>
                      Reset Form
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MY STATS TAB */}
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
                        <th>Completed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deliveries.map(delivery => (
                        <tr key={delivery.id}>
                          <td>{delivery.orderId}</td>
                          <td>{delivery.product}</td>
                          <td>{delivery.buyer}</td>
                          <td>{delivery.distance}</td>
                          <td>
                            <span className={getStatusBadge(delivery.status)}>
                              {getStatusText(delivery.status)}
                            </span>
                          </td>
                          <td>{delivery.status === 'delivered' ? '✅ Yes' : '⏳ Pending'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <hr />

                <div className="alert alert-info mt-3">
                  <strong>💡 Performance Tip:</strong> Complete deliveries on time to maintain a 5-star rating. 
                  The Logistics Agent optimizes your route to save time and fuel.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Floating AI Chat */}
      <FloatingChat currentPage="Delivery Dashboard" userRole="driver" />
    </div>
  );
}

export default DeliveryDashboard;
