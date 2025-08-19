import React, { useContext, useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Auth/Login";
import EmployeeDashboard from "./components/Dashboard/EmployeeDashboard";
import AdminDashboard from "./components/Dashboard/AdminDashboard";
import SignUp from "./components/Auth/SignUp";
import { getLocalStorage, setLocalStorage } from "./utils/localStorage";
import { AuthContext } from "./context/Authprovider";

const App = () => {
  const [user, setUser] = useState(null);
  const [loggedInUserData, setLoggedInUserData] = useState(null);
  const [authData, setAuthData] = useContext(AuthContext);
  useEffect(() => {
    const loggedInUser = localStorage.getItem("loggedInUser");

    if (loggedInUser) {
      const userData = JSON.parse(loggedInUser);
      setUser(userData.role);
      setLoggedInUserData(userData.data);
    }
  }, []);

  const handleLogin = (email, password) => {
    if (email === "admin@me.com" && password === "123") {
      setUser("admin");
      localStorage.setItem("loggedInUser", JSON.stringify({ role: "admin" }));
    } else {
      const employee = authData.employees.find(
        (e) =>
          e.email.trim() === email.trim() &&
          e.password.trim() === password.trim()
      );

      if (employee) {
        setUser("employee");
        setLoggedInUserData(employee);
        localStorage.setItem(
          "loggedInUser",
          JSON.stringify({ role: "employee", data: employee })
        );
      } else {
        alert("Invalid Credentials");
      }
    }
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          user ? (
            <Navigate to={user === "employee" ? "/employee" : "/admin"} />
          ) : (
            <Login handleLogin={handleLogin} />
          )
        }
      />
      <Route path="/signup" element={<SignUp />} />
      <Route
        path="/admin"
        element={
          user === "admin" ? (
            <AdminDashboard changeUser={setUser} />
          ) : (
            <Navigate to="/" />
          )
        }
      />
      <Route
        path="/employee"
        element={
          user === "employee" ? (
            <EmployeeDashboard changeUser={setUser} data={loggedInUserData} />
          ) : (
            <Navigate to="/" />
          )
        }
      />
    </Routes>
  );
};

export default App;
