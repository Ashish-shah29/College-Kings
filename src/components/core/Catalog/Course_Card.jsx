import React, { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import RatingStars from '../../common/RatingStars'
import GetAvgRating from '../../../utils/avgRating'
import { useState } from 'react'

const Course_Card = ({course,Height}) => {
  const [avgRatingCount ,setAvgRatingCount] = useState(0);
  useEffect(()=>{
    const count = GetAvgRating(course?.ratingAndReview);
    setAvgRatingCount(count);
  },[course])
  return (
    <div>
      <NavLink to={`/course/${course._id}`}>
        <div>
          <div className="rounded-lg" >
            <img src={course?.thumbnail} alt={course?.courseName}
            className={`${Height} w-full rounded-xl object-cover `} />
          </div>
          <div className="flex flex-col gap-2 px-1 py-3">
            <p className="text-xl text-richblack-5">
              {course?.courseName}</p>
            <p className="text-sm text-richblack-50">
              {course?.instructor?.firstName} {course?.instructor?.lastName}</p>
            <div className="flex items-center gap-2">
              <span className='text-yellow-5'>{avgRatingCount || 0}</span>
              <RatingStars Review_Count={avgRatingCount} />
              <span className='text-richblack-400'>{course?.ratingAndReview?.length} Ratings</span>
            </div>
            <p className="text-xl text-richblack-5">Rs. {course?.price}</p>
          </div>
        </div>
      </NavLink>
    </div>
  )
}

export default Course_Card