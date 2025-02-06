
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


const contact = async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,  // Your email address
        pass: process.env.EMAIL_PASS   // Your app-specific password
      }
    });

    const mailOption = {
      from: `"${name}" <${email}>`,  // User's name and email
      to: process.env.EMAIL_USER,     // Admin email
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
    console.log("Email sent successfully");
    res.redirect('/contact?status=success');
  } catch (error) {
    console.error("Error sending email:", error.message);
    if (error.response) {
      console.error("Error response:", error.response);
    }
    res.status(500).json({ message: "Failed to send your message. Please try again later." });
  }
};



module.exports={renderabout,rendercontact,rendermenu,rendercart,render404,contact};