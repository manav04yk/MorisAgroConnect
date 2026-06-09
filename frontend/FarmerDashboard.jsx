// src/pages/FarmerDashboard.jsx
import React, { useState, useEffect } from 'react';
import FloatingChat from '../components/FloatingChat';
import Toast from '../components/Toast';

function FarmerDashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('inventory');
  const [toasts, setToasts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [orderRequests, setOrderRequests] = useState([]);
  const [revenue, setRevenue] = useState({ today: 0, week: 0, month: 0 });
  const [riskAlert, setRiskAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [farmerListings, setFarmerListings] = useState([]);
  
  // Form states for adding inventory
  const [newProduct, setNewProduct] = useState('');
  const [newQuantity, setNewQuantity] = useState('');
  const [newPrice, setNewPrice] = useState('');

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
    
    // Load saved inventory from localStorage
    const savedInventory = localStorage.getItem('farmerInventory');
    if (savedInventory) {
      setInventory(JSON.parse(savedInventory));
    } else {
      // Initial mock data
      const initialInventory = [
        { id: 1, product: 'Tomatoes', quantity: 500, price: 38, unit: 'kg', updated: '2024-01-15' },
        { id: 2, product: 'Lettuce', quantity: 200, price: 25, unit: 'kg', updated: '2024-01-14' },
        { id: 3, product: 'Carrots', quantity: 300, price: 20, unit: 'kg', updated: '2024-01-13' },
      ];
      setInventory(initialInventory);
      localStorage.setItem('farmerInventory', JSON.stringify(initialInventory));
    }
    
    fetchFarmerData();
    loadFarmerListings();
    
    // Only refresh non-inventory data every 10 seconds
    const interval = setInterval(refreshOrdersAndRevenue, 10000);
    return () => clearInterval(interval);
  }, []);

  // Save inventory to localStorage whenever it changes
  useEffect(() => {
    if (inventory.length > 0) {
      localStorage.setItem('farmerInventory', JSON.stringify(inventory));
    }
  }, [inventory]);

  const refreshOrdersAndRevenue = async () => {
    try {
      // Only refresh orders and revenue (not inventory)
      setOrderRequests([
        { id: 1, buyer: 'Le Meridien Hotel', product: 'Tomatoes', quantity: 100, offeredPrice: 38, status: 'pending' },
        { id: 2, buyer: 'Bel Ombre Resort', product: 'Lettuce', quantity: 50, offeredPrice: 25, status: 'pending' },
      ]);
      
      setRevenue({ today: 12500, week: 45800, month: 156700 });
      
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
      console.error('Error refreshing data:', error);
    }
  };

  const fetchFarmerData = async () => {
    try {
      setOrderRequests([
        { id: 1, buyer: 'Le Meridien Hotel', product: 'Tomatoes', quantity: 100, offeredPrice: 38, status: 'pending' },
        { id: 2, buyer: 'Bel Ombre Resort', product: 'Lettuce', quantity: 50, offeredPrice: 25, status: 'pending' },
      ]);
      
      setRevenue({ today: 12500, week: 45800, month: 156700 });
      
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

  const loadFarmerListings = () => {
    const listings = JSON.parse(localStorage.getItem('marketplaceListings') || '[]');
    const myListings = listings.filter(l => l.farmer === (user?.name || 'Farmer'));
    setFarmerListings(myListings);
  };

  const handleAddInventory = (e) => {
    e.preventDefault();
    
    if (!newProduct || !newQuantity || !newPrice) {
      addToast('Please fill in all fields', 'error');
      return;
    }
    
    const newProductItem = {
      id: Date.now(), // Use timestamp for unique ID
      product: newProduct,
      quantity: parseInt(newQuantity),
      price: parseInt(newPrice),
      unit: 'kg',
      updated: new Date().toISOString().split('T')[0]
    };
    
    setInventory(prev => [...prev, newProductItem]);
    addToast(`✅ Added ${newQuantity}kg of ${newProduct} at Rs ${newPrice}/kg`, 'success');
    
    setNewProduct('');
    setNewQuantity('');
    setNewPrice('');
  };

  const handleDeleteProduct = (productId, productName) => {
    setInventory(prev => prev.filter(item => item.id !== productId));
    addToast(`🗑️ ${productName} removed from inventory`, 'success');
  };

  const handleAcceptOrder = (orderId, product, quantity) => {
    setOrderRequests(orderRequests.filter(order => order.id !== orderId));
    addToast(`✅ Accepted order for ${quantity}kg of ${product}`, 'success');
  };

  const handleDeclineOrder = (orderId, product) => {
    setOrderRequests(orderRequests.filter(order => order.id !== orderId));
    addToast(`❌ Declined order for ${product}`, 'warning');
  };

  const addToMarketplace = () => {
    const productSelect = document.getElementById('surplusProduct');
    const quantity = document.getElementById('surplusQuantity')?.value;
    const discountPrice = document.getElementById('surplusDiscount')?.value;
    
    if (!productSelect?.value || !quantity || !discountPrice) {
      addToast('Please fill in all fields', 'error');
      return;
    }
    
    const selectedProduct = inventory.find(item => item.product === productSelect.value);
    
    if (!selectedProduct) {
      addToast('Product not found in inventory', 'error');
      return;
    }
    
    if (parseInt(quantity) > selectedProduct.quantity) {
      addToast(`Not enough ${selectedProduct.product} in inventory. Available: ${selectedProduct.quantity} kg`, 'error');
      return;
    }
    
    // Reduce inventory
    setInventory(prev => prev.map(item => 
      item.product === selectedProduct.product 
        ? { ...item, quantity: item.quantity - parseInt(quantity) }
        : item
    ));
    
    // Save to localStorage for Marketplace to read
    const existingListings = JSON.parse(localStorage.getItem('marketplaceListings') || '[]');
    const newListing = {
      id: Date.now(),
      farmer: user?.name || 'Farmer',
      farmerLocation: user?.location || 'Mauritius',
      product: selectedProduct.product,
      quantity: parseInt(quantity),
      originalPrice: selectedProduct.price,
      discountedPrice: parseInt(discountPrice),
      expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'available',
      reason: 'Farmer surplus'
    };
    
    existingListings.push(newListing);
    localStorage.setItem('marketplaceListings', JSON.stringify(existingListings));
    
    addToast(`✅ Listed ${quantity}kg of ${selectedProduct.product} on Marketplace at Rs ${discountPrice}/kg!`, 'success');
    loadFarmerListings();
    
    // Clear form
    document.getElementById('surplusQuantity').value = '';
    document.getElementById('surplusDiscount').value = '';
    productSelect.value = '';
  };

  const deleteMarketplaceListing = (listingId, productName) => {
    const existingListings = JSON.parse(localStorage.getItem('marketplaceListings') || '[]');
    const updatedListings = existingListings.filter(l => l.id !== listingId);
    localStorage.setItem('marketplaceListings', JSON.stringify(updatedListings));
    loadFarmerListings();
    addToast(`🗑️ ${productName} removed from Marketplace`, 'success');
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
              <h6 className="fw-bold">Welcome back,</h6>
              <p className="text-success fw-bold">{user?.name || 'Farmer'}</p>
              <hr />
              <nav className="nav flex-column">
                <button 
                  className={`nav-link text-dark ${activeTab === 'inventory' ? 'active fw-bold bg-success bg-opacity-10' : ''}`}
                  onClick={() => setActiveTab('inventory')}
                  style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
                >
                  🌾 Inventory
                </button>
                <button 
                  className={`nav-link text-dark ${activeTab === 'orders' ? 'active fw-bold bg-success bg-opacity-10' : ''}`}
                  onClick={() => setActiveTab('orders')}
                  style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
                >
                  📦 Orders
                </button>
                <button 
                  className={`nav-link text-dark ${activeTab === 'revenue' ? 'active fw-bold bg-success bg-opacity-10' : ''}`}
                  onClick={() => setActiveTab('revenue')}
                  style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
                >
                  💰 Revenue
                </button>
                <button 
                  className={`nav-link text-dark ${activeTab === 'alerts' ? 'active fw-bold bg-success bg-opacity-10' : ''}`}
                  onClick={() => setActiveTab('alerts')}
                  style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
                >
                  ⚠️ Alerts
                </button>
                <button 
                  className={`nav-link text-dark ${activeTab === 'waste' ? 'active fw-bold bg-success bg-opacity-10' : ''}`}
                  onClick={() => setActiveTab('waste')}
                  style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
                >
                  ♻️ List Surplus
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content based on Active Tab */}
        <div className="col-md-10 col-12">
          
          {/* INVENTORY TAB */}
          {activeTab === 'inventory' && (
            <>
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

              <div className="card">
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
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventory.map(item => (
                          <tr key={item.id}>
                            <td><strong>{item.product}</strong></td>
                            <td>{item.quantity}</td>
                            <td>Rs {item.price}</td>
                            <td>{item.updated}</td>
                            <td>
                              <button 
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDeleteProduct(item.id, item.product)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
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
                              onClick={() => handleAcceptOrder(order.id, order.product, order.quantity)}
                            >
                              Accept
                            </button>
                            <button 
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDeclineOrder(order.id, order.product)}
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
          )}

          {/* REVENUE TAB */}
          {activeTab === 'revenue' && (
            <div className="card">
              <div className="card-header bg-white">
                <h5 className="mb-0">💰 Revenue Summary</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <div className="card bg-info text-white">
                      <div className="card-body text-center">
                        <h6>Today's Revenue</h6>
                        <h3>Rs {revenue.today.toLocaleString()}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <div className="card bg-primary text-white">
                      <div className="card-body text-center">
                        <h6>This Week</h6>
                        <h3>Rs {revenue.week.toLocaleString()}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <div className="card bg-success text-white">
                      <div className="card-body text-center">
                        <h6>This Month</h6>
                        <h3>Rs {revenue.month.toLocaleString()}</h3>
                      </div>
                    </div>
                  </div>
                </div>
                
                <hr />
                
                <div className="alert alert-success">
                  <strong>📈 Performance Summary</strong><br />
                  You've sold <strong>{inventory.reduce((sum, item) => sum + (500 - item.quantity), 0)} kg</strong> of produce this month.<br />
                  Your top selling product is <strong>Tomatoes</strong> with 200 kg sold.
                </div>
              </div>
            </div>
          )}

          {/* ALERTS TAB */}
          {activeTab === 'alerts' && (
            <div className="card">
              <div className="card-header bg-white">
                <h5 className="mb-0">⚠️ Risk Alerts & Notifications</h5>
              </div>
              <div className="card-body">
                {riskAlert ? (
                  <div className="alert alert-warning">
                    <strong>🌪️ Cyclone {riskAlert.level}!</strong>
                    <p>{riskAlert.message}</p>
                    <small>Affected zone: {riskAlert.zone}</small>
                  </div>
                ) : (
                  <div className="alert alert-success">
                    <strong>✅ No active alerts</strong>
                    <p>All systems normal. No weather risks detected in your area.</p>
                  </div>
                )}
                
                <div className="mt-4">
                  <h6>📋 Alert History</h6>
                  <ul className="list-group">
                    <li className="list-group-item">✅ January 10, 2024 - Class 1 cyclone warning (Cleared)</li>
                    <li className="list-group-item">✅ December 5, 2023 - Heavy rain advisory (Cleared)</li>
                    <li className="list-group-item">⚠️ November 20, 2023 - Supply chain disruption (Resolved)</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* SURPLUS FOOD TAB */}
          {activeTab === 'waste' && (
            <div className="card">
              <div className="card-header bg-white">
                <h5 className="mb-0">♻️ List Surplus Food on Marketplace</h5>
              </div>
              <div className="card-body">
                <div className="alert alert-info">
                  <strong>💡 Help reduce food waste!</strong> List your surplus or near-expiry produce at discounted prices.
                  Buyers can reserve it directly from the Marketplace.
                </div>
                
                <form className="row g-3 mb-4">
                  <div className="col-md-4">
                    <select className="form-select" id="surplusProduct" required>
                      <option value="">Select Product</option>
                      {inventory.map(item => (
                        <option key={item.id} value={item.product}>{item.product} (Available: {item.quantity} kg)</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <input type="number" className="form-control" id="surplusQuantity" placeholder="Quantity (kg)" />
                  </div>
                  <div className="col-md-3">
                    <input type="number" className="form-control" id="surplusDiscount" placeholder="Discounted Price (Rs/kg)" />
                  </div>
                  <div className="col-md-2">
                    <button type="button" className="btn btn-success w-100" onClick={addToMarketplace}>
                      List on Marketplace
                    </button>
                  </div>
                </form>
                
                <hr />
                
                <h6>📋 My Marketplace Listings</h6>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Original Price</th>
                        <th>Discounted Price</th>
                        <th>Expiry Date</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {farmerListings.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="text-center text-muted">No listings yet. Add some surplus food above!</td>
                         </tr>
                      ) : (
                        farmerListings.map(listing => (
                          <tr key={listing.id}>
                            <td>{listing.product}</td>
                            <td>{listing.quantity} kg</td>
                            <td>Rs {listing.originalPrice}</td>
                            <td>Rs {listing.discountedPrice}</td>
                            <td>{listing.expiryDate}</td>
                            <td><span className="badge bg-success">Available</span></td>
                            <td>
                              <button 
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => deleteMarketplaceListing(listing.id, listing.product)}
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Floating AI Chat */}
      <FloatingChat currentPage="Farmer Dashboard" userRole="farmer" />
    </div>
  );
}

export default FarmerDashboard;
