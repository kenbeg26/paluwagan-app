import { useContext } from "react";
import { NavLink } from "react-router-dom";
import { Container, Navbar, Nav } from "react-bootstrap";
import UserContext from "../context/UserContext";
import "../index.css";

export default function AppNavbar() {
  const { user } = useContext(UserContext);
  const isLoggedIn = user.id !== null;
  const isAdmin = user.isAdmin;
  const isActive = user.isActive;

  return (
    <Navbar expand="lg" className="custom-navbar">
      <Container>
        <Navbar.Brand as={NavLink} to="/">
          💰 Paluwagan Tracker
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={NavLink} to="/">
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
              <>
                <Nav.Link as={NavLink} to="/schedule">
                  Schedule
                </Nav.Link>
                <Nav.Link as={NavLink} to="/chat">
                  Chat
                </Nav.Link>
              </>
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
      </Container>
    </Navbar>
  );
}