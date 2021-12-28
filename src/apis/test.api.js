var express = require('express');
var testApi = express.Router();
const readFileExcel = require('read-excel-file/node');
const { storageFile } = require('../configs/cloudinary.config')
const { cloudinary } = require('../configs/cloudinary.config');


const uploadAssignmentFile = async (file, code, format) => {
    try {
        const result = await cloudinary.uploader.upload(file, {
            folder: `assignment`,
            resource_type: 'raw',
            format: format,
            public_id: `${code}`
        });
        const { secure_url } = result;
        return secure_url;
    } catch (error) {
        throw error;
    }
};

testApi.post('/upload', storageFile.single('file'), async (req, res, next) => {
    var file = req.file
    let arrFilename = file.originalname.split(".")
    let format = arrFilename[arrFilename.length - 1]
    console.log(format);
    const url = await uploadAssignmentFile(file.path, "15216", format)
    // readFileExcel(file.path).then(row => {
    //     console.log(row);
    // })
    // console.log("file: ", req.file);
    return res.json(url)
})

module.exports = testApi;
