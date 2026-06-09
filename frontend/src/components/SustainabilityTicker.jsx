// src/components/SustainabilityTicker.jsx
import React, { useState, useEffect } from 'react';
import { getSustainability } from '../utils/api';

function SustainabilityTicker({ buyerId }) {
  const [metrics, setMetrics] = useState({
    localKg: 0,
    wasteSavedKg: 0,
    carbonReducedPercent: 0,
    farmerPaidRs: 0
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        if (!buyerId) return;

        const response = await getSustainability(buyerId);
        const data = response.data;

        setMetrics({
          localKg: data.local_produce_kg || 0,
          wasteSavedKg: data.waste_saved_kg || 0,
          carbonReducedPercent: data.carbon_reduced_pct || 0,
          farmerPaidRs: data.farmer_revenue || 0
        });
      } catch (error) {
        console.error('Sustainability metrics error:', error);
      }
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
