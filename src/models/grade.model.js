const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const gradeSchema = new Schema({
    classCode: {
        type: String,
        required: true,
        trim: true,
    },
    studentId: {
        type: String,
        required: true,
        trim: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    scoreRecord: {
        type: Array,
        assignmentCode: {
            type: String,
            trim: true,
            required: true
        },
        structCode: {
            type: String,
            trim: true,
            required: true
        },
        score: {
            type: Number,
            required: true,
        }
    },
    mark: {
        type: Array,
        grade: {
            type: String,
            default: null
        },
        cgpa: {
            type: Number,
            default: null
        }
    }
})

const GradeModel = mongoose.model('grade', gradeSchema, 'grades')
module.exports = GradeModel
