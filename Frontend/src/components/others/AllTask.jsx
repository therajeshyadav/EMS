import React, { useContext } from "react";
import { AuthContext } from "../../context/Authprovider";

const AllTask = () => {
  const [userData] = useContext(AuthContext);

  return (
    <div className="bg-[#1c1c1c] p-5">
      <div className="bg-red-400 px-4 py-2 mb-2 rounded-md mt-5 flex justify-between">
        <h2 className="text-lg font-medium w-1/5 bg-red-600">Employee Name</h2>
        <h3 className="text-lg font-medium w-1/5 bg-red-600">New Task</h3>
        <h5 className="text-lg font-medium w-1/5 bg-red-600">Active Task</h5>
        <h5 className="text-lg font-medium w-1/5 bg-red-600">Completed</h5>
        <h5 className="text-lg font-medium w-1/5 bg-red-600">Failed</h5>
      </div>
      <div>
        {userData.employees.map((e, idx) => {
          const tasks = e.tasks || [];
          return (
            <div
              key={idx}
              className="border-2 border-emerald-400 px-4 py-2 mb-2 rounded-md mt-5 flex justify-between"
            >
              <h2 className="text-lg font-medium w-1/5">{e.firstName}</h2>
              <h3 className="text-lg font-medium w-1/5 text-blue-600">
                {tasks.filter((t) => t.newTask).length}
              </h3>
              <h5 className="text-lg font-medium w-1/5 text-yellow-400">
                {tasks.filter((t) => t.active).length}
              </h5>
                {tasks.filter((t) => t.completed).length}
              </h5>
              <h5 className="text-lg font-medium w-1/5 text-red-600">
                {tasks.filter((t) => t.failed).length}
              </h5>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AllTask;
