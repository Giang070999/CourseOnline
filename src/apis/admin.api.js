var express = require('express');
var adminApi = express.Router();
const adminController = require('../controllers/admin.controller')
const passportAuth = require("../middlewares/isAdmin.middleware")

// adminApi.post('/create-admin', (req, res, next) => {
//     const { userName, password, email, fullName } = req.body
//     AdminModel.create({
//         userName, password, email, fullName
//     })
//     return res.status(200).json({ message: "thành công!" })
// })

// api: login admin
adminApi.post('/login', adminController.postLogin)


// ============================= TEACHER ==================================
// api: lấy danh sách giáo viên và phân trang
// adminApi.get("/teachers", adminController.getTeachers)
adminApi.get("/teachers", passportAuth.jwtAuthentication, adminController.getTeachers)

// api: lấy chi tiết teacher 
adminApi.get("/teacher/:id", passportAuth.jwtAuthentication, adminController.getDetailTeacher)

// api: update giáo viên
adminApi.post("/teacher/:id", passportAuth.jwtAuthentication, adminController.putTeacher)

// api: thêm giáo viên
adminApi.post("/teacher", passportAuth.jwtAuthentication, adminController.postTeacher)


// ===================== STUDENT ==========================

// api: lấy danh sách học sinh
adminApi.get("/students", passportAuth.jwtAuthentication, adminController.getStudents)
// adminApi.get("/students", adminController.getStudents) // test

// api: lấy chi tiết 1 học sinh
adminApi.get("/student/:id", passportAuth.jwtAuthentication, adminController.getDetailStudent)

// api: cập nhật chi tiết 1 học sinh
adminApi.post("/student/:id", passportAuth.jwtAuthentication, adminController.putStudent)


// ====================== ACCOUNT ========================

// api: khoá tài khoản
adminApi.post("/account/lock/:id", passportAuth.jwtAuthentication, adminController.postLockAccount)

// api: mở khoá tài khoản
adminApi.post("/account/unlock/:id", passportAuth.jwtAuthentication, adminController.postUnLockAccount)

// api: đổi mật khẩu tài khoản
adminApi.post("/account/change-pw", passportAuth.jwtAuthentication, adminController.postChangePassword)

// api: lấy danh sách tài khoản
// adminApi.get("/accounts", adminController.getAccounts)
adminApi.get("/accounts", passportAuth.jwtAuthentication, adminController.getAccounts)

// api: lấy chi tiết tài khoản
adminApi.get("/account/:id", passportAuth.jwtAuthentication, adminController.getDetailAccount)


// ============= CLASS ====================


// api: danh sách lớp
adminApi.get("/classes", passportAuth.jwtAuthentication, adminController.getClass)

// api: chi tiết lớp
adminApi.get("/class/:code", passportAuth.jwtAuthentication, adminController.getDetailClass)

// api:cập nhật thông tin lớp
adminApi.post("/class/:code", passportAuth.jwtAuthentication, adminController.postUpdateClass)



module.exports = adminApi;
