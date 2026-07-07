import React, { useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const validateEmail = (value) => {
    const re = /^\S+@\S+\.\S+$/;
    return re.test(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage(
          data.message || "If the email exists, a reset link has been sent."
        );
      } else {
        setError(data.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-10">
        <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
            Forgot Password
          </h2>

          <p className="text-center text-gray-500 mb-6">
            Enter your registered email and we'll send a password reset link.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-600">
                {successMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition duration-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            Remembered your password?{" "}
            <Link to="/login" className="text-black font-semibold hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ForgotPassword;
