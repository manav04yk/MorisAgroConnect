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
      const saved = localStorage.getItem('marketplaceListings');
      console.log('Loading listings from localStorage:', saved);
      if (saved) {
        const parsed = JSON.parse(saved);
        setListings(parsed);
        console.log('Listings loaded:', parsed.length);
      } else {
        setListings([]);
        console.log('No listings found');
      }
    } catch (err) {
      console.error('Error loading listings:', err);
      setListings([]);
    }
    setLoading(false);
  };

  const handleReserve = async (listing) => {
    if (!user || user.role !== 'buyer') {
      addToast('Please login as a buyer to reserve food', 'error');
      return;
    }
    
    try {
      const userResponse = await api.get('/users/search', { 
        params: { name: listing.farmer } 
      });
      
      if (userResponse.data?.id) {
        await api.post('/inventory/reduce', {
          farmer_id: userResponse.data.id,
          product_name: listing.product,
          quantity_kg: listing.quantity
        });
      }
      
      const current = JSON.parse(localStorage.getItem('marketplaceListings') || '[]');
      const updated = current.filter(l => l.id !== listing.id);
      localStorage.setItem('marketplaceListings', JSON.stringify(updated));
      setListings(updated);
      
      addToast(`✅ Reserved ${listing.quantity}kg of ${listing.product}!`, 'success');
    } catch (err) {
      console.error('Reservation error:', err);
      addToast('Failed to reserve', 'error');
    }
  };

  const getExpiryBadge = (expiryDate) => {
    const daysLeft = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 1) return <span className="badge bg-danger">Expires Tomorrow!</span>;
    if (daysLeft <= 3) return <span className="badge bg-warning">Expires in {daysLeft} days</span>;
    return <span className="badge bg-info">Fresh</span>;
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-success"></div></div>;

  return (
    <div className="container mt-4 mb-5">
      {toasts.map(t => <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />)}

      <div className="card bg-warning bg-opacity-25 border-warning mb-4">
        <div className="card-body text-center">
          <h2>♻️ Food Waste Marketplace</h2>
          <p className="mb-0">Save surplus food from going to waste!</p>
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
              <div className="display-4">{listings.reduce((s, l) => s + l.quantity, 0)} kg</div>
              <div>Food Saved</div>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card bg-primary text-white text-center">
            <div className="card-body">
              <div className="display-4">Rs {listings.reduce((s, l) => s + (l.originalPrice - l.discountedPrice) * l.quantity, 0)}</div>
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
            <p>Farmers haven't listed any surplus food yet.</p>
          </div>
        ) : (
          listings.map(listing => (
            <div className="col-md-6 col-lg-4 mb-4" key={listing.id}>
              <div className="card h-100 shadow-sm">
                <div className="card-header bg-white d-flex justify-content-between">
                  <h5 className="mb-0">{listing.product}</h5>
                  {getExpiryBadge(listing.expiryDate)}
                </div>
                <div className="card-body">
                  <p><strong>From:</strong> {listing.farmer}<br /><small>📍 {listing.farmerLocation}</small></p>
                  <h4>{listing.quantity} kg</h4>
                  <p><span className="text-decoration-line-through">Rs {listing.originalPrice}/kg</span> <span className="fs-4 text-success fw-bold">Rs {listing.discountedPrice}/kg</span></p>
                  <p><span className="badge bg-warning text-dark">{listing.reason}</span></p>
                  <div className="alert alert-success py-2">💰 Save Rs {(listing.originalPrice - listing.discountedPrice) * listing.quantity}</div>
                </div>
                <div className="card-footer">
                  <button className="btn btn-success w-100" onClick={() => handleReserve(listing)} disabled={user?.role !== 'buyer'}>
                    {user?.role === 'buyer' ? '🛒 Reserve Now' : '🔒 Login as Buyer'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="card bg-light mt-4">
        <div className="card-body">
          <h6>💡 How It Works</h6>
          <ul className="small mb-0">
            <li>Farmers list surplus produce at discounted prices</li>
            <li>Buyers reserve food at up to 40% off</li>
            <li>Farmer's inventory is automatically reduced</li>
          </ul>
        </div>
      </div>

      <FloatingChat currentPage="Marketplace" userRole={user?.role || null} />
    </div>
  );
}

export default Marketplace;
