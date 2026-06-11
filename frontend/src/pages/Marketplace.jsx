// src/pages/Marketplace.jsx
import React, { useState, useEffect } from 'react';
import FloatingChat from '../components/FloatingChat';
import Toast from '../components/Toast';
import api from '../utils/api';

function Marketplace() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [toasts, setToasts] = useState([]);

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
      setUser(JSON.parse(userStr));
    }
    loadListings();
  }, []);

  const loadListings = () => {
    try {
      const savedListings = localStorage.getItem('marketplaceListings');
      if (savedListings) {
        const parsedListings = JSON.parse(savedListings);
        setListings(parsedListings);
        console.log('Loaded listings:', parsedListings.length);
      } else {
        setListings([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading listings:', error);
      setListings([]);
      setLoading(false);
    }
  };

  const handleReserve = async (listing) => {
    if (!user || user.role !== 'buyer') {
      addToast('Please login as a buyer to reserve food', 'error');
      return;
    }
    
    try {
      // Find the farmer ID by name
      const userResponse = await api.get('/users/search', { 
        params: { name: listing.farmer } 
      });
      
      if (!userResponse.data || !userResponse.data.id) {
        addToast('Farmer not found', 'error');
        return;
      }
      
      const farmerId = userResponse.data.id;
      
      // Reduce the farmer's inventory
      await api.post('/inventory/reduce', {
        farmer_id: farmerId,
        product_name: listing.product,
        quantity_kg: listing.quantity
      });
      
      // Remove from localStorage
      const currentListings = JSON.parse(localStorage.getItem('marketplaceListings') || '[]');
      const updatedListings = currentListings.filter(l => l.id !== listing.id);
      localStorage.setItem('marketplaceListings', JSON.stringify(updatedListings));
      
      // Update state
      setListings(updatedListings);
      
      addToast(`✅ Reserved ${listing.quantity}kg of ${listing.product}! Inventory updated.`, 'success');
    } catch (error) {
      console.error('Error reserving:', error);
      addToast(error.response?.data?.error || 'Failed to reserve. Please try again.', 'error');
    }
  };

  const getExpiryBadge = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    
    if (daysLeft <= 1) return <span className="badge bg-danger">Expires Tomorrow!</span>;
    if (daysLeft <= 3) return <span className="badge bg-warning">Expires in {daysLeft} days</span>;
    return <span className="badge bg-info">Fresh</span>;
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
    <div className="container mt-4 mb-5">
      {toasts.map(toast => (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
      ))}

      <div className="row mb-4">
        <div className="col-12">
          <div className="card bg-warning bg-opacity-25 border-warning">
            <div className="card-body">
              <h2 className="text-center mb-2">♻️ Food Waste Marketplace</h2>
              <p className="text-center mb-0">
                Save surplus food from going to waste! Buy at discounted prices and help reduce food waste in Mauritius.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card bg-success text-white text-center">
            <div className="card-body">
              <div className="display-4">{listings.length}</div>
              <div>Available Listings</div>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card bg-info text-white text-center">
            <div className="card-body">
              <div className="display-4">
                {listings.reduce((sum, l) => sum + l.quantity, 0)} kg
              </div>
              <div>Food Saved from Waste</div>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card bg-primary text-white text-center">
            <div className="card-body">
              <div className="display-4">
                Rs {listings.reduce((sum, l) => sum + (l.originalPrice - l.discountedPrice) * l.quantity, 0)}
              </div>
              <div>Total Savings</div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {listings.length === 0 ? (
          <div className="col-12 text-center py-5">
            <div className="display-1">🌱</div>
            <h4>No listings available</h4>
            <p className="text-muted">Farmers haven't listed any surplus food yet. Check back later!</p>
          </div>
        ) : (
          listings.map(listing => (
            <div className="col-md-6 col-lg-4 mb-4" key={listing.id}>
              <div className="card h-100 shadow-sm">
                <div className="card-header bg-white">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">{listing.product}</h5>
                    {getExpiryBadge(listing.expiryDate)}
                  </div>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <div className="text-muted small">From</div>
                    <strong>{listing.farmer}</strong>
                    <br />
                    <small className="text-muted">📍 {listing.farmerLocation}</small>
                  </div>
                  
                  <div className="mb-3">
                    <div className="text-muted small">Quantity Available</div>
                    <h4>{listing.quantity} kg</h4>
                  </div>
                  
                  <div className="mb-3">
                    <div className="text-muted small">Price</div>
                    <div>
                      <span className="text-decoration-line-through text-muted">
                        Rs {listing.originalPrice}/kg
                      </span>
                      <span className="fs-4 text-success fw-bold ms-2">
                        Rs {listing.discountedPrice}/kg
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="text-muted small">Reason for Discount</div>
                    <span className="badge bg-warning text-dark">{listing.reason}</span>
                  </div>
                  
                  <div className="alert alert-success alert-sm mb-0">
                    💰 Save Rs {(listing.originalPrice - listing.discountedPrice) * listing.quantity} on this purchase!
                  </div>
                </div>
                <div className="card-footer bg-white">
                  <button 
                    className="btn btn-success w-100"
                    onClick={() => handleReserve(listing)}
                    disabled={user?.role !== 'buyer'}
                  >
                    {user?.role === 'buyer' ? '🛒 Reserve Now' : '🔒 Login as Buyer to Reserve'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <div className="card bg-light">
            <div className="card-body">
              <h6 className="mb-2">💡 How It Works</h6>
              <ul className="small mb-0">
                <li>Farmers list surplus or near-expiry produce at discounted prices</li>
                <li>Hotels and restaurants can reserve food at up to 40% off</li>
                <li>When you reserve, the farmer's inventory is automatically reduced</li>
                <li>Every kg saved = less food waste + more profit for farmers + savings for buyers</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <FloatingChat currentPage="Marketplace" userRole={user?.role || null} />
    </div>
  );
}

export default Marketplace;
