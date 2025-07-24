import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';
import ProfileSetup from './components/Auth/ProfileSetup';
import VideoChat from './components/Video/VideoChat';
const App = () => {
    return (_jsx(Router, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Navigate, { to: "/register" }) }), _jsx(Route, { path: "/register", element: _jsx(Register, {}) }), _jsx(Route, { path: "/login", element: _jsx(Login, {}) }), _jsx(Route, { path: "/profile-setup", element: _jsx(ProfileSetup, {}) }), _jsx(Route, { path: "/video", element: _jsx(VideoChat, {}) })] }) }));
};
export default App;
