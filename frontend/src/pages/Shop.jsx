import React, { useEffect, useMemo, useState } from "react";
import Product from "../components/Product";

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 8;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, sortBy]);

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map((product) => product.category))];
    return ["All", ...uniqueCategories];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    let filtered = products.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        product.name?.toLowerCase().includes(normalizedSearch) ||
        product.description?.toLowerCase().includes(normalizedSearch) ||
        product.category?.toLowerCase().includes(normalizedSearch);

      const matchesCategory =
        selectedCategory === "All" || product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    switch (sortBy) {
      case "price-low":
        filtered = [...filtered].sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered = [...filtered].sort((a, b) => b.price - a.price);
        break;
      case "name":
        filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return filtered;
  }, [products, searchTerm, selectedCategory, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
                Shop Collection
              </p>
              <h1 className="mt-3 text-4xl font-bold text-gray-900">
                Discover our products
              </h1>
              <p className="mt-3 max-w-2xl text-lg text-gray-600">
                Browse the latest items, filter by category, and sort to find exactly what you need.
              </p>
            </div>

            <div className="text-sm text-gray-500">
              Showing {filteredProducts.length} product{filteredProducts.length === 1 ? "" : "s"}
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[2fr_1fr_1fr]">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, category, or description"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-700 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-700 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Sort by
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-700 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="rounded-2xl bg-white p-10 text-center text-lg text-gray-500 shadow-sm">
            Loading products...
          </div>
        ) : currentProducts.length > 0 ? (
          <>
            <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
              {currentProducts.map((product) => (
                <Product key={product._id} product={product} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                  className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-blue-500 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      currentPage === page
                        ? "bg-blue-600 text-white"
                        : "border border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-blue-500 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-2xl bg-white p-10 text-center text-lg text-gray-500 shadow-sm">
            No products found for the selected filters.
          </div>
        )}
      </section>
    </div>
  );
};

export default Shop;
