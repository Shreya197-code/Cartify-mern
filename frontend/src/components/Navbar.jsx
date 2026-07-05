import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useSelector } from "react-redux";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const cartItems = useSelector((state) => state.cart.cartItems);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-3 text-2xl font-bold text-blue-600"
        >
          <img
            src="/CartifyLogo.png"
            alt="Cartify"
            className="w-10 h-10 rounded-xl object-cover shadow-md"
          />

          <span>Cartify</span>
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

            {cartItems.length > 0 && (
              <span className="absolute -top-2 -right-4 bg-red-500 text-white text-xs h-5 w-5 rounded-full flex items-center justify-center">
                {cartItems.length}
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