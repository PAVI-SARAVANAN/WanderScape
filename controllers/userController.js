const fs = require('fs');
const Users = require('./../models/userModel');
const APIFeatures = require('./../utils/apifeatures');
const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError'); 
const factory = require('./handlerFactory');

const users = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/users.json`));

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};   
    Object.keys(obj).forEach(el => {
            if(allowedFields.includes(el)) newObj[el] = obj[el];
        })
    return newObj;
}

exports.getAllUsers = factory.getAll(Users);
exports.getMe = (req,res,next) =>{
    req.params.id = req.user.id;
    next();
}
exports.updateMe = catchAsync(async(req, res, next) => {
    //1. If user tries to update password, create error
    
    if(req.body.password || req.body.confirmPassword){
        return next(new appError('Password update is not allowed here. Please use "Forgot password" or "Update password" option'));
    }
    //2. Else, update entered user details
    const filteredReqBody = filterObj(req.body, 'name', 'email');
    const updatedUser = await Users.findByIdAndUpdate(req.user.id, filteredReqBody, {new: true, runValidators: true});
    res.status(200).json({
        status:'success',
        data:{
            user:updatedUser
        }
    });
});
exports.deleteMe = catchAsync(async(req,res, next)=>{
    await Users.findByIdAndUpdate(req.user.id, {active:false});
    res.status(204).json({
        status:'success',
        data:null
    })
})
exports.getUser = factory.getOne(Users);

exports.updateUser = factory.updateOne(Users);  //Do not update password with updateUser

exports.createUser = (req, res) => {

    const newId = users[users.length - 1].id + 1;
    const newUser = Object.assign({id: newId}, req.body);
    console.log(req.body);
    
    users.push(newUser);
   

    fs.writeFile(`${__dirname}/../dev-data/data/user.json`, JSON.stringify(users), (err) => {
        res.status(201).json({
            status: 'success',
            data: {users}
        });
    })
}
exports.deleteUser = factory.deleteOne(Users);

/*exports.deleteUser = (req, res)=> {
    const id = req.params.id * 1;
    if(id > users.length){
       return res.status(404).json({
        status: 'fail',
        Message: 'Invalid ID: ID not found'
       });
    }
}


*/