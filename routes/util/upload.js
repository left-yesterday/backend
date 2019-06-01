const express = require('express');
const router = express.Router();
var async = require('async');
var AWS = require('aws-sdk');
var Upload = {};
require('dotenv').config();
var moment = require('moment');
// AWS credentials(AWS 변수 세팅)
AWS.config.update({
    accessKeyId: process.env.AWS_accessKeyId,
    secretAccessKey: process.env.AWS_secretAccessKey,
    region: process.env.AWS_region
});

var s3 = new AWS.S3();

// upload 함수
router.upload = function (req, callback) {
    if (req.files != '' && req.files != undefined) {
        /*S3 버킷 설정*/
        var params = {
            Bucket: 'tgkim-test',
            Key: null,
            ACL: 'public-read',
            Body: null,
            'ContentType': 'image/png'
        };

        var dir = moment();
        var locationArray = [];
        var tasks = [];
        var fileArray = Object.keys(req.files).map(i => req.files[i])
        tasks = [
            function (callback) {
                var count = 0;
                async.during(
                    function (next) {
                        return next(null, count < fileArray.length);
                    },
                    function (next) {
                        Upload.s3(params, dir, fileArray[count], function (err, result) {
                            count++;
                            locationArray.push(result.Location)
                            next(err, fileArray);
                        });
                    },
                    function (err) {
                        callback(err);
                    }
                );
            }
        ];
        async.waterfall(tasks, function (err, result) {
            if (!err) {
                callback(null, locationArray);
            } else {
                callback('err');
            }
        });

    } else {
        callback(null, '');
    }
}

Upload.s3 = function (params, dir, files, mCallback) {
    var date = new Date();
    var month = date.getMonth() + 1;
    if (month < 10) month = '0' + month
    let ran = date.getFullYear() + '' + (month) + '' + date.getDate() + '-' + Math.random().toString(36).substr(2, 5);
    params.Key = dir + '/' + ran + '-' + files.fieldName;
    params.Body = require('fs').createReadStream(files.path);
    s3.upload(params, function (err, result) {
        mCallback(err, result);
    });
};

module.exports = router;