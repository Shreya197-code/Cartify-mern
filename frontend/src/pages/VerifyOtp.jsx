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
  const [isResending, setIsResending] = useState(false);
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
      const response = await fetch("/api/v1/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to verify OTP.");
      }

      setSuccessMessage("Email verified successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email.trim() || isResending) return;
    setError("");
    setSuccessMessage("");
    setIsResending(true);

    try {
      const res = await fetch("/api/v1/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage("A fresh 6-digit OTP has been sent to your email.");
      } else {
        setError(data.message || "Failed to resend OTP.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
        <div className="w-full max-w-md bg-white shadow-xl rounded-3xl p-8 border border-gray-100">
          <div className="text-center mb-6">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-blue-600 mb-3">
              📬
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900">
              Verify Your Email
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Enter the 6-digit OTP code sent to your inbox.
            </p>
            <div className="mt-3 rounded-2xl bg-amber-50/80 border border-amber-200/60 p-2.5 text-[11px] text-amber-800">
              💡 <strong>Tip:</strong> If not in your primary inbox, check your <strong>Spam / Junk</strong> folder or click <strong>Resend OTP</strong>.
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100 transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
                  6-Digit OTP Code
                </label>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={!email || isResending}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 disabled:opacity-50"
                >
                  {isResending ? "Resending..." : "Resend OTP"}
                </button>
              </div>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-center text-lg font-mono tracking-widest text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100 transition"
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs font-medium text-red-600">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="rounded-2xl border border-green-200 bg-green-50 p-3.5 text-xs font-medium text-green-600">
                {successMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-2xl font-bold text-sm shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Verifying OTP..." : "Verify & Activate Account"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-6">
            Already verified?{" "}
            <Link to="/login" className="text-blue-600 font-bold hover:underline">
              Log in here
            </Link>
          </p>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default VerifyOtp;
