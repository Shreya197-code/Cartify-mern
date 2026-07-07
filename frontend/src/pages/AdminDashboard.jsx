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
          fetch("/api/admin/dashboard", {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
          fetch("/api/orders", {
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
        setOrders(ordersData || []);
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
    }).format(amount);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-100 pt-8">
        <div className="max-w-7xl mx-auto px-6 pb-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-2">Overview of user, product, and sales performance.</p>
            </div>
          </div>

          <div className="bg-white shadow rounded-3xl p-8">
            {loading ? (
              <div className="flex items-center justify-center min-h-[240px]">
                <div className="text-lg font-medium text-gray-700">Loading dashboard...</div>
              </div>
            ) : error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
                <p className="font-semibold">Dashboard error</p>
                <p>{error}</p>
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                  <div className="rounded-3xl bg-blue-600 text-white p-6 shadow-sm">
                    <p className="text-sm uppercase tracking-[0.2em] opacity-80">Total Users</p>
                    <p className="mt-4 text-4xl font-bold">{analytics.totalUsers ?? 0}</p>
                  </div>
                  <div className="rounded-3xl bg-emerald-600 text-white p-6 shadow-sm">
                    <p className="text-sm uppercase tracking-[0.2em] opacity-80">Total Products</p>
                    <p className="mt-4 text-4xl font-bold">{analytics.totalProducts ?? 0}</p>
                  </div>
                  <div className="rounded-3xl bg-indigo-600 text-white p-6 shadow-sm">
                    <p className="text-sm uppercase tracking-[0.2em] opacity-80">Total Orders</p>
                    <p className="mt-4 text-4xl font-bold">{analytics.totalOrders ?? 0}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-900 text-white p-6 shadow-sm">
                    <p className="text-sm uppercase tracking-[0.2em] opacity-80">Total Revenue</p>
                    <p className="mt-4 text-4xl font-bold">{formatCurrency(analytics.totalRevenue ?? 0)}</p>
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3 mb-8">
                  <div className="rounded-3xl border border-gray-200 p-6 bg-slate-50">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Quick Links</p>
                    <div className="mt-6 space-y-4 text-sm text-gray-700">
                      <a href="/shop" className="block rounded-2xl bg-white p-4 shadow-sm hover:shadow-md transition">Browse Products</a>
                      <a href="/orders" className="block rounded-2xl bg-white p-4 shadow-sm hover:shadow-md transition">View Orders</a>
                      <a href="/profile" className="block rounded-2xl bg-white p-4 shadow-sm hover:shadow-md transition">User Settings</a>
                    </div>
                  </div>
                  <div className="rounded-3xl border border-gray-200 p-6 bg-slate-50">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Revenue Snapshot</p>
                    <p className="mt-6 text-3xl font-semibold text-gray-900">{formatCurrency(analytics.totalRevenue ?? 0)}</p>
                    <p className="mt-2 text-sm text-gray-600">Revenue from paid orders only.</p>
                  </div>
                  <div className="rounded-3xl border border-gray-200 p-6 bg-slate-50">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Recent activity</p>
                    <p className="mt-6 text-xl font-bold text-gray-900">{orders.length}</p>
                    <p className="mt-2 text-sm text-gray-600">Most recent orders in the system.</p>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Orders</h2>
                  <div className="overflow-x-auto rounded-3xl border border-gray-200 bg-white">
                    <table className="min-w-full text-left">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-5 py-4 text-sm font-semibold text-gray-500">Order ID</th>
                          <th className="px-5 py-4 text-sm font-semibold text-gray-500">Customer</th>
                          <th className="px-5 py-4 text-sm font-semibold text-gray-500">Total</th>
                          <th className="px-5 py-4 text-sm font-semibold text-gray-500">Status</th>
                          <th className="px-5 py-4 text-sm font-semibold text-gray-500">Payment</th>
                          <th className="px-5 py-4 text-sm font-semibold text-gray-500">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 6).map((order) => (
                          <tr key={order._id} className="border-t border-gray-100">
                            <td className="px-5 py-4 text-sm text-gray-700">{order._id.slice(-8)}</td>
                            <td className="px-5 py-4 text-sm text-gray-700">{order.user?.username || order.user?.email || 'Guest'}</td>
                            <td className="px-5 py-4 text-sm font-semibold text-gray-900">{formatCurrency(order.totalAmount)}</td>
                            <td className="px-5 py-4 text-sm text-gray-700 capitalize">{order.status}</td>
                            <td className="px-5 py-4 text-sm text-gray-700">{order.paymentId ? 'Paid' : 'COD'}</td>
                            <td className="px-5 py-4 text-sm text-gray-700">{new Date(order.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {orders.length === 0 && (
                      <div className="p-6 text-gray-600">No recent orders available.</div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminDashboard;
