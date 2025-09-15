import React, { useContext, useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Auth/Login";
import EmployeeDashboard from "./components/Dashboard/EmployeeDashboard";
import AdminDashboard from "./components/Dashboard/AdminDashboard";
import SignUp from "./components/Auth/SignUp";
import { AuthContext } from "./context/Authprovider";
// test change

const App = () => {
  const [user, setUser] = useState(null);
  const [loggedInUserData, setLoggedInUserData] = useState(null);
  const { authState, setAuthState } = useContext(AuthContext);

 
  useEffect(() => {
    const loggedInUser = localStorage.getItem("loggedInUser");

    if (loggedInUser) {
      const userData = JSON.parse(loggedInUser);
      setUser(userData.role);
      setLoggedInUserData(userData.profile || userData.data);
    }
  }, []);

  return (
    <Routes>
      <Route
        path="/"
        element={
          user ? (
            <Navigate to={user === "employee" ? "/employee" : "/admin"} />
          ) : (
            <Login setUser={setUser} setLoggedInUserData={setLoggedInUserData} />
          )
        }
      />
      <Route path="/signup" element={<SignUp />} />
      <Route
        path="/admin"
        element={
          user === "admin" ? (
            <AdminDashboard changeUser={setUser} data={loggedInUserData} />
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
