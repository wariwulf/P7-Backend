const multer = require('multer');
const sharp = require('sharp');
const path = require('path');

const MIME_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
};

const storage = multer.memoryStorage(); // Utilisez memoryStorage pour stocker temporairement les images en mémoire

const fileFilter = (req, file, callback) => {
  const allowedMimeTypes = Object.values(MIME_TYPES);
  if (allowedMimeTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new Error('Invalid file type.'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5 MB limit
  },
});

const resizeAndSaveImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    // Redimensionne et compresse l'image en utilisant Sharp
    const resizedImageBuffer = await sharp(req.file.buffer)
      .resize({ width: 800 })
      .jpeg({ quality: 80 })
      .toBuffer();

    // Génère le nom du fichier unique avec un timestamp
    const uniqueFileName =
      path.parse(req.file.originalname).name + Date.now() + '.jpg';

    // Enregistre l'image redimensionnée dans le dossier 'images'
    req.file.filename = uniqueFileName;
    req.file.buffer = resizedImageBuffer;
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Failed to resize and save image.' });
  }
};

module.exports = [upload.single('image'), resizeAndSaveImage];


