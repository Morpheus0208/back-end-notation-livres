const fs = require('fs');
const Book = require('../models/Book');

exports.createBook = (req, res) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id; // On supprime l'id envoyé par le front
  delete bookObject._userId; // On supprime l'id de l'utilisateur envoyé par le front
  if (req.file) {
    bookObject.imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
    const book = new Book({
      ...bookObject,
      imageUrl: req.file
        ? `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        : null,
    });
    book
      .save()
      .then(() => res.status(201).json({ message: 'Livre créé !' }))
      .catch(error => res.status(400).json({ error }));
  }
};

exports.updateBook = (req, res) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
      }
    : { ...req.body };

  delete bookObject._Userid;

  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (book.userId !== req.auth.userID) {
        res.status(401).json({ message: 'Non autorisé !' });
      } else {
        Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Livre modifié !' }))
          .catch(error => res.status(400).json({ error }));
      }
    })
    .catch(error => res.status(400).json({ error }));
};
exports.deleteBook = (req, res) => {
  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (book.userId !== req.auth.userID) {
        res.status(401).json({ message: 'Non autorisé !' });
      }

      const filename = book.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Book.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Livre supprimé !' }))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};
exports.getBookById = (req, res) => {
  Book.findOne({ _id: req.params.id })
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({ error }));
};
exports.getAllBooks = (req, res) => {
  Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};
