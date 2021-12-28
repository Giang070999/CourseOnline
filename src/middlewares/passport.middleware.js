const passport = require('passport');
const GoogleTokenStrategy = require('passport-google-token').Strategy;
const AccountModel = require('../models/account.model/account.model');
const StudentModel = require('../models/account.model/student.model')
const jwt = require('jsonwebtoken')
const express = require('express')

// authentication with JWT
const jwtAuthentication = async (req, res, next) => {
    try {
        res.locals.isAuth = false
        let authorization = req.headers.authorization;
        let token = authorization.split(" ")[1]
        //if not exist cookie[access_token] -> isAuth = false -> next
        if (!token) {
            next();
            return;
        }
        //verify jwt
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if (decoded) {
            const { accountId } = decoded.sub;
            const user = await AccountModel.findById(accountId);
            if (user) {
                res.locals.isAuth = true;
                req.user = user;
            }
        }
        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Unauthorized.',
            error,
        });
    }
}



// ! Xác thực với google plus
passport.use(
    new GoogleTokenStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const { id, name } = profile
                const { familyName, givenName } = name;
                const email = profile.emails[0].value;

                // Kiểm tra email đã tồn tại hay chưa? done(null, user): create Account
                // Kiểm tra local
                const localUser = await AccountModel.findOne({
                    email: email,
                    authType: 'local'
                })
                if (localUser) {
                    return done(null, localUser)
                }

                // Kiểm tra google
                const googleUser = await AccountModel.findOne({
                    googleId: id,
                    authType: 'google'
                })
                if (googleUser) return done(null, googleUser)

                // Tạo tài khoản với user tương ứng
                const newAccount = await AccountModel.create({
                    authType: 'google',
                    googleId: id,
                    email,
                })

                await StudentModel.create({
                    accountId: newAccount._id,
                    email,
                    fullName: familyName + " " + givenName,
                })
                done(null, newAccount)

            } catch (error) {
                console.log(error);
                done(error, false)
            }
        }
    )
)


module.exports = {
    jwtAuthentication,
}