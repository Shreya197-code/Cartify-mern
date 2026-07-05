import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Disclaimer from "./pages/Disclaimer";
import ReturnPolicy from "./pages/ReturnPolicy";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ProductDetail from "./pages/ProductDetail";

function App() {
  return (
    <Router>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
<Route path="/return-policy" element={<ReturnPolicy />} />
<Route path="/disclaimer" element={<Disclaimer />} />
<Route path="/login" element={<Login />} />
<Route path="/register" element={<Register />} />
<Route path="/product/:id" element={<ProductDetail />} />
        {/* <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} /> */}
      </Routes>

      <Footer />
    </Router>
  );
}

export default App;