import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Product from "../components/Product";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data.slice(0, 4)); // Show first 4 featured products
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-24">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
            Welcome to Cartify 🛍️
          </h1>

          <p className="text-xl md:text-2xl text-blue-100 mb-10">
            Your one-stop solution for all your shopping needs.
          </p>

          <Link
            to="/shop"
            className="inline-block bg-white text-blue-600 font-semibold px-8 py-4 rounded-xl shadow-lg hover:bg-gray-100 transition duration-300"
          >
            Start Shopping
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-4xl font-bold text-gray-900">
            Featured Products
          </h2>

          <Link
            to="/shop"
            className="text-blue-600 font-semibold hover:underline"
          >
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="text-center text-lg text-gray-500">
            Loading products...
          </div>
        ) : products.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <Product key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center text-red-500 text-lg">
            No products found.
          </div>
        )}
      </section>

      {/* Why Choose Us */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">

          <h2 className="text-4xl font-bold text-center mb-14">
            Why Shop With Us?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">

            <div className="bg-gray-50 rounded-2xl shadow-md p-8 text-center hover:shadow-xl transition">
              <div className="text-5xl mb-4">🚚</div>
              <h3 className="text-2xl font-semibold mb-3">
                Fast Delivery
              </h3>
              <p className="text-gray-600">
                Quick and reliable delivery across India.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl shadow-md p-8 text-center hover:shadow-xl transition">
              <div className="text-5xl mb-4">💳</div>
              <h3 className="text-2xl font-semibold mb-3">
                Secure Payments
              </h3>
              <p className="text-gray-600">
                Safe online payments with trusted gateways.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl shadow-md p-8 text-center hover:shadow-xl transition">
              <div className="text-5xl mb-4">⭐</div>
              <h3 className="text-2xl font-semibold mb-3">
                Premium Quality
              </h3>
              <p className="text-gray-600">
                Handpicked products from top brands.
              </p>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;