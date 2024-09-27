import React, { useEffect, useState } from 'react'
import { getDirectories } from '../services/directoryService'
import { Link } from 'react-router-dom'
import FolderCreate from './FolderCreate'

function FolderList() {
    const [directories, setDirectories] = useState([])

    const fetchData = async () => {
        const directoriesFromApi = await getDirectories()
        setDirectories(directoriesFromApi.directories)
    }

    useEffect(() => {
        fetchData()
    }, [])

    return (
        <div>
            <h2>FolderList</h2>
            <FolderCreate fetchData={fetchData} />
            <ul>
                {directories.map(directory => <li key={directory}>
                    <Link to={`/${directory}`}> {directory}</Link>
                </li>)}
            </ul>
        </div>
    )
}

export default FolderList