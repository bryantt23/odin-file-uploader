import React, { useEffect, useState } from 'react'
import { getDirectories } from '../services/directoryService'

function FolderList() {
    const [directories, setDirectories] = useState([])

    useEffect(() => {
        const fetchData = async () => {
            const directoriesFromApi = await getDirectories()
            setDirectories(directoriesFromApi.directories)
        }
        fetchData()
    }, [])

    return (
        <div><h1>FolderList</h1>
            <ul>
                {directories.map(directory => <li key={directory}>{directory}</li>)}
            </ul>
        </div>
    )
}

export default FolderList