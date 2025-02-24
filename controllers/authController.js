const Users = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync'); 
const {promisify} = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const appError = require('./../utils/appError');
const sendEmail = require('./../utils/email');
const { json } = require('express');

const signToken = id =>{
    return jwt.sign({id: id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXP_TIME
    });
}


const createSendToken = (user, statusCode, res) =>{
    const token = signToken(user._id)  
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXP_TIME * 24*60*60*1000), // converting it to millisecond
        httpOnly: true
    }
    if(process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    res.cookie('jwt', token, cookieOptions)

    user.password = undefined; //removes the pwd from response

    res.status(statusCode).json({
        status: 'success',
        token,
        data:{
            user
        }
    });
}
exports.signup = catchAsync(async(req, res, next) => {
    const newUser = await Users.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        passwordChangedAt: req.body.passwordChangedAt,
        role:req.body.role
    });
    createSendToken(newUser, 201, res);
    
});
exports.login = catchAsync(async(req, res, next) =>{
    const {email, password} = req.body;
    //Check if email & password is provided
    if(!email || !password){
        return next(new appError("Please provide your email and password to login", 400));
    }
    //check if user exists and password is correct
    const user = await Users.findOne({email}).select('+password');
 

    if(!user || !await user.correctPassword(password, user.password)){
        return next(new appError('Incorrect email or Password', 401));
    }

    //('ani12345') = "$2a$12$9vh3.HHenXGGelbGcJqkzehwW148n2vjs5ayVFL0enCJF9SLEThFC";
    createSendToken(user, 200, res);

});

exports.protect = catchAsync(async(req,res,next)=>{
    //1. Get token and check its presence
   
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }else if(req.cookies.jwt){
        token = req.cookies.jwt;
    }
   // console.log(token);
    if(!token){
        return next(new appError('You are not logged in! Please login to continue', 401))
    }
    //2. Verification of token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
    //console.log(decoded);   

    //3. If User exists
    const currentUser = await Users.findById(decoded.id)
    if(!currentUser){
        return next(new appError('The user no longer exist', 401))
    }
    //4. Check if user changed after token was issued
    if(currentUser.afterChangePassword(decoded.iat)){
        return next(new appError('The password has been reset. Please login again', 401));
    };
    //Grant access to protected routes
    req.user = currentUser;
    next();
})
//Only for rendered pages, no errors
exports.isLoggedIN = catchAsync(async(req,res,next)=>{
    //1. Verify token    
  
    if(req.cookies.jwt){
        
    
    //2. Verification of token

        const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET)   

        //3. If User exists
        const currentUser = await Users.findById(decoded.id)
        if(!currentUser){
            return next()
        }
        //4. Check if user changed after token was issued
        if(currentUser.afterChangePassword(decoded.iat)){
            return next();
        };
        //There is a logged in user
        res.locals.user = currentUser;
        return next();
    }
    next();
});

exports.restrictTo = (...roles) => {
    return (req,res,next) => {
        if(!roles.includes(req.user.role)){
            return next(new appError('You do not have access to perform this action', 403))
        }
        next();
    }
}
exports.forgotPassword = catchAsync(async(req,res,next) =>{
    //1. Get user based on email id
    const user = await Users.findOne({email: req.body.email})
    if(!user){
        return next(new appError('There is no user with this email address', 404));
    }
    //2. Generate random token
    const resetToken = user.createPasswordResetToken();
    await user.save({validateBeforeSave: false});

    //3. Send it back to user's email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Forgot your password? Reset your password here at: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;
   
    try{
        await sendEmail({
            email: user.email,
            subject: 'Your password reset link is valid only for 10 minutes',
            message
         });
       
    
        res.status(200).json({
            status:'success',
            message:'Token has been sent to email'
         })
    }catch(err){
        user.passwordResetToken = undefined;
        user.passwordResetExpiry = undefined;

        await user.save({validateBeforeSave:false});

        return next(new appError('There was an error sending the email. Please try again after sometime', 500));
    }
     

});
exports.resetPassword = catchAsync(async(req,res,next) => {
    // 1. Get user based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await Users.findOne({passwordResetToken: hashedToken, passwordResetExpiry:{$gt:Date.now()}})

    // 2. If token has not expired, and there is user, set the new password
    if(!user){
        return next(new appError('Token is invalid or has expired', 400));
    }
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;

    await user.save();

    // 3. Update the field: ChangedPasswordAt for the user
    

    // 4. Log the user in, send JWT 
    createSendToken(user, 200, res);

});

exports.updatePassword = catchAsync(async(req,res,next) => {
    //1. Get user
    const user = await Users.findById(req.user.id).select('+password');

    //2.Check if entered password is correct
    if(!(await user.correctPassword(req.body.currentPassword, user.password))){
        return next(new appError('Your current password is wrong', 401));
    }

    //3.If pwd is correct, then update the password
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;

    await user.save();
    //4. Login User & send JWT
    createSendToken(user, 200, res);

});