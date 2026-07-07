import React, { useContext, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { clearCart } from "../redux/cartSlice";

const initialForm = {
  fullName: "",
  street: "",
  city: "",
  postalCode: "",
  country: "",
};

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useContext(AuthContext);
  const cartItems = useSelector((state) => state.cart.cartItems);

  const [formData, setFormData] = useState(initialForm);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!user?.token) {
      navigate("/login");
    }
  }, [navigate, user]);

  useEffect(() => {
    if (cartItems.length === 0) {
      setError("Your cart is empty. Add products before checkout.");
    }
  }, [cartItems]);

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.qty, 0),
    [cartItems]
  );
  const shipping = subtotal > 0 ? 99 : 0;
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
      setError("Please fill in all shipping details.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        items: cartItems.map((item) => ({
          productId: item._id,
          quantity: item.qty,
          price: item.price,
        })),
        totalAmount: total,
        address: {
          fullName: formData.fullName,
          street: formData.street,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
        },
        paymentId: paymentMethod === "cod" ? "COD" : "razorpay_pending",
      };

      const response = await fetch("/api/orders", {
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
      setSuccessMessage("Order placed successfully. Your order is being processed.");
      setFormData(initialForm);
      setTimeout(() => navigate("/"), 1200);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            Checkout
          </p>
          <h1 className="mt-2 text-4xl font-bold text-gray-900">Complete your order</h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-semibold text-gray-900">Shipping address</h2>
            <p className="mt-2 text-sm text-gray-600">
              We will deliver your order to this address.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">Full name</label>
                <input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">Street address</label>
                <input
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  placeholder="House number, street name"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">City</label>
                <input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Postal code</label>
                <input
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="Postal code"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">Country</label>
                <input
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="Country"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <h3 className="text-lg font-semibold text-gray-900">Payment method</h3>
              <div className="mt-4 space-y-3">
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-white p-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={(event) => setPaymentMethod(event.target.value)}
                    className="mt-1"
                  />
                  <span>
                    <span className="block font-medium text-gray-900">Cash on Delivery</span>
                    <span className="text-sm text-gray-500">Pay when your order arrives.</span>
                  </span>
                </label>

                <label className="flex cursor-not-allowed items-start gap-3 rounded-xl border border-gray-200 bg-white p-3 opacity-70">
                  <input type="radio" name="paymentMethod" value="razorpay" disabled />
                  <span>
                    <span className="block font-medium text-gray-900">Razorpay</span>
                    <span className="text-sm text-gray-500">Integration ready for the next phase.</span>
                  </span>
                </label>
              </div>
            </div>

            {error && <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
            {successMessage && <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">{successMessage}</div>}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Link to="/cart" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                ← Back to cart
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Placing order..." : "Place order"}
              </button>
            </div>
          </form>

          <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-semibold text-gray-900">Order summary</h2>

            <div className="mt-6 space-y-3 text-sm text-gray-600">
              {cartItems.map((item) => (
                <div key={item._id} className="flex items-center justify-between gap-3">
                  <span>
                    {item.name} × {item.qty}
                  </span>
                  <span>₹{item.price * item.qty}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3 border-t border-gray-200 pt-4 text-sm text-gray-600">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 pt-3 text-base font-semibold text-gray-900">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
