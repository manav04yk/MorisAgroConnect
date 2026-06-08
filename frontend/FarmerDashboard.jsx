// src/pages/FarmerDashboard.jsx
import React, { useState, useEffect } from 'react';
import FloatingChat from '../components/FloatingChat';

function FarmerDashboard() {
  const [user, setUser] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [orderRequests, setOrderRequests] = useState([]);
  const [revenue, setRevenue] = useState({ today: 0, week: 0, month: 0 });
  const [riskAlert, setRiskAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Form states for adding inventory
  const [newProduct, setNewProduct] = useState('');
  const [newQuantity, setNewQuantity] = useState('');
  const [newPrice, setNewPrice] = useState('');

  useEffect(() => {
    // Get user from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
    fetchFarmerData();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchFarmerData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchFarmerData = async () => {
    try {
      // Mock data - will be replaced with real API calls
      setInventory([
        { id: 1, product: 'Tomatoes', quantity: 500, price: 38, unit: 'kg', updated: '2024-01-15' },
        { id: 2, product: 'Lettuce', quantity: 200, price: 25, unit: 'kg', updated: '2024-01-14' },
        { id: 3, product: 'Carrots', quantity: 300, price: 20, unit: 'kg', updated: '2024-01-13' },
      ]);
      
      setOrderRequests([
        { id: 1, buyer: 'Le Meridien Hotel', product: 'Tomatoes', quantity: 100, offeredPrice: 38, status: 'pending' },
        { id: 2, buyer: 'Bel Ombre Resort', product: 'Lettuce', quantity: 50, offeredPrice: 25, status: 'pending' },
      ]);
      
      setRevenue({ today: 12500, week: 45800, month: 156700 });
      
      // Mock cyclone alert (sometimes show for demo)
      if (Math.random() > 0.7) {
        setRiskAlert({
          level: 'Class 2 Warning',
          zone: 'North Mauritius',
          message: 'Cyclone approaching. Consider early harvest.',
        });
      } else {
        setRiskAlert(null);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching farmer data:', error);
    }
  };

  const handleAddInventory = async (e) => {
    e.preventDefault();
    alert(`✅ Added ${newQuantity}kg of ${newProduct} at Rs ${newPrice}/kg`);
    setNewProduct('');
    setNewQuantity('');
    setNewPrice('');
    fetchFarmerData(); // Refresh
  };

  const handleAcceptOrder = (orderId) => {
    alert(`✅ Order ${orderId} accepted! Buyer will be notified.`);
  };

  const handleDeclineOrder = (orderId) => {
    alert(`❌ Order ${orderId} declined.`);
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
              <h6 className="fw-bold">Welcome back,</h6>
              <p className="text-success fw-bold">{user?.name || 'Farmer'}</p>
              <hr />
              <nav className="nav flex-column">
                <a className="nav-link text-dark active" href="#">
                  🌾 Inventory
                </a>
                <a className="nav-link text-dark" href="#">
                  📦 Orders
                </a>
                <a className="nav-link text-dark" href="#">
                  💰 Revenue
                </a>
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-10 col-12">
          {/* Revenue Summary Cards */}
          <div className="row mb-4">
            <div className="col-md-4 mb-3">
              <div className="card bg-info text-white">
                <div className="card-body">
                  <h6>Today's Revenue</h6>
                  <h3>Rs {revenue.today.toLocaleString()}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card bg-primary text-white">
                <div className="card-body">
                  <h6>This Week</h6>
                  <h3>Rs {revenue.week.toLocaleString()}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card bg-success text-white">
                <div className="card-body">
                  <h6>This Month</h6>
                  <h3>Rs {revenue.month.toLocaleString()}</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Cyclone Risk Alert */}
          {riskAlert && (
            <div className="alert alert-warning alert-dismissible fade show" role="alert">
              <strong>🌪️ Cyclone {riskAlert.level}!</strong> {riskAlert.message}
              <br />
              <small>Affected zone: {riskAlert.zone}</small>
              <button type="button" className="btn-close" data-bs-dismiss="alert"></button>
            </div>
          )}

          {/* Add Inventory Form */}
          <div className="card mb-4">
            <div className="card-header bg-white">
              <h5 className="mb-0">➕ Add New Product to Inventory</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleAddInventory} className="row g-3">
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Product name"
                    value={newProduct}
                    onChange={(e) => setNewProduct(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-3">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Quantity (kg)"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-3">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Price per kg (Rs)"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-2">
                  <button type="submit" className="btn btn-success w-100">
                    Add Product
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="card mb-4">
            <div className="card-header bg-white">
              <h5 className="mb-0">📋 My Inventory</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity (kg)</th>
                      <th>Price/kg (Rs)</th>
                      <th>Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map(item => (
                      <tr key={item.id}>
                        <td><strong>{item.product}</strong></td>
                        <td>{item.quantity}</td>
                        <td>Rs {item.price}</td>
                        <td>{item.updated}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Order Requests */}
          <div className="card">
            <div className="card-header bg-white">
              <h5 className="mb-0">📦 Pending Order Requests</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Buyer</th>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Offered Price</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderRequests.map(order => (
                      <tr key={order.id}>
                        <td>{order.buyer}</td>
                        <td>{order.product}</td>
                        <td>{order.quantity} kg</td>
                        <td>Rs {order.offeredPrice}/kg</td>
                        <td>
                          <button 
                            className="btn btn-sm btn-success me-2"
                            onClick={() => handleAcceptOrder(order.id)}
                          >
                            Accept
                          </button>
                          <button 
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeclineOrder(order.id)}
                          >
                            Decline
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
            {/* Floating AI Chat - Required on EVERY page (page 6) */}
            <FloatingChat currentPage="Buyer Dashboard" userRole="buyer" />
    </div>
  );
}

export default FarmerDashboard;