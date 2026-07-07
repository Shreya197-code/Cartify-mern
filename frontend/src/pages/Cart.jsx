import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { addToCart, removeFromCart } from "../redux/cartSlice";

const Cart = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.cartItems);

  const updateQuantity = (item, newQuantity) => {
    if (newQuantity < 1) return;

    dispatch(
      addToCart({
        ...item,
        qty: newQuantity,
      })
    );
  };

  const removeItem = (itemId) => {
    dispatch(removeFromCart(itemId));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = subtotal > 0 ? 99 : 0;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
              Shopping Cart
            </p>
            <h1 className="mt-2 text-4xl font-bold text-gray-900">Your cart</h1>
          </div>
          <p className="text-gray-600">
            {cartItems.length} item{cartItems.length === 1 ? "" : "s"} in your bag
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900">Your cart is empty</h2>
            <p className="mt-3 text-gray-600">
              Add some products to continue shopping.
            </p>
            <Link
              to="/shop"
              className="mt-6 inline-flex rounded-full bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className="flex flex-col gap-4 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm md:flex-row md:items-center"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-28 w-full rounded-2xl object-cover md:w-28"
                  />

                  <div className="flex-1">
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{item.name}</h3>
                        <p className="mt-1 text-sm text-gray-500">₹{item.price}</p>
                      </div>
                      <button
                        onClick={() => removeItem(item._id)}
                        className="text-sm font-medium text-red-500 transition hover:text-red-600"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <div className="flex items-center rounded-full border border-gray-300">
                        <button
                          onClick={() => updateQuantity(item, item.qty - 1)}
                          className="px-3 py-2 text-lg text-gray-700 transition hover:text-blue-600"
                        >
                          −
                        </button>
                        <span className="min-w-[2.5rem] text-center text-sm font-semibold text-gray-900">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateQuantity(item, item.qty + 1)}
                          className="px-3 py-2 text-lg text-gray-700 transition hover:text-blue-600"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-sm font-semibold text-gray-900">
                        Subtotal: ₹{item.price * item.qty}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-gray-900">Order Summary</h2>
              <div className="mt-6 space-y-3 text-sm text-gray-600">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 text-base font-semibold text-gray-900">
                  <div className="flex items-center justify-between">
                    <span>Total</span>
                    <span>₹{total}</span>
                  </div>
                </div>
              </div>

              <Link
                to="/checkout"
                className="mt-8 block w-full rounded-full bg-blue-600 px-6 py-3 text-center font-semibold text-white transition hover:bg-blue-700"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
