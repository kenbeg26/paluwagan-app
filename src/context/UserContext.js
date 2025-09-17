import React from 'react'
import { createContext, useState, useEffect } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState({
    id: null,
    isAdmin: null,
    codename: null,
    isActive: null
  });
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  // Keep token in sync with localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  return (
    <UserContext.Provider value={{ user, setUser, token, setToken }}>
      {children}
    </UserContext.Provider>
  );
}

export default UserContext;
