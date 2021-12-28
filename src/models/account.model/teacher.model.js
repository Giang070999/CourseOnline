const mongoose = require("mongoose");
const Schema = mongoose.Schema


const teacherSchema = new Schema({
    accountId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'account',
    },
    fullName: {
        type: String,
        trim: true,
        required: true,
    },
    birthday: {
        type: String,
        default: '1970-01-01',
    },
    // true: male
    gender: {
        type: Boolean,
        default: true,
    },
    phone: {
        type: String,
        default: null
    }

})

const TeacherModel = mongoose.model('teacher', teacherSchema, 'teachers');
module.exports = TeacherModel