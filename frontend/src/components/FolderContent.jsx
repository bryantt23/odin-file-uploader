import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getFiles, downloadFile } from '../services/directoryService'
import FileUpload from './FileUpload'
import FileItem from './FileItem'

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
                {files.length === 0 ? <p>No files in this folder</p> : files.map(file => <FileItem key={file.displayName} directory={directory} file={file} />)}
            </ul>
        </div>
    )
}

export default FolderContent