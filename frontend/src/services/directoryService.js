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
    const encodedPath = encodeURIComponent(path);
    console.log("🚀 ~ uploadFile ~ path:", path);
    console.log("🚀 ~ uploadFile ~ encodedPath:", encodedPath);
    formData.forEach((value, key) => {
        console.log(key, value);
    });

    try {
        const response = await axios.post(`${baseUrl}/upload/${encodedPath}`, formData, config);
        return response.data;
    } catch (error) {
        console.error('Upload failed:', error);
        throw error;
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

export const downloadFile = async (directory, fileName) => {
    try {
        const url = `${baseUrl}/download/${encodeURIComponent(directory)}/${encodeURIComponent(fileName)}`;
        const response = await axios({
            url: url,
            method: 'GET',
            responseType: 'blob'
        });
        const fileURL = window.URL.createObjectURL(new Blob([response.data]));
        const fileLink = document.createElement('a');
        fileLink.href = fileURL;
        fileLink.setAttribute('download', fileName);
        document.body.appendChild(fileLink);
        fileLink.click();
        document.body.removeChild(fileLink);
    } catch (error) {
        console.error('Download failed:', error);
    }
}


export const getFileDetails = async (directory, filename) => {
    try {
        const response = await axios.get(`${baseUrl}/files/details/${directory}/${filename}`)
        return response.data
    } catch (error) {
        console.error('Failed to get file details:', error)
    }
}