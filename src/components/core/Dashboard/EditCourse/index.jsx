import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import RenderSteps from '../AddCourse/RenderSteps'
import { getFullDetailsOfCourse } from '../../../../services/operations/courseDetailsAPI'
import { setCourse, setEditCourse } from '../../../../slices/courseSlice'
import Spinner from '../../../common/Spinner'

const EditCourse = () => {
  const {token} = useSelector((state)=>state.auth)
  const {course }= useSelector((state)=>state.course)
  const dispatch = useDispatch()
  const [loading,setLoading] =useState(true);
  const {courseId} = useParams();

  useEffect(()=>{
    ;(async()=>{
    setLoading(true);
    let result = await getFullDetailsOfCourse(courseId,token);
    if(result?.courseDetails){
      dispatch(setCourse(result?.courseDetails));
      dispatch(setEditCourse(true));
    }
    setLoading(false)
    })()
    // populateFullCourseDetails() 
  },[])
  return (
    <div>
      <h1  className="mb-14 text-3xl font-medium text-richblack-5">Edit course</h1>

      <div className="mx-auto max-w-[600px]">
      {
        loading 
        ? (<Spinner />)
        :(
          course ? (
            <RenderSteps />
          )
          :(<div className="mt-14 text-center text-3xl font-semibold text-richblack-100"  >Course Not Found</div>)
        )
      }
      </div>
    </div>
  )
}

export default EditCourse
