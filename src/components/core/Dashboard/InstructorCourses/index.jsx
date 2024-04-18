import React, { useEffect, useState } from 'react'
import IconBtn from '../../../common/IconBtn'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchInstructorCourses } from '../../../../services/operations/courseDetailsAPI'
import CoursesTable from './CoursesTable'

const MyCourses = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const {token} = useSelector((state)=>state.auth)
  const [loading,setLoading] = useState()
  const [courses,setCourses] = useState([])

  useEffect(()=>{
   ;(async()=>{
      setLoading(true);
      let result = await fetchInstructorCourses(token);
      if(result){
        setCourses(result);
      }
    })()
    // getInstructorCourses();
  },[])
  return (
    <div>
      <div  className="mb-14 flex items-center justify-between">
        <h1 className="text-3xl font-medium text-richblack-5">My Courses</h1>
        <IconBtn
         text="Add Courses"
         onclick={()=>navigate('/dashboard/add-course')}
         />
      </div>
      {
        courses && (
          <CoursesTable courses={courses} setCourses={setCourses} />
        )
      }
    </div>
  )
}

export default MyCourses