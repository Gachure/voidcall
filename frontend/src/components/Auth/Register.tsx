// src/components/Auth/Register.tsx
import React, { useState } from 'react';
import './Register.css';
import { auth, googleProvider } from '../../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithPopup
} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { isProfileComplete } from '../../utils/checkProfile';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
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
    <div className="register-container">
      <h2>Create Account</h2>
      <form onSubmit={handleRegister}>
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
        <button type="submit">Register</button>
      </form>
      <button onClick={handleGoogle}>Register with Google</button>
      <p onClick={() => navigate('/login')}>Already have an account? Login</p>
    </div>
  );
};

export default Register;
