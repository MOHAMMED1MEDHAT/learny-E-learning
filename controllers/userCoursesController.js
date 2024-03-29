//TODO: DELETE THIS FILE
const errorHandlerMw = require("../middlewares/errorHandlerMw");
const UserCourse = require("../models/userCoursesModel");
const Course = require("../models/coursesModel");
// const APIfeatures = require("./../util/queryHandler");

const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("config");
const jwtSCRT = config.get("env_var.jwtScreteKey");

//get user courses by user id
exports.getUserCoursesByUserId = async (req, res) => {
    try {
        const { userId } = jwt.verify(req.header("x-auth-token"), jwtSCRT);

        // console.log(userId);

        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({ message: "Invalid id" });
        }

        const userCourse = await UserCourse.findOne({
            userId,
        }).exec();

        // console.log(userCourse);

        if (!userCourse) {
            return res.status(204).json({ message: "user Course not found" });
        }

        res.status(200).json({
            message: "userCourse found",
            data: { userCourse },
        });
    } catch (err) {
        errorHandlerMw(err, res);
    }
};

exports.getUserCoursesByCourseId = async (req, res) => {
    try {
        const courseId = req.params.id;

        const { userId } = jwt.verify(req.header("x-auth-token"), jwtSCRT);

        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({ message: "Invalid id" });
        }

        const userCourse = await UserCourse.findOne({
            userId,
        }).exec();

        if (!userCourse) {
            return res.status(204).json({ message: "user Course not found" });
        }

        const course = userCourse.courses.filter(
            (cour) => cour.courseId == courseId
        );

        res.status(200).json({
            message: "userCourse found",
            data: { userCourse, course },
        });
    } catch (err) {
        errorHandlerMw(err, res);
    }
};

//update time course watched by course id
exports.updateWatchedTimeByCourseId = async (req, res) => {
    try {
        const { userId } = jwt.verify(req.header("x-auth-token"), jwtSCRT);

        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid id" });
        }

        const generalCourse = await Course.findById(req.params.id);

        const { time } = req.body;

        const { courses } = await UserCourse.findOne({ userId }).exec();

        // for (const course of courses) {
        //     if (course.courseId == req.params.id) {
        //         course.watched = time;
        //         if (course.watched == generalCourse.totalWatchTime) {
        //             course.passed = true;
        //         }
        //     }
        // }

        courses.map((course) => {
            if (course.courseId == req.params.id) {
                course.watched = time;
                if (course.watched == generalCourse.totalWatchTime) {
                    course.passed = true;
                }
            }
        });

        const userCourse = await UserCourse.findOneAndUpdate(
            userId,
            {
                courses,
            },
            { returnOriginal: false }
        ).exec();

        // console.log(userCourse);

        if (!userCourse) {
            return res.status(400).json({ message: "Bad Request" });
        }

        res.status(200).json({
            message: "user course watched time was updated successfully",
            data: { userCourse },
        });
    } catch (err) {
        errorHandlerMw(err, res);
    }
};

// update course status by course id
exports.updateCourseStatusByCourseId = async (req, res) => {
    try {
        const { userId } = jwt.verify(req.header("x-auth-token"), jwtSCRT);

        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid id" });
        }

        const { passed } = req.body;

        const { courses } = await UserCourse.findOne({ userId }).exec();
        for (const course of courses) {
            if (course.courseId == req.params.id) {
                course.passed = passed;
            }
        }

        const userCourse = await UserCourse.findOneAndUpdate(
            userId,
            {
                courses,
            },
            { returnOriginal: false }
        ).exec();

        if (!userCourse) {
            return res.status(400).json({ message: "Bad Request" });
        }

        res.status(200).json({
            message: "user course  status was updated successfully",
            data: { userCourse },
        });
    } catch (err) {
        errorHandlerMw(err, res);
    }
};
