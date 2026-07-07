import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialEmail = location.state?.email || queryParams.get("email") || "";

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!email.trim() || !otp.trim()) {
      setError("Please provide both your email and OTP.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to verify OTP.");
      }

      setSuccessMessage("Email verified successfully. You can now log in.");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-10">
        <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
            Verify Your Email
          </h2>

          <p className="text-center text-gray-500 mb-6">
            Enter the OTP sent to your email to activate your account.
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                OTP
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
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
              {isSubmitting ? "Verifying..." : "Verify OTP"}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            Already verified?{" "}
            <Link to="/login" className="text-black font-semibold hover:underline">
              Login now
            </Link>
          </p>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default VerifyOtp;
