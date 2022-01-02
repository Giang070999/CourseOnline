const jwt = require('jsonwebtoken')
const helper = require('../helper')
const constants = require('../constants')
const StudentModel = require('../models/account.model/student.model')
const AccountModel = require('../models/account.model/account.model')
const TeacherModel = require('../models/account.model/teacher.model')
const MyCourseModel = require('../models/myCourse.model')
const ClassModel = require('../models/class.model')
const AssignmentModel = require("../models/asignment.model")
const { cloudinary } = require('../configs/cloudinary.config');
const readFileExcel = require('read-excel-file/node');
const GradeModel = require('../models/grade.model')
const GradeStructModel = require('../models/gradeStruct.model')


// fn: upload assignment file to cloudinary
const uploadAssignmentFile = async (file, code, extension) => {
    try {
        const result = await cloudinary.uploader.upload(file, {
            folder: `assignment`,
            resource_type: 'raw',
            format: `${extension}`,
            public_id: `${code}`,
            // flags: `attachment:${code}`,
        });
        const { secure_url } = result;
        return secure_url;
    } catch (error) {
        throw error;
    }
};

// fn: upload grades file to cloudinary
const uploadGradeFile = async (file, code) => {
    try {
        const result = await cloudinary.uploader.upload(file, {
            folder: `assignment`,
            resource_type: 'raw',
            format: "xlsx",
            public_id: `${code}`
        });
        const { secure_url } = result;
        return secure_url;
    } catch (error) {
        throw error;
    }
};

// fn: check tổng % của grade struct luôn = 100%
const checkTotalPercent = async (classCode, extra) => {
    const structs = await GradeStructModel.find({ classCode })
    var totalPercent = 0
    structs.forEach(item => {
        totalPercent += item.percent
    })
    if (totalPercent + extra <= 100) {
        return true
    }
    return false
}


// fn: Lấy thông tin cá nhân
const getInfoUser = async (req, res, next) => {
    // get token -> giải mã -> account id -> user info -> send client
    try {
        const user = req.user
        if (!res.locals.isAuth) return res.status(403).json({ message: "token không hợp lệ!" })
        // kiểm tra quyền
        const student = await StudentModel.findOne({ accountId: user._id })
        if (student) return res.status(200).json({
            message: "Lấy thông tin thành công!",
            user: student,
            role: "student"
        })

        const teacher = await TeacherModel.findOne({ accountId: user._id })
        return res.status(200).json({
            message: "Lấy thông tin thành công!",
            user: teacher,
            role: "teacher"
        })

    } catch (error) {
        return res.status(401).json({
            message: "Có lỗi xảy ra",
            error
        })

    }
}

// fn: Cập nhật thông tin cá nhân
const postInfoUser = async (req, res, next) => {
    try {
        const user = req.user
        if (!res.locals.isAuth) return res.status(403).json({ message: "token không hợp lệ!" })

        const { studentId, fullName, birthday, gender, phone } = req.body

        if (user.role === "student") {
            await StudentModel.updateOne(
                { accountId: user._id },
                { studentId, fullName, birthday, gender, phone }
            )
        }
        if (user.role === "teacher") {
            await TeacherModel.updateOne(
                { accountId: user._id },
                { fullName, birthday, gender, phone }
            )
        }

        return res.status(200).json({ message: "Cập nhật thông tin thành công" })

    } catch (error) {
        return res.status(401).json({ message: "Có lỗi xảy ra", error })

    }
}

// ============== STUDENT ================

