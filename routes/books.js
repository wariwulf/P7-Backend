const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

const booksCtrl = require('../controllers/books');

router.get('/bestrating', booksCtrl.getBestRatedBooks);
router.post('/:id/rating', booksCtrl.addRating);
router.post('/', auth, multer, booksCtrl.createBooks);
router.put('/:id', auth, multer, booksCtrl.modifBooks);
router.get('/:id', booksCtrl.getOneBook);
router.get('/', booksCtrl.getAllBooks);
router.delete('/:id', auth, booksCtrl.deleteBook);


module.exports = router;
  