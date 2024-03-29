const mongoose = require("mongoose");

const coursesSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "course",
    },
});

const subscripersSchema = new mongoose.Schema({
    subscriperId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
});

const trackSchema = new mongoose.Schema(
    {
        categoryName: {
            type: String,
            trim: true,
            unique: true,
            required: [true, "A track must have a categoryName"],
        },
        roadmap: [String],
        subscriptionLevel: {
            type: String,
            trim: true,
            default: "FREE",
            required: [true, "A track must have a subscriptionLevel"],
        },
        imageUrl: {
            type: String,
            trim: true,
            default: "ImageUrl",
            required: [true, "A track must have a imageUrl"],
        },
        courses: [coursesSchema],
        testId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "test",
            required: [true, "A track must have a test"],
        },
        subscripers: [subscripersSchema],
        certificateLink: {
            type: String,
            trem: true,
            required: [true, "A Track must have a certificateLink"],
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

trackSchema.virtual("id").get(function () {
    return this._id.toHexString();
});

module.exports = mongoose.model("track", trackSchema);

/*TODO:
1- add course link to the Roadmap to make the user go to course if (clicked)
2- think about population issues
*/
