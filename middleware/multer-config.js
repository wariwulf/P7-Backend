const multer = require('multer');

const MIME_TYPE = {
    'image/jpg': 'jpg',
    'imaje/jpeg': 'jpg',
    'image/png': 'jpg'
};

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'image')
    },
    filename: (req, file, callback) => {
        const name = file.originalname.split(' ').join(' ');
        const extension = MIME_TYPE[file.mimetype];
        callback(null, name + Date.now() + '.' + extension);
    }
});

module.exports = multer({ storage }).single('image');
