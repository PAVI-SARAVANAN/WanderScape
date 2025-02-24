const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
const cookieParser = require('cookie-parser')

const appError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRouter');
const reviewRouter = require('./routes/reviewRouter');
const viewRouter = require('./routes/viewRouter');


const app = express();
app.set('view engine', 'pug');

app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(helmet());  //Security http headers


const limiter = rateLimit({
    max:100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, Please try again after an hour!'
});

app.use('/api',limiter);

//body parser
app.use(express.json({limit: '10kb'}));
app.use(cookieParser());

//Data sanitization against NOSQL query injection
app.use(mongoSanitize());

//Data Sanitization against XSS
app.use(xss());
//Prevent parameter pollution
app.use(hpp({
    whitelist:['duration', 'price']
}));
app.use((req,res,next)=>{
    req.requestTime = new Date().toISOString();
   // console.log(req.headers);  
    next();  
})

//routes
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);


app.all('*', (req,res,next)=>{
    /*res.status(404).json({
        status: 'fail',
        message: `Unable to find ${req.originalUrl} in this server`
    }); 
    const err = new Error(`Unable to find ${req.originalUrl} in this server`);
    err.status = 'fail';
    err.statusCode = 404; */

    next(new appError(`Unable to find ${req.originalUrl} in this server`, 404));
})
app.use(globalErrorHandler);

module.exports = app;



