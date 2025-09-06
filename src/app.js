import './AppStyles.css';
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";

// Placeholder image
const placeholderImg = "https://via.placeholder.com/100";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

// --------- Login Component ---------
function Login() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!email || !username) return alert("Enter email & username");
    localStorage.setItem("user", JSON.stringify({ email, username }));
    navigate("/dashboard");
  };

  return (
    <div style={{ padding: "50px", textAlign: "center" }}>
      <h1>EcoFinds Login / Signup</h1>
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} /><br /><br />
      <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} /><br /><br />
      <button onClick={handleLogin}>Login / Signup</button>
    </div>
  );
}

// --------- Dashboard Component ---------
function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);
  const [view, setView] = useState("dashboard");

  const categories = ["Clothing", "Electronics", "Books", "Other"];

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const storedProducts = JSON.parse(localStorage.getItem("products")) || [];
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    const storedPurchases = JSON.parse(localStorage.getItem("purchases")) || [];
    setUser(storedUser);
    setProducts(storedProducts);
    setCart(storedCart);
    setPurchases(storedPurchases);
  }, []);

  const saveProducts = updated => {
    setProducts(updated);
    localStorage.setItem("products", JSON.stringify(updated));
  };

  const addOrEditProduct = () => {
    if (!title || !price || !category) return alert("Fill all fields");

    const imgURL = image ? URL.createObjectURL(image) : placeholderImg;

    if (editId) {
      const updated = products.map(p => p.id === editId ? { ...p, title, price, category, img: imgURL } : p);
      saveProducts(updated);
      setEditId(null);
    } else {
      const newProduct = { id: Date.now(), title, price, category, img: imgURL };
      saveProducts([...products, newProduct]);
    }

    setTitle(""); setPrice(""); setCategory(""); setImage(null);
  };

  const editProduct = p => {
    setEditId(p.id);
    setTitle(p.title);
    setPrice(p.price);
    setCategory(p.category);
    setView("dashboard");
  };

  const deleteProduct = id => {
    const updated = products.filter(p => p.id !== id);
    saveProducts(updated);
  };

  const addToCart = product => {
    setCart(prev => {
      const updated = [...prev, product];
      localStorage.setItem("cart", JSON.stringify(updated));
      return updated;
    });
  };

  const checkout = () => {
    if (cart.length === 0) return alert("Cart is empty");
    const updatedPurchases = [...purchases, ...cart];
    setPurchases(updatedPurchases);
    localStorage.setItem("purchases", JSON.stringify(updatedPurchases));
    setCart([]);
    localStorage.setItem("cart", JSON.stringify([]));
    alert("Checkout complete!");
  };

  const logout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const filteredProducts = products.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const cartTotal = cart.reduce((sum, item) => sum + Number(item.price), 0);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Welcome, {user?.username}</h2>

      {/* Navigation Bar */}
      <div className="nav-bar">
        <button onClick={() => setView("dashboard")}>Dashboard</button>
        <button onClick={() => setView("cart")}>Cart ({cart.length})</button>
        <button onClick={() => setView("purchases")}>Previous Purchases</button>
        <button onClick={logout}>Logout</button>
      </div>

      {/* Dashboard / Product Listing View */}
      {view === "dashboard" && (
        <>
          <h3>Add / Edit Product</h3>
          <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
          <input placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} />
          <select value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">Select Category</option>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>

          {/* Upload Image Button */}
          <label htmlFor="imageUpload" style={{
            display: "inline-block",
            padding: "6px 12px",
            backgroundColor: "#4CAF50",
            color: "white",
            borderRadius: "5px",
            cursor: "pointer",
            margin: "5px 0"
          }}>
            Upload Image
          </label>
          <input
            id="imageUpload"
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={e => setImage(e.target.files[0])}
          />

          {/* Image Preview */}
          {image && (
            <div style={{ margin: "10px 0" }}>
              <strong>Preview:</strong><br />
              <img
                src={URL.createObjectURL(image)}
                alt="Preview"
                style={{
                  width: "100px",
                  height: "100px",
                  objectFit: "cover",
                  borderRadius: "5px",
                  border: "1px solid #ccc"
                }}
              />
            </div>
          )}

          <button className="add" onClick={addOrEditProduct}>{editId ? "Save Edit" : "Add Product"}</button>

          <h3>Search / Filter</h3>
          <input placeholder="Search by title or category" value={search} onChange={e => setSearch(e.target.value)} />

          <h3>Product Listings</h3>
          <ul className="product-list">
            {filteredProducts.map(p => (
              <li className="product-card" key={p.id}>
                <div className="product-info">
                  <img src={p.img} alt={p.title} />
                  <div>
                    <strong>{p.title}</strong> - ${p.price} <br />
                    <small>{p.category}</small>
                  </div>
                </div>
                <div>
                  <button className="edit" onClick={() => editProduct(p)}>Edit</button>
                  <button className="delete" onClick={() => deleteProduct(p.id)}>Delete</button>
                  <button className="cart" onClick={() => addToCart(p)}>Add to Cart</button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Cart View */}
      {view === "cart" && (
        <>
          <h3>Cart ({cart.length} items)</h3>
          <ul className="cart-list">
            {cart.map((c, i) => <li key={i}>{c.title} - ${c.price}</li>)}
          </ul>
          <h4>Total: ${cartTotal}</h4>
          <button onClick={checkout}>Checkout</button>
        </>
      )}

      {/* Previous Purchases View */}
      {view === "purchases" && (
        <>
          <h3>Previous Purchases</h3>
          <ul className="purchases-list">
            {purchases.map((c, i) => <li key={i}>{c.title} - ${c.price}</li>)}
          </ul>
        </>
      )}
    </div>
  );
}

export default App;

