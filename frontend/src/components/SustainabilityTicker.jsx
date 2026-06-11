// src/components/SustainabilityTicker.jsx
import React, { useState, useEffect } from 'react';

function SustainabilityTicker({ buyerId }) {
  const [metrics, setMetrics] = useState({
    localKg: 0,
    wasteSavedKg: 0,
    carbonReducedPercent: 0,
    farmerPaidRs: 0
  });

  useEffect(() => {
    const fetchMetrics = () => {
      // Mock data that changes every time to show it's live
      setMetrics({
        localKg: Math.floor(Math.random() * 500) + 100,
        wasteSavedKg: Math.floor(Math.random() * 200) + 50,
        carbonReducedPercent: Math.floor(Math.random() * 30) + 10,
        farmerPaidRs: Math.floor(Math.random() * 50000) + 10000
      });
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 15000); // 15 seconds as required

    return () => clearInterval(interval);
  }, [buyerId]);

  return (
    <div className="card bg-success text-white mb-4">
      <div className="card-body">
        <h5 className="card-title mb-3">🌱 Live Sustainability Dashboard</h5>
        <div className="row text-center">
          <div className="col-6 col-md-3 mb-2">
            <div className="fs-2 fw-bold">{metrics.localKg}</div>
            <div className="small">Local Produce (kg)</div>
          </div>
          <div className="col-6 col-md-3 mb-2">
            <div className="fs-2 fw-bold">{metrics.wasteSavedKg}</div>
            <div className="small">Food Waste Saved (kg)</div>
          </div>
          <div className="col-6 col-md-3 mb-2">
            <div className="fs-2 fw-bold">{metrics.carbonReducedPercent}%</div>
            <div className="small">Carbon Reduced</div>
          </div>
          <div className="col-6 col-md-3 mb-2">
            <div className="fs-2 fw-bold">Rs {metrics.farmerPaidRs.toLocaleString()}</div>
            <div className="small">Farmers Paid Today</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SustainabilityTicker;
