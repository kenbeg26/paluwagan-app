import { useState, useEffect, useContext } from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';
import { Navigate, Link } from 'react-router-dom';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import UserContext from '../context/UserContext';

export default function Register() {
  const { user } = useContext(UserContext);
  const notyf = new Notyf();

  const [name, setName] = useState("");
  const [codename, setCodeName] = useState("");
  const [password, setPassword] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setName("");
    setCodeName("");
    setPassword("");
  };

  useEffect(() => {
    if (
      name !== "" &&
      codename !== "" &&
      password !== ""
    ) {
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  }, [name, codename, password]);

  if (user.id !== null) {
    return <Navigate to="/Home" />;
  }

  if (registered) {
    return <Navigate to="/login" />;
  }

  async function registerUser(e) {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          codename,
          password
        })
      });

      const data = await response.json();

      if (response.ok) {
        if (data.success) {
          notyf.success("Successfully registered! Redirecting to login...");
          resetForm();
          setTimeout(() => setRegistered(true), 1500);
        } else {
          // Even if success is false, check if message looks positive (fallback handling)
          if (data.message && data.message.toLowerCase().includes("success")) {
            notyf.success(data.message);
            resetForm();
            setTimeout(() => setRegistered(true), 1500);
          } else {
            notyf.error(data.message || "Registration failed");
          }
        }
      } else {
        if (data.errors) {
          data.errors.forEach(err => notyf.error(err));
        } else {
          notyf.error(data.message || "Registration failed");
        }
      }
    } catch (error) {
      console.error("Registration Error:", error);
      notyf.error(error.message || "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Form onSubmit={registerUser}>
        <h1 className="my-5 text-center">Sign Up & Get Started</h1>

        <Form.Group>
          <Form.Label>Comple Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter Comple Name"
            required
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>Code Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter Code Name"
            required
            value={codename}
            onChange={e => setCodeName(e.target.value)}
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Enter Password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            minLength={6}
          />
        </Form.Group>

        <Button
          variant={isActive ? "primary" : "secondary"}
          type="submit"
          disabled={!isActive || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Registering...
            </>
          ) : 'Submit'}

        </Button>

      </Form>

      <p className="mt-3 text-center">
        Already have an account? <Link to="/login">Click here</Link> to log in.
      </p>
    </>
  )

}