import React from "react";

const TaskList = ({ data }) => {
  return (
    <div className="flex gap-5 justify-between">
      <div className="px-9 py-6 w-[45%] bg-red-400 rounded-xl">
        <h2 className="text-3xl font-semibold">{data.newTasks || 0}</h2>
        <h3 className="text-xl font-medium">New Tasks</h3>
      </div>
      <div className="px-9 py-6 w-[45%] bg-blue-400 rounded-xl">
        <h2 className="text-3xl font-semibold">{data.activeTasks || 0}</h2>
        <h3 className="text-xl font-medium">Active Tasks</h3>
      </div>
      <div className="px-9 py-6 w-[45%] bg-green-400 rounded-xl">
        <h2 className="text-3xl font-semibold">{data.completedTasks || 0}</h2>
        <h3 className="text-xl font-medium">Completed Tasks</h3>
      </div>
      <div className="px-9 py-6 w-[45%] bg-yellow-400 rounded-xl">
        <h2 className="text-3xl font-semibold">{data.failedTasks || 0}</h2>
        <h3 className="text-xl font-medium">Failed Tasks</h3>
      </div>
    </div>
  );
};

export default TaskList;
