import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Product from "../components/Product";

const categoriesList = [
  { name: "Electronics", icon: "💻", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80", count: "Latest Tech" },
  { name: "Audio", icon: "🎧", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80", count: "Hi-Res Sound" },
  { name: "Footwear", icon: "👟", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80", count: "Sneakers & Kicks" },
  { name: "Accessories", icon: "⌚", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80", count: "Watches & Shades" },
  { name: "Fashion", icon: "👕", image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=400&q=80", count: "Premium Apparel" },
  { name: "Home & Kitchen", icon: "☕", image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80", count: "Smart Living" }
];

const Home = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroSearch, setHeroSearch] = useState("");

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/v1/products?limit=8");
      const data = await res.json();
      if (res.ok) {
        if (data.products && Array.isArray(data.products)) {
          setProducts(data.products);
        } else if (Array.isArray(data)) {
          setProducts(data.slice(0, 8));
        }
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/shop?keyword=${encodeURIComponent(heroSearch.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white py-20 lg:py-28">
        {/* Background decorative glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-10 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl pointer-events-none"></div>

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-300 backdrop-blur-md">
                <span>✨</span> AI-Powered Modern Shopping
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                Discover Curated Quality For Every Need.
              </h1>

              <p className="max-w-xl text-base sm:text-lg text-slate-300 font-normal leading-relaxed mx-auto lg:mx-0">
                Explore the latest tech, audio gear, apparel, and accessories with instant smart discovery, verified reviews, and fast delivery across India.
              </p>

              {/* Instant Search Bar on Hero */}
              <form onSubmit={handleSearchSubmit} className="max-w-md mx-auto lg:mx-0">
                <div className="flex items-center gap-2 rounded-2xl bg-white/10 p-1.5 border border-white/20 backdrop-blur-md shadow-2xl focus-within:border-blue-400 focus-within:bg-white/15">
                  <input
                    type="text"
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                    placeholder="Search iPhone, Nike, Headphones..."
                    className="flex-1 bg-transparent px-4 py-2.5 text-sm text-white placeholder-slate-400 outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/30 hover:bg-blue-500 transition"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-4 text-xs font-semibold text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> Free Shipping over ₹999
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> 7-Day Easy Returns
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> 100% Secure Checkout
                </div>
              </div>
            </div>

            {/* Right Hero Visual Showcase */}
            <div className="lg:col-span-5 hidden sm:block">
              <div className="relative mx-auto max-w-sm rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl shadow-2xl">
                <div className="overflow-hidden rounded-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80"
                    alt="Featured Product"
                    className="h-64 w-full object-cover rounded-2xl hover:scale-105 transition duration-500"
                  />
                </div>
                <div className="mt-4 p-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Featured Deal</span>
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] font-bold text-emerald-300">In Stock</span>
                  </div>
                  <h3 className="font-bold text-lg text-white">Sony WH-1000XM5 Headphones</h3>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-2xl font-black text-blue-400">₹29,990</span>
                    <Link
                      to="/shop"
                      className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-slate-900 hover:bg-slate-100 transition shadow-sm"
                    >
                      Shop Now →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Explorer */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600">
              <span>🏷️</span> Categories
            </div>
            <h2 className="mt-1 text-3xl font-extrabold text-gray-900">
              Browse By Category
            </h2>
          </div>
          <Link to="/shop" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition">
            Explore All →
          </Link>
        </div>

        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {categoriesList.map((cat) => (
            <Link
              key={cat.name}
              to={`/shop?category=${encodeURIComponent(cat.name)}`}
              className="group relative flex flex-col items-center overflow-hidden rounded-3xl border border-gray-100 bg-white p-5 text-center shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:border-blue-200"
            >
              <div className="relative mb-3 h-20 w-20 overflow-hidden rounded-2xl bg-slate-100">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition">
                {cat.name}
              </h3>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                {cat.count}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured & Trending Products */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-600">
              <span>🔥</span> Trending Right Now
            </div>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900">
              Featured Products
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Handpicked bestsellers with top customer ratings and fast dispatch.
            </p>
          </div>

          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 rounded-2xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-blue-600"
          >
            <span>View Full Catalog</span>
            <span>→</span>
          </Link>
        </div>

        {loading ? (
          /* Skeleton Loader */
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="animate-pulse rounded-3xl border border-gray-100 bg-white p-4 shadow-xs">
                <div className="h-48 w-full rounded-2xl bg-gray-200"></div>
                <div className="mt-4 h-4 w-1/3 rounded bg-gray-200"></div>
                <div className="mt-2 h-5 w-3/4 rounded bg-gray-200"></div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="h-6 w-1/3 rounded bg-gray-200"></div>
                  <div className="h-8 w-16 rounded-xl bg-gray-200"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <Product key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-xs">
            <h3 className="text-lg font-bold text-gray-900">No products available</h3>
            <p className="mt-1 text-sm text-gray-500">Check back shortly or visit the shop catalog.</p>
          </div>
        )}
      </section>

      {/* AI Assistant Banner / Superpower Promo */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 sm:p-12 text-white shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <span>🤖</span> Grounded Shopping Intelligence
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Meet Cartify AI Assistant
            </h2>
            <p className="text-sm sm:text-base text-blue-100 leading-relaxed">
              Have questions about product compatibility, stock, or tracking an existing order? Open the chat widget on the bottom right to get instant answers grounded in our live store database.
            </p>
            <div className="pt-2">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-bold text-indigo-950 shadow-lg hover:bg-blue-50 transition"
              >
                Try AI Semantic Search 🔍
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-white border-t border-gray-100 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Why Shop With Cartify?
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Built with security, speed, and modern e-commerce reliability at its core.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-3xl border border-gray-100 bg-slate-50/60 p-6 text-center transition hover:shadow-md">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl mb-4">
                🚚
              </div>
              <h3 className="font-bold text-base text-gray-900">Express Delivery</h3>
              <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                Fast, tracked door-to-door delivery with live shipment updates.
              </p>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-slate-50/60 p-6 text-center transition hover:shadow-md">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-2xl mb-4">
                💳
              </div>
              <h3 className="font-bold text-base text-gray-900">Verified Stripe Payments</h3>
              <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                End-to-end encrypted card payments & Cash on Delivery options.
              </p>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-slate-50/60 p-6 text-center transition hover:shadow-md">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-2xl mb-4">
                ✨
              </div>
              <h3 className="font-bold text-base text-gray-900">Verified Reviews</h3>
              <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                Only authenticated purchasers can review items with AI sentiment summaries.
              </p>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-slate-50/60 p-6 text-center transition hover:shadow-md">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-2xl mb-4">
                🛡️
              </div>
              <h3 className="font-bold text-base text-gray-900">Buyer Protection</h3>
              <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                7-day return policy and 100% genuine guaranteed authentic products.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;