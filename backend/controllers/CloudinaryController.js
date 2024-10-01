require('dotenv').config()
const cloudinary = require('cloudinary').v2
const path = require('path')

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
})

const getDirectories = async (req, res) => {
    try {
        const result = await cloudinary.api.sub_folders(''); const directories = result.folders.map(folder => folder.name);
        res.json({ directories });
    } catch (error) {
        console.error('Failed to fetch Cloudinary folders:', error);
        res.status(500).send('Error fetching Cloudinary folders')
    }
};

const makeDirectory = async (req, res) => {
    const { path: directoryPath } = req.body; // e.g., "newFolder"
    if (!directoryPath) {
        return res.status(400).send('Path is required');
    }

    const fullPath = `${directoryPath}/.placeholder`; // No prefix, direct under Home

    console.log("🚀 ~ makeDirectory ~ directoryPath:", directoryPath)
    try {
        const placeholderPath = path.join(__dirname, 'sierra.jpeg'); // Ensure this path is correct
        await cloudinary.uploader.upload(placeholderPath, {
            public_id: fullPath,
            overwrite: true,
            resource_type: 'raw',
            folder: directoryPath
        });
        console.log("Directory created at:", fullPath); // This will help confirm the path
        res.status(201).send('Directory created successfully');
    } catch (error) {
        console.error('Error creating directory:', error);
        res.status(500).send('Error creating directory');
    }
}




const renameDirectory = async (req, res) => {
    try {
        const { prev, updated } = req.body
        if (!prev || !updated) {
            return res.status(400).send('Both previous and updated paths are required')
        }
        await renameDirectoryFs(prev, updated)
        res.status(200).send('Directory renamed successfully')
    } catch (error) {
        console.error(error)
        res.status(500).send('Error renaming directory')
    }
}

const deleteDirectory = async (req, res) => {
    try {
        const { path } = req.params
        if (!path) {
            return res.status(400).send('Path is required')
        }
        await deleteDirectoryFs(path)
        res.status(200).send('Directory deleted successfully')
    } catch (error) {
        console.error(error)
        res.status(500).send('Error deleting directory')
    }
}

module.exports = {
    getDirectories,
    makeDirectory,
    renameDirectory,
    deleteDirectory
};
