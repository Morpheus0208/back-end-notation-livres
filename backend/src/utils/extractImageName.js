// permet l'extraction du nom de l'image à partir de son URL
function extractImageName(imageUrl = '') {
  const [, name] = String(imageUrl).split('/images/');
  return name || null;
}

module.exports = { extractImageName };
