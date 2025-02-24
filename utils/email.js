const { text } = require('express');
const nodemailer = require('nodemailer');

const sendEmail = async options => {
    //1. Create a transporter
     const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth:{
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
        //activate in gmail "less secure app" option
     })
   
    //2. Define email options
   
    const mailoptions = {
        from:'Pavi <pavipaapu264@gmail.com>',
        to:options.email,
        subject: options.subject,
        text: options.message
    }
    
    //3. Send Email with nodemailer
    try{
        const info = await transporter.sendMail(mailoptions);
        //console.log('email sent');
    }
    catch(error){
        console.error('error: ', error);
    } 

}  

module.exports = sendEmail;