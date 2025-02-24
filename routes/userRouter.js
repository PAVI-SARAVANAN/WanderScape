const express = require('express');
const userControllers = require('./../controllers/userController')
const authControllers = require('./../controllers/authController');

const router = express.Router();

router.get('/me', authControllers.protect, userControllers.getMe, userControllers.getUser);

router.post('/signup', authControllers.signup);
router.post('/login', authControllers.login);

router.post('/forgotPassword', authControllers.forgotPassword);
router.patch('/resetPassword/:token', authControllers.resetPassword);

router.use(authControllers.protect);

router.patch('/updateMyPassword', authControllers.updatePassword);
router.patch('/updateProfile', userControllers.updateMe);

router.delete('/deleteProfile', userControllers.deleteMe);

router.use(authControllers.restrictTo('admin'));

router
.route('/')
.get(userControllers.getAllUsers)
.post(userControllers.createUser)

router
.route('/:id')
.get(userControllers.getUser)
.patch(userControllers.updateUser)
.delete(userControllers.deleteUser)

module.exports = router;