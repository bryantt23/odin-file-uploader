const fs = require('fs').promises;

const getDirectories = async (source) => {
    const directories = (await fs.readdir(source, { withFileTypes: true }))
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)
    return directories;
}

const getFiles = async (source) => {
    try {
        const stats = await fs.stat(source);
        if (!stats.isDirectory()) {
            throw new Error('Not a directory');
        }
        const dirents = await fs.readdir(source, { withFileTypes: true });
        const files = dirents
            .filter(dirent => dirent.isFile())
            .map(dirent => dirent.name);
        return files;
    } catch (error) {
        console.error('Error reading files:', error);
        throw error;  // Propagate the error to be handled by the caller        
    }
}

const makeDirectory = async (path) => {
    try {
        await fs.mkdir(path);
    } catch (error) {
        console.error(error);
    }
}

const renameDirectory = async (prev, updated) => {
    try {
        await fs.rename(`./uploads/${prev}`, `./uploads/${updated}`);
    } catch (error) {
        console.error(error);
    }
}

const deleteDirectory = async (path) => {
    try {
        // Deletes the directory and any files/subdirectories within it
        await fs.rm(`./uploads/${path}`, { recursive: true, force: true });
        console.log(`Directory ${path} deleted successfully.`);
    } catch (error) {
        console.error(`Error deleting directory ${path}:`, error);
    }
}

const checkDirectory = async (path) => {
    try {
        const stats = await fs.stat(path);
        console.log(`Directory ${path} exists`);
    } catch (error) {
        console.log(`Directory ${path} does not exist`);
    }
}

const fsTest = async () => {
    console.log("print folders")
    let directories = await getDirectories("./uploads");
    console.log("directories: " + directories);

    console.log("create a folder")
    const path = './uploads/test_folder';
    await makeDirectory(path);
    await checkDirectory(path);  // Check if the directory was created
    console.log("print folders")
    directories = await getDirectories("./uploads");
    console.log("directories: " + directories);

    console.log('rename directory')
    const renamed = './uploads/test_folder_renamed';
    await renameDirectory(path, renamed);
    await checkDirectory(renamed);  // Check if it was renamed
    console.log("print folders")
    directories = await getDirectories("./uploads");
    console.log("directories: " + directories);

    console.log('delete directory')
    await deleteDirectory(renamed);
    await checkDirectory(renamed);  // Check if it was deleted
    console.log("print folders")
    directories = await getDirectories("./uploads");
    console.log("directories: " + directories);
}

// Exporting the functions using module.exports
module.exports = {
    getDirectories,
    getFiles,
    makeDirectory,
    renameDirectory,
    deleteDirectory,
    checkDirectory,
    fsTest
};


// fsTest()
