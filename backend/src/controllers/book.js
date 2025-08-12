const fs = require('fs/promises');
const path = require('path');
const Book = require('../models/Book');
const { parseBookBody } = require('../utils/parseBookBody');
const { extractImageName } = require('../utils/extractImageName');
const { IMAGES_DIR } = require('../config/paths');

// Retire _id et _userId
function sanitizeIds(input) {
  if (!input || typeof input !== 'object') return input;
  const { _id, _userId, ...safe } = input;
  return safe;
}

exports.createBook = async (req, res, next) => {
  try {
    const bookObject = sanitizeIds(parseBookBody(req)); // On supprime les champs id et id de l'utilisateur  envoyé par le front et on parse le corps de la requête

    bookObject.userId = req.auth.userId; // On ajoute l'id de l'utilisateur authentifié

    // On part du principe que tout est présent et correct
    const title = bookObject && bookObject.title ? String(bookObject.title) : '';
    const author = bookObject && bookObject.author ? String(bookObject.author) : '';
    const year = bookObject && bookObject.year != null ? Number(bookObject.year) : undefined;
    const genre = bookObject && bookObject.genre ? String(bookObject.genre) : undefined;

    const authUserId = req && req.auth ? req.auth.userId : null;

    // 1) Construire ratings initiaux (0..1 entrée) si fournis
    let ratings = [];
    if (bookObject && Array.isArray(bookObject.ratings) && bookObject.ratings.length > 0) {
      const first = bookObject.ratings[0] || {};
      const raw = first.grade !== undefined ? first.grade : first.rating;
      const g = typeof raw === 'number' ? raw : Number(raw);
      ratings = [{ userId: authUserId, grade: g }];
    } else if (bookObject && bookObject.rating !== undefined) {
      const g =
        typeof bookObject.rating === 'number' ? bookObject.rating : Number(bookObject.rating);
      ratings = [{ userId: authUserId, grade: g }];
    } else if (bookObject && bookObject.averageRating !== undefined) {
      const g =
        typeof bookObject.averageRating === 'number'
          ? bookObject.averageRating
          : Number(bookObject.averageRating);
      ratings = [{ userId: authUserId, grade: g }];
    }

    // 2) Calculer la moyenne (simple)
    let averageRating = 0;
    if (ratings.length > 0) {
      const sum = ratings.reduce((a, r) => a + r.grade, 0);
      averageRating = Math.round((sum / ratings.length) * 10) / 10;
    }

    // 3) Créer le livre
    await Book.create({
      title,
      author,
      year,
      genre,
      userId: authUserId,
      imageUrl: req.fileUrl, // supposé présent via middleware
      ratings,
      averageRating,
    });

    return res.status(201).json({
      message: 'Livre créé (rating initial appliqué si fourni).',
    });
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

    // On supprime le _id et _userId du front et on parse le corps de la requête pour obtenir les données du livre
    const bookBody = sanitizeIds(parseBookBody(req));

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

exports.rateBook = async (req, res, next) => {
  try {
    const { id } = req.params; // supposé correct
    const authUserId = req.auth.userId; // supposé présent
    const g = typeof req.body.rating === 'number' ? req.body.rating : Number(req.body.rating);

    const book = await Book.findById(id); // document Mongoose
    // On suppose le livre existant

    if (!Array.isArray(book.ratings)) book.ratings = [];
    book.ratings.push({ userId: authUserId, grade: g });

    // Recalcul simple de la moyenne
    const sum = book.ratings.reduce((a, r) => a + r.grade, 0);
    book.averageRating = Math.round((sum / book.ratings.length) * 10) / 10;

    await book.save();
    return res.status(200).json(book);
  } catch (err) {
    return next(err);
  }
};

exports.getBestRating = async (req, res, next) => {
  try {
    const books = await Book.find().sort({ averageRating: -1, _id: 1 }).limit(3);
    return res.status(200).json(books);
  } catch (err) {
    return next(err);
  }
};
