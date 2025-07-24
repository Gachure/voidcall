import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import './VideoChat.css';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, addDoc, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
const servers = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        // TODO: Add TURN servers for production
    ],
};
const VideoChat = () => {
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const [peerConnection, setPeerConnection] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [roomId, setRoomId] = useState(null);
    const [profileLoaded, setProfileLoaded] = useState(false);
    const navigate = useNavigate();
    useEffect(() => {
        const auth = getAuth();
        const uid = auth.currentUser?.uid;
        if (!uid) {
            navigate('/profile-setup');
            return;
        }
        const unsubscribe = onSnapshot(doc(db, 'profiles', uid), (docSnap) => {
            if (docSnap.exists()) {
                setUserProfile(docSnap.data());
                setProfileLoaded(true);
            }
            else {
                navigate('/profile-setup');
            }
        });
        return () => unsubscribe();
    }, [navigate]);
    useEffect(() => {
        if (!profileLoaded || !userProfile)
            return;
        const start = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
                const pc = new RTCPeerConnection(servers);
                stream.getTracks().forEach((track) => pc.addTrack(track, stream));
                pc.ontrack = (event) => {
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = event.streams[0];
                    }
                };
                setPeerConnection(pc);
                await joinMatchQueue(pc);
            }
            catch (err) {
                console.error('Media error:', err);
            }
        };
        start();
    }, [profileLoaded, userProfile]);
    const joinMatchQueue = async (pc) => {
        console.log('PeerConnection ready:', pc); // 👈 This silences TS6133 and gives you debug output
        try {
            const auth = getAuth();
            const roomRef = await addDoc(collection(db, 'rooms'), {
                uid: auth.currentUser?.uid,
                gender: userProfile.gender || 'unknown',
                country: userProfile.country || 'Earth',
                timestamp: Date.now(),
            });
            setRoomId(roomRef.id);
            // TODO: Add signaling logic
        }
        catch (err) {
            console.error('Join queue error:', err);
        }
    };
    const handleNext = async () => {
        if (peerConnection)
            peerConnection.close();
        setPeerConnection(null);
        if (roomId) {
            try {
                await deleteDoc(doc(db, 'rooms', roomId));
            }
            catch (err) {
                console.warn('Room delete failed:', err);
            }
        }
        setRoomId(null);
        setProfileLoaded(false);
        setTimeout(() => setProfileLoaded(true), 100);
    };
    const handleStop = async () => {
        if (peerConnection)
            peerConnection.close();
        setPeerConnection(null);
        if (roomId) {
            try {
                await deleteDoc(doc(db, 'rooms', roomId));
            }
            catch (err) {
                console.warn('Room delete failed:', err);
            }
        }
        setRoomId(null);
        setUserProfile(null);
        setProfileLoaded(false);
        setTimeout(() => {
            const auth = getAuth();
            if (auth.currentUser) {
                setProfileLoaded(true);
            }
            else {
                navigate('/profile-setup');
            }
        }, 100);
    };
    return (_jsxs("div", { className: "video-chat-container", children: [_jsxs("div", { className: "video-grid", children: [_jsxs("div", { className: "video-box", children: [_jsx("video", { ref: localVideoRef, autoPlay: true, muted: true, playsInline: true }), _jsx("p", { children: "You" })] }), _jsxs("div", { className: "video-box", children: [_jsx("video", { ref: remoteVideoRef, autoPlay: true, playsInline: true }), _jsxs("p", { children: ["Stranger (", userProfile?.gender || '??', " - ", userProfile?.country || '??', ")"] })] })] }), _jsxs("div", { className: "controls", children: [_jsx("button", { onClick: handleNext, children: "Next" }), _jsx("button", { onClick: handleStop, className: "stop", children: "Stop" })] })] }));
};
export default VideoChat;
