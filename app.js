const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

const booksRoutes = require('./routes/books');
const userRoutes = require('./routes/Users');

mongoose.connect('mongodb+srv://robin:robin123@api.o7ep8qn.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();

app.use(cors());

app.use(bodyParser.json());

// Route pour gérer les requêtes OPTIONS
app.options('*', (req, res) => {
  res.sendStatus(200);
});

app.use('/api/books', booksRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));


app.use((req, res) => {
  res.status(404).json({ message: 'Page non trouvé!' });
});

module.exports = app;
