const AccountModel = require("../models/account.model/account.model")
const StudentModel = require("../models/account.model/student.model")
const VerifyModel = require("../models/account.model/verify.model")
const helper = require('../helper/index')
const mailConfig = require('../configs/mail.config');
const constants = require('../constants');
const bcrypt = require('bcryptjs');
const jwtConfig = require('../configs/jwt.config');
const jwt = require('jsonwebtoken');
const MyCourseModel = require("../models/myCourse.model");


// fn: gửi mã xác thực để đăng ký tài khoản
const postSendVerifyCode = async (req, res, next) => {
    try {
        const { email } = req.body;
        //Kiểm tra tài khoản đã tồn tại hay chưa
        const account = await AccountModel.findOne({ email });

        //nếu tồn tại, thông báo lỗi, return
        if (account) {
            let suffixError =
                account.authType === 'local'
                    ? ''
                    : `bởi đăng nhập với ${account.authType}`;
            let error = `Email đã được sử dụng ${suffixError} !`;
            return res.status(400).json({ message: error });
        }

        //cấu hình email sẽ gửi
        const verifyCode = helper.generateVerifyCode(constants.NUMBER_VERIFY_CODE);
        const mail = {
            to: email,
            subject: 'Mã xác thực tạo tài khoản',
            html: mailConfig.htmlSignupAccount(verifyCode),
        };

        //lưu mã vào database để xác thực sau này
        await VerifyModel.findOneAndDelete({ email: email });
        await VerifyModel.create({
            code: verifyCode,
            email,
            dateCreated: Date.now(),
        });

        //gửi mail
        const result = await mailConfig.sendEmail(mail);

        //if success
        if (result) {
            return res.status(200).json({ message: 'Gửi mã xác thực thành công!' });
        }
    } catch (error) {
        return res.status(401).json({
            message: 'Gửi mã thất bại',
            error,
        });
    }
}

// fn: đăng ký tài khoản
const postSignup = async (req, res, next) => {
    try {
        const { email, password, verifyCode, fullName, birthday, gender, phone } = req.body

        // kiểm tra tài khoản đã tồn tại chưa?
        const account = await AccountModel.findOne({ email: email })

        // tồn tại ? báo lỗi
        if (account) {
            var suffixError = account.authType === 'local'
                ? ''
                : `bởi ${account.authType}`
            return res.status(401).json({ message: `Email đã được sử dụng ${suffixError}!` })
        }

        // kiểm tra mã xác thực
        const isVerify = await helper.isVerifyEmail(email, verifyCode)
        if (!isVerify) return res.status(401).json({ message: "Mã xác thực không hợp lệ!" })

        // tạo tài khoản và user tương ứng
        const newAccount = await AccountModel.create({
            email,
            password,
            authType: 'local',
        })
        if (newAccount) {
            await StudentModel.create({
                accountId: newAccount._id,
                fullName,
                birthday,
                gender,
                phone,
            })
        }
        return res.status(200).json({
            message: 'Tạo tài khoản thành công!'
        })
    } catch (error) {
        return res.status(400).json({
            message: 'Tạo tài khoản thất bại!',
            error
        })
    }

}

// fn: gửi mã xác thực để lấy lại mật khẩu
const postSendCodeResetPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        //Kiểm tra tài khoản đã tồn tại hay chưa
        const account = await AccountModel.findOne({ email });

        //nếu tồn tại, thông báo lỗi, return
        if (!account)
            return res.status(401).json({ message: 'Tài khoản không tồn tại' });

        //cấu hình email sẽ gửi
        const verifyCode = helper.generateVerifyCode(constants.NUMBER_VERIFY_CODE);
        const mail = {
            to: email,
            subject: 'Thay đổi mật khẩu',
            html: mailConfig.htmlResetPassword(verifyCode),
        };

        //lưu mã vào database để xác thực sau này
        await VerifyModel.findOneAndDelete({ email });
        await VerifyModel.create({
            code: verifyCode,
            email,
            dateCreated: Date.now(),
        });

        //gửi mail
        const result = await mailConfig.sendEmail(mail);

        //if success
        if (result) {
            return res.status(200).json({ message: 'Gửi mã xác thực thành công!' });
        }
    } catch (error) {
        return res.status(409).json({
            message: 'Gửi mã thất bại',
            error,
        });
    }
}

// fn: lấy lại mật khẩu
const postResetPassword = async (req, res, next) => {
    try {
        const { email, password, verifyCode } = req.body;

        // kiểm tra tài khoản tồn tại?
        const account = await AccountModel.findOne({ email })
        if (!account) return res.status(401).json({ message: "Tài khoản không tồn tại!" })

        // kiểm tra mã xác thực
        const isVerify = await helper.isVerifyEmail(email, verifyCode);

        if (!isVerify) {
            return res.status(401).json({ message: 'Mã xác nhận không hợp lệ.' });
        }
        //check userName -> hash new password -> change password
        const hashPassword = await bcrypt.hash(
            password,
            parseInt(process.env.SALT_ROUND),
        );

        const response = await AccountModel.updateOne(
            { email, authType: 'local' },
            { password: hashPassword },
        );

        //check response -> return client
        if (response.modifiedCount == 1) {
            //xoá mã xác nhận
            await VerifyModel.deleteOne({ email });
            return res.status(200).json({ message: 'Thay đổi mật khẩu thành công' });
        } else {
            return res.status(409).json({ message: 'Thay đổi mật khẩu thất bại' });
        }
    } catch (error) {
        return res.status(409).json({ message: 'Thay đổi mật khẩu thất bại' });
    }
}


// fn: đổi mật khẩu
const postChangePassword = async (req, res, next) => {
    try {
        // check account => hash password => change password

        const { verifyCode, password } = req.body

        const account = await AccountModel.findOne({ email })
        if (!account) {
            return res.status(401).json({ message: "tài khoản không tồn tại!" })
        }

        // kiểm tra mã xác thực
        const isVerify = await helper.isVerifyEmail(email, verifyCode.trim());

        if (!isVerify) {
            return res.status(401).json({ message: 'Mã xác nhận không hợp lệ.' });
        }
        //check userName -> hash new password -> change password
        const hashPassword = await bcrypt.hash(
            password,
            parseInt(process.env.SALT_ROUND),
        );

        const response = await AccountModel.updateOne({ email }, { password: hashPassword })
        if (response.modifiedCount == 1) {
            return res.status(200).json({ message: "Thay đổi mật khẩu thành công!" })
        } else {
            return res.status(409).json({ message: 'Thay đổi mật khẩu thất bại' });
        }

    } catch (error) {
        console.log(error);
        return res.status(409).json({ message: 'Thay đổi mật khẩu thất bại', error });

    }
}

module.exports = {
    postSendVerifyCode,
    postSignup,
    postResetPassword,
    postSendCodeResetPassword,
    postChangePassword,
}