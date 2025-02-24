const { stack } = require("../routes/tourRouter");
const appError = require("../utils/appError");

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`
    return new appError(message, 400);
}
const handleDuplicateFieldsDB = err => {
    const value = err.keyValue;
    const message = `Duplicate field value: ${value},  Please use another value`;
    return new appError(message, 400);
}
const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid Input Data ${errors.join('. ')}`;
    return new appError(message, 400);
}
const handleJWTError = () => new appError('Invalid Token, Please login again!', 401);
const handleJWTExpiredError = () => new appError('Your session has expired, Please login again', 401);
const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack:err.stack
    });
}

const sendErrorProd = (err, res) => {
    //operational, trusted, known errors
    if(err.isOperational){
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    }
    // unexpected, unknown errors
    else{
        console.error('Error: ', err);
        res.status(500).json(
            {
                status:'error',
                message:'Something went wrong with the server'
            }
        );
    }    
}

module.exports = ((err, req, res, next)=>{
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if(process.env.NODE_ENV === 'development'){
        sendErrorDev(err, res);
        
    }else if (process.env.NODE_ENV === 'production'){
        let error = {...err}
        if(error.name === 'castError') error = handleCastErrorDB(error)
        if(error.code === 11000) error = handleDuplicateFieldsDB(error)
        if(error.name === 'ValidationError') error = handleValidationErrorDB(error);
        if(error.name === 'JsonWebTokenError') error = handleJWTError();
        if(error.name === 'TokenExpiredError') error = handleJWTExpiredError();

       sendErrorProd(error, res);
    }
   
})