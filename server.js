// require('dotenv').config();
require('dotenv').config();
const express=require('express')
const path=require('path');
const app=express();
const bodyparser=require('body-parser');
const cookieparser=require('cookie-parser');
setuser=require('./middlewares/setuser')

const stripe = require('stripe')(process.env.STRIPE_SECRETKEY); // Replace 'your-secret-key' with your actual Stripe secret key


//import routes
const homeroutes=require('./routes/homeroute');
const adminroutes=require('./routes/adminroutes');

const { default: mongoose } = require('mongoose');
// db connection
mongoose.connect(process.env.MONGODB_URI)
.then(()=>console.log('Mongodb connected'))
.catch(err=>console.error('Mongodb connection error:',err))


//template engine setup
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

//middlewatre to parse incoming request boides
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}));
app.use(cookieparser());
//server static files
app.use(setuser)
app.use(express.static(path.join(__dirname,'public')));

// using routes
app.use('/',homeroutes);
app.use('/',adminroutes);


//start server
const PORT=process.env.PORT||3001
app.listen(PORT,()=>{
  console.log('server started');
})

