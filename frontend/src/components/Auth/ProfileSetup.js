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

    // ✅ Auto-detect country (but allow manual edit)
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async ({ coords }) => {
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`);
                    const data = await res.json();
                    const autoCountry = data?.address?.country || '';
                    setCountry(autoCountry);
                } catch (err) {
                    console.error('Country fetch error:', err);
                    setError('Could not determine country.');
                }
            }, () => setError('Location permission denied.'));
        } else {
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
            await setDoc(doc(db, 'profiles', uid), profile);
            localStorage.setItem('profile', JSON.stringify(profile));
            const saved = await getDoc(doc(db, 'profiles', uid));

            if (saved.exists()) {
                navigate('/video');
            } else {
                setError('Failed to confirm profile was saved.');
            }
        } catch (err) {
            console.error('Profile save error:', err);
            setError('Something went wrong saving your profile.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-setup-container">
            <h2>Set Up Your Profile</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Username or Display Name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="number"
                    placeholder="Your Age"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    required
                    min={18}
                />
                <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    required
                >
                    <option value="" disabled>Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </select>
                <input
                    type="text"
                    placeholder="Country (auto-detected or enter manually)"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)} // ✅ Now editable
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Save & Continue'}
                </button>
            </form>
        </div>
    );
};

export default ProfileSetup;
