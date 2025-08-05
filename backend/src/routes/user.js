const express = require('express');

const router = express.Router();
const userCtrl = require('../controllers/user');

router.post(
  '/signup',
  (req, res, next) => {
    console.log('✔️ Route /signup appelée');
    next();
  },
  userCtrl.signupUser
);
router.post('/login', userCtrl.loginUser);

module.exports = router;
