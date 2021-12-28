const mongoose = require("mongoose");
const Schema = mongoose.Schema


const studentSchema = new Schema({
    accountId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'account',
    },
    studentId: {
        type: String,
        default: null,
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
        required: true,
    },
    phone: {
        type: String,
        default: null
    }

})

const StudentModel = mongoose.model('student', studentSchema, 'students');
module.exports = StudentModel