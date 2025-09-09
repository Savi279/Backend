import multer from 'multer';
import path from 'path';
import fs from 'fs'; // Import file system module for directory creation
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the 'uploads' directory path
const uploadsDir = path.join(__dirname, '../uploads');

// Create the 'uploads' directory if it doesn't exist
// This ensures Multer has a place to store files before any uploads happen
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Set up storage engine for Multer to specify where and how files are saved
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Files will be stored in the 'uploads' directory, relative to the backend root
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Generate a unique filename: fieldname-timestamp.originalExtension
        // e.g., 'image-1700000000000.png'
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Helper function to check if the uploaded file is an allowed image type
function checkFileType(file, cb) {
    // Regular expression for allowed image extensions
    const filetypes = /jpeg|jpg|png|gif/;
    // Test the file's extension
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Test the file's MIME type
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        // If both match, accept the file
        return cb(null, true);
    } else {
        // Otherwise, reject the file with an error message
        cb('Error: Images Only!');
    }
}

// Initialize Multer upload middleware
const upload = multer({
    storage: storage, // Use the configured disk storage
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
    fileFilter: (req, file, cb) => {
        // Apply the file type check before processing the upload
        checkFileType(file, cb);
    }
}).array('images', 4); // Expect up to 4 files with the field name 'images'

export default upload;
