import React, { useEffect, useState } from 'react'
import { uploadFile } from '../services/directoryService'

function FileUpload({ directory, fetchData }) {
    const [file, setFile] = useState()

    const handleChange = (e) => {
        setFile(e.target.files[0])
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!file) {
            console.error('No file selected');
            return;
        }
        const formData = new FormData()
        formData.append('file', file)
        formData.append('path', directory)
        formData.forEach((value, key) => {
            console.log(key, value);
        });

        const config = {}
        try {
            await uploadFile(formData, directory, config);
            fetchData()
        } catch (error) {
            console.error("Error uploading file:", error);
        }
    }

    return (
        <div>
            <h2>File Upload</h2>

            <form
                onSubmit={handleSubmit}
            >
                <input type="file" name="file" onChange={handleChange} />
                <input type="submit" value="Upload" />
            </form>
        </div>
    )
}

export default FileUpload