import React, { createContext, useState, useEffect } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState({
    id: null,
    isAdmin: null,
    codename: null,
    isActive: null,
    token: null, // ✅ include token inside user object
  });

  const [token, setToken] = useState(localStorage.getItem("token") || null);

  // Fetch user details when token changes
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);

      // ✅ Fetch user details with stored token
      fetch(`${process.env.REACT_APP_API_BASE_URL}/users/details`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.user) {
            setUser({
              id: data.user._id,
              isAdmin: data.user.isAdmin,
              codename: data.user.codename,
              isActive: data.user.isActive,
              token, // ✅ store token here too
            });
          } else {
            // If token invalid, clear everything
            setUser({
              id: null,
              isAdmin: null,
              codename: null,
              isActive: null,
              token: null,
            });
            setToken(null);
            localStorage.removeItem("token");
          }
        })
        .catch((err) => {
          console.error("Failed to fetch user details:", err);
          setToken(null);
          localStorage.removeItem("token");
        });
    } else {
      localStorage.removeItem("token");
      setUser({
        id: null,
        isAdmin: null,
        codename: null,
        isActive: null,
        token: null,
      });
    }
  }, [token]);

  return (
    <UserContext.Provider value={{ user, setUser, token, setToken }}>
      {children}
    </UserContext.Provider>
  );
}

export default UserContext;
