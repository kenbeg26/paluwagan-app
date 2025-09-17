import { Navigate } from "react-router-dom";
import { useEffect, useContext } from "react";
import UserContext from "../context/UserContext";

export default function Logout() {
  const { setUser, setToken } = useContext(UserContext);

  useEffect(() => {
    // Clear user state
    setUser({
      id: null,
      isAdmin: null,
      codename: null,
      isActive: null,
    });

    // Clear token state
    setToken(null);

    // Clear localStorage explicitly (optional, since setToken already syncs)
    localStorage.removeItem("token");
  }, [setUser, setToken]);

  return <Navigate to="/login" />;
}
