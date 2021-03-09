"use strict";

const fs = require('fs');
const _ = require('lodash');
const path = require('path');

const VideoRecordingModel = require('../models/videoRecording');

exports.videoRecording = async (req, res) => {
    try {
        let currentPath = path.join(__dirname, '../../src/videoRecord/');
        const email = req.user.email;
        const { video, courseId } = req.body;
        if (_.isEmpty(video) || _.isEmpty(courseId)) {
            res.status(422).json({
                message: "Something went Wrong ❌",
                status: 422,
            });
        } else {
            const videoPath = currentPath + "-" + courseId + "-" + req.file.video;
            fs.writeFileSync(videoPath, req.file.video.data);
            const videoSave = new VideoRecordingModel({
                email,
                courseId,
                video: videoPath
            });
            await videoSave.save();
            res.status(200).json({
                status: 200,
                message: "Video Save & exam End ✌"
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Something Wrong ❌",
            status: 500,
        });
    }
};