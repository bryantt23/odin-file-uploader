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
        return response.data
    } catch (error) {
        console.error('Failed to fetch directories:', error);
        throw error
    }
}

export const createFolder = async (newFolderName) => {
    try {
        await axios.post(`${baseUrl}/directory`, {
            path: newFolderName
        })
    } catch (error) {
        console.error('Failed to create directory', error);
        throw error
    }
}

export const deleteDirectory = async (targetFolder) => {
    try {
        const response = await axios.delete(`${baseUrl}/directory/${targetFolder}`)
        return response.data;
    } catch (error) {
        console.error('Failed to delete directory', error);
        throw error
    }
}

export const renameDirectory = async (prev, updated) => {
    try {
        await axios.put(`${baseUrl}/directory`, {
            prev, updated
        })
    } catch (error) {
        console.error('Failed to update directory', error);
        throw error
    }
}


