import { useDispatch, useSelector } from "react-redux";
import IconBtn from "../../../common/IconBtn";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import ConfirmationModal from "../../../common/ConfirmationModal";
import { buyCourse } from "../../../../services/operations/studentFeaturesAPI";

const RenderTotalAmount = ()=>{
   const {total,cart} = useSelector((state)=>state.cart);
   const navigate = useNavigate()
   const dispatch  = useDispatch()
   const {user} = useSelector((state)=>state.profile)
   const {token} = useSelector((state)=>state.auth)
   const [confirmationModal,setConfirmationModal] = useState(null)

   const handleBuyCourse = async()=>{
    const courses = cart.map((course)=>course._id);
    console.log("In courses ko buy karenge : ",courses);
    //PENDING : API integration krna hai
    if (token) {
      const res = await buyCourse(token, courses, user, navigate, dispatch);
       return;
     }
     setConfirmationModal({
       text1: "You are not logged in!",
       text2: "Please login to Purchase  Course.",
       btn1Text: "Login",
       btn2Text: "Cancel",
       btn1Handler: () => navigate("/login"),
       btn2Handler: () => setConfirmationModal(null),
     });

   }

   return (
    <div className="min-w-[280px] rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-6">
      <p className="mb-1 text-sm font-medium text-richblack-300">Total</p>
      <p className="mb-6 text-3xl font-medium text-yellow-100">₹ {total}</p>
      <IconBtn
      text={"Buy Now"} 
      onclick={handleBuyCourse}
      customClasses="w-full justify-center"
      >
      </IconBtn>
      {
        confirmationModal && <ConfirmationModal modalData={confirmationModal} />
      }
    </div>
   )
}
export default RenderTotalAmount;