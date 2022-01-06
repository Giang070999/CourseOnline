const StudentModel = require('../models/account.model/student.model')
const AccountModel = require('../models/account.model/account.model')
const TeacherModel = require('../models/account.model/teacher.model')
const MyCourseModel = require('../models/myCourse.model')
const AdminModel = require("../models/account.model/admin.model")
const ClassModel = require("../models/class.model")
const bcrypt = require("bcryptjs")
const jwtConfig = require('../configs/jwt.config');
const jwt = require('jsonwebtoken');
const constants = require('../constants');


// fn: login admin
const postLogin = async (req, res, next) => {
    try {
        const { userName, password } = req.body
        const admin = await AdminModel.findOne({ userName, password })
        if (!admin) return res.status(401).json({ message: "Sai tên đăng nhập hoặc mật khẩu!" })

        const token = await jwtConfig.encodedToken(
            process.env.JWT_SECRET_KEY,
            { accountId: admin._id },
        )
        const expiresIn = new Date(Date.now() + constants.COOKIE_EXPIRES_TIME)
        return res.status(200).json({ message: "Login thành công!", access_token: token, expires: expiresIn, role: "admin" })
    } catch (error) {
        console.log(error);
        return res.status(406).json({ message: "Lỗi", error })
    }
}


// ==================== Teacher ========================
// fn: lấy danh sách teacher và phân trang
//  get /admin/teachers?limit=10&page=3&name=pham&sort:name_asc
const getTeachers = async (req, res, next) => {
    try {
        let isAdmin = res.locals.isAdmin
        if (!isAdmin) return res.status(401).json({ message: "Không được phép" })

        const { page = 1, limit = 10, name, sort } = req.query
        const nSkip = (parseInt(page) - 1) * parseInt(limit)

        let sortBy = {}
        let query = {}
        if (name) {
            let regexp = new RegExp(name, 'i')
            query.fullName = regexp
        }

        if (sort) {
            let field = sort.split("_")[0]
            let value = sort.split("_")[1]
            sortBy = [[field, value]]
        }
        const numOfTeacher = await TeacherModel.countDocuments(query)
        const result = await TeacherModel.find(query).populate("accountId", 'email authType role').select('-__v -_id')
            .skip(nSkip)
            .limit(parseInt(limit))
            .sort(sortBy)

        return res.status(200).json({
            message: "Thành công!",
            numOfTeacher,
            result
        })

    } catch (error) {
        console.log(error);
        return res.status(401).json({
            message: "Lỗi",
            error
        })
    }
}

// fn: xem thông tin chi tiết teacher
// get /admin/teacher/:id
const getDetailTeacher = async (req, res, next) => {
    try {
        let isAdmin = res.locals.isAdmin
        if (!isAdmin) return res.status(401).json({ message: "Không được phép" })
        const { id } = req.params
        const result = await TeacherModel.findOne({ accountId: id }).populate("accountId")
        return res.status(200).json({ message: "Thành công!", result })
    } catch (error) {
        console.log(error);
        return res.status(401).json({ message: 'có lỗi xảy ra!', error })
    }
}

// fn: tạo teacher
// post /admin/teacher
const postTeacher = async (req, res, next) => {
    try {
        let isAdmin = res.locals.isAdmin
        if (!isAdmin) return res.status(401).json({ message: "Không được phép" })
        const { email, password, fullName, birthday, gender, phone } = req.body
        let role = "teacher"
        // tạo account
        const account = await AccountModel.create({
            email, password, role
        })
        // tạo teacher
        await TeacherModel.create({
            accountId: account._id, fullName, birthday, gender, phone
        })
        return res.status(200).json({
            message: "tạo tài khoản thành công!"
        })
    } catch (error) {
        console.log(error);
        return res.status(401).json({
            message: "có lỗi xảy ra!",
            error
        })
    }
}

// fn: update teacher
// post /admin/teacher/:id   ==== :id là id của account
const putTeacher = async (req, res, next) => {
    try {
        let isAdmin = res.locals.isAdmin
        if (!isAdmin) return res.status(401).json({ message: "Không được phép" })
        const { id } = req.params
        const { fullName, birthday, gender, phone } = req.body

        await TeacherModel.updateOne(
            { accountId: id },
            { fullName, birthday, gender, phone }
        )
        return res.status(200).json({ message: "Thành công!" })
    } catch (error) {
        console.log(error);
        return res.status(401).json({ message: 'có lỗi xảy ra!', error })
    }
}


