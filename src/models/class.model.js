const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const classSchema = new Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    accountId: {
        type: Schema.Types.ObjectId,
        ref: 'account',
        required: true
    },
    teacher: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    students: {
        type: Array,
        studentId: {
            type: String,
            trim: true,
            required: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true
        },
        joined: {
            type: Boolean,
            default: false,
            required: true
        }
    },
    active: {
        type: Boolean,
        default: true,
        required: true
    },
    complete: {
        type: Boolean,
        default: false
    }

});

const ClassModel = mongoose.model('class', classSchema, 'classs');

module.exports = ClassModel;
