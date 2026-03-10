console.log('✅ user.routes.js loaded');

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

// 🔥 FIX: correct controller file name
const userController = require('../controllers/user.controller');

const authMiddleware = require('../middlewares/auth.middleware');

// REGISTER
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Invalid Email'),
    body('fullname.firstname')
      .isLength({ min: 3 })
      .withMessage('First name must be at least 3 characters long'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
  ],
  userController.registerUser
);

// LOGIN
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Invalid Email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
  ],
  userController.loginUser
);

// PROFILE
router.get(
  '/profile',
  authMiddleware.authUser,
  userController.getUserProfile
);




// LOGOUT
router.get(
  '/logout',
  authMiddleware.authUser,
  userController.logoutUser
);

module.exports = router;
