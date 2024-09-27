const expressSession = require('express-session')
const { PrismaSessionStore } = require('@quixo3/prisma-session-store')
const { PrismaClient } = require('@prisma/client')
const express = require('express')
const multer = require('multer')
const path = require('path')
const PORT = 3000
const fs = require('fs').promises
const prisma = new PrismaClient()
const bodyParser = require('body-parser')
const cors = require('cors')

// Function to ensure the base upload directory exists
async function ensureUploadsDirectory() {
    const baseUploadsPath = path.join(__dirname, 'uploads');
    try {
        await fs.stat(baseUploadsPath);
    } catch (error) {
        if (error && error.code === 'ENOENT') {  // No such file or directory
            await fs.mkdir(baseUploadsPath, { recursive: true });
        } else {
            throw error;
        }
    }
}

ensureUploadsDirectory().catch(console.error);

// Configure multer with dynamic paths
const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        const subPath = req.params.path;  // Assuming 'path' is provided through the URL
        const fullPath = path.join(__dirname, 'uploads', subPath);

        try {
            await fs.stat(fullPath);
        } catch (error) {
            if (error && error.code === 'ENOENT') {
                await fs.mkdir(fullPath, { recursive: true });
            } else {
                return cb(error);
            }
        }

        cb(null, fullPath);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Use the original file name
    }
});

const upload = multer({ storage: storage });

const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(
    expressSession({
        cookie: {
            maxAge: 7 * 24 * 60 * 60 * 1000 // ms
        },
        secret: 'a santa at nasa',
        resave: true,
        saveUninitialized: true,
        store: new PrismaSessionStore(
            new PrismaClient(),
            {
                checkPeriod: 2 * 60 * 1000,  //ms
                dbRecordIdIsSessionId: true,
                dbRecordIdFunction: undefined
            }
        )
    })
)

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File upload endpoint
app.post('/upload/:path', upload.single('file'), (req, res) => {
    console.log('hiiii')
    console.log(req.body); // Log to see what's available in req.body
    if (req.file) {
        res.status(200).send({ message: "File uploaded successfully", file: req.file });
    } else {
        res.status(400).send({ message: "Failed to upload file" });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '', 'form.html'))
})

app.post("/file", upload.single('file'), function (req, res, next) {
    console.log('hii', req.file, req.body)
    res.redirect("/")
})

app.post('/login', async (req, res) => {
    const { username, password } = req.body

    const user = await prisma.user.findUnique({
        where: { username }
    })

    if (user && user.password === password) {
        req.session.user = { id: user.id, username: user.username }
        res.send({ loggedIn: true })
    }
    else {
        res.status(401).send({ loggedIn: false })
    }
})

app.get('/status', (req, res) => {
    if (req.session.user) {
        res.send({ loggedIn: true, user: req.session.user })
    }
    else {
        res.send({ loggedIn: false })
    }
})

app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Failed to log out')
        }

        res.send({ loggedIn: false })
    })
})

app.get('/directory', async (req, res) => {
    try {
        const dirPath = req.query.path || './uploads'
        const directories = await getDirectories(dirPath)
        res.status(200).json({ directories })
    } catch (error) {
        console.error(error)
        res.status(500).send('Error fetching directories')
    }
})

app.post('/directory', async (req, res) => {
    try {
        const { path } = req.body
        if (!path) {
            return res.status(400).send('Path is required')
        }
        await makeDirectory(path)
        res.status(201).send('Directory created successfully')
    } catch (error) {
        console.error(error)
        res.status(500).send('Error creating directory')
    }
})

app.put('/directory', async (req, res) => {
    try {
        const { prev, updated } = req.body
        if (!prev || !updated) {
            return res.status(400).send('Both previous and updated paths are required')
        }
        await renameDirectory(prev, updated)
        res.status(200).send('Directory renamed successfully')
    } catch (error) {
        console.error(error)
        res.status(500).send('Error renaming directory')
    }
})

app.delete('/directory', async (req, res) => {
    try {
        const { path } = req.body
        if (!path) {
            return res.status(400).send('Path is required')
        }
        await deleteDirectory(path)
        res.status(200).send('Directory deleted successfully')
    } catch (error) {
        console.error(error)
        res.status(500).send('Error deleting directory')
    }
})

app.get('/files', async (req, res) => {
    const dirPath = req.query.path

    // Normalize and restrict the path to the uploads directory
    const normalizedPath = path.normalize(dirPath).replace(/^(\.\.[\/\\])+/, '');
    const fullPath = path.join(__dirname, 'uploads', normalizedPath);
    try {
        const files = await getFiles(fullPath)
        res.status(200).json({ files })
    } catch (error) {
        console.error('Failed to fetch files:', error);
        res.status(500).send('Error fetching files');
    }
})

app.post('/upload/:path', upload.single('file'), (req, res) => {
    if (req.file) {
        res.status(200).send({ message: 'File uploaded successfully', file: req.file })
    }
    else {
        res.status(400).send({ message: "Failed to upload file" })
    }
})

// Error handling middleware for Multer
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        res.status(500).send({ message: err.message });
    } else if (err) {
        res.status(500).send({ message: err.message });
    } else {
        next();
    }
});

app.listen(PORT, function (err) {
    if (err) console.log(err);
    console.log("Server listening on PORT", PORT);
})

const getDirectories = async source => {
    const directories = (await fs.readdir(source, { withFileTypes: true }))
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)
    return directories
}

const getFiles = async source => {
    try {
        const stats = await fs.stat(source)
        if (!stats.isDirectory()) {
            throw new Error('Not a directory');
        }
        const dirents = await fs.readdir(source, { withFileTypes: true })
        const files = dirents
            .filter(dirent => dirent.isFile())
            .map(dirent => dirent.name)
        return files
    } catch (error) {
        console.error('Error reading files:', error);
        throw error;  // Propagate the error to be handled by the caller        
    }
}

const makeDirectory = async (path) => {
    try {
        await fs.mkdir(path)
    } catch (error) {
        console.error(error)
    }
}

const renameDirectory = async (prev, updated) => {
    try {
        await fs.rename(prev, updated)
    } catch (error) {
        console.error(error)
    }
}

const deleteDirectory = async (path) => {
    try {
        await fs.rmdir(path)
    } catch (error) {
        console.error(error)
    }
}

const checkDirectory = async (path) => {
    try {
        const stats = await fs.stat(path)
        console.log(`Directory ${path} exists`)
    } catch (error) {
        console.log(`Directory ${path} does not exist`)
    }
}

const fsTest = async () => {
    console.log("print folders")
    let directories = await getDirectories("./uploads")
    console.log("directories: " + directories)

    console.log("create a folder")
    const path = './uploads/test_folder'
    await makeDirectory(path)
    await checkDirectory(path)  // Check if the directory was created
    console.log("print folders")
    directories = await getDirectories("./uploads")
    console.log("directories: " + directories)

    console.log('rename directory')
    const renamed = './uploads/test_folder_renamed'
    await renameDirectory(path, renamed)
    await checkDirectory(renamed)  // Check if it was renamed
    console.log("print folders")
    directories = await getDirectories("./uploads")
    console.log("directories: " + directories)

    console.log('delete directory')
    await deleteDirectory(renamed)
    await checkDirectory(renamed)  // Check if it was deleted
    console.log("print folders")
    directories = await getDirectories("./uploads")
    console.log("directories: " + directories)
}

// fsTest()
