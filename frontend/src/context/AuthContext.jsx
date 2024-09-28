import React, { createContext, useContext, useState } from 'react';
import axios from 'axios'

const baseUrl = 'http://localhost:3000'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)

    const login = async (username, password) => {
        try {
            const { data } = await axios.post(`${baseUrl}/login`, { username, password })
            if (data.loggedIn) {
                setUser({ username })
            }
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    }
    const logout = async () => {
        try {
            await axios.post(`${baseUrl}/logout`)
            setUser(null)
        } catch (error) {
            console.error('Logout failed:', error);
            throw error;
        }
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)