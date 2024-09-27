import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getFiles } from '../services/directoryService'
import FileUpload from './FileUpload'

function FolderContent() {
    let { directory } = useParams()
    const [files, setFiles] = useState([])

    useEffect(() => {
        const fetchData = async () => {
            const directoriesFromApi = await getFiles(directory)
            setFiles(directoriesFromApi.files)
        }
        fetchData()
    }, [])

    return (
        <div>
            <h2>Content of {directory}</h2>
            <FileUpload directory={directory} />
            <ul>
                {files.length === 0 ? <p>No files in this folder</p> : files.map(file => <li key={file}>
                    {file}
                </li>)}
            </ul>
        </div>
    )
}

export default FolderContent