import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useSelector, useDispatch } from "react-redux";
import { clearCart } from "../redux/cartSlice";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.cartItems);
  const navigate = useNavigate();

  const totalCartCount = cartItems.reduce((acc, item) => acc + (Number(item.qty) || 1), 0);

  const handleLogout = () => {
    dispatch(clearCart());
    logout();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link
          to="/"
          className="group flex items-center gap-3 transition-transform duration-300 hover:scale-105"
        >
          <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-blue-500/25 ring-2 ring-white">
            <img
              src="/CartifyLogo.png"
              alt="Cartify"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/CartifyLogo.svg";
              }}
              className="h-full w-full rounded-[14px] object-cover"
            />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-2xl font-black tracking-tight text-transparent">
                Cartify
              </span>
              <span className="rounded-md bg-blue-100 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-blue-700">
                AI
              </span>
            </div>
          </div>
        </Link>

        {/* Navigation */}
        <div className="hidden md:flex items-center gap-8">

          <Link
            to="/"
            className="text-gray-700 hover:text-blue-600 font-medium transition"
          >
            Home
          </Link>

          <Link
            to="/shop"
            className="text-gray-700 hover:text-blue-600 font-medium transition"
          >
            Shop
          </Link>

          <Link
            to="/cart"
            className="relative text-gray-700 hover:text-blue-600 font-medium transition"
          >
            Cart

            {user && totalCartCount > 0 && (
              <span className="absolute -top-2 -right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[11px] font-bold h-5 min-w-[20px] px-1 rounded-full flex items-center justify-center shadow-xs">
                {totalCartCount}
              </span>
            )}
          </Link>

          {user && (
            <Link
              to="/orders"
              className="text-gray-700 hover:text-blue-600 font-medium transition"
            >
              Orders
            </Link>
          )}

        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">

          {user ? (
            <>
              <Link
                to="/profile"
                className="font-medium text-gray-700 hover:text-blue-600"
              >
                Hi, <span className="text-blue-600">{user.name}</span>
              </Link>

              {user.role === "admin" && (
                <Link
                  to="/admin"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow hover:shadow-lg transition"
                >
                  Admin
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-red-500 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-5 py-2 rounded-xl border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow hover:shadow-lg transition"
              >
                Sign Up
              </Link>
            </>
          )}

        </div>
      </div>
    </nav>
  );
};

export default Navbar;