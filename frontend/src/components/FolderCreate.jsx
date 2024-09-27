import React, { useState } from 'react';
import { createFolder } from '../services/directoryService';

function FolderCreate({ fetchData }) {
    const [folderName, setFolderName] = useState('');

    const handleInputChange = (e) => {
        setFolderName(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!folderName.trim()) return; // Prevent creating empty or whitespace-only names
        await createFolder(folderName);
        setFolderName(''); // Optionally reset the input after the action
        fetchData()
    };

    return (
        <div>
            <h2>Create Folder</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={folderName}
                    onChange={handleInputChange}
                    placeholder="Enter folder name"
                />
                <button type="submit" disabled={!folderName.trim()}>
                    Create Folder
                </button>
            </form>
        </div>
    );
}

export default FolderCreate;
