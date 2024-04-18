import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Spinner from "../components/common/Spinner";
import { IoEyeOff,IoEye  } from "react-icons/io5";
import { resetPassword } from "../services/operations/authAPI";
import { useLocation, useNavigate } from "react-router-dom";
import { BiArrowBack } from "react-icons/bi";
import { Link } from "react-router-dom";

// mail send ho jane k baad, where we set new password
const UpdatePassword = () => {
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmNewPassword: "",
  });
  const {newPassword,confirmNewPassword} = formData;
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch()
  const location = useLocation()

  const changeHandler = (e) => {
    setFormData((prevData) => (
      {
      ...prevData,
      [e.target.name]: e.target.value,
     }
    ));
  }

  const handleOnSubmit = (e)=>{
    e.preventDefault();
    const token = location.pathname.split("/").at(-1)
    dispatch(resetPassword(newPassword,confirmNewPassword,token))
  }
  
  return (
    <div className="grid min-h-[calc(100vh - 3.5rem)] place-items-center">
      {loading ? (
        <Spinner />
      ) : (
        <div className="max-w-[500px] p-4 lg:p-8">
          <h1 className="text-[1.875rem] font-semibold leading-[2.375rem] text-richblack-5"> Choose new password</h1>
          <p className="my-4 text-[1.125rem] leading-[1.625rem] text-richblack-100">
            Almost done. Enter your new password and youre all set.</p>
          <form onSubmit={handleOnSubmit}>
            <label className="relative">
              <p className="mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5">
                New Password <sup className="text-pink-200">*</sup>
              </p>
              <input
                required
                type={showPassword ? "text" : "password"}
                value={newPassword}
                name="newPassword"
                onChange={changeHandler}
                placeholder="Enter New Password"
                className="form-style w-full !pr-10"
              />
               <span  
               className="absolute right-3 top-[38px] z-[10] cursor-pointer"
               onClick={()=>setShowPassword((prev)=>!prev)}>
                {
                  showPassword
                  ? (<IoEyeOff fontSize={24} fill="#AFB2BF"/>)
                  :(<IoEye fontSize={24} fill="#AFB2BF"/>)
                }
              </span>
            </label>
            <label className="relative mt-3 block">
              <p className="mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5">
                Confirm New Password <sup className="text-pink-200">*</sup>
              </p>
              <input
                required
                type={showConfirmPassword ? "text" : "password"}
                value={confirmNewPassword}
                name="confirmNewPassword"
                onChange={changeHandler}
                placeholder="Confirm New Password"
                className="form-style w-full !pr-10"
              />
              <span 
              onClick={()=>setShowConfirmPassword((prev)=> !prev)}
              className="absolute right-3 top-[38px] z-[10] cursor-pointer"
              >
                {
                  showConfirmPassword
                  ? (<IoEyeOff fontSize={24} fill="#AFB2BF"/>)
                  :(<IoEye fontSize={24} fill="#AFB2BF"/>)
                }
              </span>
            </label>
            <button 
            type="submit"
            className="mt-6 w-full rounded-[8px] bg-yellow-50 py-[12px] px-[12px] font-medium text-richblack-900"
            > 
              Reset Password
            </button>
          </form>
          <div className="mt-6 flex items-center justify-between">
                  <Link to="/login">
                    <p className='flex gap-x-2 items-center text-richblack-5'> 
                      <BiArrowBack/>
                      Back to login
                    </p>
                  </Link>
                </div>
        </div>
      )}
    </div>
  );
};

export default UpdatePassword;
