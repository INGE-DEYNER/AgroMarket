// File: frontend/src/components/Index.jsx
import React, { useEffect } from 'react';

export default function Index() {
  useEffect(() => {
    window.location.assign('/home.html');
  }, []);

  return (
    <div>
      <p>Redirecting to AgroMarket...</p>
    </div>
  );
}
