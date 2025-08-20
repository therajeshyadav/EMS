import React, { createContext, useEffect, useState } from "react";
import { EmployeesApi } from "../api/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    token: localStorage.getItem("token") || null,
    profile: null,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (authState.token) {
          const res = await EmployeesApi.me();
          if (res.data.success) {
            setAuthState((prev) => ({
              ...prev,
              profile: res.data.data,
            }));
          }
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, [authState.token]);

  return (
    <AuthContext.Provider value={{ authState, setAuthState }}>
      {children}
    </AuthContext.Provider>
  );
};
export default AuthProvider;