// fn: Lấy thông tin các lớp học đã tham gia
const getMyCourse = async (req, res, next) => {
    try {
        const user = req.user
        if (!res.locals.isAuth) return res.status(401).json({ message: "token không hợp lệ!" })

        const { page = 1, limit = 10, active, sort, name, complete } = req.query
        const nSkip = (parseInt(page) - 1) * parseInt(limit)
        // lấy thông tin học sinh
        const student = await StudentModel.findOne({ accountId: user._id })

        var query = { studentId: student.studentId }
        let sortBy = {}
        if (active) query.active = active
        if (complete) query.complete = complete

        if (name) {
            let regexp = new RegExp(name, 'i')
            query.className = regexp
        }
        if (sort) {
            let field = sort.split("_")[0]
            let value = sort.split("_")[1]
            sortBy = [[field, value]]
        }

        console.log(query);
        // Kiểm tra account có studentID ? res : err
        if (!student.studentId) return res.status(401).json({ message: "Tài khoản chưa liên kết StudentID !" })

        var numOfMyCourse = await MyCourseModel.countDocuments(query)
        var myCourses = await MyCourseModel.find(query).select("-__v -_id")
            .skip(nSkip)
            .limit(parseInt(limit))
            .sort(sortBy)

        return res.status(200).json({
            message: "Lấy danh sách khoá học thành công!",
            numOfMyCourse,
            myCourses
        })
    } catch (error) {
        return res.status(401).json({
            message: "Có lỗi xảy ra",
            error
        })
    }
}

// fn: lấy chi tiết lớp học
const getDetailCourse = async (req, res, next) => {
    try {
        const user = req.user
        if (!res.locals.isAuth) return res.status(401).json({ message: "token không hợp lệ!" })

        const { code } = req.params

        // lấy thông tin chi tiết của lớp
        const result = await ClassModel.findOne({ code }).select('-_id -__v')

        // lấy cấu trúc điểm của lớp đó
        const gradeStruct = await GradeStructModel.find({ classCode: code })

        return res.status(200).json({ message: "Thành công!", result, gradeStruct })

    } catch (error) {
        console.log(error);
        return res.status(401).json({
            message: "Lỗi!", error
        })
    }
}

// fn: Cập nhật studenID
const postStudentID = async (req, res, next) => {
    try {
        const user = req.user
        const { studentId } = req.body
        if (!res.locals.isAuth) return res.status(403).json({ message: "token không hợp lệ!" })

        // Kiểm tra có tài khoản nào đã liên kết với studentID? return : add studentId cho user
        const student = await StudentModel.findOne({ studentId })
        if (student) return res.status(406).json({ message: "StudentId đã được sử dụng!" })

        await StudentModel.updateOne(
            { accountId: user._id },
            { studentId }
        )
        // kiểm ra mycourse
        const myCourse = await MyCourseModel.findOne({ studentId })
        if (!myCourse) {
            await MyCourseModel.create({ studentId })
        }

        return res.status(200).json({
            message: "POST StudentID Thành công!"
        })
    } catch (error) {
        console.log(error);
        return res.status(401).json({
            message: "Có lỗi xảy ra!",
            error
        })
    }
}

// fn: tham gia lớp học bằng code
const postJoinClass = async (req, res, next) => {
    try {
        const { code } = req.body
        const user = req.user
        // lấy student
        const student = await StudentModel.findOne({ accountId: user._id })
        // kiểm tra có studentId không?
        if (!student.studentId) return res.status(401).json({ message: "Tài khoản chưa có studentId!" })

        // lấy class
        const classs = await ClassModel.findOne({ code })
        if (!classs) return res.status(403).json({ message: "Mã lớp không tồn tại" })

        // kiểm tra đã tham gia lớp đó hay chưa?
        const joined = await MyCourseModel.findOne({ studentId: student.studentId, classCode: code })
        if (joined) return res.status(200).json({ message: "Đã tham gia lớp này rồi!" })

        // thêm student vào lớp
        let studentsTemp = {
            studentId: student.studentId,
            fullName: student.fullName
        }
        await ClassModel.updateOne(
            { code },
            { $push: { students: studentsTemp } }
        )

        // thêm lớp vào mycourse
        const myCourse = await MyCourseModel.create({
            studentId: student.studentId,
            classCode: code,
            className: classs.name,
            teacher: classs.teacher
        })
        console.log('myCourse:', myCourse);
        return res.status(200).json({ message: "Tham gia thành công!" })

    } catch (error) {
        console.log(error);
        return res.status(401).json({
            message: "Có lỗi xảy ra!",
            error
        })
    }
}


