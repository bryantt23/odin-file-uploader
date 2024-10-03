const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const bodyParser = require('body-parser');
const cors = require('cors');
const expressSession = require('express-session');
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');
const { PrismaClient } = require('@prisma/client');

const fsFileController = require('./controllers/FileController');
const { login, getStatus, logout } = require('./controllers/AuthenticationController');
const multerDirectoryController = require('./controllers/DirectoryController');
const upload = require('./config/multerConfig')
const cloudinaryDirectoryFileController = require('./controllers/CloudinaryController')
const fileUpload = require('express-fileupload');

// Determine which controller to use based on an environment variable or other logic
const isUsingCloudinary = false;

// Determine which directory controller to use
const getDirectoryController = () => {
    return isUsingCloudinary ? cloudinaryDirectoryFileController : multerDirectoryController;
};

// Determine which file controller to use
const getFileController = () => {
    return isUsingCloudinary ? cloudinaryDirectoryFileController : fsFileController;
};

// Use the appropriate controller based on the environment setting
const directoryController = getDirectoryController();
const fileController = getFileController();

// Conditional middleware based on environment variable
const uploadMiddleware = (req, res, next) => {
    if (isUsingCloudinary) {
        next()
    }
    else {
        upload.single('file')(req, res, next)
    }
}

const PORT = 3000;

// ----- Middleware and Session Configuration -----
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(expressSession({
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000 // ms
    },
    secret: 'a santa at nasa',
    resave: true,
    saveUninitialized: true,
    store: new PrismaSessionStore(
        new PrismaClient(), {
        checkPeriod: 2 * 60 * 1000,  // ms
        dbRecordIdIsSessionId: true,
        dbRecordIdFunction: undefined
    }
    )
}));

app.use(fileUpload({
    createParentPath: true, // Automatically creates the directory path for uploaded files
    safeFileNames: true, // Ensures file names are safe to use with your filesystem
    preserveExtension: true // Preserves the extension of the file being uploaded
}));

// ----- Helper Function to Ensure Base Upload Directory Exists -----
async function ensureUploadsDirectory() {
    const baseUploadsPath = path.join(__dirname, 'uploads');
    try {
        await fs.stat(baseUploadsPath);
    } catch (error) {
        if (error && error.code === 'ENOENT') {
            await fs.mkdir(baseUploadsPath, { recursive: true });
        } else {
            throw error;
        }
    }
}

ensureUploadsDirectory().catch(console.error);

// ----- API Routes -----
// Authentication Routes
app.post('/login', login);
app.post('/logout', logout);
app.get('/status', getStatus);

// Directory Management Routes
app.get('/directory', directoryController.getDirectories);
app.post('/directory', directoryController.makeDirectory);
app.put('/directory', directoryController.renameDirectory);
app.delete('/directory/:path', directoryController.deleteDirectory);

// File Management Routes
app.get('/files', fileController.getFiles);
app.post('/upload/:path', uploadMiddleware, fileController.uploadFile);
app.get('/files/details/:directory/:filename', fileController.getFileDetails);
app.get(`/download/:directory/:filename`, fileController.downloadFile);

// ----- Error Handling Middleware -----
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        res.status(500).send({ message: err.message });
    } else if (err) {
        res.status(500).send({ message: err.message });
    } else {
        next();
    }
});

// ----- Server Activation -----
app.listen(PORT, function (err) {
    if (err) console.log(err);
    console.log("Server listening on PORT", PORT);
});
