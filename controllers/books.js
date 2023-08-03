const Books = require('../models/books');
const fs = require('fs');

// Fonction pour créer un nouveau livre dans la base de données
exports.createBooks = (req, res) =>{
    const booksObject = JSON.parse(req.body.book);
    delete booksObject._id;
    delete booksObject._userId;
    const book = new Books ({
        ...booksObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });

    // Enregistre le nouveau livre dans la base de données
    book.save()
        .then(() => { res.status(201).json({message: 'Objet enregistré!'})})
        .catch(error => { res.status(400).json ({ error })}); 
};

// Fonction pour mettre à jour un livre existant dans la base de données
exports.modifBooks = (req, res) => {
    const booksObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : {...req.body};

    delete booksObject._userId;
    Books.findOne({_id: req.params.id})
        .then((book) => {
            // Vérifie si l'utilisateur actuel est autorisé à modifier ce livre
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message: 'Non-autorisé!'});
            } else {
                // Met à jour le livre avec les nouvelles informations
                Books.updateOne ({ _id: req.params.id}, { ...booksObject, _id: req.params.id})
                    .then(() => res.status(200).json({message: 'Objet modifié!'}))
                    .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) =>
            res.status(400).json({ error }));
};

// Fonction pour récupérer un livre par son ID depuis la base de données
exports.getOneBook = (req, res, next) => {
    Books.findOne({
      _id: req.params.id
    }).then(
      (book) => {
        res.status(200).json(book);
      }
    ).catch(
      (error) => {
        res.status(404).json({
          error: error
        });
      }
    );
};

// Fonction pour récupérer tous les livres depuis la base de données
exports.getAllBooks = (req, res) => {
    Books.find()
        .then(book => res.status(200).json(book))
        .catch(error => res.status(400).json ({ error }));
};

// Fonction pour supprimer un livre de la base de données
exports.deleteBook = (req, res, next) => {
    Books.findOne({ _id: req.params.id})
        .then(book => {
            // Vérifie si l'utilisateur actuel est autorisé à supprimer ce livre
            if (!book) {
                return res.status(404).json({ message: 'Book not found' });
            }

            if (book.userId != req.auth.userId) {
                res.status(401).json({message: 'Not authorized'});
            } else {
                // Supprime le livre de la base de données et l'image associée
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Books.deleteOne({_id: req.params.id})
                        .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch( error => {
            res.status(500).json({ error });
        });
};

// Fonction pour ajouter une notation à un livre
exports.addRating = async (req, res) => {
    const { userId, rating } = req.body;
    const bookId = req.params.id;
    
    // Vérifie que la note est comprise entre 0 et 5
    if (rating < 0 || rating > 5) {
      return res.status(400).json({ message: 'La note doit être comprise entre 0 et 5.' });
    }
    
    // Vérifie si l'utilisateur a déjà noté ce livre
    const book = await Books.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Livre non trouvé.' });
    }
  
    const existingRating = book.ratings.find((r) => r.userId === userId);
    if (existingRating) {
      return res.status(400).json({ message: 'Vous avez déjà noté ce livre.' });
    }
    
    // Ajoute la nouvelle notation au tableau "ratings" du livre
    book.ratings.push({ userId, grade: rating });
  
    // Met à jour la note moyenne "averageRating" du livre
    const totalRatings = book.ratings.length;
    const totalRatingSum = book.ratings.reduce((sum, r) => sum + r.grade, 0);
    book.averageRating = totalRatingSum / totalRatings;
  
    // Sauvegarder les modifications dans la base de données
    try {
      await book.save();
      return res.status(200).json(book);
    } catch (error) {
      return res.status(500).json({ error: 'Erreur lors de l\'enregistrement de la notation.' });
    }
};

// Fonction pour récupérer les 3 livres les mieux notés depuis la base de données
exports.getBestRatedBooks = (req, res) => {
    // Récupère les 3 livres ayant la meilleure note moyenne (dans l'ordre décroissant)
    Books.find().sort({ averageRating: -1 }).limit(3)
      .then((bestRatedBooks) => {
        res.status(200).json(bestRatedBooks);
      })
      .catch((error) => {
        res.status(500).json({ error });
      });
};

module.exports = exports;
