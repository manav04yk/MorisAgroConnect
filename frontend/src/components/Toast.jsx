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

  // Color schemes based on type
  const colorSchemes = {
    success: {
      bg: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
      icon: '✅',
      border: '#28a745'
    },
    error: {
      bg: 'linear-gradient(135deg, #dc3545 0%, #f86c6b 100%)',
      icon: '❌',
      border: '#dc3545'
    },
    warning: {
      bg: 'linear-gradient(135deg, #ffc107 0%, #ffb347 100%)',
      icon: '⚠️',
      border: '#ffc107'
    },
    info: {
      bg: 'linear-gradient(135deg, #17a2b8 0%, #4ecdc4 100%)',
      icon: 'ℹ️',
      border: '#17a2b8'
    }
  };

  const scheme = colorSchemes[type] || colorSchemes.success;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 9999,
      animation: 'slideIn 0.3s ease-out'
    }}>
      <div style={{
        background: scheme.bg,
        color: 'white',
        padding: '12px 20px',
        borderRadius: '12px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
        minWidth: '280px',
        borderLeft: `4px solid ${scheme.border}`,
        backdropFilter: 'blur(10px)'
      }}>
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <span style={{ fontSize: '20px' }}>{scheme.icon}</span>
            <span style={{ fontWeight: '500' }}>{message}</span>
          </div>
          <button 
            onClick={() => { setIsVisible(false); onClose(); }}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ✕
          </button>
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
          @keyframes slideOut {
            from {
              transform: translateX(0);
              opacity: 1;
            }
            to {
              transform: translateX(100%);
              opacity: 0;
            }
          }
        `}
      </style>
    </div>
  );
}

export default Toast;
