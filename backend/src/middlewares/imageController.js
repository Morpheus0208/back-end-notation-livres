const sharp = require('sharp');
const path = require('path');

exports.compressAndSaveImage = async (req, res, next) => {
  const imagesDir = path.join(__dirname, '..', 'images');
  const name = req.file.originalname.split(' ').join('_');
  const fileName = `${name}-${Date.now()}.webp`;
  const filePath = path.join(imagesDir, fileName);

  await sharp(req.file.buffer).webp({ quality: 20 }).toFile(filePath);

  req.file.filename = fileName;
  next();
};
