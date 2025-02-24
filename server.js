const app = require('./app');
const dotenv = require('dotenv');
const mongoose = require('mongoose');


dotenv.config({path:'./env-vars.env'});

process.on('uncaughtException', err => {
    console.log('Uncaught exceptions, so shutting down');
    console.log(err);    
    process.exit(1); //Unhandled rejections, so shutting down
    
})

const port = 3000;
const server = app.listen(port, ()=> {
    console.log("Port is running on....");
} )
const DB = process.env.DATABASE.replace('<db_password>', process.env.DATABASE_PASSWORD);

mongoose
.connect(DB,{
//.connect(process.env.DATABASE_LOCAL,{
    useNewUrlParser: true,
    useCreateIndex:true,
    useFindAndModify: false
}).then(con=>{
    //console.log(con.connection);
    console.log('DB SETUP IS OVER');
});

process.on('unhandledRejection', err =>{
    console.log(err.name, err.message)
    server.close(()=> {
        process.exit(1); //Unhandled rejections, so shutting down
    })     
});



