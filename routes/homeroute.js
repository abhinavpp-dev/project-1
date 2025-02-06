const express=require('express')
const router=express.Router();

const { renderabout, rendercontact,rendercart,render404, contact, }=require('../controllers/homecontroller');
const {renderloginpage, signup, verifyotp, login,renderforgotpassword, forgotpassword, forgotpasswordotp, resetpassword, renderuserdashbord, renderuserprofile, updateprofile, logout, renderhomepage, loginout}=require('../controllers/authcontroller');
const { getproduct } = require('../controllers/addproduct');
const cartController=require('../controllers/cartcontrol');
const { renderCheckout, checkoutController } = require('../controllers/checkoutcontroller');
const { paymentsucess, cancelpayment } = require('../controllers/payment');
const { userorder, deliveredOrders } = require('../controllers/ordercontroller');
const { applycoupencode } = require('../controllers/coupon');



router.get('/',renderhomepage);
router.get('/about',renderabout);
router.get('/contact',rendercontact);
router.post('/contact',contact)
router.get('/menu',getproduct);
router.get('/cart',rendercart);
router.get('/checkout',renderCheckout);
// router.get('/singleproduct',rendersingleproduct);
router.get('/404',render404);

//authentication and user profile
router.get('/login',renderloginpage)
router.post('/signup',signup);
router.post('/verify-otp',verifyotp)
router.post('/login',login)
router.get('/forgotpassword',renderforgotpassword);
router.post('/forgotpassword',forgotpassword);
router.post('/forgotpassword-otp',forgotpasswordotp);
router.post('/resetpassword',resetpassword)
router.get('/user-dashbord',renderuserdashbord);
router.get('/profile',renderuserprofile)                                                                                                                                                                                                                                                                                                                                                                                                                       
router.post('/update-profile',updateprofile)
router.post('/logout',logout)


//cart
router.post('/cart/add',cartController.addcart);
router.get('/cart1',cartController.rendercart)
router.post('/cart/increase',cartController.increaseitem);
router.post('/cart/decrease',cartController.decreaseitem);
router.post('/cartremove',cartController.removeitem)

//checkout
router.get('/checkout',renderCheckout);
router.post('/checkout',checkoutController)


//stripe payment
router.get('/complete',paymentsucess);
router.get('/cancel',cancelpayment)

router.post('/apply-coupon',applycoupencode)

// order and details
router.get('/userorder',userorder)
router.get('/delivered-orders',deliveredOrders)

//login and logout
router.get('logout',logout)
router.get('/loginout',loginout)




module.exports=router;