// fn: xem điểm
const getMyGrade = async (req, res, next) => {
    try {
        const user = req.user
        if (!res.locals.isAuth) return res.status(403).json({ message: "token không hợp lệ!" })

        const student = await StudentModel.findOne({ accountId: user._id })
        if (!student.studentId) return res.status(401).json({ message: "Tài khoản chưa có studentId!" })
        const studentId = student.studentId

        const { classCode } = req.query
        let query = { studentId }
        if (classCode) query.classCode = classCode
        // lấy bảng điểm
        const result = await GradeModel.find(query).select("-__v -_id")
        // lấy cấu trúc điểm kèm danh sách bài tập
        const gradeStructs = await GradeStructModel.find({ classCode }).select("-__v -_id")
        var structs = [...gradeStructs]
        for (let i = 0; i < structs.length; i++) {
            // lấy ds bài tập của từng cấu trúc điểm
            var assignments = await AssignmentModel.find({ structCode: structs[i].code }).select("-__v -_id")
            structs[i] = {
                code: structs[i].code,
                classCode: structs[i].classCode,
                structName: structs[i].structName,
                percent: structs[i].percent,
                total: structs[i].total,
                assignments
            }
        }

        return res.status(200).json({ message: "Thành công", result, structs })

    } catch (error) {
        console.log(error);
        return res.status(401).json({
            message: "Lỗi",
            error
        })
    }
}



// ================= TEACHER =================
// fn: tạo class
const postClass = async (req, res, next) => {
    try {
        const user = req.user
        if (!res.locals.isAuth || user.role !== "teacher") return res.status(401).json({ message: "Không được phép!" })
        const { name } = req.body
        const file = req.file
        // đọc file lấy danh sách hs
        var students = []
        if (file) {
            const data = await readFileExcel(file.path)
            for (let i = 1; i < data.length; i++) {
                let temp = {
                    studentId: data[i][1],
                    fullName: data[i][2],
                    joined: false,
                }
                students.push(temp)
            }
        }

        const teacher = await TeacherModel.findOne({ accountId: user._id })
        // tạo CODE
        var code = helper.generateVerifyCode(constants.NUMBER_VERIFY_CODE)

        await ClassModel.create({
            code,
            accountId: teacher.accountId,
            teacher: teacher.fullName,
            phone: teacher.phone,
            name,
            students: students
        })
        return res.status(200).json({ message: "Tạo lớp thành công!", code })

    } catch (error) {
        console.log(error);
        return res.status(401).json({ message: "Lỗi", error })

    }
}



// fn: lấy danh sách lớp đang có
const getMyClass = async (req, res, next) => {
    try {
        const user = req.user
        if (!res.locals.isAuth || user.role !== "teacher") return res.status(401).json({ message: "Không được phép!" })

        const { active, page = 1, limit = 10, sort, name } = req.query
        const nSkip = (parseInt(page) - 1) * parseInt(limit)
        let query = { accountId: user._id }
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
        console.log(query);
        const numOfClass = await ClassModel.countDocuments(query)
        const result = await ClassModel.find(query).select("-_id -__v -students")
            .skip(nSkip)
            .limit(parseInt(limit))
            .sort(sortBy)
        return res.status(200).json({ message: "Thành công!", numOfClass, result })

    } catch (error) {
        console.log(error);
        return res.status(401).json({ message: "Lỗi", error })
    }
}

// fn: lấy chi tiết lớp học
const getDetailClass = async (req, res, next) => {
    try {
        const user = req.user
        if (!res.locals.isAuth || user.role !== "teacher") return res.status(401).json({ message: "Không được phép!" })

        const { code } = req.params
        // lấy thông tin chi tiết của lớp
        var result = await ClassModel.findOne({ code }).select("-_id -__v")

        // lấy cấu trúc điểm của lớp đó
        const gradeStruct = await GradeStructModel.find({ classCode: code }).select("-_id -__v")

        return res.status(200).json({ message: "Thành công!", result, gradeStruct })
    } catch (error) {
        console.log(error);
        return res.status(401).json({ message: "Lỗi", error })
    }
}

