const AppError = require("./../util/AppError");

const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
    const value = err.keyValue;
    const message = `Duplicate field value: ${JSON.stringify(
        value
    )}. Please use another value`;
    return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid input data: ${errors.join(". ")}`;
    return new AppError(message, 400);
};

sendErrorDev = (err, res) => {
    res.status(500).json({
        status: "fail",
        errorMassage: { err },
    });
};

sendErrorProd = (err, res) => {
    if (err.isOperational) {
        res.status(500).json({
            status: "fail",
            errorMassage: err.message,
        });
    } else {
        res.status(500).json({
            status: "fail",
            errorMassage: "Something went wrong",
        });
    }
};

module.exports = (err, res) => {
    if (process.env.NODE_ENV === "development") {
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV === "production") {
        let error = { ...err };
        if (error.name === "CastError") error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        if (error.name === "ValidationError")
            error = handleValidationErrorDB(error);
        sendErrorProd(error, res);
    }
};
