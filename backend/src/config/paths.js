const path = require('path');

// Dossier où Sharp enregistre réellement les images
// Adapte selon ta structure : si imageController est en src/middlewares et tu veux /backend/images :
const IMAGES_DIR = path.join(__dirname, '..', '..', 'images');

module.exports = { IMAGES_DIR };
