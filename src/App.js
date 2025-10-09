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
import Footer from "./components/Footer";

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

  function ProtectedRoute({ element, user }) {
    if (!user.id) {
      // If not logged in, redirect to login
      return <Navigate to="/login" />;
    }

    if (user.isActive === false) {
      // If user is inactive, redirect to NotAuthorized page
      return <Navigate to="/not-authorized" />;
    }

    // Otherwise, allow access
    return element;
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

  return (
    <UserProvider value={{ user, setUser, unsetUser }}>
      <Router>
        <div className="app-container">
          <AppNavbar />
          <div className="main-content">
            <Container className="my-4">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="/not-authorized" element={<NotAuthorized />} />
                <Route path="/adminDashboard" element={<AdminDashboard />} />
                <Route path="/products" element={<ProductCatalog />} />
                <Route
                  path="/schedule"
                  element={<ProtectedRoute element={<Schedule />} user={user} />}
                />
                <Route
                  path="/chat"
                  element={<ProtectedRoute element={<Chat />} user={user} />}
                />
              </Routes>
            </Container>
          </div>

          <Footer />
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;
