var express = require('express');
var userApi = express.Router();

const userController = require('../controllers/user.controller')
const passportAuth = require('../middlewares/passport.middleware')
const { storageFile } = require('../configs/cloudinary.config')


// api: lấy thông tin của người dùng
userApi.get('/my', passportAuth.jwtAuthentication, userController.getInfoUser)

// api: cập nhật thông tin user
userApi.post('/my', passportAuth.jwtAuthentication, userController.postInfoUser)


// #region ========== STUDENT APIs ===========
// api: cập nhật studentID
userApi.post('/student-id', passportAuth.jwtAuthentication, userController.postStudentID)

// api: tham gia lớp học bằng code
userApi.post('/join', passportAuth.jwtAuthentication, userController.postJoinClass)

// api: xem danh sách các lớp đã tham gia
userApi.get('/student/my-courses', passportAuth.jwtAuthentication, userController.getMyCourse)

// api: xem danh sách bài tập
// userApi.get('/student/course/assignments', userController.getAssignments)
userApi.get('/student/course/assignments', passportAuth.jwtAuthentication, userController.getAssignments)

// api: xem chi tiết 1 lớp (thông tin lớp, giảng viên, danh sách học sinh + phân bổ điểm)
userApi.get('/student/course/:code', passportAuth.jwtAuthentication, userController.getDetailCourse)


// api: xem điểm (phân bổ điểm + danh sách bài tập trong từng phân bổ điểm + bảng điểm)
userApi.get('/student/grade', passportAuth.jwtAuthentication, userController.getMyGrade)

// #endregion

// #region ========== TEACHER APIs ===========

// ==== class =====
// api: tạo lớp học (post kèm danh sách học sinh .xlsx)
userApi.post('/teacher/create-class', passportAuth.jwtAuthentication, storageFile.single('file'), userController.postClass)

// api: danh sách các lớp đang dạy
userApi.get('/teacher/my-class', passportAuth.jwtAuthentication, userController.getMyClass)

// api: xem chi tiết lớp
userApi.get('/teacher/class/:code', passportAuth.jwtAuthentication, userController.getDetailClass)

// api: cập nhật thông tin lớp
userApi.post('/teacher/class', passportAuth.jwtAuthentication, storageFile.single('file'), userController.postUpdateClass)


// ==== assignment & grade =====
// api: lấy ds  bài tập của 1 lớp
userApi.get('/teacher/assignments', passportAuth.jwtAuthentication, userController.getAssignments)

// api: lấy chi tiết bài tập của 1 lớp
userApi.get('/teacher/assignment', passportAuth.jwtAuthentication, userController.getAssignment)

// api: thêm bài tập
userApi.post('/teacher/assignment', passportAuth.jwtAuthentication, storageFile.single('file'), userController.postAssignment)

// api: sửa bài tập
userApi.post('/teacher/assignment/update', passportAuth.jwtAuthentication, storageFile.single('file'), userController.postUpdateAssignment)

// api: thêm điểm cho bài tập
userApi.post('/teacher/assignment/grade', passportAuth.jwtAuthentication, storageFile.single('file'), userController.postAssignmentGrade)

// api: lấy danh sách điểm của học sinh trong 1 lớp
// userApi.get('/teacher/grades/',  userController.getGrades)
userApi.get('/teacher/grades/', passportAuth.jwtAuthentication, userController.getGrades)

// api: lấy cấu trúc điểm của 1 lớp
userApi.get('/teacher/grade-struct', passportAuth.jwtAuthentication, userController.getGradeStruct)

// api: thêm 1 grade struct
userApi.post('/teacher/grade-struct', passportAuth.jwtAuthentication, userController.postGradeStruct)

// api: xoá 1 grade struct
userApi.post('/teacher/grade-struct/delete', passportAuth.jwtAuthentication, userController.deleteGradeStruct)

// api: sửa 1 grade struct
userApi.post('/teacher/grade-struct/update', passportAuth.jwtAuthentication, userController.postUpdateGradeStruct)

// api: tính điểm trung bình cho lớp
userApi.post('/teacher/final-course', passportAuth.jwtAuthentication, userController.postFinalClass)



// #endregion

module.exports = userApi