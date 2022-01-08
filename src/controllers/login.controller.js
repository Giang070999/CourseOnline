const AccountModel = require("../models/account.model/account.model")
const bcrypt = require('bcryptjs');
const jwtConfig = require('../configs/jwt.config');
const jwt = require('jsonwebtoken');
const constants = require('../constants');
const express = require('express')


// fn: Đăng nhập local => login success => tạo refreshToken -> tạo jwt -> set cookies client
const postLogin = async (req, res, next) => {
    try {

        const { email, password, keepLogin } = req.body

        // kiểm tra tài khoản có tồn tại không?
        const account = await AccountModel.findOne({
            email
            // authType: 'local'
        })
        if (!account) return res.status(401).json({
            message: "Tài khoản không tồn tại!",
        })
        if (!account.active) return res.status(403).json({ message: "Tài khoản đã bị khoá." })

        // Kiểm tra mật khẩu
        const isMatch = await bcrypt.compare(password, account.password)
        if (!isMatch) return res.status(401).json({ message: 'Sai tài khoản hoặc mật khẩu!' })

        // đăng nhập thành công
        // tạo refresh token
        const refreshToken = await jwtConfig.encodedToken(
            process.env.JWT_SECRET_REFRESH_KEY,
            {
                accountId: account._id,
                keepLogin,
            },
            constants.JWT_REFRESH_EXPIRES_TIME,
        )
        // Tạo access token -> gửi client
        const token = await jwtConfig.encodedToken(
            process.env.JWT_SECRET_KEY,
            { accountId: account._id },
        )

        // Lưu refresh token
        await AccountModel.updateOne(
            { _id: account._id },
            { refreshToken }
        )

        if (express().get('env') === 'production') {
            // ! Heroku không cho set cookies cross domain (*.herokuapp.com)
            // Ta lưu cookies vào localstorage 
            if (token)
                return res.status(200).json({
                    message: "Đăng nhập thành công.",
                    token: token,
                    refreshToken: refreshToken,
                    role: account.role
                })
        } else {
            // nếu không duy trì đăng nhập thì giữ trạng thái sống token là session
            const expiresIn = keepLogin
                ? new Date(Date.now() + constants.COOKIE_EXPIRES_TIME)
                : 0
            // Gửi token lưu vào cookies và chỉ đọc
            res.cookie('access_token', token, {
                httpOnly: true,
                expires: expiresIn,
            })
            return res.status(200).json({
                message: "Đăng nhập thành công.",
                refreshToken: refreshToken,
                token: token,
                role: account.role
            })
        }
    } catch (error) {
        return res
            .status(400)
            .json({ message: 'Đăng nhập thất bại. Thử lại', error });
    }
}

// fn: Đăng nhập bằng google -> client sẽ gửi access token đến -> dùng access token lấy thông tin người dùng -> req.user
const postLoginWithGoogle = async (req, res, next) => {
    try {
        const { user } = req
        console.log("user: ", user);
        if (!user.active) return res.status(401).json({ message: "Tài khoản đã bị khoá!" })

        // tạo refreshToken 
        const refreshToken = await jwtConfig.encodedToken(
            process.env.JWT_SECRET_REFRESH_KEY,
            { accountId: user._id, keepLogin: true },
            constants.JWT_REFRESH_EXPIRES_TIME
        )

        // lưu refreshToken
        await AccountModel.updateOne(
            { _id: user._id },
            { refreshToken }
        )

        // tạo access token -> set header -> gửi client
        const token = await jwtConfig.encodedToken(process.env.JWT_SECRET_KEY, {
            accountId: user._id,
        })
        console.log("token: ", token);
        if (express().get('env') === 'production') {
            if (token)
                return res.status(200).json({ message: "Đăng nhập thành công! ", token, refreshToken, role: user.role });
        } else {
            const expiresIn = new Date(Date.now() + constants.COOKIE_EXPIRES_TIME);
            //set cookie for web browser
            res.cookie('access_token', token, {
                httpOnly: true,
                expires: expiresIn,
            });
            res.status(200).json({ message: "Đăng nhập thành công! ", refreshToken, token, role: user.role });
        }
    } catch (error) {
        return res.status(401).json({ message: 'Lỗi! Vui lòng thử lại.', error });
    }
}

// fn: Refresh jwt token
const postRefreshToken = async (req, res, next) => {
    try {
        const refreshToken = req.body.refresh_token
        const account = await AccountModel.findOne({
            refreshToken
        })
        if (!account) return res.status(403).json({ message: "Refresh token không hợp lệ!" })

        // Xác nhận token
        const decoded = await jwt.verify(
            refreshToken,
            process.env.JWT_SECRET_REFRESH_KEY,
        )

        const { userId, keepLogin } = decoded.sub
        // Tạo 1 access_token mới -> set cookie
        const newAccessToken = await jwtConfig.encodedToken(
            process.env.JWT_SECRET_KEY,
            { userId }
        )

        // cookies expires if keepLogin then 0
        const expiresIn = keepLogin
            ? new Date(Date.now() + constants.COOKIE_EXPIRES_TIME)
            : 0
        res.cookie('access_token', newAccessToken, {
            httpOnly: true,
            expires: expiresIn
        })
        return res.status(200).json({
            message: "refresh token thành công!",
            token: newAccessToken,
            refreshToken,
            role: account.role
        })
    } catch (error) {
        return res.status(401).json({
            message: "Không được phép!",
            error
        })
    }
}


// fn: Đăng xuất
const postLogout = async (req, res, next) => {
    try {
        let access_token = null
        if (express().get('env') === 'production') access_token = req.body.access_token
        else access_token = req.cookies.access_token
        const decoded = await jwt.verify(access_token, process.env.JWT_SECRET_KEY)
        const { accountId } = decoded.sub
        // Xoá refreshToken
        await AccountModel.updateOne(
            { _id: accountId },
            { refreshToken: null }
        )
        // Xoá cookie
        res.clearCookie('access_token')
        return res.status(200).json({
            message: "Đăng xuất thành công!"
        })
    } catch (error) {
        return res.status(409).json({
            message: "Đăng xuất thất bại!",
            error
        })
    }
}

// fn: check authenticate with jwt -> return isAuth
const getAuth = (req, res, next) => {
    if (res.locals.isAuth) return res.json({ isAuth: res.locals.isAuth });
    return res.json({ isAuth: false });
};

module.exports = {
    postLogin,
    postLoginWithGoogle,
    postRefreshToken,
    postLogout,
    getAuth,
}