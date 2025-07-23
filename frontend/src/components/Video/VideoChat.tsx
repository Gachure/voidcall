// src/components/Video/VideoChat.tsx
import React, { useEffect, useRef, useState } from 'react';
import './VideoChat.css';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const servers = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    // TODO: Add TURN servers for production
  ],
};

const VideoChat: React.FC = () => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);

  const navigate = useNavigate();

  // ✅ Fetch user's profile from Firestore
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
      } else {
        navigate('/profile-setup');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // ✅ Start local stream + connect
  useEffect(() => {
    if (!profileLoaded || !userProfile) return;

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
      } catch (err) {
        console.error('Media error:', err);
      }
    };

    start();
  }, [profileLoaded, userProfile]);

  const joinMatchQueue = async (pc: RTCPeerConnection) => {
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
    } catch (err) {
      console.error('Join queue error:', err);
    }
  };

  // ✅ NEXT: Leave current call and start fresh
  const handleNext = async () => {
    if (peerConnection) peerConnection.close();
    setPeerConnection(null);

    if (roomId) {
      try {
        await deleteDoc(doc(db, 'rooms', roomId));
      } catch (err) {
        console.warn('Room delete failed:', err);
      }
    }

    setRoomId(null);
    setProfileLoaded(false); // 👈 Force restart
    setTimeout(() => setProfileLoaded(true), 100); // Quick reload
  };

  // ✅ STOP: Leave room and reset VideoChat without navigating
  const handleStop = async () => {
    if (peerConnection) peerConnection.close();
    setPeerConnection(null);

    if (roomId) {
      try {
        await deleteDoc(doc(db, 'rooms', roomId));
      } catch (err) {
        console.warn('Room delete failed:', err);
      }
    }

    setRoomId(null);
    setUserProfile(null);
    setProfileLoaded(false);

    // 👇 Refresh the component by resetting state
    setTimeout(() => {
      const auth = getAuth();
      if (auth.currentUser) {
        setProfileLoaded(true); // Re-fetch everything fresh
      } else {
        navigate('/profile-setup');
      }
    }, 100);
  };

  return (
    <div className="video-chat-container">
      <div className="video-grid">
        <div className="video-box">
          <video ref={localVideoRef} autoPlay muted playsInline />
          <p>You</p>
        </div>
        <div className="video-box">
          <video ref={remoteVideoRef} autoPlay playsInline />
          <p>
            Stranger ({userProfile?.gender || '??'} - {userProfile?.country || '??'})
          </p>
        </div>
      </div>

      <div className="controls">
        <button onClick={handleNext}>Next</button>
        <button onClick={handleStop} className="stop">Stop</button>
      </div>
    </div>
  );
};

export default VideoChat;
