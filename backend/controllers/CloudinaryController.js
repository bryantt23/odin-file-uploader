require('dotenv').config()
const cloudinary = require('cloudinary').v2
const path = require('path');
const { Readable } = require('stream');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
})

const getDirectories = async (req, res) => {
    try {
        const result = await cloudinary.api.sub_folders('');
        const directories = result.folders.map(folder => folder.name);
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

/**
 * Fetch and return all files from a specified Cloudinary folder.
 */
const getFiles = async (req, res) => {
    const folderPath = req.query.path;

    if (!folderPath) {
        return res.status(400).send({ message: 'Folder path is required' });
    }

    try {
        const allResources = await getAllResources();
        const filtered = allResources.filter(resource => resource.asset_folder === folderPath);

        if (!filtered.length) {
            return res.status(404).send({ message: `No resources found in folder: ${folderPath}` });
        }

        const files = filtered.map(resource => (
            {
                displayName: resource.display_name,
                public_id: resource.public_id,
                url: resource.url,
                modified: resource.created_at,
                size: resource.bytes,
                name: resource.asset_id
            }
        ));
        res.json({ files });
    } catch (error) {
        console.error('Error fetching files:', error);
        res.status(500).send({ message: "Error fetching files from Cloudinary", error });
    }
};

async function getAllResources() {
    try {
        let allResources = [];

        // Fetch image resources
        const imageResources = await cloudinary.api.resources({
            type: 'upload',
            prefix: '',
            resource_type: 'image',
            max_results: 100
        });
        allResources = allResources.concat(imageResources.resources);

        // Fetch raw resources
        const rawResources = await cloudinary.api.resources({
            type: 'upload',
            prefix: '',
            resource_type: 'raw',
            max_results: 100
        });
        console.log('Raw resources fetched:', rawResources.resources.length);
        allResources = allResources.concat(rawResources.resources);
        return allResources
    } catch (error) {
        console.error('Error fetching resources:', error);
    }
}

const uploadFile = async (req, res) => {
    if (!req.files || !req.files.file) {
        return res.status(400).send('No file uploaded');
    }

    const file = req.files.file;
    const directoryPath = req.params.path;  // Assuming the directory path is sent as a URL parameter
    const readableStream = new Readable();
    readableStream._read = () => { };
    readableStream.push(file.data);
    readableStream.push(null); // EOF

    // Define Cloudinary upload options
    const uploadOptions = {
        resource_type: 'auto',
        folder: directoryPath, // Specify the folder path for Cloudinary
    };

    // Stream the uploaded file to Cloudinary
    const cloudinaryStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
            if (error) {
                console.error('Cloudinary error:', error);
                return res.status(500).send({ message: 'Cloudinary upload failed', error });
            }
            res.send({ message: 'File uploaded successfully to Cloudinary', url: result.secure_url });
        }
    );

    readableStream.pipe(cloudinaryStream);
};

const renameDirectory = async (req, res) => {
    const { prev, updated } = req.body;

    if (!prev || !updated) {
        return res.status(400).send('Both previous and updated paths are required');
    }

    try {
        // Step 1: Fetch all resources from the previous directory
        const allResources = await getAllResources();
        const filtered = allResources.filter(resource => resource.asset_folder === prev);

        // Step 2: Create new directory by copying files
        const copyResults = await Promise.all(filtered.map(resource =>
            cloudinary.uploader.upload(resource.url, {
                public_id: resource.public_id.replace(prev, updated),
                folder: updated,
                resource_type: 'auto'
            })
        ));

        // Step 3: Check if all files are copied successfully
        if (copyResults.some(result => !result)) {
            throw new Error('Failed to copy some files');
        }

        // Step 4: Delete old files
        let deletionResults = await Promise.all(filtered.map(resource =>
            cloudinary.uploader.destroy(resource.public_id, { resource_type: 'image' })
        ));
        deletionResults = await Promise.all(filtered.map(resource =>
            cloudinary.uploader.destroy(resource.public_id, { resource_type: 'raw' })
        ));

        // Step 5: Check if all files are deleted successfully
        if (deletionResults.some(result => !result.result === 'ok')) {
            throw new Error('Failed to delete some files');
        }

        // Step 6: Delete the old folder if empty
        try {
            await cloudinary.api.delete_folder(prev);
            console.log("Folder deleted successfully");
        } catch (error) {
            throw new Error('Failed to delete the folder: ' + error.message);
        }

        res.status(200).send('Directory renamed successfully');
    } catch (error) {
        console.error('Error renaming directory:', error);
        res.status(500).send('Error renaming directory');
    }
};

const downloadFile = (req, res) => {
    console.log("Download attempted on Cloudinary setup, which is not implemented.");
    res.status(501).send("Downloading files directly is not implemented in the Cloudinary setup.");
};

const getFileDetails = (req, res) => {
    console.log("Get file details attempted on Cloudinary setup, which is not implemented.");
    res.status(501).send("Getting file details directly is not implemented in the Cloudinary setup.");
};

module.exports = {
    getDirectories,
    makeDirectory,
    renameDirectory,
    deleteDirectory,
    getFiles,
    uploadFile,
    downloadFile,
    getFileDetails
};
