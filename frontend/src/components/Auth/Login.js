import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/Auth/Login.tsx
import { useState } from 'react';
import './Login.css';
import { auth, googleProvider } from '../../firebase';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { isProfileComplete } from '../../utils/checkProfile';
const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const userCred = await signInWithEmailAndPassword(auth, email, password);
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
    return (_jsxs("div", { className: "login-container", children: [_jsx("h2", { children: "Login" }), _jsxs("form", { onSubmit: handleLogin, children: [_jsx("input", { type: "email", placeholder: "Email", onChange: (e) => setEmail(e.target.value), required: true }), _jsx("input", { type: "password", placeholder: "Password", onChange: (e) => setPassword(e.target.value), required: true }), _jsx("button", { type: "submit", children: "Login" })] }), _jsx("button", { onClick: handleGoogle, children: "Login with Google" }), _jsx("p", { onClick: () => navigate('/register'), children: "Don't have an account? Register" })] }));
};
export default Login;
