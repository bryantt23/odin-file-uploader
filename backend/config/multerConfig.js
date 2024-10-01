const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure storage
const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        const subPath = req.params.path;  // Assuming 'path' is provided through the URL
        const fullPath = path.join(__dirname, '../uploads', subPath); // Adjust the path as necessary

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

module.exports = upload;
