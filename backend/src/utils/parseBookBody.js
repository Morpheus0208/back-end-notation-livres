function parseBookBody(req) {
  // multipart/form-data => req.body.book est une string JSON
  if (req.body && typeof req.body.book === 'string') {
    try {
      return JSON.parse(req.body.book);
    } catch (e) {
      return {};
    }
  }
  // JSON direct
  return req.body || {};
}
module.exports = { parseBookBody };