// ============== Student ===================
// fn: lấy danh sách student và phân trang
//  get /admin/students?limit=10&page=3&name=pham&sort:name_asc
const getStudents = async (req, res, next) => {
    try {
        let isAdmin = res.locals.isAdmin
        if (!isAdmin) return res.status(401).json({ message: "Không được phép" })

        const { page = 1, limit = 10, name, sort } = req.query
        const nSkip = (parseInt(page) - 1) * parseInt(limit)

        let sortBy = {}
        let query = {}
        if (name) {
            let regexp = new RegExp(name, 'i')
            query.fullName = regexp
        }
        if (sort) {
            let field = sort.split("_")[0]
            let value = sort.split("_")[1]
            sortBy = [[field, value]]
        }
        const numOfStudent = await StudentModel.countDocuments(query)
        const result = await StudentModel.find(query).select('-__v').populate("accountId", 'email authType role')
            .skip(nSkip)
            .limit(parseInt(limit))
            .sort(sortBy)

        return res.status(200).json({
            message: "Thành công!",
            numOfStudent,
            result
        })

    } catch (error) {
        console.log(error);
        return res.status(401).json({
            message: "Lỗi",
            error
        })
    }
}

// fn: xem thông tin chi tiết student
// get /admin/student/:id
const getDetailStudent = async (req, res, next) => {
    try {
        let isAdmin = res.locals.isAdmin
        if (!isAdmin) return res.status(401).json({ message: "Không được phép" })
        const { id } = req.params
        const result = await StudentModel.findOne({ accountId: id }).populate("accountId")
        return res.status(200).json({ message: "Thành công!", result })
    } catch (error) {
        console.log(error);
        return res.status(401).json({ message: 'Có lỗi xảy ra!', error })
    }
}


// fn: update student
// post /admin/student/:id   ==== :id là id của account
const putStudent = async (req, res, next) => {
    try {
        let isAdmin = res.locals.isAdmin
        if (!isAdmin) return res.status(401).json({ message: "Không được phép" })
        const { id } = req.params
        const { studentId, fullName, birthday, gender, phone } = req.body

        await StudentModel.updateOne(
            { accountId: id },
            { studentId, fullName, birthday, gender, phone }
        )
        return res.status(200).json({ message: "Thành công!" })
    } catch (error) {
        console.log(error);
        return res.status(401).json({ message: 'có lỗi xảy ra!', error })
    }
}


// ================= ACCOUNT =======================
// fn: khoá tài khoản
const postLockAccount = async (req, res, next) => {
    try {
        let isAdmin = res.locals.isAdmin
        if (!isAdmin) return res.status(401).json({ message: "Không được phép" })
        const { id } = req.params
        // kiểm tra tài khoản

        const account = await AccountModel.findById(id)
        if (!account) return res.status(401).json({ message: "Tài khoản không tồn tại" })
        console.log(account);
        await AccountModel.updateOne(
            { _id: id },
            { active: false }
        )
        return res.status(200).json({ message: "Khoá tài khoản thành công!" })

    } catch (error) {
        console.log(error);
        return res.status(403).json({
            message: "Lỗi",
            error
        })
    }
}

// fn: mở khoá tài khoản
const postUnLockAccount = async (req, res, next) => {
    try {
        let isAdmin = res.locals.isAdmin
        if (!isAdmin) return res.status(401).json({ message: "Không được phép" })
        const { id } = req.params
        // kiểm tra tài khoản

        const account = await AccountModel.findById(id)
        if (!account) return res.status(401).json({ message: "Tài khoản không tồn tại" })

        await AccountModel.updateOne(
            { _id: id },
            { active: true }
        )

        return res.status(200).json({ message: "Mở khoá tài khoản thành công!" })

    } catch (error) {
        console.log(error);
        return res.status(401).json({
            message: "Lỗi",
            error
        })
    }
}

// fn: đổi mật khẩu
const postChangePassword = async (req, res, next) => {
    try {
        let isAdmin = res.locals.isAdmin
        if (!isAdmin) return res.status(401).json({ message: "Không được phép" })
        const { email, password } = req.body
        // Kiểm tra tài khoản
        const account = await AccountModel.findOne({ email })
        if (!account) return res.status(401).json({ message: "Tài khoản không tồn tại" })
        const hashPassword = await bcrypt.hash(
            password,
            parseInt(process.env.SALT_ROUND),
        );
        await AccountModel.updateOne(
            { email },
            { password: hashPassword }
        )
        return res.status(200).json({ message: "Đổi mật khẩu thành công!" })
    } catch (error) {
        console.log(error);
        return res.status(403).json({ message: "Lỗi", error })
    }
}

