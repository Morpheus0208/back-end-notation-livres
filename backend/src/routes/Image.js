const express = require('express');
const fs = require('fs');

const router = express.Router();
const upload = require('../middlewares/multer-config');
const auth = require('../middlewares/auth');
const { compressAndSaveImage } = require('../middlewares/imageController');

router.post('/upload', auth, upload, compressAndSaveImage, (req, res) => {
  fs.access('./uploads', error => {
    if (error) {
      fs.mkdirSync('./uploads');
    }
  });
  res.status(201).json({ message: 'Image compressée avec succès', filename: req.file.filename });
});
