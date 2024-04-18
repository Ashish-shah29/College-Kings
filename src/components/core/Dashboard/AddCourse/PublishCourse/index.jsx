import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import IconBtn from '../../../../common/IconBtn';
import { resetCourseState, setStep } from '../../../../../slices/courseSlice';
import { COURSE_STATUS } from '../../../../../utils/constants';
import { editCourseDetails } from '../../../../../services/operations/courseDetailsAPI';
import { useNavigate } from 'react-router-dom';

const PublishCourse = () => {
  const { course } = useSelector((state) => state.course);
  const [loading, setLoading] = useState();
  const { token } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate()

  const {register,handleSubmit,setValue,getValues,formState:{errors}} = useForm()

  useEffect(()=>{
    if(course?.status === COURSE_STATUS.PUBLISHED){
      setValue("public",true);
    }
  },[])
  
  const goBack =()=>{
    dispatch(setStep(2));
  }
  const gotoCourses=()=>{
    dispatch(resetCourseState());
    navigate('/dashboard/my-courses');
  }

  const handlePublishCourse=async(data)=>{
    if(course?.status === COURSE_STATUS.DRAFT && getValues("public")===false 
     || 
     course?.status === COURSE_STATUS.PUBLISHED && getValues("public")===true){
      // no changes made 
      // navigate to my-courses
      gotoCourses();
    }
    else{
      let formdata = new FormData();
      const courseStatus = data.public ? COURSE_STATUS.PUBLISHED : COURSE_STATUS.DRAFT
      formdata.append("courseId",course._id)
      formdata.append("status",courseStatus)
  
      // api call 
      setLoading(true)
      let result = await editCourseDetails(formdata,token);
      if(result){
        gotoCourses();
      }
      setLoading(false);
    }
  }

  const onFormSubmit = (data)=>{
   handlePublishCourse(data);
  }
  return (
    <div className="rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-6" >
      <p className="text-2xl font-semibold text-richblack-5">Publish Course</p>
      <form onSubmit={handleSubmit(onFormSubmit)} >
      <div className="my-6 mb-8">
        <label htmlFor="public" className="inline-flex items-center text-lg">
          <input 
          type="checkbox" 
          id='public'
          {...register("public")}
          className="border-gray-300 h-4 w-4 rounded bg-richblack-500 text-richblack-400 focus:ring-2 focus:ring-richblack-5"
          />
          <span className="ml-2 text-richblack-400">
            Make this course public</span>
        </label>
      </div>
      <div className="ml-auto flex max-w-max items-center gap-x-4">
        <button 
        type='button'
        onClick={goBack}
        className="flex cursor-pointer items-center gap-x-2 rounded-md bg-richblack-300 py-[8px] px-[20px] font-semibold text-richblack-900"
        >
          Back
        </button>
        <IconBtn
        text="Save changes"
        type="submit"
        disable={loading}
         />
      </div>
      </form>
    </div>
  )
}

export default PublishCourse