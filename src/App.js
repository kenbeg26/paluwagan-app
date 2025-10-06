import Container from 'react-bootstrap/Container';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { UserProvider } from './context/UserContext';
import AppNavbar from './components/AppNavbar';
import Register from './pages/Register';
import Login from './pages/Login';
import Logout from './pages/Logout';
import Home from './pages/Home';
import AdminDashboard from './components/AdminDashboard';
import ProductCatalog from './pages/ProductCatalog';
import Schedule from './pages/Schedule';
import Chat from './components/Chat';
import NotAuthorized from './pages/NotAuthorized';

function App() {
  const [user, setUser] = useState({
    id: null,
    isAdmin: null,
    isActive: null
  });

  function unsetUser() {
    localStorage.clear();
    setUser({ id: null, isAdmin: null, isActive: null });
  }

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch(`${process.env.REACT_APP_API_BASE_URL}/users/details`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.user) {
          console.log("User details received:", data);
          setUser({
            id: data.user._id,
            isAdmin: data.user.isAdmin,
            isActive: data.user.isActive
          });
        } else {
          setUser({ id: null, isAdmin: null, isActive: null });
        }
      })
      .catch(err => console.error("Error fetching user details:", err));
  }, []);

  // 🔒 Protected Route for Active Users
  const ActiveRoute = ({ element }) => {
    return user.isActive === false ? <Navigate to="/not-authorized" /> : element;
  };

  // 🔒 Protected Route for Admins Only
  const AdminRoute = ({ element }) => {
    if (user.isActive === false) return <Navigate to="/not-authorized" />;
    if (!user.isAdmin) return <Navigate to="/" />;
    return element;
  };

  return (
    <UserProvider value={{ user, setUser, unsetUser }}>
      <Router>
        <AppNavbar />
        <Container>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/not-authorized" element={<NotAuthorized />} />

            {/* 🔒 Protected Routes */}
            <Route path="/adminDashboard" element={<AdminRoute element={<AdminDashboard />} />} />
            <Route path="/products" element={<ActiveRoute element={<ProductCatalog />} />} />
            <Route path="/schedule" element={<ActiveRoute element={<Schedule />} />} />
            <Route path="/chat" element={<ActiveRoute element={<Chat />} />} />
          </Routes>
        </Container>
      </Router>
    </UserProvider>
  );
}

export default App;
