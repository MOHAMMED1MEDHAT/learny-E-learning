const errorHandlerMw = require("./../middlewares/errorHandlerMw");
const User = require("../models/userModel");
const {
    requestPasswordReset,
    resetPassword,
} = require("../services/authService");

const bcrypt = require("bcrypt");

exports.signUpController = async (req, res) => {
    try {
        const { name, email, password, phone, imageUrl, gender, address } =
            req.body;

        const used = await User.findOne({ email: req.body.email }).exec();
        if (used) {
            return res.status(409).json({ message: "user already registered" });
        }

        const salt = await bcrypt.genSalt(process.env.BCRYPT_SALT * 1);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
            imageUrl,
            gender,
            address,
        });

        const token = user.getAuthToken(user._id, user.isAdmin);

        res.cookie("x-auth-token", token, { httpOnly: true });

        res.status(200).json({
            message: "user was added successfully",
            data: { user, token },
        });
    } catch (err) {
        errorHandlerMw(err, res);
    }
};

exports.resetPasswordRequestController = async (req, res, next) => {
    const requestPasswordResetService = await requestPasswordReset(
        req.body.email
    );
    return res.json(requestPasswordResetService);
};

exports.resetPasswordController = async (req, res, next) => {
    const resetPasswordService = await resetPassword(
        req.body.userId,
        req.body.token,
        req.body.password
    );
    return res.json({ status: resetPasswordService });
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).exec();

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res
                .status(401)
                .json({ message: "Incorrect email or password" });
        }

        //check if the subscription is expired
        const expired = user.IsSubsriptionExpired();
        if (expired) {
            await User.findByIdAndUpdate(user._id, {
                subscription: "FREE",
            });
        }

        const token = user.getAuthToken(user._id, user.isAdmin);
        res.cookie("x-auth-token", token, {
            httpOnly: false,
            sameSite: "None",
            secure: true,
        });
        res.status(200).json({
            message: "user signed in successfully",
            token: token,
        });
    } catch (err) {
        errorHandlerMw(err, res);
        // console.log("err", err);
    }
};

exports.logout = async (req, res) => {
    try {
        res.cookie("x-auth-token", "", { httpOnly: true });
        res.status(200).json({ message: "logged out successfully..." });
        //test---------------
        // console.log(req.body.type.toUpperCase());
        //--------------------------
    } catch (err) {
        errorHandlerMw(err, res);
    }
};