// fn: cập nhật thông tin lớp
const postUpdateClass = async (req, res, next) => {
    try {

        const user = req.user
        if (!res.locals.isAuth || user.role !== "teacher") return res.status(401).json({ message: "Không được phép!" })

        // chỉ cho cập nhật tên lớp, số đt, trạng thái lớp (lock/unlock)
        const { code, name, phone, active } = req.body
        const file = req.file

        if (file) {
            const data = await readFileExcel(file.path)
            var students = []
            for (let i = 1; i < data.length; i++) {
                let temp = {
                    studentId: data[i][1],
                    fullName: data[i][2],
                    joined: false,
                }
                students.push(temp)
            }
            await ClassModel.updateOne({ code },
                { name, phone, active, students }
            )
            return res.status(200).json({ message: "Cập nhật thành công!" })

        }

        await ClassModel.updateOne({ code },
            { name, phone, active }
        )

        return res.status(200).json({ message: "Cập nhật thành công!" })
    } catch (error) {
        console.log(error);
        return res.status(401).json({ message: "Lỗi", error })
    }
}

// fn: thêm cấu trúc điểm
const postGradeStruct = async (req, res, next) => {
    try {
        const user = req.user
        if (!res.locals.isAuth || user.role !== "teacher") return res.status(401).json({ message: "Không được phép!" })

        const { classCode, structName, percent, total } = req.body
        var isPermit = await checkTotalPercent(classCode, parseInt(percent))
        if (!isPermit) {
            return res.status(401).json({ message: "Tổng phần trăm vượt quá 100%" })
        }
        const code = helper.generateVerifyCode(constants.NUMBER_VERIFY_CODE)
        await GradeStructModel.create({
            code,
            classCode,
            structName,
            percent,
            total
        })
        return res.status(200).json({ message: "Thêm thành công!" })
    } catch (error) {
        console.log(error);
        return res.status(401).json({ message: "Lỗi", error })
    }
}


// fn: xoá 1 cấu trúc điểm
const deleteGradeStruct = async (req, res, next) => {
    try {

        const { code } = req.body

        await GradeStructModel.deleteOne({ code })
        return res.status(200).json({ message: "xoá thành công!" })
    } catch (error) {
        console.log(error);
        return res.status(401).json({ message: "Lỗi", error })
    }
}

// fn: lấy cấu trúc điểm
const getGradeStruct = async (req, res, next) => {
    try {
        const user = req.user
        if (!res.locals.isAuth || user.role !== "teacher") return res.status(401).json({ message: "Không được phép!" })

        const { classCode, page = 1, limit = 10 } = req.query
        var nSkip = (parseInt(page) - 1) * parseInt(limit)
        const result = await GradeStructModel.find({ classCode }).select("-_id -__v")
            .skip(nSkip)
            .limit(parseInt(limit))
        return res.status(200).json({
            message: "Thành công",
            result
        })
    } catch (error) {
        console.log(error);
        return res.status(401).json({ message: "Lỗi", error })
    }
}

// fn: cập nhật cấu trúc điểm
const postUpdateGradeStruct = async (req, res, next) => {
    try {
        const { code, structName, percent, total } = req.body
        const user = req.user
        if (!res.locals.isAuth || user.role !== "teacher") return res.status(401).json({ message: "Không được phép!" })

        // kiểm tra có vượt quá 100% ?
        const gradeStructOld = await GradeStructModel.findOne({ code })

        await GradeStructModel.updateOne({ code },
            { structName, percent, total }
        )
        const isPermit = await checkTotalPercent(gradeStructOld.classCode, 0)
        if (!isPermit) {
            await GradeStructModel.updateOne({ code },
                {
                    structName: gradeStructOld.structName,
                    percent: gradeStructOld.percent,
                    total: gradeStructOld.total
                }
            )
            return res.status(401).json({ message: "Tổng phần trăm vượt quá 100%" })
        }
        return res.status(200).json({ message: "Cập nhật thành công" })
    } catch (error) {
        console.log(error);
        return res.status(401).json({ message: "Lỗi", error })
    }
}




// fn: lấy danh sách bài tập của 1 lớp
const getAssignments = async (req, res, next) => {
    try {
        const { classCode } = req.query
        let query = {}
        if (classCode) query.classCode = classCode
        const result = await AssignmentModel.find(query).select("-__v -_id")
        return res.status(200).json({ message: "Thành công!", result })
    } catch (error) {
        console.log(error);
        return res.status(401).json({ message: "Lỗi", error })
    }
}

