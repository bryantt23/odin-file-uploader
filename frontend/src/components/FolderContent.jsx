import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getFiles, downloadFile } from '../services/directoryService'
import FileUpload from './FileUpload'

function FolderContent() {
    let { directory } = useParams()
    const [files, setFiles] = useState([])

    const fetchData = async () => {
        const directoriesFromApi = await getFiles(directory)
        setFiles(directoriesFromApi.files)
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleDownload = async (filename) => {
        downloadFile(directory, filename)
    }

    return (
        <div>
            <h2>Content of {directory}</h2>
            <FileUpload directory={directory} fetchData={fetchData} />
            <ul>
                {files.length === 0 ? <p>No files in this folder</p> : files.map(file => <li key={file}>
                    {file}
                    <button onClick={() => handleDownload(file)}>Download</button>
                </li>)}
            </ul>
        </div>
    )
}

export default FolderContent