import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Spinner from "../../common/Spinner";
import SidebarLink from "./SidebarLink";
import { sidebarLinks } from "../../../data/dashboard-links";
import {VscSignOut } from 'react-icons/vsc'
import { logout } from "../../../services/operations/authAPI";
import ConfirmationModal from "../../common/ConfirmationModal";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const { user, loading: profileLoading } = useSelector(
    (state) => state.profile
  );
  const {loading:authLoading} = useSelector((state)=>state.auth)
  const [confirmationModal,setConfirmationModal] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate()

  if (profileLoading || authLoading) {
    return <Spinner />;
  }

  return (
    <div>
      <div className="flex h-[calc(100vh-3.5rem)] min-w-[220px] flex-col border-r-[1px] border-r-richblack-700 bg-richblack-800 py-10">
        <div className="flex flex-col">
          {sidebarLinks.map((link) => {
            if (link.type && user?.accountType !== link.type) return null;
            return (
              <SidebarLink key={link.id} link={link} iconName={link.icon} />
            );
          })}
        </div>
        {/* horizontal line  */}
        <div className="h-[1px] mx-auto w-full bg-richblack-700"></div>
        
        <div className="flex flex-col">
          {/* setting  */}
          <SidebarLink 
          link={{name:"Settings",path:"/dashboard/settings"}}
          iconName={"VscSettingsGear"}
          />
          {/* log out button  */}
          <button
           onClick={()=>setConfirmationModal({
            text1:"Are you sure ?",
            text2:"You will be logged out of your account",
            btn1Text:"Logout",
            btn2Text:"Cancel",
            btn1Handler: ()=>{dispatch(logout(navigate))},
            btn2Handler:()=>{setConfirmationModal(null)}
           })}
           className="px-8 py-2 text-sm font-medium text-richblack-300"
          >
            <div className="flex gap-x-2 items-center">
              <VscSignOut className="text-lg" />
              <span>Log Out</span>
            </div>
          </button>
        </div>
      </div>
      {confirmationModal &&
       <ConfirmationModal modalData={confirmationModal} />}
    </div>
  );
};

export default Sidebar;
