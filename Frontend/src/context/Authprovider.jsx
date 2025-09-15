import React, { createContext, useEffect, useState } from "react";
import { EmployeesApi } from "../api/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    token: localStorage.getItem("token") || null,
    profile: JSON.parse(localStorage.getItem("profile")) || null,
    role: localStorage.getItem("role") || null,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (authState.token) {
          const res = await EmployeesApi.me();
          console.log(res.data.data, "authcontext");
          if (res.data.success) {
            const userData = res.data.data;

            // Save to both state and localStorage
            setAuthState({
              token: authState.token,
              role: userData.role,
              profile: userData,
            });

            localStorage.setItem("profile", JSON.stringify(userData));
            localStorage.setItem("role", userData.role);
          } else {
            // If token invalid, clear everything
            setAuthState({ token: null, profile: null, role: null });
            localStorage.removeItem("token");
            localStorage.removeItem("profile");
            localStorage.removeItem("role");
          }
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setAuthState({ token: null, profile: null, role: null });
        localStorage.removeItem("token");
        localStorage.removeItem("profile");
        localStorage.removeItem("role");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [authState.token]);

  return (
    <AuthContext.Provider value={{ authState, setAuthState, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
