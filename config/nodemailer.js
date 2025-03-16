import nodemailer from 'nodemailer'
    const transporter=nodemailer.createTransport({
        service:'Gmail',
        auth:{
            user:'adithkp000@gmail.com',
            pass:"nknr ppkr brgy ejzp"
        }
    })
export default transporter;