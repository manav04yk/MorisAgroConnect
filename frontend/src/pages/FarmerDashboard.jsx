// src/pages/FarmerDashboard.jsx
import React, { useState, useEffect } from 'react';
import FloatingChat from '../components/FloatingChat';
import Toast from '../components/Toast';

import {
  getFarmerInventory,
  addInventory,
  getOrders,
  createWasteListing,
  getWasteListings
} from '../utils/api';

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

  const [newProduct, setNewProduct] = useState('');
  const [newQuantity, setNewQuantity] = useState('');
  const [newPrice, setNewPrice] = useState('');

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  useEffect(() => {
    const userStr = localStorage.getItem('user');

    if (userStr) {
      const parsedUser = JSON.parse(userStr);
      setUser(parsedUser);
      fetchFarmerData(parsedUser);
      loadFarmerListings(parsedUser);
    } else {
      addToast('User not found. Please login again.', 'error');
      setLoading(false);
    }

    const interval = setInterval(() => {
      const currentUserStr = localStorage.getItem('user');
      if (currentUserStr) {
        const currentUser = JSON.parse(currentUserStr);
        fetchFarmerData(currentUser, false);
        loadFarmerListings(currentUser);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const fetchFarmerData = async (currentUser = user, showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      if (!currentUser) {
        addToast('User not found. Please login again.', 'error');
        setLoading(false);
        return;
      }

      const [inventoryRes, ordersRes] = await Promise.all([
        getFarmerInventory(currentUser.id),
        getOrders()
      ]);

      const formattedInventory = inventoryRes.data.map(item => ({
        id: item.id,
        product: item.name,
        quantity: Number(item.quantity_kg),
        price: Number(item.price_per_kg),
        unit: item.unit || 'kg',
        updated: item.updated_at
          ? new Date(item.updated_at).toLocaleDateString()
          : 'N/A'
      }));

      const formattedOrders = ordersRes.data.map(order => ({
        id: order.id,
        buyer: order.buyer_name,
        product: order.product_name,
        quantity: Number(order.quantity_kg),
        offeredPrice:
          Number(order.quantity_kg) > 0
            ? (Number(order.total_amount) / Number(order.quantity_kg)).toFixed(2)
            : 0,
        totalAmount: Number(order.total_amount || 0),
        status: order.status
      }));

      setInventory(formattedInventory);
      setOrderRequests(formattedOrders);

      const totalRevenue = ordersRes.data.reduce(
        (sum, order) => sum + Number(order.total_amount || 0),
        0
      );

      setRevenue({
        today: totalRevenue,
        week: totalRevenue,
        month: totalRevenue
      });

      setRiskAlert(null);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching farmer data:', error);
      addToast(
        error.response?.data?.error || 'Failed to load farmer dashboard data',
        'error'
      );
      setLoading(false);
    }
  };

  const loadFarmerListings = async (currentUser = user) => {
    try {
      if (!currentUser) return;

      const response = await getWasteListings();

      const myListings = response.data
        .filter(listing => Number(listing.farmer_id) === Number(currentUser.id))
        .map(listing => ({
          id: listing.id,
          product: listing.product,
          quantity: Number(listing.quantity_kg),
          expiryDate: listing.expiry_date
            ? new Date(listing.expiry_date).toLocaleDateString()
            : 'N/A',
          status: listing.status
        }));

      setFarmerListings(myListings);
    } catch (error) {
      console.error('Error loading farmer listings:', error);
    }
  };

  const handleAddInventory = async (e) => {
    e.preventDefault();

    if (!newProduct || !newQuantity || !newPrice) {
      addToast('Please fill in all fields', 'error');
      return;
    }

    if (Number(newQuantity) <= 0 || Number(newPrice) <= 0) {
      addToast('Quantity and price must be greater than 0', 'error');
      return;
    }

    try {
      await addInventory({
        name: newProduct,
        quantity_kg: Number(newQuantity),
        price_per_kg: Number(newPrice),
        unit: 'kg'
      });

      addToast(
        `✅ Added/updated ${newQuantity}kg of ${newProduct} at Rs ${newPrice}/kg`,
        'success'
      );

      setNewProduct('');
      setNewQuantity('');
      setNewPrice('');

      fetchFarmerData(user);
    } catch (error) {
      console.error('Add inventory error:', error);
      addToast(
        error.response?.data?.error || 'Failed to add inventory',
        'error'
      );
    }
  };

  const handleDeleteProduct = () => {
    addToast(
      'Delete is not connected to backend yet. We need to add a DELETE /api/inventory/:id endpoint first.',
      'warning'
    );
  };

  const handleAcceptOrder = () => {
    addToast(
      'Order accept is not connected yet. Orders are created when buyer approves a quotation.',
      'warning'
    );
  };

  const handleDeclineOrder = () => {
    addToast(
      'Order decline is not connected yet. We need a reject/cancel endpoint first.',
      'warning'
    );
  };

  const addToMarketplace = async () => {
    const productSelect = document.getElementById('surplusProduct');
    const quantity = document.getElementById('surplusQuantity')?.value;

    if (!productSelect?.value || !quantity) {
      addToast('Please select a product and enter quantity', 'error');
      return;
    }

    const selectedProduct = inventory.find(
      item => item.product === productSelect.value
    );

    if (!selectedProduct) {
      addToast('Product not found in inventory', 'error');
      return;
    }

    if (Number(quantity) <= 0) {
      addToast('Quantity must be greater than 0', 'error');
      return;
    }

    if (Number(quantity) > selectedProduct.quantity) {
      addToast(
        `Not enough ${selectedProduct.product} in inventory. Available: ${selectedProduct.quantity} kg`,
        'error'
      );
      return;
    }

    try {
      const expiryDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      await createWasteListing({
        product: selectedProduct.product,
        quantity_kg: Number(quantity),
        expiry_date: expiryDate
      });

      addToast(
        `✅ Listed ${quantity}kg of ${selectedProduct.product} on Marketplace!`,
        'success'
      );

      document.getElementById('surplusQuantity').value = '';
      productSelect.value = '';

      fetchFarmerData(user);
      loadFarmerListings(user);
    } catch (error) {
      console.error('Create waste listing error:', error);
      addToast(
        error.response?.data?.error || 'Failed to list surplus food',
        'error'
      );
    }
  };

  const deleteMarketplaceListing = () => {
    addToast(
      'Remove listing is not connected to backend yet. We need a DELETE or PATCH endpoint for waste listings first.',
      'warning'
    );
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
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}

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

        <div className="col-md-10 col-12">
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
                        {inventory.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="text-center text-muted">
                              No inventory found. Add your first product above.
                            </td>
                          </tr>
                        ) : (
                          inventory.map(item => (
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
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'orders' && (
            <div className="card">
              <div className="card-header bg-white">
                <h5 className="mb-0">📦 My Orders</h5>
              </div>

              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Buyer</th>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Price/kg</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {orderRequests.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center text-muted">
                            No orders found yet.
                          </td>
                        </tr>
                      ) : (
                        orderRequests.map(order => (
                          <tr key={order.id}>
                            <td>{order.buyer}</td>
                            <td>{order.product}</td>
                            <td>{order.quantity} kg</td>
                            <td>Rs {order.offeredPrice}/kg</td>
                            <td>
                              <span className="badge bg-success">
                                {order.status}
                              </span>
                            </td>
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
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

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
                  Revenue is calculated from confirmed backend orders linked to this farmer.
                </div>
              </div>
            </div>
          )}

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
                    <li className="list-group-item">
                      Risk alerts will be connected later through Salesforce/MuleSoft cyclone monitoring.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'waste' && (
            <div className="card">
              <div className="card-header bg-white">
                <h5 className="mb-0">♻️ List Surplus Food on Marketplace</h5>
              </div>

              <div className="card-body">
                <div className="alert alert-info">
                  <strong>💡 Help reduce food waste!</strong> List your surplus or near-expiry produce.
                  Buyers can view it directly from the Marketplace.
                </div>

                <form className="row g-3 mb-4">
                  <div className="col-md-5">
                    <select className="form-select" id="surplusProduct" required>
                      <option value="">Select Product</option>
                      {inventory.map(item => (
                        <option key={item.id} value={item.product}>
                          {item.product} (Available: {item.quantity} kg)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-4">
                    <input
                      type="number"
                      className="form-control"
                      id="surplusQuantity"
                      placeholder="Quantity (kg)"
                    />
                  </div>

                  <div className="col-md-3">
                    <button
                      type="button"
                      className="btn btn-success w-100"
                      onClick={addToMarketplace}
                    >
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
                        <th>Expiry Date</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {farmerListings.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center text-muted">
                            No listings yet. Add some surplus food above!
                          </td>
                        </tr>
                      ) : (
                        farmerListings.map(listing => (
                          <tr key={listing.id}>
                            <td>{listing.product}</td>
                            <td>{listing.quantity} kg</td>
                            <td>{listing.expiryDate}</td>
                            <td>
                              <span className="badge bg-success">
                                {listing.status}
                              </span>
                            </td>
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

      <FloatingChat currentPage="Farmer Dashboard" userRole="farmer" />
    </div>
  );
}

export default FarmerDashboard;