// fn: danh sách tài khoản
const getAccounts = async (req, res, next) => {
    try {
        let isAdmin = res.locals.isAdmin
        if (!isAdmin) return res.status(401).json({ message: "Không được phép" })

        const { page = 1, limit = 10, email, active, role, sort } = req.query
        const nSkip = (parseInt(page) - 1) * parseInt(limit)

        let query = {}
        let sortBy = {}
        if (role) query.role = role
        if (active) query.active = active
        if (email) {
            let regexp = new RegExp(email, 'i')
            query.email = regexp
        }
        if (sort) {
            let field = sort.split("_")[0]
            let value = sort.split("_")[1]
            sortBy = [[field, value]]
        }

        const numOfAccount = await AccountModel.countDocuments(query)
        const result = await AccountModel.find(query).select("-refreshToken -__v -password")
            .skip(nSkip)
            .limit(parseInt(limit))
            .sort(sortBy)

        return res.status(200).json({
            message: "Thành công!",
            numOfAccount,
            result
        })

    } catch (error) {
        console.log(error);
        return res.status(401).json({
            message: "Lỗi", error
        })

    }
}

// fn: chi tiết tài khoản
// /accounts/:id
const getDetailAccount = async (req, res, next) => {
    try {
        let isAdmin = res.locals.isAdmin
        if (!isAdmin) return res.status(401).json({ message: "Không được phép" })
        const { id } = req.params
        // lấy tài khoản
        const account = await AccountModel.findById(id)
        return res.status(200).json({ message: "Thành công!", account })
    } catch (error) {
        console.log(error);
        return res.status(401).json({ message: "Lỗi", error })
    }
}


// ================= CLASS =====================
// fn: update class info active, name
const postUpdateClass = async (req, res, next) => {
    try {
        let isAdmin = res.locals.isAdmin
        if (!isAdmin) return res.status(401).json({ message: "Không được phép" })

        const { active, name } = req.body
        const { code } = req.params
        // kiểm tra có tồn tại lớp?
        const classs = await ClassModel.findOne({ code })
        if (!classs) return res.status(403).json({ message: "Mã lớp không tồn tại" })

        // cập nhật thông tin
        await ClassModel.updateOne({ code }, { active: active, name: name })
        return res.status(200).json({ message: "Cập nhật thành công!" })
    } catch (error) {
        console.log(error);
        return res.status(401).json({ message: "Lỗi", error })
    }
}

// fn: lấy danh sách lớp
const getClass = async (req, res, next) => {
    try {
        let isAdmin = res.locals.isAdmin
        if (!isAdmin) return res.status(401).json({ message: "Không được phép" })

        const { page = 1, limit = 10, active, sort, name } = req.query
        const nSkip = (parseInt(page) - 1) * parseInt(limit)

        let query = {}
        let sortBy = {}
        if (active) query.active = active
        if (name) {
            let regexp = new RegExp(name, 'i')
            query.name = regexp
        }
        if (sort) {
            let field = sort.split("_")[0]
            let value = sort.split("_")[1]
            sortBy = [[field, value]]
        }
        const numOfClass = await ClassModel.countDocuments(query)
        const result = await ClassModel.find(query).select("-__v -_id -students")
            .skip(nSkip)
            .limit(parseInt(limit))
            .sort(sortBy)

        return res.status(200).json({ message: "Thành công!", numOfClass, result })
    } catch (error) {
        console.log(error);
        return res.status(401).json({ message: "Lỗi", error })
    }
}

// fn: chi tiết lớp
const getDetailClass = async (req, res, next) => {
    try {
        let isAdmin = res.locals.isAdmin
        if (!isAdmin) return res.status(401).json({ message: "Không được phép" })

        const { code } = req.query

        const result = await ClassModel.findOne({ code }).select("-__v -_id")

        return res.status(200).json({ message: "Thành công!", result })
    } catch (error) {
        console.log(error);
        return res.status(401).json({ message: "Lỗi", error })
    }
}



module.exports = {
    postLogin,

    // fn: teachers
    getTeachers,
    getDetailTeacher,
    postTeacher,
    putTeacher,

    // fn: students
    getStudents,
    getDetailStudent,
    putStudent,

    // fn: lock account
    postLockAccount,
    postUnLockAccount,
    postChangePassword,
    getAccounts,
    getDetailAccount,

    // fn: class
    postUpdateClass,
    getClass,
    getDetailClass,
}