import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/Auth/Register.tsx
import { useState } from 'react';
import './Register.css';
import { auth, googleProvider } from '../../firebase';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { isProfileComplete } from '../../utils/checkProfile';
const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const userCred = await createUserWithEmailAndPassword(auth, email, password);
            const complete = await isProfileComplete(userCred.user.uid);
            navigate(complete ? '/match' : '/profile-setup');
        }
        catch (err) {
            alert(err.message);
        }
    };
    const handleGoogle = async () => {
        try {
            const userCred = await signInWithPopup(auth, googleProvider);
            const complete = await isProfileComplete(userCred.user.uid);
            navigate(complete ? '/match' : '/profile-setup');
        }
        catch (err) {
            alert(err.message);
        }
    };
    return (_jsxs("div", { className: "register-container", children: [_jsx("h2", { children: "Create Account" }), _jsxs("form", { onSubmit: handleRegister, children: [_jsx("input", { type: "email", placeholder: "Email", onChange: (e) => setEmail(e.target.value), required: true }), _jsx("input", { type: "password", placeholder: "Password", onChange: (e) => setPassword(e.target.value), required: true }), _jsx("button", { type: "submit", children: "Register" })] }), _jsx("button", { onClick: handleGoogle, children: "Register with Google" }), _jsx("p", { onClick: () => navigate('/login'), children: "Already have an account? Login" })] }));
};
export default Register;
