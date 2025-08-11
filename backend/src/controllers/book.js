const fs = require('fs/promises');
const path = require('path');
const Book = require('../models/Book');
const { IMAGES_DIR } = require('../config/paths');

function extractImageName(imageUrl = '') {
  const [, name] = String(imageUrl).split('/images/');
  return name || null;
}
function parseBookBody(req) {
  // Accepte 2 cas : multipart (req.body.book = string JSON) ou JSON pur
  if (req.body && typeof req.body.book === 'string') {
    return JSON.parse(req.body.book);
  }
  return req.body || {};
}

exports.createBook = async (req, res, next) => {
  try {
    const bookObject = parseBookBody(req);
    delete bookObject._id; // On supprime l'id envoyé par le front
    delete bookObject._userId; // On supprime l'id de l'utilisateur envoyé par le front

    bookObject.userId = req.auth.userId; // On ajoute l'id de l'utilisateur authentifié

    if (!req.fileUrl) {
      return res.status(400).json({ error: 'Image manquante' });
    }

    bookObject.imageUrl = req.fileUrl; // On ajoute l'URL de l'image si elle existe`;
    bookObject.averageRating = 0; // Initialisation de la note moyenne
    bookObject.ratings = []; // Initialisation du tableau de notes

    await new Book(bookObject).save(); // Création d'une nouvelle instance de Book et sauvegarde
    return res.status(201).json({ message: 'Livre créé !' });
  } catch (err) {
    return next(err);
  }
};

exports.updateBook = async (req, res, next) => {
  try {
    const bookObject = await Book.findById(req.params.id);
    if (!bookObject) {
      return res.status(404).json({ message: 'Livre non trouvé' });
    }
    // Vérification que l'utilisateur authentifié est bien celui qui a créé le livre
    if (bookObject.userId !== req.auth.userId) {
      return res.status(403).json({ message: 'Non autorisé !' });
    }

    // On parse le corps de la requête pour obtenir les données du livre
    const bookBody = parseBookBody(req);

    // On supprime les champs non nécessaires
    delete bookBody._id; // On supprime l'id envoyé par le front
    delete bookBody._userId; // On supprime l'id de l'utilisateur envoyé par le front

    // On gère l'image : si une nouvelle image est envoyée, on la traite
    let oldFileToDelete = null;
    if (req.fileUrl) {
      if (bookObject.imageUrl) {
        const oldName = extractImageName(bookObject.imageUrl);
        if (oldName) {
          oldFileToDelete = path.join(IMAGES_DIR, oldName);
        }
        bookBody.imageUrl = req.fileUrl;
      }

      Object.assign(bookObject, bookBody); // Met à jour les propriétés du livre

      await bookObject.save(); // Enregistre les modifications dans la base de données

      if (oldFileToDelete) {
        try {
          await fs.unlink(oldFileToDelete); // Supprime l'ancienne image si elle existe
        } catch (err) {
          if (err.code !== 'ENOENT') {
            throw err; // Ignore l'erreur si le fichier n'existe pas
          }
        }
      }
    }
    return res.status(200).json({ message: 'Livre modifié !' });
  } catch (err) {
    return next(err);
  }
};

exports.deleteBook = async (req, res, next) => {
  try {
    const bookObject = await Book.findById(req.params.id);

    if (!bookObject) {
      return res.status(404).json({ message: 'Livre non trouvé' });
    }

    if (bookObject.userId !== req.auth.userId) {
      return res.status(403).json({ message: 'Non autorisé !' });
    }
    // On extrait le nom de l'image à partir de l'URL
    const name = extractImageName(bookObject.imageUrl);
    // Si un nom d'image est trouvé, on tente de la supprimer
    if (name) {
      const filePath = path.join(IMAGES_DIR, name);
      try {
        await fs.unlink(filePath); // Supprime l'image associée au livre
      } catch (err) {
        if (err.code !== 'ENOENT') {
          return next(err); // Propagation de l'erreur si le fichier n'existe pas
        }
      }
    }
    await Book.deleteOne({ _id: req.params.id });
    return res.status(200).json({ message: 'Livre supprimé !' });
  } catch (err) {
    return next(err);
  }
};
exports.getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById({ _id: req.params.id });
    if (!book) {
      return res.status(404).json({ error: 'Livre non trouvé' });
    }

    return res.status(200).json(book);
  } catch (err) {
    return next(err);
  }
};

exports.getAllBooks = async (req, res, next) => {
  try {
    const books = await Book.find({});
    return res.status(200).json(books);
  } catch (err) {
    return next(err);
  }
};
