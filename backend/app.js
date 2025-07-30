const express = require('express');
const Book = require('./src/models/Book');

const app = express();

// Middlewares globaux
app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

// POST pour créer un livre

app.post('/api/book', (req, res) => {
  console.log('req.body:', req.body);
  delete req.body._id; // On supprime l'id envoyé par le front
  const book = new Book({
    ...req.body,
  });
  book
    .save()
    .then(() => res.status(201).json({ message: 'Livre créé !' }))
    .catch(error => res.status(400).json({ error }));
});

// PUT pour modifier un livre
app.put('/api/book/:id', (req, res) => {
  delete req.body._id; // On supprime l'id envoyé par le front
  Book.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Livre modifié !' }))
    .catch(error => res.status(400).json({ error }));
});
// DELETE pour supprimer un livre
app.delete('/api/book/:id', (req, res) => {
  Book.deleteOne({ _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Livre supprimé !' }))
    .catch(error => res.status(400).json({ error }));
});
// GET pour récupérer un livre par son ID
app.get('/api/book/:id', (req, res) => {
  Book.findOne({ _id: req.params.id })
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({ error }));
});

// GET pour récupérer tous les livres
app.get('/api/book', (req, res) => {
  Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
});

module.exports = app;
