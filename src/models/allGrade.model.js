const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const allGradeSchema = new Schema({
    classCode: {
        type: String,
        required: true,
        trim: true,
    },
    classId: {
        type: Schema.Types.ObjectId,
        ref: "class",
        required: true,
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
    // scoreRecord: {
    //     type: Array,
    //     assignment: {
    //         type: Schema.Types.ObjectId,
    //         ref: "asignment",
    //         required: true
    //     },
    //     struct: {
    //         type: Schema.Types.ObjectId,
    //         ref: "gradeStruct",
    //         required: true
    //     },
    //     score: {
    //         type: Number,
    //         required: true,
    //     }
    // },
    gpa: {
        type: Number,
        default: null,
    }

})

const AllGradeModel = mongoose.model('AllGrade', allGradeSchema, 'AllGrades')
module.exports = AllGradeModel
