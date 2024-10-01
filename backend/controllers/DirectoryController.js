
const { getDirectories: getDirectoriesFs,
    makeDirectory: makeDirectoryFs,
    deleteDirectory: deleteDirectoryFs,
    renameDirectory: renameDirectoryFs } = require('../fsFunctions');

const getDirectories = async (req, res) => {
    try {
        const dirPath = req.query.path || './uploads'
        const directories = await getDirectoriesFs(dirPath)
        res.status(200).json({ directories })
    } catch (error) {
        console.error(error)
        res.status(500).send('Error fetching directories')
    }
};

const makeDirectory = async (req, res) => {
    try {
        const { path } = req.body
        if (!path) {
            return res.status(400).send('Path is required')
        }
        await makeDirectoryFs(`./uploads/${path}`)
        res.status(201).send('Directory created successfully')
    } catch (error) {
        console.error(error)
        res.status(500).send('Error creating directory')
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
