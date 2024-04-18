import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ConfirmationModal from "../../../../common/ConfirmationModal";
import { setCourse } from "../../../../../slices/courseSlice";
import {
  deleteSection,
  deleteSubSection,
} from "../../../../../services/operations/courseDetailsAPI";
import { MdEdit } from "react-icons/md";
import { RxDropdownMenu } from "react-icons/rx";
import { AiFillCaretDown } from "react-icons/ai";
import { FaPlus } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import SubSectionModal from "./SubSectionModal";

const NestedView = ({ handleChangeEditSectionName }) => {
  const { course } = useSelector((state) => state.course);
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);

  const [addSubSection, setAddSubSection] = useState(null);
  const [viewSubSection, setViewSubSection] = useState(null);
  const [editSubSection, setEditSubSection] = useState(null);

  const [confirmationModal, setConfirmationModal] = useState(null);
  const dispatch = useDispatch();

  const handleDeleteSection = async (sectionId) => {
    setLoading(true);
    let result = await deleteSection(
      {
        sectionId: sectionId,
        courseId: course._id,
      },
      token
    );
    if (result) {
      dispatch(setCourse(result));
    }
    setConfirmationModal(null);
    setLoading(false);
  };

  const handleDeleteSubSection = async (subSectionId, sectionId) => {
    setLoading(true);
    let result = await deleteSubSection(
      { sectionId: sectionId, subSectionId: subSectionId },
      token
    );
    if (result) {
      let updatedCourseContent = course.courseContent.map((section) =>
        section._id === sectionId ? result : section
      );
      const updatedCourse = { ...course, courseContent: updatedCourseContent };
      dispatch(setCourse(updatedCourse));
    }
    setConfirmationModal(null);
  };
  return (
    <div
      className="rounded-lg bg-richblack-700 p-6 px-8"
      id="nestedViewContainer"
    >
      {course?.courseContent?.length > 0 &&
        course?.courseContent?.map((section, index) => (
          <details key={section._id} open>
            <summary className="flex cursor-pointer items-center justify-between border-b-2 border-b-richblack-600 py-2">
              <div className="flex items-center gap-x-3">
                <RxDropdownMenu className="text-2xl text-richblack-50" />
                <span className="font-semibold text-richblack-50">
                  {section?.name}
                </span>
              </div>
              <div className="flex items-center gap-x-3">
                <button
                  onClick={() =>
                    handleChangeEditSectionName(
                      section?._id,
                      section?.name
                    )
                  }
                >
                  {/* edit icon  */}
                  <MdEdit className="text-xl text-richblack-300" />
                </button>
                <button
                  onClick={() =>
                    setConfirmationModal({
                      text1: "Delete this Section?",
                      text2: "All the lectures in this section will be deleted",
                      btn1Text: "Delete",
                      btn2Text: "Cancel",
                      btn1Handler: () => {
                        handleDeleteSection(section._id);
                      },
                      btn2Handler: () => {
                        setConfirmationModal(null);
                      },
                    })
                  }
                >
                  {/* bin icon  */}
                  <RiDeleteBin6Line className="text-xl text-richblack-300" />
                </button>
                <span className="font-medium text-richblack-300">|</span>
                {/* 3 dots  */}
                <AiFillCaretDown className={`text-xl text-richblack-300`} />
              </div>
            </summary>
            {/* yaha se sub section start  */}
            <div className="px-6 pb-4">
              {section.subSections.map((subSection) => (
                <div
                  onClick={() => setViewSubSection(subSection)}
                  className="flex cursor-pointer items-center justify-between gap-x-3 border-b-2 border-b-richblack-600 py-2"
                >
                  <div className="flex items-center gap-x-3 py-2 ">
                    <RxDropdownMenu className="text-2xl text-richblack-50" />
                    <span className="font-semibold text-richblack-50">
                      {subSection.title}
                    </span>
                  </div>
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-x-3"
                  >
                    {/* edit icon button  */}
                    <button
                      onClick={() =>
                        setEditSubSection({
                          ...subSection,
                          sectionId: section._id,
                        })
                      }
                    >
                      {/* icon  */}
                      <MdEdit className="text-xl text-richblack-300" />
                    </button>
                    {/* bin icon button  */}
                    <button
                      onClick={() =>
                        setConfirmationModal({
                          text1: "Delete this Sub-Section?",
                          text2: "This lecture will be deleted",
                          btn1Text: "Delete",
                          btn2Text: "Cancel",
                          btn1Handler: () => {
                            handleDeleteSubSection(subSection._id, section._id);
                          },
                          btn2Handler: () => {
                            setConfirmationModal(null);
                          },
                        })
                      }
                    >
                      {/* icon  */}
                      <RiDeleteBin6Line className="text-xl text-richblack-300" />
                    </button>
                  </div>
                </div>
              ))}
              {/* Add lecture  */}
              <button
                onClick={() => setAddSubSection(section._id)}
                className="mt-3 flex items-center gap-x-1 text-yellow-50"
              >
                {/* icon  */}
                <FaPlus className="text-lg" />
                <span>Add Lecture</span>
              </button>
            </div>
          </details>
        ))}

      {addSubSection ? (
        <SubSectionModal
          modalData={addSubSection}
          setModalData={setAddSubSection}
          add={true}
        />
      ) : viewSubSection ? (
        <SubSectionModal
          modalData={viewSubSection}
          setModalData={setViewSubSection}
          view={true}
        />
      ) : (
        editSubSection && (
          <SubSectionModal
            modalData={editSubSection}
            setModalData={setEditSubSection}
            edit={true}
          />
        )
      )}
      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </div>
  );
};

export default NestedView;
