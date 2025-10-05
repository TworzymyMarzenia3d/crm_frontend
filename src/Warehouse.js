// KOD Z POPRZEDNIEJ WIADOMOŚCI
import React, { useState, useEffect } from 'react';
// ... (cały kod komponentu magazynu) ...
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function Warehouse({ token }) {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [productName, setProductName] = useState('');
    const [productUnit, setProductUnit] = useState('');
    const [manufacturer, setManufacturer] = useState('');
    const [materialType, setMaterialType] = useState('');
    const [color, setColor] = useState('');

    const isFilamentCategory = categories.find(c => c.id === parseInt(selectedCategoryId))?.name.toLowerCase() === 'filament';

    const fetchData = async () => {
        setIsLoading(true);
        const headers = { 'Authorization': `Bearer ${token}` };
        try {
            const [catsRes, prodsRes] = await Promise.all([
                fetch(`${API_URL}/api/product-categories`, { headers }),
                fetch(`${API_URL}/api/products`, { headers }),
            ]);
            const catsData = await catsRes.json();
            const prodsData = await prodsRes.json();
            setCategories(catsData);
            setProducts(prodsData);
            if (catsData.length > 0 && !selectedCategoryId) {
                setSelectedCategoryId(catsData[0].id);
            }
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [token]);

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
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error);
            }
            fetchData();
        } catch (error) {
            alert(error.message);
        }
    };

    if (isLoading) return <p>Ładowanie...</p>;

    return (
        <>
            <div className="management-panel">
                <section className="form-section">
                    <h2>Dodaj nowy produkt</h2>
                    <form onSubmit={handleAddProduct}>
                        <label>Kategoria</label>
                        <select value={selectedCategoryId} onChange={e => setSelectedCategoryId(e.target.value)}>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
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
                <section className="form-section"><h2>Dodaj zakupy (w budowie)</h2></section>
            </div>
            <section className="list-section full-width">
                <h2>Lista Produktów</h2>
                <table>
                    <thead><tr><th>Nazwa</th><th>Kategoria</th><th>Jednostka</th></tr></thead>
                    <tbody>
                        {products.map(p => (<tr key={p.id}><td>{p.name}</td><td>{p.category.name}</td><td>{p.unit}</td></tr>))}
                    </tbody>
                </table>
            </section>
        </>
    );
}
export default Warehouse;