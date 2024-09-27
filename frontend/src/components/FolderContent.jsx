import React from 'react'
import { useParams } from 'react-router-dom'

function FolderContent() {
    let { directory } = useParams()

    return (
        <div>
            <h2>Content of {directory}</h2>
            {/* Display folder content or perform other actions */}</div>
    )
}

export default FolderContent