import React, { createContext, useContext, useEffect, useState } from 'react';
import { login as serviceLogin, logout as serviceLogout } from '../services/authenticationService';

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')))

    const login = async (username, password) => {
        const result = await serviceLogin(username, password)
        if (result) {
            setUser({ username })
        }
    }

    const logout = async () => {
        await serviceLogout()
        setUser(null)
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