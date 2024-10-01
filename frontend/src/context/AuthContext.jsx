import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios'

const baseUrl = 'http://localhost:3000'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')))

    const login = async (username, password) => {
        try {
            const { data } = await axios.post(`${baseUrl}/login`, { username, password })
            if (data.loggedIn) {
                setUser({ username })
                localStorage.setItem('user', JSON.stringify({ username }))
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
            localStorage.removeItem('user')
        } catch (error) {
            console.error('Logout failed:', error);
            throw error;
        }
    }

    // Initialize user from local storage on first render
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'))
        if (storedUser) {
            setUser(storedUser)
        }
    }, [])

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)