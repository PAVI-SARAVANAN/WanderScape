const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const Tour = require('./../../models/tourModel');
const User = require('./../../models/userModel');
const Review = require('./../../models/reviewModel');


dotenv.config({path:'./env-vars.env'})

const DB = process.env.DATABASE.replace('<db_password>', process.env.DATABASE_PASSWORD);

mongoose
.connect(DB,{
    useNewUrlParser: true,
    useCreateIndex:true,
    useFindAndModify: false
}).then(con=>{
  
})

//READ JSON FILE

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));

//IMPORT DATA INTO DB
const importData = async() => {
    try{
        await Tour.create(tours);
        await Review.create(reviews);
        await User.create(users, {validateBeforeSave: false});
        console.log('Data was loaded successfully')
    }catch(err){
        console.log(err);
    }
    process.exit();
}

//DELETE ALL DATA FROM CONN

const deleteData = async() =>{
    try{
        await Tour.deleteMany();
        await Review.deleteMany();
        await User.deleteMany();
        console.log('Data was deleted successfully')
    }catch(err){
        console.log(err);
    }
    process.exit();
}

if(process.argv[2] === '--import'){
    importData();
}
else if(process.argv[2] === '--delete'){
    deleteData();
}
console.log(process.argv)