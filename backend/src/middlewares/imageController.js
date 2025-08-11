const sharp = require('sharp');
const path = require('path');
const fs = require('fs/promises');
const { IMAGES_DIR } = require('../config/paths'); // Chemin vers le dossier images

function sanitizeName(name) {
  return name
    .normalize('NFKD')
    .replace(/[^\w.\- ]+/g, '') // supprime accents/symboles
    .replace(/\s+/g, '-'); // espaces -> tirets
}

function safeStamp() {
  return new Date().toISOString().replace(/[:]/g, '-'); // Windows-friendly
}

exports.compressAndSaveImage = async (req, res, next) => {
  try {
    if (!req.file) return next(); // pas d'image => continuer la chaîne

    await fs.mkdir(IMAGES_DIR, { recursive: true });

    // Utiliser le buffer de multer et le nom original du fichier
    const { buffer, originalname } = req.file;

    const base = sanitizeName(originalname.replace(/\.[^.]+$/, '')); // retire extension d'origine
    const fileName = `${base}-${safeStamp()}.webp`;
    const filePath = path.join(IMAGES_DIR, fileName);

    await sharp(buffer).webp({ quality: 60 }).toFile(filePath);

    // Store the file path in the request object for later use
    req.fileUrl = `${req.protocol}://${req.get('host')}/images/${fileName}`;

    return next();
  } catch (err) {
    return next(err);
  }
};