// fn: lấy chi tiết bài tập của 1 lớp
const getAssignment = async (req, res, next) => {
    try {
        const { code } = req.query

        const result = await AssignmentModel.findOne({ code }).select("-__v -_id")
        return res.status(200).json({ message: "Thành công!", result })
    } catch (error) {
        console.log(error);
        return res.status(401).json({ message: "Lỗi", error })
    }
}

// fn: thêm bài tập
const postAssignment = async (req, res, next) => {
    try {
        const user = req.user
        if (!res.locals.isAuth || user.role !== "teacher") return res.status(401).json({ message: "Không được phép!" })

        const { classCode, name, structCode, pending, expired } = req.body
        const file = req.file
        // lấy đuôi file
        let arrFilename = file.originalname.split(".")
        let format = arrFilename[arrFilename.length - 1]
        let p = new Date(pending)
        let e = new Date(expired)
        let n = Date.now()
        if (e <= p || e <= n) {
            return res.status(403).json({ message: "Thời gian không hợp lệ!" })
        }

        // lấy thông tin cần thiết
        const teacher = await TeacherModel.findOne({ accountId: user._id })
        const code = helper.generateVerifyCode(constants.NUMBER_VERIFY_CODE)
        const fileUrl = await uploadAssignmentFile(file.path, code, format)
        // tạo assignment
        await AssignmentModel.create({
            owner: teacher._id,
            attachFile: fileUrl,
            code,
            classCode,
            name,
            structCode,
            pending,
            expired
        })
        return res.status(200).json({ message: "Thành công!", fileUrl })

    } catch (error) {
        console.log(error);
        return res.status(401).json({ message: "Lỗi", error })
    }
}

// fn: sửa thông tin bài tập
const postUpdateAssignment = async (req, res, next) => {
    try {
        const user = req.user
        if (!res.locals.isAuth || user.role !== "teacher") return res.status(401).json({ message: "Không được phép!" })

        const { code, name, structCode, pending, expired, status } = req.body
        const file = req.file
        let p = new Date(pending)
        let e = new Date(expired)
        let n = Date.now()
        if (e <= p || e <= n) {
            return res.status(403).json({ message: "Thời gian không hợp lệ!" })
        }
        if (file) {
            // lấy đuôi file
            let arrFilename = file.originalname.split(".")
            let format = arrFilename[arrFilename.length - 1]

            const fileUrl = await uploadAssignmentFile(file.path, code, format)
            //  update bài tập
            await AssignmentModel.updateOne({ code },
                { name, attachFile: fileUrl, structCode, pending, expired, status }
            )
            return res.status(200).json({ message: "Cập nhật thành công!" })
        }

        //  update bài tập
        await AssignmentModel.updateOne({ code },
            { name, structCode, pending, expired, status }
        )
        return res.status(200).json({ message: "Cập nhật thành công!" })

    } catch (error) {
        console.log(error);
        return res.status(401).json({ message: "Lỗi", error })
    }
}

// fn: thêm điểm cho bài tập
const postAssignmentGrade = async (req, res, next) => {
    try {
        const user = req.user
        if (!res.locals.isAuth || user.role !== "teacher") return res.status(401).json({ message: "Không được phép!" })
        // code : assignment code
        const { code, classCode } = req.body
        const file = req.file
        // upload file điểm lên cloundy
        // const urlFile = uploadGradeFile(file.path, code)

        // đọc file => thêm điểm cho hs (cột 1 là stt,cột 2 studentId, cột 3 fullName, cột 4 điểm )
        const data = await readFileExcel(file.path)
        for (let i = 1; i < data.length; i++) {
            let studentId = data[i][1]
            let fullName = data[i][2]
            let grade = await GradeModel.findOne({ classCode: classCode, studentId: studentId })
            if (!grade) {
                await GradeModel.create({ classCode: classCode, studentId: studentId, fullName: fullName })
            }
            // lấy info bài tập
            const assignment = await AssignmentModel.findOne({ code })
            // lấy info cấu trúc điểm
            const struct = await GradeStructModel.findOne({ code: assignment.structCode })

            let scoreRecord = {
                assignmentCode: code,
                structCode: struct.code,
                score: data[i][3]
            }
            var isAdded = await GradeModel.findOne({ classCode: classCode, studentId: studentId, "scoreRecord.assignmentCode": code })
            if (isAdded) {
                await GradeModel.updateOne(
                    { classCode: classCode, studentId: studentId, "scoreRecord.assignmentCode": code },
                    { $set: { "scoreRecord.$.score": scoreRecord } }
                )
            }
            await GradeModel.updateOne(
                { classCode: classCode, studentId: studentId },
                { $push: { scoreRecord: scoreRecord } }
            )
        }
        // sửa trạng thái bài tập
        await AssignmentModel.updateOne({ code }, { status: "finalized" })
        return res.status(200).json({ message: "Thành công!" })
    } catch (error) {
        console.log(error);
        return res.status(401).json({ message: "Lỗi", error })
    }
}


