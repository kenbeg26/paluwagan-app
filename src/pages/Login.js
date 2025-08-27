import { useState, useEffect, useContext } from 'react';
import { Form, Button } from 'react-bootstrap';
import { Navigate, Link } from 'react-router-dom';
import UserContext from '../context/UserContext';

import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';

const notyf = new Notyf();

export default function Login() {
  const { user, setUser } = useContext(UserContext);

  const [codename, setCodeName] = useState("");
  const [password, setPassword] = useState("");
  const [isActive, setIsActive] = useState(false);

  function authenticate(e) {
    e.preventDefault();
    fetch(`${process.env.REACT_APP_API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        codename: codename,
        password: password
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.access !== undefined) {
          localStorage.setItem('token', data.access);
          console.log('Token received:', data.access);
          retrieveUserDetails(data.access);
          setCodeName('');
          setPassword('');
          notyf.success("You are now logged in!");
        } else if (data.message === "Codename and password do not match") {
          notyf.error("Incorrect codename or password");
        } else {
          notyf.error(`${email} does not exist`);
        }
      });
  }

  function retrieveUserDetails(token) {
    fetch(`${process.env.REACT_APP_API_BASE_URL}/users/details`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        console.log('User details response:', data); // helpful debug log
        setUser({
          id: data.user._id,
          isAdmin: data.user.isAdmin,
          codename: data.user.codename,
          isActive: data.user.isActive
        });
      });
  }

  useEffect(() => {
    if (codename !== '' && password !== '') {
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  }, [codename, password]);

  if (user.id !== null) {
    return <Navigate to="/" />;
  }




}