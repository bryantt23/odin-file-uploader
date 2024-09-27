import axios from 'axios'

const baseUrl = 'http://localhost:3000'

export const getDirectories = async (path = '') => {
    try {
        const response = await axios.get(`${baseUrl}/directory`, {
            params: { path }
        })
        return response.data
    } catch (error) {
        console.error('Failed to fetch directories:', error);
        throw error
    }
}