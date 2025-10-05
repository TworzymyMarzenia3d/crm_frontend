import React, { useState } from 'react';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
function Login({ onLoginSuccess }) {
  // ... (cały kod komponentu Login, który już masz) ...
  const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }),
      });
      if (response.ok) { const { token } = await response.json(); onLoginSuccess(token); }
      else { setError('Nieprawidłowe hasło!'); }
    } catch (err) { setError('Błąd połączenia z serwerem.'); }
    finally { setIsLoading(false); }
  };
  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h1>Menedżer Filamentów</h1><h2>Logowanie</h2>
        <input type="password" placeholder="Hasło" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading}/>
        <button type="submit" disabled={isLoading}>{isLoading ? 'Logowanie...' : 'Zaloguj'}</button>
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
}
export default Login;