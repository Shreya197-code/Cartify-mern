import React, { useContext, useState, useEffect } from "react";
import Footer from "../components/Footer";
import { AuthContext } from "../context/AuthContext";

const Profile = () => {
  const { user, login, logout } = useContext(AuthContext);
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [role, setRole] = useState(user?.role || "user");

  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [error, setError] = useState("");

  // password change
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState("");
  const [pwError, setPwError] = useState("");

  useEffect(() => {
    setUsername(user?.username || "");
    setEmail(user?.email || "");
    setRole(user?.role || "user");
  }, [user]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setError("");
    setSaveMsg("");

    if (!username.trim() || !email.trim()) {
      setError("Username and email are required.");
      return;
    }

    const token = user?.token;
    if (!token) {
      setError("Not authenticated. Please login again.");
      return;
    }

    setIsSaving(true);

    try {
      const res = await fetch("/api/auth/user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username, email }),
      });

      const data = await res.json();
      if (res.ok) {
        setSaveMsg(data.message || "Profile updated");
        // update auth context user
        const updatedUser = { ...user, username: data.user.username, email: data.user.email };
        login(updatedUser, token);
      } else {
        setError(data.message || "Failed to update profile");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError("");
    setPwMsg("");

    if (!oldPassword || !newPassword) {
      setPwError("Please fill both password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwError("New passwords do not match.");
      return;
    }

    const token = user?.token;
    if (!token) {
      setPwError("Not authenticated. Please login again.");
      return;
    }

    setPwSaving(true);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        setPwMsg(data.message || "Password changed successfully");
        // log user out to force re-login
        setTimeout(() => {
          logout();
          window.location.href = "/login";
        }, 1200);
      } else {
        setPwError(data.message || "Failed to change password");
      }
    } catch (err) {
      setPwError("Network error. Please try again.");
    } finally {
      setPwSaving(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-10">
        <div className="w-full max-w-2xl bg-white shadow-xl rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Profile</h2>

          <form onSubmit={handleProfileSave} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <input
                type="text"
                value={role}
                disabled
                className="w-full px-4 py-3 border rounded-lg bg-gray-100"
              />
            </div>

            {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}
            {saveMsg && <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-600">{saveMsg}</div>}

            <button type="submit" disabled={isSaving} className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800">
              {isSaving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>

          <hr className="my-6" />

          <h3 className="text-xl font-semibold mb-4">Change Password</h3>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Old Password</label>
              <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black" />
            </div>

            {pwError && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{pwError}</div>}
            {pwMsg && <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-600">{pwMsg}</div>}

            <button type="submit" disabled={pwSaving} className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800">
              {pwSaving ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Profile;
