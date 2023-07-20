const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require ('body-parser');
const path = require('path');

const booksRoutes = require('./routes/books');
const userRoutes = require('./routes/Users');


mongoose.connect('mongodb+srv://robin:robin123@api.o7ep8qn.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use(bodyParser.json());

app.use('/api/books', booksRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Bienvenue sur l\'API de livres !' });
});

app.get('/api', (req, res) => {
  res.status(200).json({ message: 'API is online' });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Page non trouvé!' });
});

module.exports = app;
