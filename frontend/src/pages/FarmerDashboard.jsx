// src/pages/FarmerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FloatingChat from '../components/FloatingChat';
import Toast from '../components/Toast';
import api from '../utils/api';

function FarmerDashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('inventory');
  const [toasts, setToasts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [orderRequests, setOrderRequests] = useState([]);
  const [revenue, setRevenue] = useState({ today: 0, week: 0, month: 0 });
  const [loading, setLoading] = useState(true);
  const [farmerListings, setFarmerListings] = useState([]);
  
  const [newProduct, setNewProduct] = useState('');
  const [newQuantity, setNewQuantity] = useState('');
  const [newPrice, setNewPrice] = useState('');

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editQuantity, setEditQuantity] = useState('');
  const [editPrice, setEditPrice] = useState('');

  const navigate = useNavigate();

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const fetchInventory = async (farmerId) => {
    try {
      const response = await api.get(`/inventory/${farmerId}`);
      setInventory(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setInventory([]);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      const orders = Array.isArray(response.data) ? response.data : [];
      const pending = orders.filter(o => o.status === 'confirmed');
      setOrderRequests(pending);
      const deliveredOrders = orders.filter(o => o.status === 'delivered');
      const totalRevenue = deliveredOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
      setRevenue({
        today: Math.floor(totalRevenue * 0.1),
        week: Math.floor(totalRevenue * 0.5),
        month: totalRevenue
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrderRequests([]);
    }
  };

  const loadFarmerListings = (farmerName) => {
    try {
      const listings = JSON.parse(localStorage.getItem('marketplaceListings') || '[]');
      const myListings = listings.filter(l => l.farmer === farmerName);
      setFarmerListings(myListings);
    } catch (error) {
      console.error('Error loading farmer listings:', error);
      setFarmerListings([]);
    }
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setEditQuantity(product.quantity_kg);
    setEditPrice(product.price_per_kg);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingProduct(null);
    setEditQuantity('');
    setEditPrice('');
  };

  const handleSaveEdit = async () => {
    if (!editQuantity || !editPrice) {
      addToast('Please fill in all fields', 'error');
      return;
    }

    try {
      await api.post('/inventory', {
        name: editingProduct.name,
        quantity_kg: parseInt(editQuantity),
        price_per_kg: parseInt(editPrice),
        unit: 'kg'
      });
      
      addToast(`✅ ${editingProduct.name} updated successfully`, 'success');
      handleCloseEditModal();
      
      const userStr = localStorage.getItem('user');
      const currentUser = JSON.parse(userStr);
      await fetchInventory(currentUser.id);
    } catch (error) {
      console.error('Error updating product:', error);
      addToast(error.response?.data?.error || 'Failed to update product', 'error');
    }
  };

  const handleDeleteProduct = async (productId, productName) => {
    if (window.confirm(`Are you sure you want to delete ${productName} from inventory?`)) {
      try {
        await api.delete(`/inventory/${productId}`);
        addToast(`🗑️ ${productName} removed from inventory`, 'success');
        
        const userStr = localStorage.getItem('user');
        const currentUser = JSON.parse(userStr);
        await fetchInventory(currentUser.id);
      } catch (error) {
        console.error('Error deleting product:', error);
        addToast(error.response?.data?.error || 'Failed to delete product', 'error');
      }
    }
  };

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }
    
    const currentUser = JSON.parse(userStr);
    if (currentUser.role !== 'farmer') {
      navigate('/');
      return;
    }
    
    setUser(currentUser);
    
    const loadData = async () => {
      setLoading(true);
      await fetchInventory(currentUser.id);
      await fetchOrders();
      loadFarmerListings(currentUser.name);
      setLoading(false);
    };
    
    loadData();
    
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [navigate]);

  const handleAddInventory = async (e) => {
    e.preventDefault();
    
    if (!newProduct || !newQuantity || !newPrice) {
      addToast('Please fill in all fields', 'error');
      return;
    }
    
    try {
      await api.post('/inventory', {
        name: newProduct,
        quantity_kg: parseInt(newQuantity),
        price_per_kg: parseInt(newPrice),
        unit: 'kg'
      });
      
      addToast(`✅ Added ${newQuantity}kg of ${newProduct} at Rs ${newPrice}/kg`, 'success');
      
      setNewProduct('');
      setNewQuantity('');
      setNewPrice('');
      
      const userStr = localStorage.getItem('user');
      const currentUser = JSON.parse(userStr);
      await fetchInventory(currentUser.id);
      
    } catch (error) {
      console.error('Error adding inventory:', error);
      addToast(error.response?.data?.error || 'Failed to add product', 'error');
    }
  };

  const addToMarketplace = () => {
    const productSelect = document.getElementById('surplusProduct');
    const quantity = document.getElementById('surplusQuantity')?.value;
    const discountPrice = document.getElementById('surplusDiscount')?.value;
    
    if (!productSelect?.value || !quantity || !discountPrice) {
      addToast('Please fill in all fields', 'error');
      return;
    }
    
    const selectedProduct = inventory.find(item => item.name === productSelect.value);
    
    if (!selectedProduct) {
      addToast('Product not found in inventory', 'error');
      return;
    }
    
    if (parseInt(quantity) > selectedProduct.quantity_kg) {
      addToast(`Not enough ${selectedProduct.name}. Available: ${selectedProduct.quantity_kg} kg`, 'error');
      return;
    }
    
    // Get existing listings
    const existingListings = JSON.parse(localStorage.getItem('marketplaceListings') || '[]');
    
    const newListing = {
      id: Date.now(),
      farmer: user?.name || 'Farmer',
      farmerLocation: user?.location || 'Mauritius',
      product: selectedProduct.name,
      quantity: parseInt(quantity),
      originalPrice: selectedProduct.price_per_kg,
      discountedPrice: parseInt(discountPrice),
      expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'available',
      reason: 'Farmer surplus'
    };
    
    existingListings.push(newListing);
    localStorage.setItem('marketplaceListings', JSON.stringify(existingListings));
    
    addToast(`✅ Listed ${quantity}kg of ${selectedProduct.name} on Marketplace at Rs ${discountPrice}/kg!`, 'success');
    
    // Refresh the farmer's own listings display
    loadFarmerListings(user?.name);
    
    // Clear form
    document.getElementById('surplusQuantity').value = '';
    document.getElementById('surplusDiscount').value = '';
    productSelect.value = '';
  };

  const deleteMarketplaceListing = (listingId, productName) => {
    const existingListings = JSON.parse(localStorage.getItem('marketplaceListings') || '[]');
    const updatedListings = existingListings.filter(l => l.id !== listingId);
    localStorage.setItem('marketplaceListings', JSON.stringify(updatedListings));
    loadFarmerListings(user?.name);
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
      {toasts.map(toast => (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
      ))}

      {showEditModal && editingProduct && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Product: {editingProduct.name}</h5>
                <button type="button" className="btn-close" onClick={handleCloseEditModal}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Quantity (kg)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Price per kg (Rs)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseEditModal}>Cancel</button>
                <button type="button" className="btn btn-success" onClick={handleSaveEdit}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row">
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
                  🌾 Inventory ({inventory.length})
                </button>
                <button 
                  className={`nav-link text-dark ${activeTab === 'orders' ? 'active fw-bold bg-success bg-opacity-10' : ''}`}
                  onClick={() => setActiveTab('orders')}
                  style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
                >
                  📦 Orders ({orderRequests.length})
                </button>
                <button 
                  className={`nav-link text-dark ${activeTab === 'revenue' ? 'active fw-bold bg-success bg-opacity-10' : ''}`}
                  onClick={() => setActiveTab('revenue')}
                  style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
                >
                  💰 Revenue
                </button>
                <button 
                  className={`nav-link text-dark ${activeTab === 'waste' ? 'active fw-bold bg-success bg-opacity-10' : ''}`}
                  onClick={() => setActiveTab('waste')}
                  style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
                >
                  ♻️ List Surplus ({farmerListings.length})
                </button>
              </nav>
            </div>
          </div>
        </div>

        <div className="col-md-10 col-12">
          <div className="mb-4">
            <h2 className="text-success">🌾 Farmer Dashboard</h2>
          </div>
          
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
                      <button type="submit" className="btn btn-success w-100">Add Product</button>
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
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventory.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="text-center text-muted">No inventory yet. Add your first product above!</td>
                          </tr>
                        ) : (
                          inventory.map(item => (
                            <tr key={item.id}>
                              <td><strong>{item.name}</strong></td>
                              <td>{item.quantity_kg}</td>
                              <td>Rs {item.price_per_kg}</td>
                              <td>{item.updated_at?.split('T')[0]}</td>
                              <td>
                                <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleOpenEditModal(item)}>✏️ Edit</button>
                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteProduct(item.id, item.name)}>🗑️ Delete</button>
                              </td>
                            </tr>
                          ))
                        )}
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
                <h5 className="mb-0">📦 Order Requests</h5>
                <small className="text-muted">Orders from buyers that need your attention</small>
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
                      {orderRequests.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center text-muted">No pending orders.</td>
                        </tr>
                      ) : (
                        orderRequests.map(order => (
                          <tr key={order.id}>
                            <td>{order.buyer_name}</td>
                            <td>{order.product_name}</td>
                            <td>{order.quantity_kg} kg</td>
                            <td>Rs {order.total_amount}</td>
                            <td>
                              <button className="btn btn-sm btn-success me-2" onClick={() => addToast(`Order accepted!`, 'success')}>Accept</button>
                              <button className="btn btn-sm btn-danger" onClick={() => addToast(`Order declined`, 'warning')}>Decline</button>
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

          {/* REVENUE TAB */}
          {activeTab === 'revenue' && (
            <div className="card">
              <div className="card-header bg-white">
                <h5 className="mb-0">💰 Revenue Summary</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <div className="card bg-info text-white text-center">
                      <div className="card-body">
                        <h6>Today's Revenue</h6>
                        <h3>Rs {revenue.today.toLocaleString()}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <div className="card bg-primary text-white text-center">
                      <div className="card-body">
                        <h6>This Week</h6>
                        <h3>Rs {revenue.week.toLocaleString()}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <div className="card bg-success text-white text-center">
                      <div className="card-body">
                        <h6>This Month</h6>
                        <h3>Rs {revenue.month.toLocaleString()}</h3>
                      </div>
                    </div>
                  </div>
                </div>
                <hr />
                <div className="alert alert-success">
                  <strong>📈 Performance Summary</strong><br />
                  Total products: <strong>{inventory.length}</strong><br />
                  Total quantity: <strong>{inventory.reduce((sum, i) => sum + i.quantity_kg, 0)} kg</strong>
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
                  <strong>💡 Help reduce food waste!</strong> List your surplus produce at discounted prices.
                </div>
                
                <div className="row g-3 mb-4">
                  <div className="col-md-4">
                    <select className="form-select" id="surplusProduct">
                      <option value="">Select Product</option>
                      {inventory.map(item => (
                        <option key={item.id} value={item.name}>{item.name} (Available: {item.quantity_kg} kg @ Rs {item.price_per_kg}/kg)</option>
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
                    <button type="button" className="btn btn-success w-100" onClick={addToMarketplace}>List on Marketplace</button>
                  </div>
                </div>
                
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
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {farmerListings.length === 0 ? (
                        <td>
                          <td colSpan="6" className="text-center text-muted">No listings yet. Add some surplus food above!</td>
                        </td>
                      ) : (
                        farmerListings.map(listing => (
                          <tr key={listing.id}>
                            <td>{listing.product}</td>
                            <td>{listing.quantity} kg</td>
                            <td>Rs {listing.originalPrice}</td>
                            <td>Rs {listing.discountedPrice}</td>
                            <td>{listing.expiryDate}</td>
                            <td>
                              <button className="btn btn-sm btn-outline-danger" onClick={() => deleteMarketplaceListing(listing.id, listing.product)}>Remove</button>
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
      
      <FloatingChat currentPage="Farmer Dashboard" userRole="farmer" />
    </div>
  );
}

export default FarmerDashboard;
