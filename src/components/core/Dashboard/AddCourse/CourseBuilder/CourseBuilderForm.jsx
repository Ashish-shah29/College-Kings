import React, { useState } from "react";
import { useForm } from "react-hook-form";
import IconBtn from "../../../../common/IconBtn";
import { IoAddCircleOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { MdNavigateNext } from "react-icons/md";
import { setStep, setEditCourse, setCourse } from "../../../../../slices/courseSlice";
import toast from "react-hot-toast";
import NestedView from "./NestedView";
import {
  createSection,
  updateSection,
} from "../../../../../services/operations/courseDetailsAPI";

const CourseBuilderForm = () => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();
  const [editSectionName, setEditSectionName] = useState(null);
  const { course } = useSelector((state) => state.course);
  const [loading, setLoading] = useState();
  const { token } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const cancelEdit = () => {
    setEditSectionName(null);
    setValue("sectionName", "");
  };

  const handleChangeEditSectionName=(sectionId,sectionName)=>{
    console.log("HANDLE CHANGE : ",sectionId)
    console.log(sectionName)
    if(editSectionName === sectionId){
      cancelEdit()
    }
    else{
    setEditSectionName(sectionId);
    setValue("sectionName",sectionName);
    }
  }

  const onFormSubmit = async (data) => {
    console.log("SECTION DATA", data)
    setLoading(true);
    let result;
    if (editSectionName) {
      result = await updateSection(
        {
          sectionName: data.sectionName,
          sectionId: editSectionName,
          courseId: course._id,
        },
        token
      );
    } else {
      result = await createSection(
        {
          sectionName: data.sectionName,
          courseId: course._id,
        },
        token
      );
      console.log("SECTION RESULT ",result)
    }
    if(result){
      dispatch(setCourse(result));
      setEditSectionName(null);
      setValue("sectionName","");
    }
    setLoading(false);
  }

    const goBack = () => {
      setEditCourse(true);
      dispatch(setStep(1));
    };
    const gotoNext = () => {
      if (course?.courseContent?.length === 0) {
        toast.error("Please add atleast one section");
        return;
      }
      if (
        course?.courseContent?.some((section) => section.subSections.length === 0)
      ) {
        toast.error("Please add atleast one sub section in each section");
        return;
      }
      // if sb thik
      dispatch(setStep(3));
    };
    return (
      <div className="space-y-8 rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-6">
        <h1 className="text-2xl font-semibold text-richblack-5">Course Builder</h1>
        <form onSubmit={handleSubmit(onFormSubmit)}
         className="space-y-4">
          <div className="flex flex-col space-y-2">
            <label htmlFor="sectionName" className="text-sm text-richblack-5">Section name <sup className="text-pink-200">*</sup></label>
            <input
              type="text"
              id="sectionName"
              placeholder="Add Section name"
              {...register("sectionName", { required: true })}
              className="form-style w-full"
            />
            {errors.sectionName && <span className="ml-2 text-xs tracking-wide text-pink-200">Section Name is required</span>}
          </div>
          <div className="flex items-end gap-x-4">
            <IconBtn
              type="Submit"
              text={editSectionName ? "Edit Section Name" : "Create Section"}
              outline={true}
              customClasses={"text-white"}
            >
              <IoAddCircleOutline size={20} className="text-yellow-50" />
            </IconBtn>
            {editSectionName && (
              <button type="button" onClick={cancelEdit} className="text-sm text-richblack-300 underline">
                Cancel Edit
              </button>
            )}
          </div>
        </form>
        {course.courseContent.length > 0
         && 
         <NestedView handleChangeEditSectionName={handleChangeEditSectionName}/>
         }
        <div className="flex justify-end gap-x-3">
          <button onClick={goBack} className={`flex cursor-pointer items-center gap-x-2 rounded-md bg-richblack-300 py-[8px] px-[20px] font-semibold text-richblack-900`}>Back</button>
          <IconBtn disable={loading} text="Next" onclick={gotoNext}>
            <MdNavigateNext />
          </IconBtn>
        </div>
      </div>
    );
};
export default CourseBuilderForm;