// fn: lấy danh sách điểm của 1 lớp
const getGrades = async (req, res, next) => {
    try {
        const { classCode, studentId, page = 1, limit = 10 } = req.query
        const nSkip = (parseInt(page) - 1) * parseInt(limit)
        let query = {}
        if (classCode) query.classCode = classCode
        if (studentId) query.studentId = studentId
        console.log(query);
        // lấy điểm
        const result = await GradeModel.find(query).select("-__v -_id")
            .limit(parseInt(limit))
            .skip(nSkip)

        // lấy cấu trúc điểm kèm danh sách bài tập của cấu trúc đó
        var gradeStruct = await GradeStructModel.find({ classCode }).select("-__v -_id")
        var structs = [...gradeStruct]
        for (let i = 0; i < structs.length; i++) {
            var assignments = await AssignmentModel.find({ structCode: structs[i].code }).select("-__v -_id")
            structs[i] = {
                code: structs[i].code,
                classCode: structs[i].classCode,
                structName: structs[i].structName,
                percent: structs[i].percent,
                total: structs[i].total,
                assignments: assignments
            }
        }

        return res.status(200).json({ message: "Thành công!", result, structs })

    } catch (error) {
        console.log(error);
        return res.status(401).json({ message: "Lỗi", error })
    }
}

// fn: đánh dấu lớp hoàn thành => tính điểm tb cho học sinh
const postFinalClass = async (req, res, next) => {
    try {
        const { classCode } = req.body

        // đánh dấu hoàn thiện khoá học
        await ClassModel.updateOne({ code: classCode }, { complete: true })

        // tính điểm
        const gradesOfStudents = await GradeModel.find({ classCode })
        const structs = await GradeStructModel.find({ classCode })

        // lặp (lọc điểm cùng loại struct -> tính tổng * % của struct đó -> ra %gpa của 1 struct ) 
        // -> tính tổng các %gpa lại 
        gradesOfStudents.forEach(async gradeOf1Student => {
            var scores = gradeOf1Student.scoreRecord // arr điểm của 1 học sinh
            var gpa = 0
            structs.forEach(struct => {
                var sc = scores.filter((score) => {
                    return score.structCode === struct.code
                }) // arr điểm của 1 loại struct
                let tong = 0
                sc.forEach(item => {
                    tong += item.score
                })
                if (tong > struct.total) tong = struct.total
                let result = tong * struct.percent / 100
                gpa += result
            });
            //có gpa => update bảng điểm
            await GradeModel.updateOne({ studentId: gradeOf1Student.studentId },
                { gpa: gpa.toFixed(2) }
            )
            // console.log("calculate GPA for: ", gradeOf1Student.studentId);
        })
        return res.status(200).json({ message: "thành công" })

    } catch (error) {
        console.log(error);
        return res.status(401).json({ message: "Lỗi", error })
    }
}

module.exports = {
    getInfoUser,
    postInfoUser,

    // student
    getMyCourse,
    getDetailCourse,
    postStudentID,
    postJoinClass,
    getMyGrade,

    // teacher
    postClass,
    postUpdateClass,
    getGradeStruct,
    postUpdateGradeStruct,
    postGradeStruct,
    getMyClass,
    getDetailClass,
    getAssignments,
    getAssignment,
    postAssignment,
    postUpdateAssignment,
    postAssignmentGrade,
    getGrades,
    postFinalClass,
    deleteGradeStruct,
}