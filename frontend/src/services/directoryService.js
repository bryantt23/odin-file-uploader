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

export const getFiles = async (path = '') => {
    try {
        const response = await axios.get(`${baseUrl}/files`, {
            params: { path }
        })
        return response.data
    } catch (error) {
        console.error('Failed to fetch directories:', error);
        throw error
    }
}

export const uploadFile = async (formData, path, config) => {
    console.log("🚀 ~ uploadFile ~ formData, config:", formData, config)
    formData.forEach((value, key) => {
        console.log(key, value);
    });

    try {
        const response = await axios.post(`${baseUrl}/upload/${path}`, formData, config)
        console.log("🚀 ~ uploadFile ~ response:", response)
        return response.data
    } catch (error) {
        console.error('Failed to fetch directories:', error);
        throw error
    }

}
