const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const asignmentSchema = new Schema({
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'teacher',
        required: true
    },
    code: {
        type: String,
        unique: true,
        trim: true,
        required: true,
    },
    classCode: {
        type: String,
        required: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    attachFile: {
        type: String,
        required: true
    },
    structCode: {
        type: String,
        required: true,
        trim: true
    },
    // ngày cho phép xem bt
    pending: {
        type: Date,
    },
    expired: {
        type: Date,
    },
    status: {
        type: String,
        enum: ['canceled', 'available', 'finalized', 'hide'],
        default: 'available',
    }

})

const AsignmentModel = mongoose.model('asignment', asignmentSchema, 'asignments');

module.exports = AsignmentModel;