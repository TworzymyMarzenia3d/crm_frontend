import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function Clients({ token }) {
  // Stany
  const [clients, setClients] = useState([]);
  const [name, setName] = useState('');
  const [nip, setNip] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pobieranie danych
  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/clients`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Nie udało się pobrać listy klientów.');
      const data = await response.json();
      setClients(data);
      setError(null);
    } catch (err) { setError(err.message); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchClients(); }, [token]);

  // Dodawanie klienta
  const handleAddClient = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name, nip, address, phone, email, notes }),
      });
      if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Nie udało się dodać klienta.');
      }
      fetchClients();
      setName(''); setNip(''); setAddress(''); setPhone(''); setEmail(''); setNotes('');
    } catch (err) { alert(err.message); }
  };

  if (isLoading) return <p>Ładowanie listy klientów...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <>
      <div className="management-panel" >
        <section className="form-section" style={{ flex: '0 1 500px' }}>
          <h2>Dodaj nowego klienta</h2>
          <form onSubmit={handleAddClient}>
            <label>Nazwa klienta / Firma *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            <label>NIP</label>
            <input type="text" value={nip} onChange={(e) => setNip(e.target.value)} />
            <label>Adres</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
            <label>Telefon</label>
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <label>Notatki</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows="4"></textarea>
            <button type="submit">Dodaj klienta</button>
          </form>
        </section>
      </div>

      <section className="list-section full-width">
        <h2>Lista Klientów</h2>
        <table>
            <thead>
              <tr>
                <th>Nazwa</th><th>NIP</th><th>Adres</th><th>Telefon</th><th>Email</th><th>Notatki</th>
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 ? (
                <tr><td colSpan="6">Brak klientów w bazie.</td></tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id}>
                    <td>{client.name}</td><td>{client.nip || '-'}</td><td>{client.address || '-'}</td>
                    <td>{client.phone || '-'}</td><td>{client.email || '-'}</td><td>{client.notes || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
        </table>
      </section>
    </>
  );
}

export default Clients;