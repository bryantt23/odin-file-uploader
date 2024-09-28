import React, { useEffect, useState } from 'react'
import { getDirectories, deleteDirectory, renameDirectory } from '../services/directoryService'
import { Link } from 'react-router-dom'
import FolderCreate from './FolderCreate'

function FolderList() {
    const [directories, setDirectories] = useState([])
    const [newFolderName, setNewFolderName] = useState('')
    const [selectedFolder, setSelectedFolder] = useState('')

    const fetchData = async () => {
        const directoriesFromApi = await getDirectories()
        setDirectories(directoriesFromApi.directories)
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleDelete = async (folder) => {
        if (window.confirm(`Are you sure you want to delete the folder ${folder}?`)) {
            await deleteDirectory(folder)
            fetchData()
        }
    }

    const handleRename = async (oldName) => {
        if (newFolderName && !directories.includes(newFolderName)) {
            if (window.confirm(`Are you sure you want to rename ${oldName} to ${newFolderName}?`)) {
                await renameDirectory(oldName, newFolderName)
                fetchData()
            }
        }
        else {
            alert("Please enter a new name that doesn't already exist.");
        }
        setNewFolderName('');
        setSelectedFolder('');
    }

    const handleChange = e => {
        setNewFolderName(e.target.value)
    }

    return (
        <div>
            <h2>FolderList</h2>
            <FolderCreate fetchData={fetchData} />
            <ul>
                {directories.map(directory => <li key={directory}>
                    <Link to={`/${directory}`}> {directory}</Link>
                    <button onClick={() => handleDelete(directory)}>Delete</button>
                    {selectedFolder === directory ? (
                        <div>
                            <input
                                type="text"
                                value={newFolderName}
                                onChange={handleChange}
                                placeholder='New folder name'
                            />
                            <button
                                onClick={() => handleRename(directory)}
                                disabled={!newFolderName || directories.includes(newFolderName)}
                            >
                                Rename
                            </button>
                            <button onClick={() => setSelectedFolder('')}>Cancel</button>
                        </div>
                    ) : (
                        <button onClick={() => setSelectedFolder(directory)}>Rename</button>
                    )}
                </li>)}
            </ul>
        </div>
    )
}

export default FolderList