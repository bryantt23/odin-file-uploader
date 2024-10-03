const fs = require('fs').promises;
const path = require('path');
const { getFiles: getFilesFs } = require('../fsFunctions');

const getFiles = async (req, res) => {
    const dirPath = req.query.path;  // Get directory path from query
    const normalizedPath = path.normalize(dirPath).replace(/^(\.\.[\/\\])+/, '');  // Restrict path to prevent directory traversal
    const fullPath = path.join(__dirname, '..', 'uploads', normalizedPath);  // Construct full path to the files directory

    try {
        const filenames = await fs.readdir(fullPath);
        const files = await Promise.all(filenames.map(async filename => {
            return {
                displayName: filename,  // or however you want the name displayed
            };
        }));
        res.status(200).json({ files });
    } catch (error) {
        console.error('Failed to fetch files:', error);
        res.status(500).send('Error fetching files');
    }
};


const uploadFile = (req, res) => {
    if (req.file) {
        res.status(200).send({ message: 'File uploaded successfully', file: req.file })
    }
    else {
        res.status(400).send({ message: "Failed to upload file" })
    }
}

const getFileDetails = async (req, res) => {
    const { directory, filename } = req.params;

    try {
        const filePath = path.join(__dirname, '../uploads', directory, filename);

        // Use asynchronous method to check if the file exists
        try {
            await fs.stat(filePath);
        } catch (error) {
            if (error.code === 'ENOENT') {  // No such file or directory
                console.log("File does not exist:", filePath);
                return res.status(404).send('File not found');
            } else {
                throw error;  // Other errors are thrown
            }
        }

        const stats = await fs.stat(filePath);
        res.json({
            name: filename,
            size: stats.size,
            modified: stats.mtime.toISOString()  // Ensuring date is in a readable format
        });
    } catch (error) {
        console.error("Error retrieving file details:", error);
        res.status(500).send('Error getting file details');
    }
}

const downloadFile = async (req, res) => {
    const { directory, filename } = req.params
    const filePath = path.join(__dirname, '../uploads', directory, filename)

    try {
        await fs.stat(filePath)
        res.download(filePath, filename, (err) => {
            if (err) {
                // Handle errors that occur during the download process
                console.error("Download error:", err);
                res.status(500).send("File could not be downloaded.");
            }
        })
    } catch (error) {
        // Handle errors such as file not existing
        console.error("File does not exist:", error);
        res.status(404).send("File not found.");
    }
}

module.exports = {
    getFileDetails,
    uploadFile,
    getFiles,
    downloadFile
};
