import React from 'react'
import {Swiper,SwiperSlide} from 'swiper/react'
import 'swiper/css'
import 'swiper/css/free-mode'
import 'swiper/css/pagination'
import {FreeMode,Pagination,Navigation} from 'swiper/modules'
import Course_Card from './Course_Card'


const CourseSlider = ({Courses}) => {
  return (
    <div>
      {
        Courses?.length ? (
          <Swiper
           slidesPerView={1}
           loop={true}
           spaceBetween={25}
           pagination={{clickable:true}}
           modules={[FreeMode,Pagination]}
           breakpoints={
            {
              1024:{
              slidesPerView : 3,
            },
            }
           }
           className='max-h-[30rem]'
          >
            {
              Courses?.map((course,index)=>(
                <SwiperSlide key={index}>
                  <Course_Card course={course} Height={"h-[250px]"} />
                </SwiperSlide>
              ))
            }
          </Swiper>
        )
        :(
          <p className="text-xl text-richblack-5">No Course Found</p>
        )
      }
    </div>
  )
}

export default CourseSlider