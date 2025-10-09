import { useContext } from "react";
import { NavLink } from "react-router-dom";
import { Container, Navbar, Nav } from "react-bootstrap";
import UserContext from "../context/UserContext";
import { ChatDots } from "react-bootstrap-icons";
import "../index.css";

export default function AppNavbar() {
  const { user } = useContext(UserContext);
  const isLoggedIn = user.id !== null;
  const isAdmin = user.isAdmin;
  const isActive = user.isActive;

  return (
    <Navbar expand="lg" className="custom-navbar" variant="dark">
      <Container>
        <Navbar.Brand as={NavLink} to="/" className="navbar-brand-custom">
          💰 Paluwagan Tracker
        </Navbar.Brand>

        {/* Toggle button for small screens */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={NavLink} to="/" end>
              Home
            </Nav.Link>

            {isLoggedIn && (
              <>
                {isAdmin ? (
                  <>
                    <Nav.Link as={NavLink} to="/adminDashboard">
                      Admin Dashboard
                    </Nav.Link>
                    <Nav.Link as={NavLink} to="/products">
                      Bundle
                    </Nav.Link>
                  </>
                ) : (
                  <Nav.Link as={NavLink} to="/products">
                    Bundle
                  </Nav.Link>
                )}
              </>
            )}

            {isLoggedIn && isActive && (
              <Nav.Link as={NavLink} to="/schedule">
                Schedule
              </Nav.Link>
            )}

            {isLoggedIn ? (
              <Nav.Link as={NavLink} to="/logout">
                Logout
              </Nav.Link>
            ) : (
              <>
                <Nav.Link as={NavLink} to="/login">
                  Login
                </Nav.Link>
                <Nav.Link as={NavLink} to="/register">
                  Register
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>

        {/* Chat icon always visible separately */}
        {isLoggedIn && isActive && (
          <Nav className="chat-floating-btn d-lg-none">
            <Nav.Link as={NavLink} to="/chat" title="Chat">
              <ChatDots size={28} />
            </Nav.Link>
          </Nav>
        )}

        {/* Large screen inline chat icon */}
        {isLoggedIn && isActive && (
          <Nav className="ms-auto d-none d-lg-flex align-items-center me-2">
            <Nav.Link as={NavLink} to="/chat" title="Chat">
              <ChatDots size={24} />
            </Nav.Link>
          </Nav>
        )}
      </Container>
    </Navbar>
  );
}
