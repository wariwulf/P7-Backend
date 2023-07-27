const Books = require('../models/Books');
const fs = require('fs');

exports.createBooks = (req, res) =>{
    const booksObject = JSON.parse(req.body.book);
    delete booksObject._id;
    delete booksObject._userId;
    const book = new Books ({
        ...booksObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });

   book.save()
    .then(() => { res.status(201).json({message: 'Objet enregistré!'})})
    .catch(error => { res.status(400).json ({ error })}); 
};

exports.modifBooks = (req, res) => {
    const booksObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : {...req.body};

    delete booksObject._userId;
    Books.findOne({_id: req.params.id})
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message: 'Non-autorisé!'});
            } else {
                Books.updateOne ({ _id: req.params.id}, { ...booksObject, _id: req.params.id})
                    .then(() => res.status(200).json({message: 'Objet modifié!'}))
                    .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) =>
            res.status(400).json({ error }));
};

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

exports.getAllBooks = (req, res) => {
    Books.find()
        .then(book => res.status(200).json(book))
        .catch(error => res.status(400).json ({ error }));
};

exports.deleteBook = (req, res, next) => {
    Books.findOne({ _id: req.params.id})
        .then(book => {
            if (!book) {
                return res.status(404).json({ message: 'Book not found' });
            }


            if (book.userId != req.auth.userId) {
                res.status(401).json({message: 'Not authorized'});
            } else {
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

  exports.getBestRatedBooks = (req, res) => {
    // Récupére les 3 livres ayant la meilleure note moyenne (dans l'ordre décroissant)
    Books.find().sort({ averageRating: -1 }).limit(3)
      .then((bestRatedBooks) => {
        res.status(200).json(bestRatedBooks);
      })
      .catch((error) => {
        res.status(500).json({ error });
      });
  };

module.exports = exports;