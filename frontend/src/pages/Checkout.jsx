import React, { useContext, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { clearCart } from "../redux/cartSlice";

const initialForm = {
  fullName: "",
  street: "",
  city: "",
  postalCode: "",
  country: "India",
};

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { user } = useContext(AuthContext);
  const cartItems = useSelector((state) => state.cart.cartItems);

  const [formData, setFormData] = useState(initialForm);
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!user?.token) {
      navigate("/login");
    }
  }, [navigate, user]);

  useEffect(() => {
    if (searchParams.get("payment") === "cancelled") {
      setError("Payment was cancelled. You can retry with Stripe or select Cash on Delivery.");
    }
  }, [searchParams]);

  useEffect(() => {
    if (cartItems.length === 0 && !searchParams.get("payment")) {
      setError("Your cart is empty. Add products before checkout.");
    }
  }, [cartItems, searchParams]);

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * (item.qty || 1), 0),
    [cartItems]
  );
  const shipping = subtotal > 0 ? (subtotal > 999 ? 0 : 99) : 0;
  const total = subtotal + shipping;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!user?.token) {
      setError("Please log in to place an order.");
      return;
    }

    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    const requiredFields = ["fullName", "street", "city", "postalCode", "country"];
    const missingField = requiredFields.find((field) => !formData[field].trim());

    if (missingField) {
      setError("Please fill in all shipping address fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const address = {
        fullName: formData.fullName,
        street: formData.street,
        city: formData.city,
        postalCode: formData.postalCode,
        country: formData.country,
      };

      const items = cartItems.map((item) => ({
        productId: item._id,
        quantity: item.qty || 1,
        price: item.price,
      }));

      if (paymentMethod === "stripe") {
        // Stripe Hosted Checkout Flow
        const response = await fetch("/api/v1/payment/create-checkout-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ items, address }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to initialize Stripe checkout.");
        }

        // Clear cart in anticipation of payment redirect
        dispatch(clearCart());

        if (data.url) {
          // Redirect to Stripe checkout page
          window.location.href = data.url;
        } else {
          setSuccessMessage("Order registered in pending state.");
          setTimeout(() => navigate("/orders"), 1200);
        }
      } else {
        // Cash on Delivery Order Flow
        const payload = {
          items,
          totalAmount: total,
          address,
          paymentId: "Cash on Delivery",
        };

        const response = await fetch("/api/v1/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to place the order.");
        }

        dispatch(clearCart());
        setSuccessMessage("Order placed successfully! A confirmation email has been sent.");
        setFormData(initialForm);
        setTimeout(() => navigate("/orders"), 1500);
      }
    } catch (err) {
      setError(err.message || "Something went wrong during checkout.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-600">
            🔒 Secure Checkout
          </div>
          <h1 className="mt-3 text-4xl font-extrabold text-gray-900">Complete Your Order</h1>
          <p className="mt-1 text-sm text-gray-500">Fast, verified & encrypted checkout.</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          {/* Shipping and Payment Form */}
          <form onSubmit={handleSubmit} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold text-gray-900">1. Delivery Address</h2>
            <p className="mt-1 text-sm text-gray-500">
              Provide the exact location where you'd like your items delivered.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Full Name
                </label>
                <input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  required
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Street Address
                </label>
                <input
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  placeholder="Apartment, building, flat number, street"
                  required
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                  City
                </label>
                <input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  required
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Postal / Pin Code
                </label>
                <input
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="PIN / Postal Code"
                  required
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Country
                </label>
                <input
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="Country"
                  required
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="mt-8 border-t border-gray-100 pt-6">
              <h2 className="text-xl font-bold text-gray-900">2. Payment Method</h2>
              <p className="mt-1 text-sm text-gray-500">Choose your preferred payment option.</p>

              <div className="mt-4 space-y-3">
                {/* Stripe Card Payment */}
                <label className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition ${
                  paymentMethod === "stripe"
                    ? "border-blue-600 bg-blue-50/40 ring-2 ring-blue-600/10"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="stripe"
                    checked={paymentMethod === "stripe"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-1 text-blue-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900">Pay with Card / Stripe (Test Mode)</span>
                      <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">Recommended</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Redirects to Stripe's secure test checkout page. Test card <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-800">4242 4242 4242 4242</code>.
                    </p>
                  </div>
                </label>

                {/* Cash on Delivery */}
                <label className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition ${
                  paymentMethod === "cod"
                    ? "border-blue-600 bg-blue-50/40 ring-2 ring-blue-600/10"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-1 text-blue-600"
                  />
                  <div>
                    <span className="font-bold text-gray-900">Cash on Delivery (COD)</span>
                    <p className="mt-1 text-xs text-gray-500">
                      Pay with cash or UPI directly when your package is delivered to your doorstep.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {error && (
              <div className="mt-6 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="mt-6 flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
                <span>✅</span>
                <span>{successMessage}</span>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-gray-100 pt-6">
              <Link to="/cart" className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition">
                ← Back to Cart
              </Link>
              <button
                type="submit"
                disabled={isSubmitting || cartItems.length === 0}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3.5 font-bold text-white shadow-lg shadow-blue-500/20 transition hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Processing Order...</span>
                  </>
                ) : paymentMethod === "stripe" ? (
                  "Proceed to Stripe Payment →"
                ) : (
                  "Place Order (COD)"
                )}
              </button>
            </div>
          </form>

          {/* Order Summary Sidebar */}
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8 h-fit">
            <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>

            <div className="mt-6 divide-y divide-gray-100">
              {cartItems.map((item) => (
                <div key={item._id} className="flex items-center justify-between py-3 gap-3">
                  <div className="flex items-center gap-3">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="h-12 w-12 rounded-xl object-cover" />
                    ) : (
                      <div className="h-12 w-12 rounded-xl bg-gray-100"></div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-gray-900 line-clamp-1">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.qty || 1}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-900">₹{item.price * (item.qty || 1)}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3 border-t border-gray-100 pt-4 text-sm text-gray-600">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">₹{subtotal}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span className="text-green-600 font-semibold">FREE</span> : `₹${shipping}`}</span>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 pt-4 text-base font-extrabold text-gray-900">
                <span>Total Due</span>
                <span className="text-2xl font-black text-blue-600">₹{total}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
