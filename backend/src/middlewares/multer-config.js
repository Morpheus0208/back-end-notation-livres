const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite à 5 Mo
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true); // Type accepté
    } else {
      cb(new Error('Format non supporté : seulement JPEG, PNG, WebP autorisés'), false);
    }
  },
});

module.exports = upload.single('image');
