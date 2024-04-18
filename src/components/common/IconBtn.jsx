import React from "react";

const IconBtn = ({
  text,
  children,
  onclick,
  customClasses,
  disable,
  type,
  outline = false,
}) => {
  return (
    <button
      type={type}
      onClick={onclick}
      className={`flex items-center ${
        outline ? "border border-yellow-50 bg-transparent" : "bg-yellow-50"
      } cursor-pointer gap-x-2 rounded-md py-2 px-5 font-semibold text-richblack-900 ${customClasses}`}
      disabled={disable}
    >
      {children ? (
        <div className="flex items-center gap-x-2">
          <span>{text}</span>
          {children}
        </div>
      ) : (
        text
      )}
    </button>
  );
};

export default IconBtn;
