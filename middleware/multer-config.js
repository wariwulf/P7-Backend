const multer = require('multer');

// Définition des types MIME autorisés et leurs extensions correspondantes
const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'jpg'
};

// Configuration du stockage des fichiers téléchargés
const storage = multer.diskStorage({
    // Spécification du dossier de destination pour les images téléchargées
    destination: (req, file, callback) => {
        callback(null, 'images')
    },
    // Génération d'un nom de fichier unique pour chaque image téléchargée
    filename: (req, file, callback) => {
        const name = file.originalname.split(' ').join('_'); // Remplace les espaces dans le nom d'origine par des underscores
        const extension = MIME_TYPES[file.mimetype]; // Récupère l'extension du fichier en fonction de son type MIME
        callback(null, name + Date.now() + '.' + extension); // Concatène le nom d'origine, la date actuelle et l'extension pour obtenir un nom de fichier unique
    }
});

// Exporte le middleware Multer configuré pour gérer les téléchargements d'images uniques avec le stockage défini
module.exports = multer({ storage }).single('image');
