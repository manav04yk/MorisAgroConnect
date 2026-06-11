// src/components/ProtectedRoute.jsx - TEMPORARY BYPASS VERSION
import React from 'react';

function ProtectedRoute({ children }) {
  // TEMPORARILY BYPASSING AUTH FOR TESTING
  console.log('ProtectedRoute: Bypassing authentication for testing');
  return children;
}

export default ProtectedRoute;
