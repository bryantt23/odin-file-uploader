import axios from 'axios'

const baseUrl = 'http://localhost:3000'


export const login = async (username, password) => {
    try {
        const { data } = await axios.post(`${baseUrl}/login`, { username, password })
        if (data.loggedIn) {
            localStorage.setItem('user', JSON.stringify({ username }))
            return true
        }
        return false
    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    }
}

export const logout = async () => {
    try {
        await axios.post(`${baseUrl}/logout`)
        localStorage.removeItem('user')
    } catch (error) {
        console.error('Logout failed:', error);
        throw error;
    }
}