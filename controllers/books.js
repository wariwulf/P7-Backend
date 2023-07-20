const Book = require('../models/Books');

exports.createBooks = (req, res, next) =>{
    const booksObject = JSON.parse(req.body.thing);
    delete booksObject._id;
    delete booksObject._userId;
    const book = new Book ({
        ...booksObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });

   book.save()
    .then(() => { res.status(201).json({message: 'Objet enregistré!'})})
    .catch(error => { res.status(400).json ({ error })}); 
};

exports.getAllBooks = (req, res ,next) => {
    Book.find()
        .then(book => res.status(200).json(book))
        .catch(error => res.status(400).json ({ error }));
};

module.exports = exports;