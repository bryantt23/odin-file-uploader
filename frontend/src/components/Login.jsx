import { useAuth } from '../context/AuthContext';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

export const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate(); // Create an instance of useNavigate

    const handleLogin = async () => {
        try {
            await login(username, password);
            navigate('/'); // Redirect to home page upon successful login
        } catch (error) {
            alert('Failed to log in');
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
            />
            <button onClick={handleLogin}>Log in</button>
        </div>
    );
};
