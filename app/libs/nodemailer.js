'use strict';

const nodemailer = require('nodemailer');

let sendMail = (receiverDetails , cb) => {

    let transporter = nodemailer.createTransport({

        host : 'smtp.gmail.com',
        port: 465,
        auth : {
            user : "dummy4nodemailer@gmail.com",
            pass : 'dummy*444#'
        },
        tls:{
            rejectUnauthorized: false
        }
    });
    
    let receiverEmailId = receiverDetails.emailId;
    let receiverChangePassToken = receiverDetails.token;

    const mailOptions = {
        from: 'dummy4nodemailer@gmail.com', // sender address
        to: receiverEmailId, // list of receivers
        subject: 'Password Reset Url', // Subject line
        html: `<p>Reset Password Link.</p>
        <p>localhost:4200/changepassword/${receiverChangePassToken}</p>
        `// plain text body
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if(err){
            console.log("nodemailer error "+err);
            cb(err,null);
        }else{
            console.log("nodemailer success"+ info );
            cb(null,info);
        }
         
     });


}

module.exports = {
    sendMail : sendMail
}