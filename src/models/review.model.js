const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    student: {
        type: Schema.Types.ObjectId,
        ref: 'student',
        required: true
    },
    teacher: {
        type: Schema.Types.ObjectId,
        ref: 'teacher',
        required: true
    },
    assignment: {
        type: Schema.Types.ObjectId,
        ref: 'asignment',
        required: true
    },
    class: {
        type: Schema.Types.ObjectId,
        ref: 'class',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    comments: {
        type: Array,
        name: {
            type: String,
            required: true
        },
        content: {
            type: String,
        },
        createAt: { type: String }
    },
    complete: {
        type: Boolean,
        default: false,
        required: true
    }

});

const ReviewModel = mongoose.model('review', reviewSchema, 'reviews');

module.exports = ReviewModel;
