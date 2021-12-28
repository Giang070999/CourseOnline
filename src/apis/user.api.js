var express = require('express');
var userApi = express.Router();

const userController = require('../controllers/user.controller')
const passportAuth = require('../middlewares/passport.middleware')
const { storageFile } = require('../configs/cloudinary.config')


// api: lấy thông tin của người dùng
userApi.get('/my', passportAuth.jwtAuthentication, userController.getInfoUser)

// api: cập nhật thông tin user
userApi.post('/my', passportAuth.jwtAuthentication, userController.postInfoUser)


// ========= Student API ==========

// api: cập nhật studentID
userApi.post('/student-id', passportAuth.jwtAuthentication, userController.postStudentID)

// api: tham gia lớp học bằng code
userApi.post('/join', passportAuth.jwtAuthentication, userController.postJoinClass)

// api: xem danh sách các lớp đã tham gia
userApi.get('/student/my-courses', passportAuth.jwtAuthentication, userController.getMyCourse)

// api: xem chi tiết 1 lớp
userApi.get('/student/course/:code', passportAuth.jwtAuthentication, userController.getDetailCourse)


// api: xem cấu trúc điểm

// api: xem điểm
userApi.get('/student/grade', passportAuth.jwtAuthentication, userController.getMyGrade)


// ========= Teacher API ==========
// ==== class =====
// api: tạo lớp học
userApi.post('/teacher/create-class', passportAuth.jwtAuthentication, storageFile.single('file'), userController.postClass)

// api: nhập danh sách học sinh = file excel
// userApi.post('/teacher/create-class', passportAuth.jwtAuthentication, storageFile.single('file'), userController.postListStudents)


// api: danh sách các lớp đang sở hữu
userApi.get('/teacher/my-class', passportAuth.jwtAuthentication, userController.getMyClass)

// api: xem chi tiết lớp
userApi.get('/teacher/class/:code', passportAuth.jwtAuthentication, userController.getDetailClass)

// api: cập nhật thông tin lớp
userApi.post('/teacher/class', passportAuth.jwtAuthentication, userController.postUpdateClass)


// ==== assignment & grade =====
// api: lấy ds  bài tập của 1 lớp
userApi.get('/teacher/assignments', passportAuth.jwtAuthentication, userController.getAssignments)

// api: lấy chi tiết bài tập của 1 lớp
userApi.get('/teacher/assignment', passportAuth.jwtAuthentication, userController.getAssignments)

// api: thêm bài tập
userApi.post('/teacher/assignment', passportAuth.jwtAuthentication, storageFile.single('file'), userController.postAssignment)

// api: sửa bài tập
userApi.post('/teacher/assignment/update', passportAuth.jwtAuthentication, storageFile.single('file'), userController.postUpdateAssignment)

// api: thêm điểm cho bài tập
userApi.post('/teacher/assignment/grade', passportAuth.jwtAuthentication, storageFile.single('file'), userController.postAssignmentGrade)

// api: lấy danh sách điểm của học sinh trong 1 lớp
userApi.get('/teacher/grades/', passportAuth.jwtAuthentication, userController.getGrades)

// api: lấy cấu trúc điểm của 1 lớp
userApi.get('/teacher/grade-struct', passportAuth.jwtAuthentication, userController.getGradeStruct)

// api: thêm 1 grade struct
userApi.post('/teacher/grade-struct', passportAuth.jwtAuthentication, userController.postGradeStruct)

// api: sửa 1 grade struct
userApi.post('/teacher/grade-struct/update', passportAuth.jwtAuthentication, userController.postUpdateGradeStruct)

// api: tính điểm trung bình cho lớp


module.exports = userApi