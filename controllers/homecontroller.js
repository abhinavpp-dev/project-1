
// const { use } = require('../routes/homeroute')


const { text } = require('body-parser');
const nodemailer=require('nodemailer');
const user=require('../models/user');
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
const rendersingleproduct=(req,res)=>{
  res.render('users/single-product');
}
const render404=(req,res)=>{
  res.render('users/404');
}


const rendercontact=(req,res)=>{
  res.render('users/contact')
}


const contact = async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  try {
    // Fetch admin email from database
    const admin = await User.findOne({ role: 'admin' }); // Assuming `role: admin` identifies admin
    if (!admin) {
      return res.status(404).json({ message: 'Admin email not found' });
    }

    const mailOption = {
      from:user.email , // Application email from environment variables
      to: process.env.EMAIL_USER, // Admin email fetched from the database
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

    // Send the email
    await transporter.sendMail(mailOption);
    console.log('Email sent successfully');

    // Respond to the client
    res.status(200).json({ message: 'Your message has been sent successfully.' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send your message. Please try again later.' });
  }
};



module.exports={renderabout,rendercontact,rendermenu,rendercart,rendersingleproduct,render404,contact};