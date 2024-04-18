import { setPaymentLoading } from '../../slices/courseSlice';
import { resetCart } from '../../slices/cartSlice';
import rzpLogo from '../../assets/Logo/rzp_logo.png'
import {toast} from 'react-hot-toast'
import { studentEndpoints } from '../apis'; 
const { apiConnector } = require("../apiconnector");
// import { useDispatch } from 'react-redux';
// import { useNavigate } from 'react-router-dom';


const {COURSE_PAYMENT_API,COURSE_VERIFY_API,SEND_PAYMENT_SUCCESS_EMAIL_API} = studentEndpoints


const loadScript = (src)=>{
  return new Promise((resolve)=>{
    const script = document.createElement("script")
    script.src = src;
    script.onload = ()=>{
      resolve(true)
    }
    script.onerror = ()=>{
      resolve(false)
    }
    document.body.appendChild(script)
  })
}

export const buyCourse = async(token,courses,user,navigate,dispatch)=>{

  const toastId = toast.loading("loading...")
  console.log("INSIDE BUY COURSE : ",courses,user)
  try{ 
    const res = loadScript("https://checkout.razorpay.com/v1/checkout.js");
    console.log("script load ho gai....")
    if(!res){
      toast.error("failed to load razorpay script")
      return;
    }
    const orderResponse = await apiConnector("POST",COURSE_PAYMENT_API,{courses},{
      Authorization:`Bearer ${token}`
    })
    console.log("ORDER RESPONSE : ",orderResponse)
    if(!orderResponse.data.success){
      throw new Error("could not initialize order")
    }
    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY,
      amount: orderResponse.data.data.amount,
      currency: orderResponse.data.data.currency,
      order_id: orderResponse.data.data.id,
      name:`StudyNotion`,
      description:"Thank you for purchasing the course",
      image: rzpLogo,
      prefill:{
        name:user.firstName,
        email:user.email
      },
      handler:function(response){
        // send payment success mail to student
        sendPaymentSuccessMail(response,orderResponse.data.data.amount,token)
        // 
        verfiyPayment({...response,courses},token,navigate,dispatch)
      }
    }
    console.log("options created : ",options)
       //miss hogya tha 
       const paymentObject = new window.Razorpay(options);
       paymentObject.open();
       paymentObject.on("payment.failed", function(response) {
           toast.error("oops, payment failed : ");
           console.log("response error : ",response);
       })

  }catch(err){
    toast.error(err)
  }
  toast.dismiss(toastId)
}

const sendPaymentSuccessMail = async(response,amount,token)=>{
  try{
    await apiConnector("POST",SEND_PAYMENT_SUCCESS_EMAIL_API,
    {
      order_id:response.razorpay_order_id,
      payment_id:response.razorpay_payment_id,
      amount:amount
    },
    {
      Authorization:`Bearer ${token}`
    })
  }
  catch(err){
    console.log("ERROR IN PAYMENT SUCCESS MAIL : ",err)
  }
}

const verfiyPayment = async(bodyData,token,navigate,dispatch)=>{
  dispatch(setPaymentLoading(true))
  const toastId = toast.loading("loading...")
  try{
    const response = await apiConnector("POST",COURSE_VERIFY_API,
    bodyData,
    {
      Authorization:`Bearer ${token}`
    }
    )
    console.log("VERIFY KA RESPONSE : ",response)
    if(!response?.data?.success){
      throw new Error(response?.data?.message)
    }
    toast.success("Payment successfull, you are added to the course")
    navigate('/dashboard/enrolled-courses')
    dispatch(resetCart())

  }catch(err){
    console.log("VERIFY PAYMENT ERROR...",err)
    toast.error(err.message)
  }
  toast.dismiss(toastId)
  dispatch(setPaymentLoading(false))
}
