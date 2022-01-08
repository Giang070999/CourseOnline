const mongoose = require("mongoose");
const Schema = mongoose.Schema


const myCourseSchema = new Schema({
    studentId: {
        type: String,
        required: true
    },
    // classId: {
    //     type: Schema.Types.ObjectId,
    //     ref: "class",
    //     required: true
    // },
    classCode: {
        type: String,
        required: true
    },
    className: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        default: true,
        required: true
    },
    complete: {
        type: Boolean,
        default: false,
        required: true
    },
    teacher: {
        type: String,
        required: true
    }
})


const MyCourseModel = mongoose.model('myCourse', myCourseSchema, 'myCourses');
module.exports = MyCourseModel