import React, { createContext, useEffect, useState } from "react";
import { getLocalStorage, setLocalStorage } from "../utils/localStorage";

export const AuthContext = createContext();

const Authprovider = ({ children }) => {
  const [userData, setUserData] = useState({ employees: [], admin: [] });

  useEffect(() => {
    if (!localStorage.getItem("employees")) {
      setLocalStorage();
    }
    const storedData = getLocalStorage();

    console.log("Loaded userData from localStorage:", storedData); // 🛠 Debugging

    setUserData(storedData || { employees: [], admin: [] }); // ✅ Default fallback
  }, []);
  return (
    <div>
      <AuthContext.Provider value={[userData, setUserData]}>
        {children}
      </AuthContext.Provider>
    </div>
  );
};

export default Authprovider;
