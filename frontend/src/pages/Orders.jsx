import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Orders = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getPaymentDetails = (paymentId) => {
    if (!paymentId || paymentId === "COD") {
      return { method: "Cash on Delivery", status: "Pending" };
    }

    if (paymentId === "razorpay_pending") {
      return { method: "Online Payment", status: "Pending" };
    }

    return { method: "Online Payment", status: "Paid" };
  };

  useEffect(() => {
    if (!user?.token) {
      navigate("/login");
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/orders/myorders", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load orders.");
        }

        setOrders(data || []);
      } catch (err) {
        setError(err.message || "Something went wrong while loading your orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate, user]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            Order History
          </p>
          <h1 className="mt-2 text-4xl font-bold text-gray-900">My Orders</h1>
          <p className="mt-2 text-sm text-gray-600">
            Review your past purchases and track your order status.
          </p>
        </div>

        {loading ? (
          <div className="rounded-3xl bg-white p-10 text-center text-lg text-gray-700 shadow-sm">
            Loading your orders...
          </div>
        ) : error ? (
          <div className="rounded-3xl bg-red-50 p-8 text-red-700 shadow-sm">
            <p className="font-semibold">Unable to load orders</p>
            <p className="mt-2">{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
            <p className="text-xl font-semibold text-gray-900">No orders found yet.</p>
            <p className="mt-2 text-gray-600">Once you place an order, it will appear here.</p>
            <Link
              to="/shop"
              className="mt-6 inline-flex rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="rounded-3xl bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-gray-500">Order ID</p>
                    <p className="mt-2 text-lg font-semibold text-gray-900">{order._id}</p>
                  </div>
                  <div className="space-y-2 text-right">
                    <p className="text-sm text-gray-500">Placed</p>
                    <p className="text-base font-semibold text-gray-900">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="space-y-2 text-right">
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="text-base font-semibold text-blue-600 capitalize">{order.status}</p>
                  </div>
                  <div className="space-y-2 text-right">
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="text-base font-semibold text-gray-900">₹{order.totalAmount}</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-sm uppercase tracking-[0.2em] text-gray-500">Shipping</p>
                    <p className="mt-3 text-sm text-gray-700">{order.address.fullName}</p>
                    <p className="text-sm text-gray-700">{order.address.street}</p>
                    <p className="text-sm text-gray-700">
                      {order.address.city}, {order.address.postalCode}
                    </p>
                    <p className="text-sm text-gray-700">{order.address.country}</p>
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm uppercase tracking-[0.2em] text-gray-500">Payment method</p>
                        <p className="mt-2 text-sm font-semibold text-gray-900">
                          {getPaymentDetails(order.paymentId).method}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm uppercase tracking-[0.2em] text-gray-500">Payment status</p>
                        <p className={`mt-2 text-sm font-semibold ${order.paymentId === 'COD' ? 'text-yellow-600' : 'text-green-600'}`}>
                          {getPaymentDetails(order.paymentId).status}
                        </p>
                      </div>
                    </div>

                    <p className="mt-6 text-sm uppercase tracking-[0.2em] text-gray-500">Items</p>
                    <div className="mt-3 space-y-4">
                      {order.items.map((item) => {
                        const product = item.productId || {};
                        const productName = product.name || "Product";
                        const productImage = product.imageUrl || "/placeholder-product.png";
                        const productId = product._id || item.productId;
                        return (
                          <div key={productId} className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:flex sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                              <img
                                src={productImage}
                                alt={productName}
                                className="h-20 w-20 rounded-2xl object-cover"
                              />
                              <div>
                                <p className="text-base font-semibold text-gray-900">{productName}</p>
                                <p className="mt-1 text-sm text-gray-500">Qty: {item.quantity}</p>
                                <p className="mt-1 text-sm text-gray-500">Price: ₹{item.price.toFixed(2)}</p>
                                <p className="mt-1 text-sm text-gray-900 font-semibold">Total: ₹{(item.price * item.quantity).toFixed(2)}</p>
                              </div>
                            </div>
                            <div className="mt-4 flex flex-col gap-2 sm:mt-0 sm:items-end">
                              <Link
                                to={`/product/${productId}`}
                                className="inline-flex items-center rounded-full border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                              >
                                View Product
                              </Link>
                              {order.status === "delivered" && (
                                <Link
                                  to={`/product/${productId}`}
                                  className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                                >
                                  Write Review
                                </Link>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
