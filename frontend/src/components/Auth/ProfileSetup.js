import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/Auth/ProfileSetup.tsx
import { useEffect, useState } from 'react';
import './ProfileSetup.css';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
const ProfileSetup = () => {
    const [username, setUsername] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [country, setCountry] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    // ✅ Auto-detect country
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async ({ coords }) => {
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`);
                    const data = await res.json();
                    setCountry(data?.address?.country || '');
                }
                catch (err) {
                    console.error('Country fetch error:', err);
                    setError('Could not determine country.');
                }
            }, () => setError('Location permission denied.'));
        }
        else {
            setError('Geolocation not supported.');
        }
    }, []);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username || !gender || !country || age === '') {
            setError('All fields are required.');
            return;
        }
        if (Number(age) < 18) {
            setError('You must be at least 18.');
            return;
        }
        setLoading(true);
        const auth = getAuth();
        const uid = auth.currentUser?.uid;
        if (!uid) {
            setError('You are not logged in.');
            setLoading(false);
            return;
        }
        const profile = {
            username,
            age: Number(age),
            gender,
            country,
            createdAt: new Date()
        };
        try {
            // ✅ Save profile to Firestore
            await setDoc(doc(db, 'profiles', uid), profile);
            localStorage.setItem('profile', JSON.stringify(profile));
            // 🔄 Confirm it saved before navigating
            const saved = await getDoc(doc(db, 'profiles', uid));
            if (saved.exists()) {
                navigate('/video');
            }
            else {
                setError('Failed to confirm profile was saved.');
            }
        }
        catch (err) {
            console.error('Profile save error:', err);
            setError('Something went wrong saving your profile.');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "profile-setup-container", children: [_jsx("h2", { children: "Set Up Your Profile" }), error && _jsx("p", { style: { color: 'red' }, children: error }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsx("input", { type: "text", placeholder: "Username or Display Name", value: username, onChange: (e) => setUsername(e.target.value), required: true }), _jsx("input", { type: "number", placeholder: "Your Age", value: age, onChange: (e) => setAge(Number(e.target.value)), required: true, min: 18 }), _jsxs("select", { value: gender, onChange: (e) => setGender(e.target.value), required: true, children: [_jsx("option", { value: "", disabled: true, children: "Select Gender" }), _jsx("option", { value: "Male", children: "Male" }), _jsx("option", { value: "Female", children: "Female" }), _jsx("option", { value: "Other", children: "Other" })] }), _jsx("input", { type: "text", value: country, placeholder: "Country (auto-detected)", readOnly: true }), _jsx("button", { type: "submit", disabled: loading, children: loading ? 'Saving...' : 'Save & Continue' })] })] }));
};
export default ProfileSetup;
