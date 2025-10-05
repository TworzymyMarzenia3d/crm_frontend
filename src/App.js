import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import Login from './Login';
import Navbar from './Navbar';
import Warehouse from './Warehouse';
import Clients from './Clients';
import Orders from './Orders';

function App() {
  const [token, setToken] = useState(localStorage.getItem('authToken'));

  const handleLoginSuccess = (newToken) => {
    localStorage.setItem('authToken', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
  };

  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <Router>
      <div className="App">
        <Navbar onLogout={handleLogout} />
        <main className="container">
          <Routes>
            <Route path="/warehouse" element={<Warehouse token={token} />} />
            <Route path="/clients" element={<Clients token={token} />} />
            <Route path="/orders" element={<Orders token={token} />} />
            <Route path="*" element={<Navigate to="/warehouse" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;