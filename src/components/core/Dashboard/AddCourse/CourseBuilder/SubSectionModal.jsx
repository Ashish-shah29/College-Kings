import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { createSubSection, updateSubSection } from "../../../../../services/operations/courseDetailsAPI";
import { setCourse } from "../../../../../slices/courseSlice";
import Upload from "../Upload";
import IconBtn from "../../../../common/IconBtn";
import {RxCross2} from 'react-icons/rx'

const SubSectionModal = ({
  modalData,
  setModalData,
  add = false,
  view = false,
  edit = false,
}) => {
  const [loading, setLoading] = useState(false);
  const { course } = useSelector((state) => state.course);
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const {
    register,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (view || edit) {
      setValue("lectureTitle", modalData.title);
      setValue("lectureDesc", modalData.description);
      setValue("lectureVideo", modalData.videoUrl);
    }
  }, []);

  const isFormUpdated = () => {
    let currentValues = getValues();
    if (
      currentValues.lectureTitle !== modalData.title ||
      currentValues.lectureDesc !== modalData.description ||
      currentValues.lectureVideo !== modalData.videoUrl
    ){
      return true;
    }
    return false;
  };
  const handleEditSubSection = async()=>{
    let currentValues = getValues();
    let formdata = new FormData();
    formdata.append("sectionId",modalData.sectionId);
    formdata.append("subSectionId",modalData._id);

    if(currentValues.lectureTitle !== modalData.title){
      formdata.append("title",currentValues.lectureTitle)
    }
    if(currentValues.lectureDesc !== modalData.
      description){
      formdata.append("description",currentValues.lectureDesc)
    }
    if(currentValues.lectureVideo !== modalData.videoUrl){
      formdata.append("video",currentValues.lectureVideo)
    }
    // api call 
    setLoading(true);
    console.log("PRINTING FORMDATA : ",formdata)
    const result = await updateSubSection(formdata,token);
    if(result){
      const updatedCourseContent = course?.courseContent.map((section) =>
      section._id === modalData.sectionId ? result : section
    )
    const updatedCourse = { ...course, courseContent: updatedCourseContent }
    dispatch(setCourse(updatedCourse))
    }
    setModalData(null);
    setLoading(false);
  }
  const onFormSubmit = async (data) => {
    setLoading(true);
    if (view) {
      return;
    }
    if (edit) {
      if (!isFormUpdated()) {
        toast.error("No changes made to hte lecture");
        return;
      }
      handleEditSubSection();
      return;
    }
    // add lecture

    let formdata = new FormData();
    formdata.append("sectionId", modalData);
    formdata.append("title", data.lectureTitle);
    formdata.append("description", data.lectureDesc);
    formdata.append("video", data.lectureVideo);

    // api call
    console.log("PRINTING FORMDATA : ",formdata)
    let result = await createSubSection(formdata, token);

    if (result) {
      const updatedCourseContent = course?.courseContent.map((section) => (
        section._id === modalData ? result : section
      ));
      const updatedCourse = { ...course, courseContent: updatedCourseContent };
      dispatch(setCourse(updatedCourse));
    }
    setModalData(null);
    setLoading(false);
  };
  return (
    <div className="fixed inset-0 z-[1000] !mt-0 grid h-screen w-screen place-items-center overflow-auto bg-white bg-opacity-10 backdrop-blur-sm">
      <div className="my-10 w-11/12 max-w-[700px] rounded-lg border border-richblack-400 bg-richblack-800">
        <div className="flex items-center justify-between rounded-t-lg bg-richblack-700 p-5">
          <p className="text-xl font-semibold text-richblack-5">{view ? "Viewing ":edit?"Editing ":add &&"Adding "}Lecture </p>
          <button 
          onClick={()=>!loading && setModalData(null)}
          >
            {/* icon */}
            <RxCross2 className="text-2xl text-richblack-5" />
          </button>
        </div>
        <form 
        onSubmit={handleSubmit(onFormSubmit)}
        className="space-y-8 px-8 py-10"
        >
          <Upload
           name="lectureVideo"
           label="Lecture Video"
           register={register}
           setValue={setValue}
           errors={errors}
           video={true}
           viewData={view ? modalData.videoUrl :null}
           editData={edit ? modalData.videoUrl :null}
           />
           <div className="flex flex-col space-y-2">
            <label className="text-sm text-richblack-5" htmlFor="sectionTitle">
              <span>Lecture title {!view && (<sup className="text-pink-200">*</sup>)}</span>
            </label>
            <input 
            type="text"
            id="sectionTitle"
            placeholder="Enter Lecture title"
            disabled={view || loading} 
            {...register("lectureTitle",{required:true})}
            className="form-style w-full"
             />
             {errors.lectureTitle && (
              <span className="ml-2 text-xs tracking-wide text-pink-200">lecture title is required</span>
             )}
           </div>
           <div className="flex flex-col space-y-2" >
            <label className="text-sm text-richblack-5" htmlFor="sectionDesc">
              Lecture Description{!view && (<sup className="text-pink-200">*</sup>)}
              </label>
              <input 
              type="text" 
              placeholder="Enter Lecture description"
              id="sectionDesc"
              disabled={view || loading}
              {...register("lectureDesc",{required:true})}
              className="form-style resize-x-none min-h-[130px] w-full"
              />
              {errors.lectureDesc &&(
                <span className="ml-2 text-xs tracking-wide text-pink-200">Lecture description is required</span>
              )}
           </div>
           {
            !view && (
              <div className="flex justify-end">
                <IconBtn 
                text={add? "Save" :"Save changes"}
                type="submit"
                />
              </div>
            )
           }
        </form>
      </div>
  </div>
  )
};

export default SubSectionModal;
