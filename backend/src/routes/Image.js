const express = require('express');

const router = express.Router();
const upload = require('../images/multer-config');
const auth = require('../middlewares/auth');
const { compressAndSaveImage } = require('../middlewares/imageController');

router.post('/upload', auth, upload, compressAndSaveImage, (req, res) => {
  res.status(201).json({ message: 'Image compressée avec succès', filename: req.file.filename });
});
