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

    try {
        const placeholderPath = path.join(__dirname, '../1x1.png'); // Ensure this path is correct
        await cloudinary.uploader.upload(placeholderPath, {
            public_id: fullPath,
            overwrite: true,
            resource_type: 'raw',
            folder: directoryPath
        });
        res.status(201).send('Directory created successfully');
    } catch (error) {
        console.error('Error creating directory:', error);
        res.status(500).send('Error creating directory');
    }
}

// Helper function to delete a folder and its contents
const deleteFolderHelper = async (directoryPath) => {
    const resourceTypes = ['image', 'video', 'raw'];

    try {
        for (const resourceType of resourceTypes) {
            const resources = await cloudinary.api.resources({
                type: 'upload',
                prefix: directoryPath,
                resource_type: resourceType
            });

            const publicIds = resources.resources.map(resource => resource.public_id);

            if (publicIds.length > 0) {
                await cloudinary.api.delete_resources(publicIds, { resource_type: resourceType });
            }
        }

        // Delete the folder itself
        await cloudinary.api.delete_folder(directoryPath);
        return { success: true };
    } catch (error) {
        return { success: false, error }; // Return the error for handling outside
    }
};


const deleteDirectory = async (req, res) => {
    const { path: directoryPath } = req.params;
    console.log("🚀 ~ deleteDirectory ~ directoryPath:", directoryPath);

    if (!directoryPath) {
        return res.status(400).send('Path is required');
    }

    try {
        const result = await deleteFolderHelper(directoryPath)

        if (result.success) {
            res.status(200).send('Directory and its contents deleted successfully');
        } else {
            console.error("🚀 ~ deleteDirectory ~ error:", result.error);
            if (result.error.http_code === 404) {
                return res.status(404).send('Folder not found');
            }
            res.status(500).send('Error deleting directory and its contents');
        }
    } catch (error) {
        if (error.http_code === 404) {
            console.log("🚀 ~ Folder not found:", directoryPath);
            return res.status(404).send('Folder not found');
        }
        console.error("🚀 ~ deleteDirectory ~ error:", error);
        res.status(500).send('Error deleting directory and its contents');
    }
};

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

module.exports = {
    getDirectories,
    makeDirectory,
    renameDirectory,
    deleteDirectory
};
