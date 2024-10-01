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
const { getFiles, getFileDetails, uploadFile, downloadFile } = require('./controllers/FileController')
const { login, getStatus, logout } = require('./controllers/AuthenticationController')
const { getDirectories, deleteDirectory, makeDirectory, renameDirectory } = require('./controllers/DirectoryController')

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

// authentication routes
app.post('/login', login)
app.post('/logout', logout)
app.get('/status', getStatus)

// directory routes
app.get('/directory', getDirectories)
app.post('/directory', makeDirectory)
app.put('/directory', renameDirectory)
app.delete('/directory/:path', deleteDirectory)

// file routes
app.get('/files', getFiles)
app.post('/upload/:path', upload.single('file'), uploadFile);
app.get('/files/details/:directory/:filename', getFileDetails);
app.post('/upload/:path', upload.single('file'), uploadFile)
app.get(`/download/:directory/:filename`, downloadFile)

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