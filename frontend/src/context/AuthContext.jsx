import React, { createContext, useState } from "react";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
 const [user, setUser] = useState(
  JSON.parse(localStorage.getItem("user")) || null
);

const login = (userData, token) => {
  const normalizedUser = {
    ...userData,
    name: userData?.name || userData?.username || userData?.email,
    token,
  };

  localStorage.setItem("user", JSON.stringify(normalizedUser));
  setUser(normalizedUser);
};

const logout = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("cart");
  setUser(null);
};

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;