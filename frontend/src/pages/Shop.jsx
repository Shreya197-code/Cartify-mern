import React, { useEffect, useState, useCallback } from "react";
import Product from "../components/Product";

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isSemanticSearch, setIsSemanticSearch] = useState(false);
  const [isAiSearching, setIsAiSearching] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      if (isSemanticSearch && searchTerm.trim()) {
        setIsAiSearching(true);
        const res = await fetch(`/api/v1/ai/search?q=${encodeURIComponent(searchTerm.trim())}`);
        const data = await res.json();
        if (res.ok && data.results) {
          setProducts(data.results);
          setTotalProducts(data.results.length);
          setTotalPages(1);
        } else {
          setProducts([]);
          setTotalProducts(0);
        }
        setIsAiSearching(false);
      } else {
        const queryParams = new URLSearchParams({
          page: currentPage.toString(),
          limit: "12",
        });

        if (searchTerm.trim()) queryParams.append("keyword", searchTerm.trim());
        if (selectedCategory && selectedCategory !== "All") queryParams.append("category", selectedCategory);
        if (sortBy) queryParams.append("sort", sortBy);
        if (minPrice) queryParams.append("minPrice", minPrice);
        if (maxPrice) queryParams.append("maxPrice", maxPrice);

        const res = await fetch(`/api/v1/products?${queryParams.toString()}`);
        const data = await res.json();

        if (res.ok) {
          if (data.products && Array.isArray(data.products)) {
            setProducts(data.products);
            setTotalPages(data.pages || 1);
            setTotalProducts(data.total || data.products.length);
            if (data.categories && data.categories.length > 0) {
              setCategories(["All", ...data.categories]);
            }
          } else if (Array.isArray(data)) {
            setProducts(data);
            setTotalProducts(data.length);
            setTotalPages(1);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedCategory, sortBy, minPrice, maxPrice, searchTerm, isSemanticSearch]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [fetchProducts]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSortBy("newest");
    setMinPrice("");
    setMaxPrice("");
    setCurrentPage(1);
    setIsSemanticSearch(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header */}
      <section className="border-b border-gray-200 bg-white shadow-xs">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-600">
                <span>✨</span> Curated Catalog
              </div>
              <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
                Explore Cartify Store
              </h1>
              <p className="mt-2 max-w-2xl text-base text-gray-600">
                Discover trending items, high-performance gadgets, and lifestyle essentials with instant smart search.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Semantic AI Toggle */}
              <button
                type="button"
                onClick={() => {
                  setIsSemanticSearch(!isSemanticSearch);
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all ${
                  isSemanticSearch
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-200"
                    : "border border-gray-200 bg-gray-50 text-gray-700 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700"
                }`}
              >
                <span>🧠</span>
                <span>{isSemanticSearch ? "AI Semantic Search Active" : "Enable AI Semantic Search"}</span>
              </button>

              <span className="hidden text-sm font-medium text-gray-500 sm:inline-block">
                {totalProducts} product{totalProducts === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-12">
            {/* Search Input */}
            <div className="lg:col-span-5">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                {isSemanticSearch ? "Ask with natural intent" : "Search keyword"}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder={
                    isSemanticSearch
                      ? "e.g. 'comfortable wireless headset for workout'"
                      : "Search by title, category, keywords..."
                  }
                  className={`w-full rounded-2xl border bg-white px-4 py-3 pl-11 text-sm text-gray-800 shadow-xs outline-none transition ${
                    isSemanticSearch
                      ? "border-purple-300 focus:border-purple-500 focus:ring-3 focus:ring-purple-100"
                      : "border-gray-200 focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                  }`}
                />
                <svg
                  className={`absolute left-3.5 top-3.5 h-5 w-5 ${isSemanticSearch ? "text-purple-500" : "text-gray-400"}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Category Dropdown */}
            <div className="lg:col-span-3">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 shadow-xs outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="lg:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 shadow-xs outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="reviews">Most Reviewed</option>
                <option value="name_asc">Name: A to Z</option>
              </select>
            </div>

            {/* Reset Button */}
            <div className="flex items-end lg:col-span-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        {loading || isAiSearching ? (
          /* Skeleton Loader */
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="animate-pulse rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="h-56 w-full rounded-2xl bg-gray-200"></div>
                <div className="mt-4 h-4 w-1/3 rounded bg-gray-200"></div>
                <div className="mt-2 h-6 w-3/4 rounded bg-gray-200"></div>
                <div className="mt-2 h-4 w-full rounded bg-gray-200"></div>
                <div className="mt-6 flex items-center justify-between">
                  <div className="h-6 w-1/3 rounded bg-gray-200"></div>
                  <div className="h-10 w-20 rounded-xl bg-gray-200"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <Product key={product._id} product={product} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && !isSemanticSearch && (
              <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-xs transition hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`rounded-xl px-4 py-2.5 text-sm font-semibold shadow-xs transition ${
                      currentPage === page
                        ? "bg-blue-600 text-white"
                        : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-xs transition hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-xs">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-blue-600">
              🔍
            </div>
            <h3 className="mt-4 text-xl font-bold text-gray-900">No matching products found</h3>
            <p className="mt-2 text-sm text-gray-500">
              Try adjusting your search query, clearing filters, or asking the AI Assistant on the bottom right.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-6 inline-flex rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Shop;
