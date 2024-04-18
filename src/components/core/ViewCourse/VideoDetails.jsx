import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { markLectureAsComplete } from "../../../services/operations/courseDetailsAPI";
import { updateCompletedLectures } from "../../../slices/viewCourseSlice";
import "video-react/dist/video-react.css";
import { Player,BigPlayButton } from "video-react";
import IconBtn from "../../common/IconBtn";

const VideoDetails = () => {
  const { courseId, sectionId, subSectionId } = useParams();
  const { token } = useSelector((state) => state.auth);
  const [previewSource, setPreviewSource] = useState("")
  const { courseEntireData, courseSectionData, completedLectures } =
    useSelector((state) => state.viewCourse);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [videoData, setVideoData] = useState();
  const [videoEnded, setVideoEnded] = useState(false);
  const [loading, setLoading] = useState(false);
  const playerRef = useRef();

  useEffect(() => {
    console.log("DETAILS ME SECTION DATA : ",courseSectionData)
  console.log("DETAILS ME ENTIRE DATA : ",courseEntireData)
  console.log("DETAILS ME LECTURES DATA : ",completedLectures)
    ;(() => {
      if (!courseSectionData.length) {
        return;
      }
      if (!courseId && !sectionId && !subSectionId) {
        navigate("/dashboard/enrolled-courses");
        return;
      }
      const filteredSection = courseSectionData.filter(
        (sec) => sec._id === sectionId
      );
      const filteredSubSection = filteredSection[0]?.subSections.filter(
        (subSection) => subSection._id === subSectionId
      );

      const video = filteredSubSection[0];
      setVideoData(video);
      setPreviewSource(courseEntireData.thumbnail)
      setVideoEnded(false)
    })();
  }, [courseEntireData, courseSectionData, location.pathname]);

  const isFirstVideo = () => {
    const currSectionIndex = courseSectionData.findIndex(
      (sec) => sec._id == sectionId
    );
    const currSubSectionIndex = courseSectionData[
      currSectionIndex
    ].subSections.findIndex((subSec) => subSec._id === subSectionId);

    if (currSectionIndex == 0 && currSubSectionIndex == 0) {
      return true;
    }
    return false;
  };
  const isLastVideo = () => {
    const currSectionIndex = courseSectionData.findIndex(
      (sec) => sec._id == sectionId
    );
    const noOfSubSections =
      courseSectionData[currSectionIndex].subSections.length;
    const currSubSectionIndex = courseSectionData[
      currSectionIndex
    ].subSections.findIndex((subSec) => subSec._id === subSectionId);

    if (
      currSectionIndex === courseSectionData.length - 1 &&
      currSubSectionIndex == noOfSubSections - 1
    ) {
      return true;
    }
    return false;
  };
  const goToNextVideo = () => {
    // assuming that it's not a last video of the course
    const currSectionIndex = courseSectionData.findIndex(
      (sec) => sec._id == sectionId
    );
    const noOfSubSections =
      courseSectionData[currSectionIndex].subSections.length;
    const currSubSectionIndex = courseSectionData[
      currSectionIndex
    ].subSections.findIndex((subSec) => subSec._id === subSectionId);

    if (currSubSectionIndex !== noOfSubSections - 1) {
      // same section ki next video
      const nextSubSectionId =
        courseSectionData[currSectionIndex].subSections[currSubSectionIndex + 1]
          ._id;
      navigate(
        `/view-course/${courseId}/section/${sectionId}/sub-section/${nextSubSectionId}`
      );
    } else {
      // next section ki first video
      const nextSectionId = courseSectionData[currSectionIndex + 1]._id;
      const nextSubSectionId =
        courseSectionData[currSectionIndex + 1].subSections[0]._id;
      navigate(
        `/view-course/${courseId}/section/${nextSectionId}/sub-section/${nextSubSectionId}`
      );
    }
  };
  const goToPrevVideo = () => {
    // assuming it's not the first video
    const currSectionIndex = courseSectionData.findIndex(
      (sec) => sec._id == sectionId
    );
   
    const currSubSectionIndex = courseSectionData[
      currSectionIndex
    ].subSections.findIndex((subSec) => subSec._id === subSectionId);

    if (currSubSectionIndex !== 0) {
      // same section me prev video
      const prevSubSectionId =
        courseSectionData[currSectionIndex].subSections[currSubSectionIndex - 1]
          ._id;
      navigate(
        `/view-course/${courseId}/section/${sectionId}/sub-section/${prevSubSectionId}`
      );
    } else {
      // prev section ki last video
      const prevSectionId = courseSectionData[currSectionIndex - 1]._id;
      const noOfPrevSubSections =
      courseSectionData[currSectionIndex - 1].subSections.length;
      const prevSubSectionId =
        courseSectionData[currSectionIndex - 1].subSections[
          noOfPrevSubSections - 1
        ]._id;
      navigate(
        `/view-course/${courseId}/section/${prevSectionId}/sub-section/${prevSubSectionId}`
      );
    }
  };
  const handleLectureCompletion = async () => {
    setLoading(true);
    const res = await markLectureAsComplete(
      {
        courseId,
        subSectionId,
      },
      token
    );
    if (res) {
      dispatch(updateCompletedLectures(subSectionId));
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-5 text-white">
      {!videoData ? (
           <img
           src={previewSource}
           alt="Preview"
           className="h-full w-full rounded-md object-cover"
         />
      ) : (
        <Player
          playsInline
          ref={playerRef}
          aspectRatio="16:9"
          onEnded={() => setVideoEnded(true)}
          src={videoData?.videoUrl}
        >
        <BigPlayButton position="center" />
          {
          videoEnded && (
            <div
            style={{
              backgroundImage:
                "linear-gradient(to top, rgb(0, 0, 0), rgba(0,0,0,0.7), rgba(0,0,0,0.5), rgba(0,0,0,0.1)",
            }}
            className="full absolute inset-0 z-[100] grid h-full place-content-center font-inter"
             >
              {!completedLectures?.includes(subSectionId) && (
                <IconBtn
                text={!loading ? "Mark As Completed" : "Loading..."}
                customClasses="text-xl max-w-max px-4 mx-auto"
                  onclick={() => handleLectureCompletion()}
                />
              )}
              <IconBtn
                text="Rewatch"
                disable={loading}
                customClasses="text-xl max-w-max px-4 mx-auto mt-2"
                onclick={() => {
                  if (playerRef?.current) {
                    // setting the time of video to 0,to restart it
                    playerRef?.current?.seek(0);
                    playerRef?.current?.play();
                    setVideoEnded(false)
                  }
                }}
              />
              <div className="mt-10 flex min-w-[250px] justify-center gap-x-4 text-xl">
                {!isFirstVideo() && (
                  <button
                    onClick={goToPrevVideo}
                    disabled={loading}
                    className="blackButton"
                  >
                    Prev
                  </button>
                )}
                {!isLastVideo() && (
                  <button
                    onClick={goToNextVideo}
                    disabled={loading}
                    className="blackButton"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          )}
        </Player>
      )}
      <h1 className="mt-4 text-3xl font-semibold">{videoData?.title}</h1>
      <p className="pt-2 pb-6">{videoData?.description}</p>
    </div>
  );
};

export default VideoDetails;
