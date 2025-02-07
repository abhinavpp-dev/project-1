
// const { use } = require('../routes/homeroute')


const { text } = require('body-parser');
const nodemailer=require('nodemailer');
const User=require('../models/user');
const { success, error } = require('toastr');

// nodemailer setup
const transporter=nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth:{
    user: process.env.EMAIL_USER,  
    pass: process.env.EMAIL_PASS,     
  }
});



const renderabout=(req,res)=>{
  res.render('users/about')
}

const rendermenu=(req,res)=>{
  res.render('users/shop',{success:null,error:null});
}
const rendercart=(req,res)=>{
  res.render('users/cart');
}
// const rendercheckout=(req,res)=>{
//   res.render('users/checkout');
// }
// const rendersingleproduct=(req,res)=>{
//   res.render('users/single-product');
// }
const render404=(req,res)=>{
  res.render('users/404');
}


const rendercontact=(req,res)=>{
  res.render('users/contact')
}

// const nodemailer = require('nodemailer');
const contact = async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
console.log(name,email,message,subject)
  try {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOption = {
      from: `"${name}" <${email}>`,
      to: process.env.EMAIL_USER,
      subject: `New Contact Form Submission - ${subject}`,
      text: `
        You have a new contact form submission:

        Name: ${name}
        Email: ${email}
        Phone: ${phone}
        Subject: ${subject}

        Message:
        ${message}
      `
    };

    await transporter.sendMail(mailOption);
    console.log("Email sent successfully to admin");
    res.render('users/contact', { error: null });  // Pass error as null
  } catch (error) {
    console.error("Error sending email:", error.message);
    res.render('users/contact', { error: 'Failed to send your message. Please try again later.' });
  }
};


// module.exports = { contact };




module.exports={renderabout,rendercontact,rendermenu,rendercart,render404,contact};