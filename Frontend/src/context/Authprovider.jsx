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

  // Logout function to clear all auth data
  const logout = () => {
    console.log("🚪 Logging out user");
    setAuthState({ token: null, profile: null, role: null });
    localStorage.removeItem("token");
    localStorage.removeItem("profile");
    localStorage.removeItem("role");
    localStorage.removeItem("loggedInUser");
    window.location.href = "/"; // Force redirect to login
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (authState.token) {
          console.log("🔍 Fetching profile with token:", authState.token?.substring(0, 20) + "...");
          
          const res = await EmployeesApi.me();
          console.log("📋 Profile response:", res.data);
          
          if (res.data.success) {
            const userData = res.data.data;

            // Save to both state and localStorage
            setAuthState(prev => ({
              ...prev,
              role: userData.role,
              profile: userData,
            }));

            localStorage.setItem("profile", JSON.stringify(userData));
            localStorage.setItem("role", userData.role);
            console.log("✅ Profile loaded successfully");
          } else {
            console.warn("⚠️ Profile fetch failed - invalid response");
            // If token invalid, clear everything
            setAuthState({ token: null, profile: null, role: null });
            localStorage.removeItem("token");
            localStorage.removeItem("profile");
            localStorage.removeItem("role");
            localStorage.removeItem("loggedInUser");
          }
        } else {
          console.log("ℹ️ No token found, skipping profile fetch");
        }
      } catch (err) {
        console.error("❌ Error fetching profile:", err.message);
        
        // Check if it's a network error vs auth error
        if (err.response?.status === 401) {
          console.log("🔐 Token expired or invalid, clearing auth");
          setAuthState({ token: null, profile: null, role: null });
          localStorage.removeItem("token");
          localStorage.removeItem("profile");
          localStorage.removeItem("role");
          localStorage.removeItem("loggedInUser");
        } else {
          console.log("🌐 Network error, keeping existing auth state");
          // For network errors, don't clear the auth state
          // Just use what we have in localStorage
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [authState.token]);

  return (
    <AuthContext.Provider value={{ authState, setAuthState, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
