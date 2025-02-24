class appError extends Error{
    constructor(message, statusCode){
        super(message);
        //console.log('entered appError block');
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = appError;