const mongoose = require("mongoose");
const Schema = mongoose.Schema


const gradeStructSchema = new Schema({
    code: {
        type: String,
        unique: true,
        required: true,
        trim: true,
    },
    classCode: {
        type: String,
        required: true,
        trim: true
    },
    structName: {
        type: String,
        required: true,
        trim: true
    },
    percent: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    }
})

const GradeStructModel = mongoose.model('gradeStruct', gradeStructSchema, 'gradeStructs');
module.exports = GradeStructModel