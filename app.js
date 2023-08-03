const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const booksRoutes = require('./routes/books');
const userRoutes = require('./routes/Users');
const dbUri = process.env.DB_URI;

// Connexion à la base de données MongoDB
mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

// Création de l'application Express
const app = express();

// Middleware pour gérer les requêtes CORS
app.use(cors());

// Middleware pour parser les données JSON dans le corps des requêtes
app.use(bodyParser.json());

// Middleware pour gérer les requêtes OPTIONS (prévention des erreurs CORS)
app.options('*', (req, res) => {
  res.sendStatus(200);
});

// Configuration des routes pour les livres et les utilisateurs
app.use('/api/books', booksRoutes);
app.use('/api/auth', userRoutes);

// Middleware pour servir les images statiques depuis le dossier 'images'
app.use('/images', express.static(path.join(__dirname, 'images')));

// Middleware pour gérer les requêtes vers des routes inconnues (404 Not Found)
app.use((req, res) => {
  res.status(404).json({ message: 'Page non trouvée!' });
});

// Exporte l'application Express configurée
module.exports = app;
