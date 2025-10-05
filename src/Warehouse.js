import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function Warehouse({ token }) {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [purchases, setPurchases] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Stany dla formularza kategorii
    const [newCategoryName, setNewCategoryName] = useState('');

    // Stany dla formularza dodawania produktu
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [productName, setProductName] = useState('');
    const [productUnit, setProductUnit] = useState('');
    const [manufacturer, setManufacturer] = useState('');
    const [materialType, setMaterialType] = useState('');
    const [color, setColor] = useState('');
    
    // Stany dla formularza zakupów
    const [purchaseProductId, setPurchaseProductId] = useState('');
    const [purchaseVendor, setPurchaseVendor] = useState('');
    const [purchasePrice, setPurchasePrice] = useState('');
    const [purchaseQuantity, setPurchaseQuantity] = useState('');
    const [purchaseCurrency, setPurchaseCurrency] = useState('PLN');
    const [exchangeRate, setExchangeRate] = useState('1');

    const isFilamentCategory = categories.find(c => c.id === parseInt(selectedCategoryId))?.name.toLowerCase() === 'filament';

    const fetchData = async () => {
        setIsLoading(true);
        const headers = { 'Authorization': `Bearer ${token}` };
        try {
            const [catsRes, prodsRes, purcsRes] = await Promise.all([
                fetch(`${API_URL}/api/product-categories`, { headers }),
                fetch(`${API_URL}/api/products`, { headers }),
                fetch(`${API_URL}/api/purchases`, { headers }),
            ]);
            const catsData = await catsRes.json();
            const prodsData = await prodsRes.json();
            const purcsData = await purcsRes.json();

            setCategories(catsData);
            setProducts(prodsData);
            setPurchases(purcsData);

            if (catsData.length > 0 && !selectedCategoryId) setSelectedCategoryId(catsData[0].id);
            if (prodsData.length > 0 && !purchaseProductId) setPurchaseProductId(prodsData[0].id);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [token]);

    const handleAddCategory = async () => {
        if (!newCategoryName) return;
        try {
            const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
            await fetch(`${API_URL}/api/product-categories`, { method: 'POST', headers, body: JSON.stringify({ name: newCategoryName }) });
            setNewCategoryName('');
            fetchData();
        } catch (error) { alert("Nie udało się dodać kategorii."); }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
        let body;
        if (isFilamentCategory) {
            body = { categoryId: selectedCategoryId, manufacturer, materialType, color };
        } else {
            body = { categoryId: selectedCategoryId, name: productName, unit: productUnit };
        }
        try {
            const response = await fetch(`${API_URL}/api/products`, { method: 'POST', headers, body: JSON.stringify(body) });
            if (!response.ok) { const errData = await response.json(); throw new Error(errData.error); }
            fetchData();
        } catch (error) { alert(error.message); }
    };
    
    const handleAddPurchase = async (e) => {
        e.preventDefault();
        if (!purchaseProductId) return alert("Proszę wybrać produkt.");
        try {
            const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
            await fetch(`${API_URL}/api/purchases`, {
                method: 'POST', headers,
                body: JSON.stringify({
                    productId: purchaseProductId, vendorName: purchaseVendor, price: purchasePrice,
                    initialQuantity: purchaseQuantity, currency: purchaseCurrency, exchangeRate: exchangeRate,
                }),
            });
            fetchData();
            setPurchasePrice(''); setPurchaseQuantity(''); setPurchaseVendor('');
        } catch (err) { alert(err.message); }
    };

    if (isLoading) return <p>Ładowanie danych magazynu...</p>;

    return (
        <>
            <div className="management-panel">
                <section className="form-section">
                    <h2>Dodaj nowy produkt</h2>
                    <form onSubmit={handleAddProduct}>
                        <label>Kategoria</label>
                        <select value={selectedCategoryId} onChange={e => setSelectedCategoryId(e.target.value)}>
                            {categories.length === 0 && <option disabled>Najpierw dodaj kategorię</option>}
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <div className="add-category-form">
                            <input type="text" placeholder="Nowa kategoria..." value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} />
                            <button type="button" onClick={handleAddCategory}>Dodaj kat.</button>
                        </div>
                        
                        {isFilamentCategory ? (
                            <>
                                <label>Producent</label><input type="text" value={manufacturer} onChange={e => setManufacturer(e.target.value)} required />
                                <label>Typ Materiału</label><input type="text" value={materialType} onChange={e => setMaterialType(e.target.value)} required />
                                <label>Kolor</label><input type="text" value={color} onChange={e => setColor(e.target.value)} required />
                            </>
                        ) : (
                            <>
                                <label>Nazwa Produktu</label><input type="text" value={productName} onChange={e => setProductName(e.target.value)} required />
                                <label>Jednostka (g, ml, szt, h)</label><input type="text" value={productUnit} onChange={e => setProductUnit(e.target.value)} required />
                            </>
                        )}
                        <button type="submit">Dodaj produkt</button>
                    </form>
                </section>

                <section className="form-section">
                    <h2>Dodaj nowy zakup</h2>
                    <form onSubmit={handleAddPurchase}>
                        <label>Produkt</label>
                        <select value={purchaseProductId} onChange={e => setPurchaseProductId(e.target.value)} required>
                            {products.length === 0 && <option disabled>Najpierw dodaj produkt</option>}
                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <label>Dostawca (sklep)</label>
                        <input type="text" placeholder="Nazwa sklepu" value={purchaseVendor} onChange={e => setPurchaseVendor(e.target.value)} />
                        <label>Cena</label>
                        <input type="number" placeholder="Cena" value={purchasePrice} onChange={e => setPurchasePrice(e.target.value)} required step="0.01" />
                        <label>Ilość</label>
                        <input type="number" placeholder="Ilość (w jednostce produktu)" value={purchaseQuantity} onChange={e => setPurchaseQuantity(e.target.value)} required step="0.01" />
                        <div className="currency-wrapper">
                            <div>
                                <label>Waluta</label>
                                <select value={purchaseCurrency} onChange={(e) => { const nc = e.target.value; setPurchaseCurrency(nc); if (nc === 'PLN') setExchangeRate('1'); }}>
                                    <option value="PLN">PLN</option><option value="EUR">EUR</option><option value="USD">USD</option><option value="CZK">CZK</option>
                                </select>
                            </div>
                            {purchaseCurrency !== 'PLN' && (
                                <div>
                                    <label>Kurs {purchaseCurrency}/PLN</label>
                                    <input type="number" value={exchangeRate} onChange={(e) => setExchangeRate(e.target.value)} required step="0.0001" />
                                </div>
                            )}
                        </div>
                        <button type="submit">Dodaj zakup</button>
                    </form>
                </section>
            </div>
            <section className="list-section full-width">
                <h2>Stan Magazynowy (Partie Produktów)</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Produkt</th><th>Ilość (zostało/całość)</th><th>Dostawca</th><th>Data zakupu</th><th>Koszt / jednostkę (PLN)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {purchases.map(p => (
                            <tr key={p.id}>
                                <td>{p.product.name}</td>
                                <td>{p.currentQuantity} / {p.initialQuantity} {p.product.unit}</td>
                                <td>{p.vendorName || '-'}</td>
                                <td>{new Date(p.purchaseDate).toLocaleDateString()}</td>
                                <td>{p.costPerUnitInPLN.toFixed(4)} PLN</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </>
    );
}

export default Warehouse;