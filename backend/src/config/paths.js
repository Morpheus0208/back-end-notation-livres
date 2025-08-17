const path = require('path');

// Dossier où Sharp enregistre réellement les images

const IMAGES_DIR = path.join(__dirname, '..', '..', 'images');

module.exports = { IMAGES_DIR };
