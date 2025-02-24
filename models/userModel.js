const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
//const validator = require('validator');


const userSchema = new mongoose.Schema({
    name:{
        required: [true, 'Please tell us your name'],
        type: String
    },
    email:{
        required:[true, 'Please provide your email Id'],
        type: String,
        unique: true,
        lowercase: true,
        //validate:[validator.isEmail, 'Please provide a valid email id']
    },
    photo:String,
    role:{
        type:String,
        enum:['admin', 'user','tour-guide','lead-tour-guide'],
        default:'user'
    },
    password:{
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        maxlength: 20,
        select:false
    },
    confirmPassword:{
        type: String,
        required: [true, 'Please confirm your password'],
        validate:{
            validator: function(el){
                return el === this.password;
            }
        }
    },
    passwordChangedAt: {
        type: Date
    },
    passwordResetToken: String,
    passwordResetExpiry: String,
    active:{
        type: Boolean,
        default: true,
        select:false
    }
});

userSchema.pre('save', function(next){
    if(!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
})
userSchema.pre(/^find/,function(next){
    this.find({active: {$ne: false}});
    next();
})

userSchema.pre('save', async function(next){

    // this function only runs if the pwd is modified
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);

    this.confirmPassword = undefined;

    next();
})
userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    return await  bcrypt.compare(candidatePassword, userPassword);
}
userSchema.methods.afterChangePassword = function(JWTTimestamp){
    if(this.passwordChangedAt){
        const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10); 
        console.log(changedTimeStamp, JWTTimestamp);
        return JWTTimestamp < changedTimeStamp; // 1.20(password/token created) < 1.30(password changed) which is true(means password has changed)
    }

    //False means password not changed
    return false;
}
userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpiry = Date.now() + 10 * 60 * 1000;

    return resetToken;
}

const Users = mongoose.model('users', userSchema);

module.exports = Users;