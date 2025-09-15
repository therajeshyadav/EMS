import React from "react";

const FailedTask = ({ data }) => {
  return (
    <div className=" p-5 flex-shrink-0 h-full w-[300px] bg-yellow-400 rounded-xl ">
      <div className="flex justify-between items-center">
        <h3 className="bg-red-600 px-3 text-sm py-1 rounded">
          {data.category}
        </h3>
        <h4 className="text-sm">{data.taskDate}</h4>
      </div>
      <p className="text-sm mt-2 ">{data.taskDescription}</p>
      <div className="mt-2 ">
        <button className="w-full bg-violet-700">Failed</button>
      </div>
    </div>
  );
};

export default FailedTask;
