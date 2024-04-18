import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const RequirementsField = ({ 
  name, 
  register, 
  label, 
  setValue,
  errors 
}) => {
  const { course, editCourse } = useSelector((state) => state.course);
  const [requirement, setRequirement] = useState("");
  const [requirementList, setRequirementList] = useState([]);

  useEffect(() => {
    if (editCourse) {
      setRequirementList(course?.instructions);
    }
    register(name, { required: true, validate: (value) => value.length > 0 });
  }, []);

  useEffect(() => {
    setValue(name, requirementList);
  }, [requirementList]);

  const handleAddRequirement = () => {
    console.log("add handler me aa gye bhai")
    if (requirement.trim()) {
      const list = [...requirementList, requirement.trim()];
      setRequirementList(list);
      setRequirement(""); 
    }
  };
  const handleRemoveRequirement = (reqIndex) => {
    const list = requirementList.filter((_, index) => index !== reqIndex);
    setRequirementList(list);
  };
  return (
    <div>
      <div  className="flex flex-col space-y-2" >
        <label 
        className="text-sm text-richblack-5"
        htmlFor={name}>
        {label}<sup className="text-pink-200">*</sup>
        </label>
        <input
          type="text"
          name={name}
          value={requirement}
          onChange={(e) => setRequirement(e.target.value)}
          className="form-style w-full"
        />
        <button 
        onClick={handleAddRequirement}
        className="font-semibold text-yellow-50"
        type="button"
        >
          Add
        </button>
      </div>
          { requirementList.length > 0 &&
          (
            <ul className="mt-2 list-inside list-disc">
           { requirementList.map((req,index)=>(
             <li key={index} className="flex items-center text-richblack-5">
                <span>{req}</span>
                <button 
                 type="button"
                 className="ml-2 text-xs text-pure-greys-300 "
                 onClick={()=>handleRemoveRequirement(index)}
                >
                  clear
                </button>
              </li>
            ))}
            </ul>
          )
          }
        
        {
          errors[name] && (
            <div className="ml-2 text-xs tracking-wide text-pink-200">
            {label} is required
            </div>
          )
        }
    </div>
  );
};

export default RequirementsField;
