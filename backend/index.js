const expressSession = require('express-session')
const { PrismaSessionStore } = require('@quixo3/prisma-session-store')
const { PrismaClient } = require('@prisma/client')
const express = require('express')
const multer = require('multer')
const path = require('path')
const PORT = 3000
const fs = require('fs').promises
const bodyParser = require('body-parser')
const cors = require('cors')
const { deleteDirectory, getDirectories, getFiles, makeDirectory, renameDirectory } = require('./fsFunctions')
const { login, getStatus, logout } = require('./controllers/AuthenticationController')

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

app.post('/login', login)
app.post('/logout', logout)
app.get('/status', getStatus)


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
        await makeDirectory(`./uploads/${path}`)
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

app.delete('/directory/:path', async (req, res) => {
    try {
        const { path } = req.params
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

app.get('/files/details/:directory/:filename', async (req, res) => {
    const { directory, filename } = req.params;

    try {
        const filePath = path.join(__dirname, 'uploads', directory, filename);

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
});

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

app.get(`/download/:directory/:filename`, async (req, res) => {
    const { directory, filename } = req.params
    const filePath = path.join(__dirname, 'uploads', directory, filename)

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