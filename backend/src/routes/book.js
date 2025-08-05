const express = require('express');
const bookctrl = require('../controllers/book');
const auth = require('../middlewares/auth');
const multer = require('../../images/multer-config');

const router = express.Router();

// POST pour créer un livre
router.post('/', auth, multer, bookctrl.createBook);
// PUT pour modifier un livre
router.put('/:id', auth, multer, bookctrl.updateBook);
// DELETE pour supprimer un livre
router.delete('/:id', auth, bookctrl.deleteBook);
// GET pour récupérer un livre par son ID
router.get('/:id', bookctrl.getBookById);
// GET pour récupérer tous les livres
router.get('/', bookctrl.getAllBooks);

module.exports = router;
