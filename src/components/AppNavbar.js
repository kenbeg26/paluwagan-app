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
    <Navbar
      expand="lg"
      className="custom-navbar navbar-dark"
      variant="dark"
    >
      <Container>
        <Navbar.Brand as={NavLink} to="/">
          💰 Paluwagan Tracker
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={NavLink} to="/">Home</Nav.Link>

            {user?.isAdmin && (
              <Nav.Link as={NavLink} to="/admin">Admin Dashboard</Nav.Link>
            )}

            {isLoggedIn && isActive && (
              <Nav.Link as={NavLink} to="/chat">Chat</Nav.Link>
            )}

            <Nav.Link as={NavLink} to="/bundle">Bundle</Nav.Link>
            <Nav.Link as={NavLink} to="/schedule">Schedule</Nav.Link>
            <Nav.Link as={NavLink} to="/logout">Logout</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
