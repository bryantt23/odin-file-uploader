import React, { useEffect, useState } from 'react'
import { getDirectories } from '../services/directoryService'
import { Link } from 'react-router-dom'

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
        <div>
            <h2>FolderList</h2>
            <ul>
                {directories.map(directory => <li key={directory}>
                    <Link to={`/${directory}`}> {directory}</Link>
                </li>)}
            </ul>
        </div>
    )
}

export default FolderList