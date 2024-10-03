import React, { useEffect, useState } from 'react';
import { downloadFile, getFileDetails } from '../services/directoryService';

function FileItem({ directory, file }) {
    const [showDetails, setShowDetails] = useState(false)
    const [fileDetails, setFileDetails] = useState(null)

    useEffect(() => {
        if (file.public_id) {
            setFileDetails({ name: file.name, size: file.size, modified: file.modified })
        }
    }, [])

    const handleDownload = async () => {
        // using cloudinary
        if (file.public_id) {
            const downloadUrl = `${file.url}?fl_attachment=${encodeURIComponent(file.displayName)}`;
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.target = '_blank'; // This will open the link in a new tab
            link.setAttribute('download', file);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        else {
            downloadFile(directory, file.displayName)
        }
    }

    const toggleDetails = async () => {
        if (!showDetails && fileDetails === null) {
            const details = await getFileDetails(directory, file.displayName)
            setFileDetails(details)
        }
        setShowDetails(!showDetails)
    }

    return (<li>
        {file.displayName}
        <button onClick={() => handleDownload(file)}>Download</button>
        <button onClick={toggleDetails}>{showDetails ? 'Hide Details' : 'Show Details'}</button>{showDetails && (
            <ul>
                <li>Name: {fileDetails.name}</li>
                <li>Size: {fileDetails.size}</li>
                <li>Last Modified: {fileDetails.modified}</li>
            </ul>
        )}
    </li>
    )
}

export default FileItem