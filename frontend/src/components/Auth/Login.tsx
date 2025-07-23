// src/components/Auth/Login.tsx
import React, { useState } from 'react';
import './Login.css';
import { auth, googleProvider } from '../../firebase';
import {
  signInWithEmailAndPassword,
  signInWithPopup
} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { isProfileComplete } from '../../utils/checkProfile';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const complete = await isProfileComplete(userCred.user.uid);
      navigate(complete ? '/match' : '/profile-setup');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleGoogle = async () => {
    try {
      const userCred = await signInWithPopup(auth, googleProvider);
      const complete = await isProfileComplete(userCred.user.uid);
      navigate(complete ? '/match' : '/profile-setup');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      <button onClick={handleGoogle}>Login with Google</button>
      <p onClick={() => navigate('/register')}>Don't have an account? Register</p>
    </div>
  );
};

export default Login;
