// src/components/Toast.jsx
import React, { useState, useEffect } from 'react';

function Toast({ message, type, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) return null;

  const bgColor = type === 'success' ? 'bg-success' : type === 'error' ? 'bg-danger' : 'bg-info';

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 9999,
      animation: 'slideIn 0.3s ease-out'
    }}>
      <div className={`${bgColor} text-white p-3 rounded shadow`} style={{ minWidth: '250px' }}>
        <div className="d-flex justify-content-between align-items-center">
          <span>{message}</span>
          <button 
            onClick={() => { setIsVisible(false); onClose(); }}
            className="btn-close btn-close-white ms-3"
            style={{ fontSize: '12px' }}
          ></button>
        </div>
      </div>
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
}

export default Toast;