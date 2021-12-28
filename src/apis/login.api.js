var express = require('express');
var loginApi = express.Router();

const loginController = require('../controllers/login.controller')
const passportAuth = require('../middlewares/passport.middleware');
const passport = require('passport')

const { parser, storageFile } = require('../configs/cloudinary.config')

// api: đăng nhập local
loginApi.post('/', loginController.postLogin)

// api: đăng nhập bằng google
loginApi.post('/google',
    passport.authenticate('google-token', { session: false }),
    loginController.postLoginWithGoogle
)

// api: xác thực người dùng
loginApi.get('/auth', passportAuth.jwtAuthentication, loginController.getAuth)


// api: refresh token
loginApi.post('/refresh_token', loginController.postRefreshToken)


loginApi.post('/logout', loginController.postLogout)

module.exports = loginApi;
