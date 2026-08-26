import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import { AuthContext } from "../context/AuthContext";

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // AI Description Generator State
  const [aiName, setAiName] = useState("");
  const [aiCategory, setAiCategory] = useState("Electronics");
  const [aiSpecs, setAiSpecs] = useState("");
  const [generatedDesc, setGeneratedDesc] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [descCopied, setDescCopied] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        const [analyticsRes, ordersRes] = await Promise.all([
          fetch("/api/v1/admin/dashboard", {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
          fetch("/api/v1/orders", {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
        ]);

        const analyticsData = await analyticsRes.json();
        const ordersData = await ordersRes.json();

        if (!analyticsRes.ok) {
          throw new Error(analyticsData.message || "Failed to fetch analytics");
        }

        if (!ordersRes.ok) {
          throw new Error(ordersData.message || "Failed to fetch recent orders");
        }

        setAnalytics(analyticsData.analytics || {});
        setOrders(Array.isArray(ordersData) ? ordersData : []);
      } catch (err) {
        console.error(err);
        setError(err.message || "Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const handleGenerateDescription = async (e) => {
    e.preventDefault();
    if (!aiName || !aiSpecs || isGenerating) return;
    setIsGenerating(true);
    setGeneratedDesc("");
    setDescCopied(false);

    try {
      const res = await fetch("/api/v1/ai/generate-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          name: aiName,
          category: aiCategory,
          specs: aiSpecs,
        }),
      });
      const data = await res.json();
      if (res.ok && data.description) {
        setGeneratedDesc(data.description);
      } else {
        setGeneratedDesc("Failed to generate description. Please try again.");
      }
    } catch (err) {
      setGeneratedDesc("Network error generating description.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedDesc);
    setDescCopied(true);
    setTimeout(() => setDescCopied(false), 2000);
  };

  return (
    <>
      <div className="min-h-screen bg-slate-50 pt-8 pb-16">
        <div className="mx-auto max-w-7xl px-6">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-600">
                🛡️ Admin Central
              </div>
              <h1 className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Analytics & Store Control
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Real-time sales, order fulfillment, and AI copywriting tools.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center rounded-3xl border border-gray-100 bg-white p-12 shadow-sm">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                <p className="text-sm font-medium text-gray-600">Loading analytics & orders...</p>
              </div>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
              <p className="font-bold">Dashboard Error</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Metric Highlights */}
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-600 to-blue-700 p-6 text-white shadow-lg shadow-blue-500/15">
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-100">Total Users</p>
                  <p className="mt-3 text-3xl font-black">{analytics.totalUsers ?? 0}</p>
                  <p className="mt-1 text-xs text-blue-200">Registered customers</p>
                </div>

                <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white shadow-lg shadow-emerald-500/15">
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-100">Catalog Products</p>
                  <p className="mt-3 text-3xl font-black">{analytics.totalProducts ?? 0}</p>
                  <p className="mt-1 text-xs text-emerald-200">Active store items</p>
                </div>

                <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-600 to-purple-700 p-6 text-white shadow-lg shadow-indigo-500/15">
                  <p className="text-xs font-bold uppercase tracking-wider text-indigo-100">Total Orders</p>
                  <p className="mt-3 text-3xl font-black">{analytics.totalOrders ?? 0}</p>
                  <p className="mt-1 text-xs text-indigo-200">Placed orders</p>
                </div>

                <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-lg shadow-slate-900/15">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-300">Verified Revenue</p>
                  <p className="mt-3 text-3xl font-black">{formatCurrency(analytics.totalRevenue ?? 0)}</p>
                  <p className="mt-1 text-xs text-slate-400">From paid & delivered orders</p>
                </div>
              </div>

              {/* Revenue Trends & Status Breakdown */}
              <div className="grid gap-6 lg:grid-cols-12">
                {/* Revenue Over Time Visualization */}
                <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">Revenue Performance</h3>
                      <p className="text-xs text-gray-500">Monthly breakdown of successful transactions</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    {analytics.revenueOverTime && analytics.revenueOverTime.length > 0 ? (
                      <div className="space-y-4">
                        {analytics.revenueOverTime.map((item, idx) => {
                          const maxRev = Math.max(...analytics.revenueOverTime.map((r) => r.revenue || 1));
                          const percent = Math.max(8, Math.round((item.revenue / maxRev) * 100));
                          return (
                            <div key={idx} className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs font-semibold">
                                <span className="text-gray-700">{item.month}</span>
                                <span className="text-blue-600">{formatCurrency(item.revenue)} ({item.orders} orders)</span>
                              </div>
                              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500"
                                  style={{ width: `${percent}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex h-36 items-center justify-center rounded-2xl bg-slate-50 text-sm text-gray-500">
                        No historical revenue recorded yet.
                      </div>
                    )}
                  </div>
                </div>

                {/* Orders by Status */}
                <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-4">
                  <h3 className="font-bold text-lg text-gray-900">Order Status Breakdown</h3>
                  <p className="text-xs text-gray-500">Distribution across fulfillment stages</p>

                  <div className="mt-6 space-y-3">
                    {analytics.ordersByStatus && analytics.ordersByStatus.length > 0 ? (
                      analytics.ordersByStatus.map((statusItem, idx) => (
                        <div key={idx} className="flex items-center justify-between rounded-2xl border border-gray-100 bg-slate-50/60 p-3.5">
                          <span className="text-sm font-semibold text-gray-800">{statusItem.name}</span>
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                            {statusItem.value}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs text-gray-500">No status data yet</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Superpower 3: Admin AI Copywriting Co-Pilot */}
              <div className="rounded-3xl border border-purple-100 bg-gradient-to-br from-purple-50/50 via-white to-indigo-50/40 p-6 shadow-sm sm:p-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-md shadow-purple-500/20">
                    ✨
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-gray-900">AI Description Co-Pilot</h3>
                    <p className="text-xs text-gray-500">Generate high-converting product descriptions from bullet points</p>
                  </div>
                </div>

                <form onSubmit={handleGenerateDescription} className="mt-6 grid gap-4 lg:grid-cols-12">
                  <div className="lg:col-span-4">
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-600">Product Name</label>
                    <input
                      type="text"
                      value={aiName}
                      onChange={(e) => setAiName(e.target.value)}
                      placeholder="e.g. Aura Pro Noise Cancelling Headphones"
                      required
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    />
                  </div>

                  <div className="lg:col-span-3">
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-600">Category</label>
                    <select
                      value={aiCategory}
                      onChange={(e) => setAiCategory(e.target.value)}
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    >
                      <option value="Electronics">Electronics</option>
                      <option value="Audio">Audio</option>
                      <option value="Clothing">Clothing</option>
                      <option value="Footwear">Footwear</option>
                      <option value="Accessories">Accessories</option>
                      <option value="Home & Kitchen">Home & Kitchen</option>
                    </select>
                  </div>

                  <div className="lg:col-span-5">
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-600">Key Features / Specs</label>
                    <input
                      type="text"
                      value={aiSpecs}
                      onChange={(e) => setAiSpecs(e.target.value)}
                      placeholder="e.g. 40hr battery, ANC, USB-C fast charge, spatial audio"
                      required
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    />
                  </div>

                  <div className="lg:col-span-12 flex justify-end">
                    <button
                      type="submit"
                      disabled={isGenerating || !aiName || !aiSpecs}
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-purple-500/20 transition hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50"
                    >
                      {isGenerating ? "Drafting with AI..." : "Generate Description ✨"}
                    </button>
                  </div>
                </form>

                {generatedDesc && (
                  <div className="mt-6 rounded-2xl border border-purple-200 bg-white p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-purple-700">AI Generated Draft</span>
                      <button
                        onClick={copyToClipboard}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition"
                      >
                        {descCopied ? "✅ Copied!" : "📋 Copy to Clipboard"}
                      </button>
                    </div>
                    <p className="whitespace-pre-line text-sm text-gray-700 leading-relaxed">{generatedDesc}</p>
                  </div>
                )}
              </div>

              {/* Low Stock Alerts & Top Products */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Low Stock Alerts */}
                <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg text-gray-900">⚠️ Low Stock Alerts</h3>
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                      {analytics.lowStockProducts?.length || 0} Items
                    </span>
                  </div>

                  {analytics.lowStockProducts && analytics.lowStockProducts.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {analytics.lowStockProducts.map((p) => (
                        <div key={p._id} className="flex items-center justify-between py-3">
                          <div className="flex items-center gap-3">
                            {p.imageUrl ? (
                              <img src={p.imageUrl} alt={p.name} className="h-10 w-10 rounded-xl object-cover" />
                            ) : (
                              <div className="h-10 w-10 rounded-xl bg-gray-100"></div>
                            )}
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                              <p className="text-xs text-gray-500">{p.category}</p>
                            </div>
                          </div>
                          <span className="rounded-lg bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600">
                            {p.stock === 0 ? "Out of Stock" : `${p.stock} left`}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="p-4 text-center text-xs text-gray-500">All products have healthy inventory levels.</p>
                  )}
                </div>

                {/* Top Selling Products */}
                <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg text-gray-900">🏆 Top Selling Items</h3>
                    <span className="text-xs text-gray-500">By quantity sold</span>
                  </div>

                  {analytics.topSellingProducts && analytics.topSellingProducts.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {analytics.topSellingProducts.map((p) => (
                        <div key={p._id} className="flex items-center justify-between py-3">
                          <div className="flex items-center gap-3">
                            {p.imageUrl ? (
                              <img src={p.imageUrl} alt={p.name} className="h-10 w-10 rounded-xl object-cover" />
                            ) : (
                              <div className="h-10 w-10 rounded-xl bg-gray-100"></div>
                            )}
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                              <p className="text-xs text-gray-500">{p.totalSold} units sold</p>
                            </div>
                          </div>
                          <span className="text-sm font-bold text-emerald-600">{formatCurrency(p.totalRevenue)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="p-4 text-center text-xs text-gray-500">Sales rankings will appear as orders come in.</p>
                  )}
                </div>
              </div>

              {/* Recent Orders Table */}
              <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-bold text-xl text-gray-900">Recent Customer Orders</h3>
                  <span className="text-xs text-gray-500">Showing latest {orders.length} orders</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-left">
                    <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-gray-500">
                      <tr>
                        <th className="rounded-l-xl px-4 py-3">Order ID</th>
                        <th className="px-4 py-3">Customer</th>
                        <th className="px-4 py-3">Total</th>
                        <th className="px-4 py-3">Payment</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="rounded-r-xl px-4 py-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {orders.slice(0, 10).map((order) => (
                        <tr key={order._id} className="hover:bg-slate-50/60 transition">
                          <td className="px-4 py-3.5 font-mono text-xs text-blue-600 font-semibold">#{order._id.slice(-6)}</td>
                          <td className="px-4 py-3.5 font-medium text-gray-800">
                            {order.user?.username || order.user?.email || "Customer"}
                          </td>
                          <td className="px-4 py-3.5 font-bold text-gray-900">{formatCurrency(order.totalAmount)}</td>
                          <td className="px-4 py-3.5">
                            <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-bold ${
                              order.paymentStatus === "paid"
                                ? "bg-emerald-50 text-emerald-700"
                                : order.paymentStatus === "failed"
                                ? "bg-red-50 text-red-700"
                                : "bg-amber-50 text-amber-700"
                            }`}>
                              {order.paymentStatus ? order.paymentStatus.toUpperCase() : (order.paymentId ? "PAID" : "PENDING")}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="capitalize font-medium text-gray-700">{order.status || "pending"}</span>
                          </td>
                          <td className="px-4 py-3.5 text-xs text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {orders.length === 0 && (
                    <div className="py-8 text-center text-sm text-gray-500">No orders registered yet.</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminDashboard;
