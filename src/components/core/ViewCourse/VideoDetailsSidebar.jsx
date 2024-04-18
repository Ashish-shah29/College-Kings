import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import IconBtn from "../../common/IconBtn";
import {IoIosArrowBack} from 'react-icons/io'
import {BsChevronDown} from 'react-icons/bs'
import { setCompletedLectures, setCourseSectionData, setEntireCourseData, setTotalNoOfLectures } from "../../../slices/viewCourseSlice";

const VideoDetailsSidebar = ({ setReviewModal }) => {
  const { sectionId, subSectionId } = useParams();
  const {
    courseSectionData,
    courseEntireData,
    completedLectures,
    totalNoOfLectures,
  } = useSelector((state) => state.viewCourse);
  console.log("SECTION DATA : ",courseSectionData)
  console.log("ENTIRE DATA : ",courseEntireData)
  console.log("LECTURES DATA : ",completedLectures)
  console.log("TOTAL LECTURES DATA : ",totalNoOfLectures)

  const [activeSection, setActiveSection] = useState("");
  const [activeSubSection, setActiveSubSection] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch()
  useEffect(() => {
    ;(() => {
      if (courseSectionData?.length == 0) {
        return;
      }
      const currentSectionIndex = courseSectionData.findIndex(
        (data) => data._id === sectionId
      );
      const currentSubSectionIndex = courseSectionData?.[
        currentSectionIndex
      ]?.subSections?.findIndex((data) => data._id === subSectionId);
 
      setActiveSection(courseSectionData?.[currentSectionIndex]?._id);

      const activeSubSectionId =
        courseSectionData?.[currentSectionIndex]?.subSections?.[
          currentSubSectionIndex
        ]?._id;
      setActiveSubSection(activeSubSectionId);
    })();
  }, [courseEntireData, courseSectionData, location.pathname]);

  const handleGoBack = ()=>{
    dispatch(setCourseSectionData([]))
    dispatch(setEntireCourseData([]))
    dispatch(setCompletedLectures([]))
    dispatch(setTotalNoOfLectures(0))
    navigate("/dashboard/enrolled-courses")
  }
  return (
    <>
      <div  className="flex h-[calc(100vh-3.5rem)] w-[320px] max-w-[350px] flex-col border-r-[1px] border-r-richblack-700 bg-richblack-800">
        {/* for buttons and heading  */}
        <div className="mx-5 flex flex-col items-start justify-between gap-2 gap-y-4 border-b border-richblack-600 py-5 text-lg font-bold text-richblack-25">
          {/* for buttons  */}
          <div className="flex w-full items-center justify-between ">
            <div onClick={handleGoBack}
             className="flex h-[35px] w-[35px] items-center justify-center rounded-full bg-richblack-100 p-1 text-richblack-700 hover:scale-90"
             title="back"
             >
              <IoIosArrowBack size={30} />
            </div>
            <div>
              <IconBtn 
               text="Add Review"
               customClasses="ml-auto" 
               onclick={() => setReviewModal(true)} />
            </div>
          </div>

          <div className="flex flex-col">
            <div>{courseEntireData?.courseName}</div>
            <div className="text-sm font-semibold text-richblack-500">{completedLectures?.length / totalNoOfLectures *100}</div>
          </div>
        </div>
        {/* for sectins and sub sections  */}
        <div className="h-[calc(100vh - 5rem)] overflow-y-auto" >
          {
            courseSectionData?.map((section,index)=>(
              <div  
              className="mt-2 cursor-pointer text-sm text-richblack-5"
              onClick={()=>{
                setActiveSection(section._id)
              }}
              key={section._id}
              >
                {/* for section */}
              <div className="flex flex-row justify-between bg-richblack-600 px-5 py-4">
                <span className="w-[70%] font-semibold">{section?.name}</span>
                <div className="flex items-center gap-3">
                  <span
                    className={`${
                      activeSection != section?._id
                        ? "rotate-0"
                        : "rotate-180"
                    } transition-all duration-500`}
                  >
                    <BsChevronDown />
                  </span>
                </div>
              </div>
              {/* for subSection  */}
              <div>
                {
                  activeSection===section._id && (
                    <div className="transition-[height] duration-500 ease-in-out">
                      {
                        section.subSections.map((subSection)=>(
                          <div 
                           onClick={()=>{
                            setActiveSubSection(subSection._id);
                            navigate(`view-course/${courseEntireData._id}/section/${section._id}/sub-section/${subSection._id}`)
                           }} 
                           className={`flex gap-3  px-5 py-2  ${activeSubSection===subSection._id 
                            ?"bg-yellow-200 font-semibold text-richblack-800"
                           :"hover:bg-richblack-900"}`}
                           key={subSection._id}
                          >
                            <input 
                             type="checkbox"
                             checked={completedLectures?.includes(subSection._id)}
                             onChange={()=>{}}
                             />
                             <span>{subSection?.title}</span>
                          </div>
                        ))
                      }
                    </div>
                  )
                }
              </div>
              </div>
            ))
          }
        </div>
      </div>
    </>
  );
};

export default VideoDetailsSidebar;
